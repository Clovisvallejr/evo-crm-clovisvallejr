@echo off
REM ============================================================
REM SETUP COMPLETO - EVO CRM COMMUNITY
REM ============================================================
REM Este script faz setup COMPLETO do Docker com todas as atualizacoes
REM Executa em 3 passos: DOWN + BUILD + UP
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo SETUP COMPLETO - EVO CRM COMMUNITY
echo ============================================================
echo.

REM PASSO 1: Parar e remover TUDO
echo [1/4] Parando e removendo containers antigos...
docker compose down -v
if errorlevel 1 (
    echo ERRO ao fazer down. Verifique se Docker esta rodando.
    pause
    exit /b 1
)
echo OK - Containers removidos
echo.

REM PASSO 2: Limpar node_modules e package-lock para rebuild completo
echo [2/4] Limpando dependencias antigas...
cd evo-ai-frontend-community
if exist node_modules rmdir /s /q node_modules >nul 2>&1
if exist package-lock.json del package-lock.json >nul 2>&1
echo OK - Limpeza completa
cd ..
echo.

REM PASSO 3: Reinstalar dependencias e fazer build
echo [3/4] Instalando dependencias (npm install)...
cd evo-ai-frontend-community
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERRO no npm install
    pause
    exit /b 1
)
echo OK - Dependencias instaladas
echo.

echo [3/4] Compilando frontend (npm run build)...
call npm run build
if errorlevel 1 (
    echo ERRO na compilacao
    pause
    exit /b 1
)
echo OK - Build completo
cd ..
echo.

REM PASSO 4: Subir Docker
echo [4/4] Iniciando Docker (docker compose up -d)...
docker compose up -d
if errorlevel 1 (
    echo ERRO ao fazer up
    pause
    exit /b 1
)
echo OK - Docker iniciado
echo.

REM Aguardar containers ficarem healthy
echo Aguardando containers ficarem prontos (aguarde 60-180 segundos)...
echo.

set "max_wait=180"
set "waited=0"

:wait_loop
if %waited% geq %max_wait% (
    echo Timeout aguardando containers
    echo Verifique com: docker compose ps
    goto :done
)

docker compose ps | findstr "healthy" >nul 2>&1
if errorlevel 0 (
    echo OK - Containers prontos!
    goto :done
)

timeout /t 5 /nobreak >nul 2>&1
set /a waited=%waited%+5
goto :wait_loop

:done
echo.
echo ============================================================
echo SETUP COMPLETO!
echo ============================================================
echo.
echo Acesse: http://localhost:5173
echo.
echo Para verificar status: docker compose ps
echo Para ver logs: docker compose logs -f evo-frontend
echo.
echo ============================================================
echo.
pause
