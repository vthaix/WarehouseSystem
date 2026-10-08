param([switch]$Browser)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskRuntime = Get-ChildItem (Join-Path $taskRoot '.runtime') -Directory -Filter 'node-v*-win-x64' -ErrorAction SilentlyContinue | Select-Object -First 1
$taskNode = if ($taskRuntime) { Join-Path $taskRuntime.FullName 'node.exe' } else { (Get-Command node -ErrorAction Stop).Source }
Push-Location -LiteralPath $taskRoot
try {
  & $taskNode --test
  if ($LASTEXITCODE -ne 0) { throw 'Kiểm thử backend thất bại.' }
  if ($Browser) { & $taskNode e2e/run.cjs; if ($LASTEXITCODE -ne 0) { throw 'Kiểm thử trình duyệt thất bại.' } }
} finally { Pop-Location }