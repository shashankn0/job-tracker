# Job Tracker SQLite Extension

Native C++ Neutralino extension that provides SQLite database access over WebSocket.

## Prerequisites (Windows)

1. **CMake** — `winget install Kitware.CMake`
2. **C++ compiler** — one of:
   - Visual Studio 2022 Build Tools with "Desktop development with C++"
     (`winget install Microsoft.VisualStudio.2022.BuildTools`)
   - MinGW-w64 (`winget install BrechtSanders.WinLibs.POSIX.UCRT`)

Restart your terminal after installing.

## Build

From the project root:

```powershell
npm.cmd run setup:extension
npm.cmd run build:extension
```

Output: `extensions/sqlite-ext/sqlite-ext.exe`

## Protocol

The extension handles two events from the app:

| Event | Input | Output |
|-------|-------|--------|
| `query` | `{ sql, params?, _respId, _respEvent }` | `{ rows: [...], _respId }` |
| `exec` | `{ sql, params?, _respId, _respEvent }` | `{ done: true, _respId }` |

SQL parameters use `?` placeholders. Query rows are returned as JSON objects keyed by column name.
