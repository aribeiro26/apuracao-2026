$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false
$raiz = Split-Path $PSScriptRoot -Parent
Set-Location $raiz

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  $bin = "C:\Program Files\Docker\Docker\resources\bin"
  if (Test-Path $bin) { $env:Path = "$bin;" + $env:Path }
}

$trava = Join-Path $env:TEMP "apuracao-local-update.lock"
if (Test-Path $trava) {
  $idade = (Get-Date) - (Get-Item $trava).LastWriteTime
  if ($idade.TotalMinutes -lt 25) { exit 0 }
}
Set-Content -Path $trava -Value (Get-Date -Format o)

function Publicar-NoContainer {
  $env:Path = "C:\Program Files\nodejs;" + $env:Path
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "build local falhou" }
  $nome = "apuracao-2026-web-1"
  $existe = docker ps -a --filter "name=^/${nome}$" --format "{{.Names}}"
  if (-not $existe) { throw "container local ausente" }
  docker exec -u root $nome sh -c "rm -rf /app/.next /app/node_modules /app/server.js"
  if ($LASTEXITCODE -ne 0) { throw "nao limpou o container" }
  docker cp .next/standalone/. "${nome}:/app/"
  docker cp .next/static "${nome}:/app/.next/static"
  docker cp public/. "${nome}:/app/public/"
  docker cp proxy/entrada.mjs "${nome}:/app/proxy/entrada.mjs"
  docker exec -u root $nome chown -R nextjs:nodejs /app
  docker restart $nome
  if ($LASTEXITCODE -ne 0) { throw "restart falhou" }
}

try {
  docker compose up --build -d
  if ($LASTEXITCODE -ne 0) {
    Publicar-NoContainer
  }
} finally {
  Remove-Item $trava -ErrorAction SilentlyContinue
}
