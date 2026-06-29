@echo off
REM ============================================================
REM REBUILD DOCKER DO ZERO - SEM ERROS
REM ============================================================
REM Deleta TUDO e recria do zero com build correto
REM ============================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================
echo REBUILD DOCKER - DO ZERO
echo ============================================================
echo.

REM PASSO 1: Parar tudo
echo [PASSO 1/7] Parando todos os containers...
docker compose down -v
if errorlevel 1 (
    echo ERRO: Docker compose down falhou
    pause
    exit /b 1
)
timeout /t 2 /nobreak >nul
echo OK
echo.

REM PASSO 2: Limpar node_modules e cache
echo [PASSO 2/7] Limpando dependencias antigas...
cd evo-ai-frontend-community
if exist node_modules (
    echo   Removendo node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo   Removendo package-lock.json...
    del /f /q package-lock.json
)
cd ..
echo OK
echo.

REM PASSO 3: NPM Install
echo [PASSO 3/7] Instalando dependencias (npm install)...
cd evo-ai-frontend-community
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERRO: npm install falhou
    cd ..
    pause
    exit /b 1
)
echo OK
echo.

REM PASSO 4: NPM Build
echo [PASSO 4/7] Compilando frontend (npm run build)...
call npm run build
if errorlevel 1 (
    echo ERRO: npm run build falhou
    cd ..
    pause
    exit /b 1
)
echo OK
cd ..
echo.

REM PASSO 5: Docker Up
echo [PASSO 5/7] Iniciando Docker Compose...
docker compose up -d
if errorlevel 1 (
    echo ERRO: docker compose up falhou
    pause
    exit /b 1
)
echo OK
echo.

REM PASSO 6: Aguardar containers ficarem prontos
echo [PASSO 6/7] Aguardando containers ficarem prontos...
echo   (aguarde 2-3 minutos...)
echo.

set "wait_count=0"
:wait_containers
docker compose ps | findstr "Healthy" >nul 2>&1
if errorlevel 0 (
    echo   Containers prontos!
    goto :containers_ready
)

if %wait_count% geq 120 (
    echo   Timeout aguardando (120 segundos)
    goto :containers_ready
)

timeout /t 5 /nobreak >nul
set /a wait_count=%wait_count%+5
goto :wait_containers

:containers_ready
echo OK
echo.

REM PASSO 7: Verificar status final
echo [PASSO 7/7] Verificando status final...
echo.
docker compose ps
echo.
echo ============================================================
echo BUILD COMPLETO!
echo ============================================================
echo.
echo Acesse a aplicacao em: http://localhost:5173
echo.
echo Para ver logs em tempo real:
echo   docker compose logs -f evo-frontend
echo.
echo Para parar Docker:
echo   docker compose down
echo.
echo ============================================================
echo.
pause
