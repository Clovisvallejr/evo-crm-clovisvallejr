@echo off
REM Rebuild Total Final

cd /d "C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2"

echo.
echo DELETANDO DOCKER...
docker compose down -v

echo DELETANDO node_modules...
rmdir /s /q "C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2\evo-ai-frontend-community\node_modules" 2>nul

echo DELETANDO package-lock.json...
del /f /q "C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2\evo-ai-frontend-community\package-lock.json" 2>nul

echo.
echo BUILDANDO DOCKER (vai levar 3-5 minutos)...
docker compose build --no-cache

echo.
echo SUBINDO CONTAINERS...
docker compose up -d

echo.
echo AGUARDANDO 60 SEGUNDOS...
timeout /t 60 /nobreak

echo.
echo STATUS:
docker compose ps

echo.
echo ACESSE: http://localhost:5173
pause
