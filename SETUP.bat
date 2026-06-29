@echo off
setlocal enabledelayedexpansion

echo INICIANDO SETUP...
cd /d C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2

echo Parando Docker...
docker compose down -v
timeout /t 5

echo Instalando dependencias...
cd evo-ai-frontend-community
call npm install --legacy-peer-deps
if errorlevel 1 goto error

echo Building...
call npm run build
if errorlevel 1 goto error

cd ..

echo Iniciando Docker...
docker compose up -d
timeout /t 180

echo.
echo STATUS:
docker compose ps

echo.
echo PRONTO! Abra: http://localhost:5173
echo Login: admin@clovisvallejr.com / Imperio@123
goto end

:error
echo ERRO!
exit /b 1

:end
