param(
  [string]$BaseUrl = "http://127.0.0.1:4001/api",
  [int]$Port = 4001
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")

Write-Host ""
Write-Host "=== PG77 local smoke runner ==="

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

if (-not (Test-Path ".\package.json")) {
  throw "ต้องรันจากโฟลเดอร์ PG77-real-core เท่านั้น"
}

Write-Host "Project path: $(Get-Location)"

Write-Host ""
Write-Host "=== Ensure PostgreSQL 5432 ==="

if (-not (netstat -ano | Select-String ":5432\s+.*LISTENING")) {
  Write-Host "PostgreSQL not listening. Starting PostgreSQL..."
  & "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\16\data" -l "$env:TEMP\pg77-postgres.log"
  Start-Sleep -Seconds 3
}

if (-not (netstat -ano | Select-String ":5432\s+.*LISTENING")) {
  throw "PostgreSQL ยังไม่ LISTENING ที่ 5432"
}

Write-Host "PostgreSQL 5432: LISTENING"

Write-Host ""
Write-Host "=== Set ENV ==="

$pgPasswordSecure = Read-Host "Postgres password" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPasswordSecure)
try {
  $pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

$encodedPassword = [System.Uri]::EscapeDataString($pgPasswordPlain)

$env:PORT = "$Port"
$env:DATABASE_URL = "postgresql://postgres:$encodedPassword@127.0.0.1:5432/pg77_local_test?schema=public"
$env:NODE_ENV = "development-local"
$env:LOCAL_ADMIN_PASSWORD = "local-smoke-only-not-real-secret"
$env:JWT_SECRET = "local-smoke-only-not-real-jwt-secret"
$env:GAME_PROVIDER_MODE = "mock"
$env:PAYMENT_PROVIDER_MODE = "sandbox"
$env:BANK_STATEMENT_MODE = "mock"
$env:SMS_PROVIDER_MODE = "mock"
$env:SLIP_OCR_MODE = "mock"
$env:BASE_URL = $BaseUrl
$env:PGPASSWORD = $pgPasswordPlain

$pgPasswordPlain = $null
$encodedPassword = $null

$memberPasswordSecure = Read-Host "Demo member password" -AsSecureString
$bstr2 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($memberPasswordSecure)
try {
  $memberPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr2)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr2)
}

$env:LOCAL_MEMBER_PASSWORD = $memberPasswordPlain
$memberPasswordPlain = $null

Write-Host ""
Write-Host "=== ENV check ==="

node -e 'const u=new URL(process.env.DATABASE_URL); console.log("DB target:", u.hostname, u.pathname.slice(1)); console.log("NODE_ENV:", process.env.NODE_ENV); console.log("BASE_URL:", process.env.BASE_URL); console.log("LOCAL_ADMIN_PASSWORD:", process.env.LOCAL_ADMIN_PASSWORD ? "set" : "missing"); console.log("LOCAL_MEMBER_PASSWORD:", process.env.LOCAL_MEMBER_PASSWORD ? "set" : "missing");'

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "=== Prisma DB check ==="

node -e 'const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); (async () => { const rows = await prisma.$queryRawUnsafe("SELECT current_database() AS current_database, current_user AS current_user"); console.log("Prisma DB PASS:", rows); })().catch(e => { console.error("Prisma DB FAIL:", e.message); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });'

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:PGPASSWORD = $null

function Test-Backend {
  try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -TimeoutSec 5
    $dbConnected = $health.data.databaseConnected
    Write-Host "Backend health: OK | databaseConnected=$dbConnected"

    if ($dbConnected -ne $true) {
      return $false
    }

    return $true
  } catch {
    Write-Host "Backend health failed: $($_.Exception.Message)"
    return $false
  }
}

Write-Host ""
Write-Host "=== Ensure backend $Port ==="

if (-not (Test-Backend)) {
  Write-Host "Backend not ready. Cleaning port $Port if needed..."

  $portConn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($portConn) {
    $portConn | ForEach-Object {
      try {
        $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "Stopping process on port ${Port}: PID=$($_.OwningProcess) $($p.ProcessName)"
        Stop-Process -Id $_.OwningProcess -Force
      } catch {}
    }
    Start-Sleep -Seconds 2
  }

  Write-Host "Starting backend on port $Port..."

  $cmd = 'cd "' + $ProjectRoot + '"; $env:PORT="' + $Port + '"; npm run dev'
  Start-Process pwsh -WorkingDirectory $ProjectRoot -ArgumentList @("-NoExit", "-NoProfile", "-Command", $cmd)

  $ready = $false
  for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Backend) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    throw "Backend $Port ยังไม่พร้อม หรือ databaseConnected ยังไม่ true"
  }
}

Write-Host ""
Write-Host "=== smoke:admin-role-management ==="

npm run smoke:admin-role-management

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "=== smoke:all-local ==="

npm run smoke:all-local

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "=== DONE: smoke passed ==="

