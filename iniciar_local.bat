@echo off
title Iniciar Imperio CRM Local
echo =======================================================
echo Iniciando ambiente local do Imperio CRM (Modo Offline)
echo =======================================================
echo.
echo Construindo e iniciando os conteineres (evo-frontend, evo-crm, etc)...
docker compose -p crm_conversacional-v1 up -d --build

echo.
echo =======================================================
echo Os servicos estao sendo iniciados em segundo plano.
echo Pode levar alguns minutos para que tudo fique pronto.
echo =======================================================
echo.
echo Assim que iniciar, voce podera acessar:
echo.
echo Painel Frontend:  http://localhost:5173
echo API do CRM:       http://localhost:3000
echo.
echo Para ver os logs, voce pode usar o comando:
echo docker compose -p crm_conversacional-v1 logs -f evo-frontend
echo.
pause
