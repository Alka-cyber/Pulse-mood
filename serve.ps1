$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootFull = [System.IO.Path]::GetFullPath($root).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$port = 4173
$address = [System.Net.IPAddress]::Parse("127.0.0.1")
$listener = [System.Net.Sockets.TcpListener]::new($address, $port)

function Get-ContentType {
  param([string] $Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".webmanifest" { "application/manifest+json; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    default { "application/octet-stream" }
  }
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream] $Stream,
    [int] $Status,
    [string] $StatusText,
    [string] $ContentType,
    [byte[]] $Body,
    [bool] $SendBody
  )

  $header = "HTTP/1.1 $Status $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($SendBody -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$listener.Start()
Write-Host "Pulse Board is running at http://127.0.0.1:$port/"
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 8192, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $client.Close()
        continue
      }

      do {
        $line = $reader.ReadLine()
      } while ($null -ne $line -and $line.Length -gt 0)

      $parts = $requestLine.Split(" ")
      $method = $parts[0]
      $requestPath = $parts[1].Split("?")[0].TrimStart("/")

      if ($method -ne "GET" -and $method -ne "HEAD") {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed")
        Send-Response $stream 405 "Method Not Allowed" "text/plain; charset=utf-8" $body $true
        $client.Close()
        continue
      }

      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
      }

      $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $requestPath))
      if (-not $candidate.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
        Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" $body ($method -eq "GET")
        $client.Close()
        continue
      }

      if (-not [System.IO.File]::Exists($candidate)) {
        $candidate = Join-Path $root "index.html"
      }

      $bytes = [System.IO.File]::ReadAllBytes($candidate)
      Send-Response $stream 200 "OK" (Get-ContentType $candidate) $bytes ($method -eq "GET")
      $client.Close()
    }
    catch {
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
