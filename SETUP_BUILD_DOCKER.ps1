# ============================================
# SCRIPT DE SETUP, BUILD E DOCKER
# Império CRM - Complete Installation
# ============================================

Write-Host "🚀 COMEÇANDO SETUP DO IMPÉRIO CRM..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
$projectPath = "C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2"
if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Pasta do projeto não encontrada: $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath
Write-Host "✅ Navegou para: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# ============================================
# PASSO 1: INSTALAR DEPENDÊNCIAS
# ============================================
Write-Host "📦 PASSO 1: Instalando dependências (html2pdf.js e zod)..." -ForegroundColor Cyan
npm install html2pdf.js zod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
Write-Host ""

# ============================================
# PASSO 2: BUILD DO FRONTEND
# ============================================
Write-Host "🏗️ PASSO 2: Building Frontend..." -ForegroundColor Cyan
cd "$projectPath\evo-ai-frontend-community"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend buildado com sucesso!" -ForegroundColor Green
cd $projectPath
Write-Host ""

# ============================================
# PASSO 3: LIGAR DOCKER
# ============================================
Write-Host "🐳 PASSO 3: Iniciando Docker..." -ForegroundColor Cyan
Write-Host "Aguarde alguns minutos para os containers iniciarem..." -ForegroundColor Yellow

# Parar containers antigos se existirem
docker compose down --remove-orphans 2>$null

# Iniciar containers
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar Docker" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker iniciado!" -ForegroundColor Green
Write-Host ""

# ============================================
# PASSO 4: VERIFICAR STATUS
# ============================================
Write-Host "✅ PASSO 4: Verificando status dos containers..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
docker compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 SETUP COMPLETO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Abra o navegador e acesse: http://localhost:5173" -ForegroundColor White
Write-Host "2. Faça login com:" -ForegroundColor White
Write-Host "   Email: admin@clovisvallejr.com" -ForegroundColor White
Write-Host "   Senha: Imperio@123" -ForegroundColor White
Write-Host "3. Navegue para: /customer/quotes" -ForegroundColor White
Write-Host "4. Teste criar um novo orçamento" -ForegroundColor White
Write-Host "5. Valide: formulário, toasts, cálculos automáticos, PDF" -ForegroundColor White
Write-Host ""
Write-Host "📚 Para detalhes completos de teste, veja:" -ForegroundColor Yellow
Write-Host "   C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2\TESTE_DOCKER_MANUAL.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Status: PRONTO PARA TESTAR!" -ForegroundColor Green
