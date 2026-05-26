$ErrorActionPreference = "SilentlyContinue"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $root "serve.ps1"
$indexFile = Join-Path $root "index.html"
$url = "http://127.0.0.1:4173/"

$serverIsRunning = $false
try {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $url -Method Head -TimeoutSec 1
  $serverIsRunning = $response.StatusCode -eq 200
}
catch {
  $serverIsRunning = $false
}

if (-not $serverIsRunning) {
  Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $serverScript
  ) -WorkingDirectory $root -WindowStyle Minimized | Out-Null

  foreach ($attempt in 1..12) {
    Start-Sleep -Milliseconds 500
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $url -Method Head -TimeoutSec 1
      if ($response.StatusCode -eq 200) {
        $serverIsRunning = $true
        break
      }
    }
    catch {
      $serverIsRunning = $false
    }
  }
}

if ($serverIsRunning) {
  Start-Process $url
}
else {
  Start-Process $indexFile
}
