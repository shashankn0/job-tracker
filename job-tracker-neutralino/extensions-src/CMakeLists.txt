cmake_minimum_required(VERSION 3.16)
project(jobtracker-sqlite-ext LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(OUTPUT_DIR "${CMAKE_SOURCE_DIR}/../extensions/sqlite-ext")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE "${OUTPUT_DIR}")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG "${OUTPUT_DIR}")

include_directories(./lib ./lib/asio ./sqlite)

add_executable(sqlite-ext
  main.cpp
  sqlite/sqlite3.c
)

target_compile_definitions(sqlite-ext PRIVATE
  _WEBSOCKETPP_CPP11_STL_
  ASIO_STANDALONE
  _WEBSOCKETPP_CPP11_THREAD_
  SQLITE_THREADSAFE=1
)

if(WIN32)
  target_link_libraries(sqlite-ext PRIVATE ws2_32)
  target_compile_options(sqlite-ext PRIVATE /utf-8 /EHsc)
endif()
