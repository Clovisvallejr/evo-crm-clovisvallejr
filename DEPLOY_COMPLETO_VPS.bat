@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================================
echo SCRIPT DE DEPLOY COMPLETO PARA PRODUCAO (VPS)
echo ============================================================
echo.

set /p commit_msg="Digite a mensagem do commit (Pressione Enter para usar 'Deploy da arquitetura de orçamentos e kanban'): "
if "%commit_msg%"=="" set commit_msg=Deploy da arquitetura de orcamentos e kanban

echo.
echo.

echo [PASSO 2/4] Preparando arquivos principais para commit...
git add .
echo.

echo [PASSO 3/4] Fazendo commit e push do projeto principal para o GitHub (branch main)...
git commit -m "!commit_msg!"
git push origin main
if errorlevel 1 (
    echo ERRO: Falha ao enviar para o GitHub. Verifique sua conexao ou conflitos.
    pause
    exit /b 1
)
echo OK - Codigo enviado com sucesso!
echo.

echo ============================================================
echo [PASSO 4/4] ATUALIZACAO NA VPS
echo ============================================================
echo O codigo mais recente ja esta no GitHub.
echo.
echo Para fazer o deploy automatico na VPS via SSH, pressione qualquer tecla.
echo (Sera solicitada a senha da VPS se voce nao tiver chave SSH configurada)
echo.
pause

echo.
echo Conectando na VPS (administrator@155.117.47.244)...
echo OBS: Se pedir senha, digite a sua senha: tW%%CJS8$h*
echo.
ssh -t administrator@155.117.47.244 "sudo bash -c 'cd /root/imperio-crm/evo-crm-clovisvallejr_2 2>/dev/null || cd /root/evo-crm-community 2>/dev/null && sed -i s#FRONTEND_URL=http://localhost:5173#FRONTEND_URL=https://imperiocrm.com.br#g .env && sed -i s#BACKEND_URL=http://localhost:3000#BACKEND_URL=https://imperiocrm.com.br/crm#g .env && git pull origin main && docker compose build && docker compose run --rm evo-crm bundle exec rails db:migrate && docker compose run --rm evo-auth bundle exec rails db:seed && docker compose up -d'"

echo.
echo ============================================================
echo DEPLOY FINALIZADO!
echo ============================================================
echo.
pause
