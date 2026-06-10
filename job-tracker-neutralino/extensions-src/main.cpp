#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include <websocketpp/client.hpp>
#include <websocketpp/config/asio_no_tls_client.hpp>

#include "json/json.hpp"
#include "sqlite/sqlite3.h"
#include "uuid.hpp"

typedef websocketpp::client<websocketpp::config::asio_client> ws_client;
using json = nlohmann::json;

namespace fs = std::filesystem;

static std::string readStdin() {
  std::ostringstream buffer;
  buffer << std::cin.rdbuf();
  return buffer.str();
}

static void ensureParentDirectory(const std::string& dbPath) {
  fs::path parent = fs::path(dbPath).parent_path();
  if (!parent.empty()) {
    fs::create_directories(parent);
  }
}

static json cellToJson(sqlite3_stmt* stmt, int index) {
  switch (sqlite3_column_type(stmt, index)) {
    case SQLITE_INTEGER:
      return json(sqlite3_column_int64(stmt, index));
    case SQLITE_FLOAT:
      return json(sqlite3_column_double(stmt, index));
    case SQLITE_TEXT:
      return json(reinterpret_cast<const char*>(sqlite3_column_text(stmt, index)));
    case SQLITE_BLOB: {
      const void* blob = sqlite3_column_blob(stmt, index);
      int size = sqlite3_column_bytes(stmt, index);
      return json(std::string(static_cast<const char*>(blob), size));
    }
    default:
      return json(nullptr);
  }
}

static void bindParams(sqlite3_stmt* stmt, const json& params) {
  if (!params.is_array()) {
    return;
  }

  for (size_t i = 0; i < params.size(); i++) {
    const json& value = params[i];
    int index = static_cast<int>(i + 1);

    if (value.is_null()) {
      sqlite3_bind_null(stmt, index);
    } else if (value.is_number_integer()) {
      sqlite3_bind_int64(stmt, index, value.get<int64_t>());
    } else if (value.is_number_float()) {
      sqlite3_bind_double(stmt, index, value.get<double>());
    } else if (value.is_boolean()) {
      sqlite3_bind_int(stmt, index, value.get<bool>() ? 1 : 0);
    } else {
      std::string text = value.is_string() ? value.get<std::string>() : value.dump();
      sqlite3_bind_text(stmt, index, text.c_str(), -1, SQLITE_TRANSIENT);
    }
  }
}

static json runQuery(sqlite3* db, const std::string& sql, const json& params) {
  sqlite3_stmt* stmt = nullptr;
  if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
    throw std::runtime_error(sqlite3_errmsg(db));
  }

  bindParams(stmt, params);

  json rows = json::array();
  while (sqlite3_step(stmt) == SQLITE_ROW) {
    json row = json::object();
    int columnCount = sqlite3_column_count(stmt);
    for (int i = 0; i < columnCount; i++) {
      row[sqlite3_column_name(stmt, i)] = cellToJson(stmt, i);
    }
    rows.push_back(row);
  }

  sqlite3_finalize(stmt);
  return rows;
}

static void runExec(sqlite3* db, const std::string& sql, const json& params) {
  sqlite3_stmt* stmt = nullptr;
  if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
    throw std::runtime_error(sqlite3_errmsg(db));
  }

  bindParams(stmt, params);

  if (sqlite3_step(stmt) != SQLITE_DONE) {
    std::string error = sqlite3_errmsg(db);
    sqlite3_finalize(stmt);
    throw std::runtime_error(error);
  }

  sqlite3_finalize(stmt);
}

static void sendBroadcast(
  ws_client& client,
  websocketpp::connection_hdl handler,
  const std::string& token,
  const std::string& event,
  const json& data) {
  json message = {
      {"id", getUUID()},
      {"method", "app.broadcast"},
      {"accessToken", token},
      {"data", {{"event", event}, {"data", data}}},
  };
  client.send(handler, message.dump(), websocketpp::frame::opcode::text);
}

int main(int argc, char* argv[]) {
  if (argc < 2) {
    std::cerr << "Usage: sqlite-ext <database-path>" << std::endl;
    return 1;
  }

  const std::string dbPath = argv[1];
  ensureParentDirectory(dbPath);

  sqlite3* db = nullptr;
  if (sqlite3_open(dbPath.c_str(), &db) != SQLITE_OK) {
    std::cerr << "Failed to open database: " << sqlite3_errmsg(db) << std::endl;
    return 1;
  }

  sqlite3_exec(db, "PRAGMA journal_mode=WAL;", nullptr, nullptr, nullptr);

  json connInfo;
  try {
    connInfo = json::parse(readStdin());
  } catch (const std::exception& error) {
    std::cerr << "Failed to parse connection info: " << error.what() << std::endl;
    sqlite3_close(db);
    return 1;
  }

  const std::string port = connInfo["nlPort"].get<std::string>();
  const std::string token = connInfo["nlToken"].get<std::string>();
  const std::string connectToken = connInfo["nlConnectToken"].get<std::string>();
  const std::string extensionId = connInfo["nlExtensionId"].get<std::string>();

  try {
    ws_client client;
    client.init_asio();
    client.clear_access_channels(websocketpp::log::alevel::all);
    client.clear_error_channels(websocketpp::log::elevel::all);

    client.set_fail_handler([&](websocketpp::connection_hdl) {
      sqlite3_close(db);
      exit(1);
    });

    client.set_close_handler([&](websocketpp::connection_hdl) {
      sqlite3_close(db);
      exit(0);
    });

    client.set_message_handler([&](websocketpp::connection_hdl handler, ws_client::message_ptr msg) {
      json incoming;
      try {
        incoming = json::parse(msg->get_payload());
      } catch (...) {
        return;
      }

      if (!incoming.contains("event") || !incoming.contains("data")) {
        return;
      }

      const std::string event = incoming["event"].get<std::string>();
      const json data = incoming["data"];

      if (event != "query" && event != "exec") {
        return;
      }

      if (!data.contains("_respId") || !data.contains("_respEvent")) {
        return;
      }

      const int respId = data["_respId"].get<int>();
      const std::string respEvent = data["_respEvent"].get<std::string>();
      const std::string sql = data.value("sql", "");
      const json params = data.contains("params") ? data["params"] : json::array();

      json response = {{"_respId", respId}};

      try {
        if (event == "query") {
          response["rows"] = runQuery(db, sql, params);
        } else {
          runExec(db, sql, params);
          response["done"] = true;
        }
      } catch (const std::exception& error) {
        response["error"] = error.what();
      }

      sendBroadcast(client, handler, token, respEvent, response);
    });

    const std::string uri =
        "ws://localhost:" + port + "?extensionId=" + extensionId + "&connectToken=" + connectToken;

    websocketpp::lib::error_code ec;
    ws_client::connection_ptr connection = client.get_connection(uri, ec);
    if (ec) {
      std::cerr << "WebSocket connection error: " << ec.message() << std::endl;
      sqlite3_close(db);
      return 1;
    }

    client.connect(connection);
    client.run();
  } catch (const std::exception& error) {
    std::cerr << "Extension error: " << error.what() << std::endl;
    sqlite3_close(db);
    return 1;
  }

  return 0;
}
