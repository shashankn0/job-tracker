$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "extensions-src"
$lib = Join-Path $src "lib"
$sqliteDir = Join-Path $src "sqlite"

New-Item -ItemType Directory -Force -Path $lib, $sqliteDir | Out-Null

Write-Host "Downloading SQLite amalgamation..."
$sqliteZip = Join-Path $env:TEMP "sqlite-amalgamation.zip"
Invoke-WebRequest -Uri "https://www.sqlite.org/2024/sqlite-amalgamation-3460100.zip" -OutFile $sqliteZip
Expand-Archive -Path $sqliteZip -DestinationPath $env:TEMP -Force
Copy-Item (Join-Path $env:TEMP "sqlite-amalgamation-3460100\sqlite3.c") $sqliteDir -Force
Copy-Item (Join-Path $env:TEMP "sqlite-amalgamation-3460100\sqlite3.h") $sqliteDir -Force

Write-Host "Downloading nlohmann/json..."
$jsonDir = Join-Path $lib "json"
New-Item -ItemType Directory -Force -Path $jsonDir | Out-Null
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/nlohmann/json/v3.11.3/single_include/nlohmann/json.hpp" -OutFile (Join-Path $jsonDir "json.hpp")

Write-Host "Downloading websocketpp..."
$wsZip = Join-Path $env:TEMP "websocketpp.zip"
Invoke-WebRequest -Uri "https://github.com/zaphoyd/websocketpp/archive/refs/tags/0.8.2.zip" -OutFile $wsZip
Expand-Archive -Path $wsZip -DestinationPath $env:TEMP -Force
$wsSrc = Join-Path $env:TEMP "websocketpp-0.8.2"
if (Test-Path (Join-Path $lib "websocketpp")) {
  Remove-Item (Join-Path $lib "websocketpp") -Recurse -Force
}
Copy-Item (Join-Path $wsSrc "websocketpp") (Join-Path $lib "websocketpp") -Recurse -Force

Write-Host "Downloading Asio standalone..."
$asioZip = Join-Path $env:TEMP "asio.zip"
Invoke-WebRequest -Uri "https://github.com/chriskohlhoff/asio/archive/refs/tags/asio-1-30-2.zip" -OutFile $asioZip
Expand-Archive -Path $asioZip -DestinationPath $env:TEMP -Force
$asioSrc = Join-Path $env:TEMP "asio-asio-1-30-2\asio\include"
if (Test-Path (Join-Path $lib "asio")) {
  Remove-Item (Join-Path $lib "asio") -Recurse -Force
}
Copy-Item $asioSrc (Join-Path $lib "asio") -Recurse -Force

Write-Host "Extension dependencies installed."
