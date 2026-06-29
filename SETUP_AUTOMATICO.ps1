# Setup Automatico - Imperio CRM
# Executa tudo de uma vez

Write-Host "INICIANDO SETUP..." -ForegroundColor Green
$projectPath = "C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2"

if (-not (Test-Path $projectPath)) {
    Write-Host "Erro: Pasta nao encontrada" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath

# Parar Docker
Write-Host "Parando Docker..." -ForegroundColor Cyan
docker compose down -v 2>$null
Start-Sleep -Seconds 5

# Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
cd "$projectPath\evo-ai-frontend-community"
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao instalar" -ForegroundColor Red
    exit 1
}

# Build
Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build" -ForegroundColor Red
    exit 1
}

# Voltar
cd $projectPath

# Iniciar Docker
Write-Host "Iniciando Docker..." -ForegroundColor Cyan
docker compose up -d
Start-Sleep -Seconds 180

# Status
Write-Host "STATUS:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "PRONTO! Abra: http://localhost:5173" -ForegroundColor Green
Write-Host "Login: admin@clovisvallejr.com / Imperio@123" -ForegroundColor Green
