@echo off
setlocal EnableDelayedExpansion

echo ========================================================
echo       FERRAMENTA DE RESTAURACAO DE BACKUP DO CRM
echo ========================================================
echo.

:: Configurações da VPS
set VPS_IP=155.117.47.244
set VPS_USER=administrator
set VPS_DIR=/root/imperio-crm/evo-crm-clovisvallejr_2

echo Conectando a VPS em %VPS_IP% como %VPS_USER%...
echo.

:: Verifica listar os backups disponiveis
echo Listando backups disponiveis na pasta:
ssh %VPS_USER%@%VPS_IP% "ls -1 %VPS_DIR%/evo-ai-crm-community/storage/backups/"

echo.
echo ========================================================
echo Digite o nome completo do arquivo de backup que deseja restaurar.
echo Exemplo: backup_20260630_163703.tar.gz
echo ========================================================
set /p BACKUP_FILE="Nome do backup (ou digite 0 para cancelar): "

if "%BACKUP_FILE%"=="0" (
    echo Operacao cancelada.
    pause
    exit /b
)

echo.
echo ========================================================
echo ATENCAO: A restauracao de um backup apagara todos os 
echo dados inseridos APOS a criacao do backup. Esta acao e 
echo IRREVERSIVEL!
echo ========================================================
set /p CONFIRM="Deseja realmente continuar? (S/N): "
if /I NOT "%CONFIRM%"=="S" (
    echo Operacao cancelada.
    pause
    exit /b
)

echo.
echo Iniciando restauracao do backup %BACKUP_FILE%...
echo Isso pode demorar alguns minutos. Por favor, aguarde.

:: Comando bash na VPS para fazer o restore
set RESTORE_CMD=cd %VPS_DIR% ^&^& ^
sudo rm -rf /tmp/restore_backup ^&^& ^
sudo mkdir -p /tmp/restore_backup ^&^& ^
cd /tmp/restore_backup ^&^& ^
echo Extraindo arquivos... ^&^& ^
sudo tar -xzf %VPS_DIR%/evo-ai-crm-community/storage/backups/%BACKUP_FILE% ^&^& ^
echo Limpando banco de dados publico... ^&^& ^
sudo docker exec -i evo-crm-clovisvallejr_2-postgres-1 psql -U postgres -d evo_community -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' ^&^& ^
echo Restaurando dados do SQL... ^&^& ^
sudo docker exec -i evo-crm-clovisvallejr_2-postgres-1 psql -U postgres -d evo_community ^< /tmp/restore_backup/database.sql ^&^& ^
echo Restaurando arquivos fisicos... ^&^& ^
sudo cp -r /tmp/restore_backup/storage/* %VPS_DIR%/evo-ai-crm-community/storage/ ^&^& ^
sudo chown -R 1000:1000 %VPS_DIR%/evo-ai-crm-community/storage/ ^&^& ^
echo Reiniciando servicos... ^&^& ^
cd %VPS_DIR% ^&^& ^
sudo docker compose restart evo-crm evo-crm-sidekiq evo-processor evo-bot-runtime ^&^& ^
echo Limpando arquivos temporarios... ^&^& ^
sudo rm -rf /tmp/restore_backup ^&^& ^
echo. ^&^& ^
echo RESTAURACAO CONCLUIDA COM SUCESSO!

ssh %VPS_USER%@%VPS_IP% "%RESTORE_CMD%"

echo.
pause
