param([int]$Port = 3000)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskRuntime = Get-ChildItem (Join-Path $taskRoot '.runtime') -Directory -Filter 'node-v*-win-x64' -ErrorAction SilentlyContinue | Select-Object -First 1
$taskNode = if ($taskRuntime) { Join-Path $taskRuntime.FullName 'node.exe' } else { (Get-Command node -ErrorAction Stop).Source }
if (-not $env:DEMO_PASSWORD) {
  $taskPassword = Read-Host 'Chọn mật khẩu cho các tài khoản mẫu' -AsSecureString
  $taskPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskPassword)
  try { $env:DEMO_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer) }
}
if ([string]::IsNullOrWhiteSpace($env:DEMO_PASSWORD)) { throw 'Mật khẩu không được để trống.' }
$env:PORT = [string]$Port
Push-Location -LiteralPath $taskRoot
try {
  if (-not (Test-Path -LiteralPath 'node_modules/ejs')) {
    if ($taskRuntime) { & $taskNode (Join-Path $taskRuntime.FullName 'node_modules/npm/bin/npm-cli.js') ci --ignore-scripts }
    else { & npm.cmd ci --ignore-scripts }
    if ($LASTEXITCODE -ne 0) { throw 'Không cài được dependencies.' }
  }
  & $taskNode src/server.js
  if ($LASTEXITCODE -ne 0) { throw 'Máy chủ dừng do lỗi.' }
} finally { Pop-Location }