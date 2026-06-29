@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================================
echo RECONSTRUINDO O FRONTEND DO DOCKER OFFLINE
echo ============================================================
echo.
echo As alteracoes no codigo do frontend requerem a reconstrucao da
echo imagem do Docker para terem efeito.
echo.
echo Parando o container atual do frontend...
docker compose stop evo-frontend

echo.
echo Reconstruindo e iniciando o frontend com as correcoes...
docker compose build --no-cache evo-frontend
docker compose up -d evo-frontend

echo.
echo ============================================================
echo PRONTO! 
echo ============================================================
echo Agora acesse http://localhost:5173/products e verifique
echo se as imagens estao carregando corretamente.
echo.
pause
