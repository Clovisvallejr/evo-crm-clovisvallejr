@echo off
echo Iniciando o Imperio CRM...
echo.

echo Verificando dependencias do Docker...
docker compose up -d

echo.
echo =======================================================
echo Aplicativo iniciado! 
echo O CRM estara disponivel em: http://localhost:5173
echo =======================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul
