# Job Tracker

A desktop application built with Neutralino and React for tracking job applications with AI-powered job description cleaning.

## Features

- **AI-Powered Cleaning**: Automatically extracts company name, job title, location, and role ID from job descriptions
- **Clean Formatting**: Organizes job descriptions into standardized sections
- **Native SQLite**: C++ extension provides real SQLite with a standard `.db` file on disk
- **Dark Mode UI**: Modern dark theme with clean, organized interface

## Prerequisites

- Node.js (v18 or higher)
- Neutralino CLI (`npm install -g @neutralinojs/neu`)
- OpenRouter API key (for AI cleaning functionality)
- **For building the SQLite extension:**
  - CMake 3.16+
  - Visual Studio 2022 Build Tools (C++ workload) or MinGW-w64

## Installation

```bash
git clone <repository-url>
cd job-tracker-neutralino
npm.cmd install
```

## Building the SQLite extension (first time)

The app uses a native C++ extension for SQLite. Build it once before packaging:

```powershell
# Install build tools if needed:
# winget install Kitware.CMake
# winget install Microsoft.VisualStudio.2022.BuildTools

npm.cmd run setup:extension
npm.cmd run build:extension
```

This downloads SQLite, websocketpp, and Asio, then compiles `extensions/sqlite-ext/sqlite-ext.exe`.

## Building the app

```powershell
npm.cmd run build
neu.cmd build
```

Or combine extension + frontend:

```powershell
npm.cmd run build:all
neu.cmd build
```

The built application will be in `dist/Job Tracker/`.

## Configuration

1. Get an OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Run the application
3. Go to Settings and enter your API key
4. Click "Save Settings"

## Development

```powershell
npm.cmd run build:extension
npm.cmd run build
neu.cmd run
```

## Accessing the database outside the app

Job Tracker stores data in a standard SQLite file that any SQLite tool can open.

### Database location

The path is shown in **Settings → Database** inside the app. On Windows it is typically:

```
%LOCALAPPDATA%\com.jobtracker.app\job-tracker\jobs.db
```

### Important: close the app first

SQLite locks the database while Job Tracker is running. **Close Job Tracker** before opening `jobs.db` with external tools.

### Tools you can use

| Tool | How |
|------|-----|
| [DB Browser for SQLite](https://sqlitebrowser.org/) | File → Open Database → select `jobs.db` |
| [DBeaver](https://dbeaver.io/) | New connection → SQLite → point to `jobs.db` |
| `sqlite3` CLI | `sqlite3 "%LOCALAPPDATA%\com.jobtracker.app\job-tracker\jobs.db"` |

### Example queries

```sql
-- List all jobs
SELECT company, title, location, saved_date FROM jobs ORDER BY saved_date DESC;

-- Search by company
SELECT * FROM jobs WHERE company LIKE '%Acme%';

-- View API key (stored in config table)
SELECT value FROM config WHERE key = 'openRouterApiKey';
```

### Schema

```sql
-- jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  company TEXT,
  title TEXT,
  role_id TEXT,
  location TEXT,
  saved_date TEXT,
  cleaned_text TEXT,
  raw_text TEXT,
  source TEXT
);

-- config table (app settings)
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### Backup

Copy `jobs.db` to back up all your data. The file is self-contained.

## Tech Stack

- **Frontend**: React, Vite
- **Desktop Framework**: Neutralino 6.7.0
- **Database**: Native SQLite (C++ extension)
- **AI**: OpenRouter API with Claude 3 Haiku

## License

MIT
