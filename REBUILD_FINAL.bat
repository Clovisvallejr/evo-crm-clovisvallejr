@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ============================================================
echo REBUILD FINAL - LIMPEZA COMPLETA
echo ============================================================
echo.

echo [1/6] Parando Docker...
docker compose down -v
timeout /t 3 /nobreak >nul

echo [2/6] Deletando node_modules...
cd evo-ai-frontend-community
if exist node_modules (
    echo   Removendo node_modules...
    for /d %%x in (node_modules\*) do @rd /s /q "%%x"
    rmdir /s /q node_modules 2>nul
)

echo [3/6] Deletando package-lock.json...
if exist package-lock.json (
    del /f /q package-lock.json
)

cd ..

echo [4/6] Buildando Docker (vai instalar npm e compilar tudo)...
docker compose build --no-cache 2>&1 | tail -50
if errorlevel 1 (
    echo ERRO: Docker build falhou
    pause
    exit /b 1
)

echo.
echo [5/6] Subindo containers...
docker compose up -d
timeout /t 5 /nobreak >nul

echo.
echo [6/6] Aguardando startup (2-3 minutos)...
timeout /t 180 /nobreak >nul

echo.
echo ============================================================
echo STATUS FINAL:
echo ============================================================
docker compose ps
echo.
echo Acesse: http://localhost:5173
echo.
pause
