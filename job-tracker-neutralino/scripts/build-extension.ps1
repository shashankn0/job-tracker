$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "extensions-src"
$build = Join-Path $src "build"
$sqliteHeader = Join-Path $src "sqlite\sqlite3.h"

if (-not (Test-Path $sqliteHeader)) {
  Write-Host "Dependencies missing. Running setup-extension-deps.ps1..."
  & (Join-Path $PSScriptRoot "setup-extension-deps.ps1")
}

New-Item -ItemType Directory -Force -Path (Join-Path $root "extensions\sqlite-ext") | Out-Null

$cmake = Get-Command cmake -ErrorAction SilentlyContinue
if (-not $cmake) {
  Write-Error "CMake not found. Install with: winget install Kitware.CMake"
}

$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$generator = $null

if (Test-Path $vswhere) {
  $vsPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
  if ($vsPath) {
    $generator = "Visual Studio 17 2022"
  }
}

if ($generator) {
  cmake -S $src -B $build -G $generator -A x64
  cmake --build $build --config Release
} else {
  Write-Host "Visual Studio not found, trying MinGW..."
  cmake -S $src -B $build -G "MinGW Makefiles"
  cmake --build $build --config Release
}

Write-Host "Built: extensions\sqlite-ext\sqlite-ext.exe"
