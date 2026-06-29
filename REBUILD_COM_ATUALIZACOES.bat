@echo off
REM ============================================================
REM REBUILD DOCKER COM TODAS AS ATUALIZACOES
REM ============================================================
REM - Deleta tudo
REM - Reconstroi com Toasts integrados
REM - Reconstroi com Validacoes integradas
REM ============================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================
echo REBUILD DOCKER COM ATUALIZACOES
echo ============================================================
echo.

REM PASSO 1: Down e Delete
echo [PASSO 1/7] Parando e deletando tudo...
docker compose down -v
if errorlevel 1 (
    echo ERRO: docker compose down falhou
    pause
    exit /b 1
)
timeout /t 2 /nobreak >nul
echo OK - Tudo deletado
echo.

REM PASSO 2: Limpar node_modules
echo [PASSO 2/7] Limpando node_modules e cache...
cd evo-ai-frontend-community
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)
cd ..
echo OK
echo.

REM PASSO 3: NPM Install
echo [PASSO 3/7] npm install...
cd evo-ai-frontend-community
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERRO: npm install falhou
    cd ..
    pause
    exit /b 1
)
cd ..
echo OK
echo.

REM PASSO 4: NPM Build
echo [PASSO 4/7] npm run build...
cd evo-ai-frontend-community
call npm run build
if errorlevel 1 (
    echo ERRO: npm run build falhou
    cd ..
    pause
    exit /b 1
)
cd ..
echo OK
echo.

REM PASSO 5: Docker Up
echo [PASSO 5/7] docker compose up -d...
docker compose up -d
if errorlevel 1 (
    echo ERRO: docker compose up falhou
    pause
    exit /b 1
)
echo OK
echo.

REM PASSO 6: Aguardar
echo [PASSO 6/7] Aguardando containers (2-3 minutos)...
set wait=0
:wait_loop
if %wait% geq 120 goto wait_done
docker compose ps | findstr "Healthy" >nul 2>&1
if errorlevel 0 goto wait_done
timeout /t 5 /nobreak >nul
set /a wait=%wait%+5
goto wait_loop
:wait_done
echo OK
echo.

REM PASSO 7: Status
echo [PASSO 7/7] Status final...
docker compose ps
echo.
echo ============================================================
echo REBUILD COMPLETO COM ATUALIZACOES!
echo ============================================================
echo.
echo ✅ MUDANCAS APLICADAS:
echo   - Validacao com Toasts (em vez de alerts)
echo   - Success messages ao criar/atualizar
echo   - Error messages com contexto
echo.
echo Acesse: http://localhost:5173
echo.
echo ============================================================
echo.
pause
