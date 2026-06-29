@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ============================================================
echo REBUILD TOTAL FINAL - TUDO DO ZERO
echo ============================================================
echo Este script vai:
echo   1. Deletar TODOS os containers e volumes do Docker
echo   2. Deletar node_modules e package-lock.json
echo   3. Fazer rebuild da imagem Docker (SEM cache)
echo   4. Subir os containers novamente
echo ============================================================
echo.

REM PASSO 1: Docker Compose Down completo
echo [1/5] Parando Docker e deletando tudo...
docker compose down -v
if errorlevel 1 (
    echo ERRO: docker compose down falhou
    echo.
    echo Tente executar manualmente:
    echo   docker compose down -v
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
echo OK
echo.

REM PASSO 2: Deletar node_modules e package-lock
echo [2/5] Deletando dependencias locais...
cd evo-ai-frontend-community

if exist node_modules (
    echo   Removendo node_modules (pode levar 30 segundos)...
    for /d %%x in (node_modules\*) do @rd /s /q "%%x" 2>nul
    rmdir /s /q node_modules 2>nul
    echo   OK
)

if exist package-lock.json (
    echo   Removendo package-lock.json...
    del /f /q package-lock.json
    echo   OK
)

cd ..
echo.

REM PASSO 3: Docker Compose Build (sem cache)
echo [3/5] Buildando imagem Docker (vai compilar TUDO)...
echo   Isso pode levar 3-5 minutos...
echo.
docker compose build --no-cache
if errorlevel 1 (
    echo.
    echo ERRO: Docker build falhou
    echo.
    echo Se o erro for sobre package.json/npm:
    echo   - Feche outros programas que usam Node.js
    echo   - Tente novamente em alguns segundos
    pause
    exit /b 1
)
echo.
echo OK
echo.

REM PASSO 4: Docker Compose Up
echo [4/5] Subindo containers...
docker compose up -d
if errorlevel 1 (
    echo ERRO: docker compose up falhou
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
echo OK
echo.

REM PASSO 5: Aguardar containers ficarem prontos
echo [5/5] Aguardando containers ficarem prontos...
echo   Aguarde 2-3 minutos enquanto o aplicativo inicia...
echo.

set "wait_count=0"
:wait_loop
cls
echo.
echo ============================================================
echo AGUARDANDO CONTAINERS FICAREM PRONTOS...
echo ============================================================
echo.
docker compose ps
echo.
echo [Aguardando... %wait_count%s]
echo.

set /a wait_count=%wait_count%+5
if %wait_count% gtr 180 goto wait_done

timeout /t 5 /nobreak >nul
goto wait_loop

:wait_done
echo.
echo ============================================================
echo STATUS FINAL:
echo ============================================================
echo.
docker compose ps
echo.
echo ============================================================
echo ✅ REBUILD COMPLETO!
echo ============================================================
echo.
echo URL: http://localhost:5173
echo.
echo O que testar:
echo   1. Vá em "Orçamentos"
echo   2. Clique "Novo Orçamento"
echo   3. Deixe os campos VAZIOS
echo   4. Clique "Salvar"
echo   5. DEVE aparecer um TOAST VERMELHO com erro
echo.
echo   6. Preencha os campos corretamente
echo   7. Clique "Salvar"
echo   8. DEVE aparecer um TOAST VERDE "Orçamento criado com sucesso!"
echo.
echo   9. Vá em "Pedidos"
echo   10. Clique "Gerenciar"
echo   11. Clique "Editar"
echo   12. Mude algum dado
echo   13. Clique "Salvar Alterações"
echo   14. DEVE aparecer TOAST VERDE "Pedido atualizado com sucesso!"
echo.
echo ============================================================
echo.
pause
