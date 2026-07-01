#!/bin/bash
# restore.sh - Restaurar backup do Evo CRM em ambiente Docker/Portainer

if [ "$#" -ne 1 ]; then
    echo "Uso: $0 <arquivo_de_backup.tar.gz>"
    echo "Exemplo: $0 backup_20260701_030000.tar.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo $BACKUP_FILE não encontrado!"
    exit 1
fi

# Nome do container do Postgres (ajuste se necessário)
DB_CONTAINER="postgres"
# Nome do banco de dados (ajuste se necessário)
DB_NAME="chatwoot"
DB_USER="postgres"

echo "================================================================"
echo "Iniciando processo de restauração do Evo CRM"
echo "Arquivo de backup: $BACKUP_FILE"
echo "================================================================"

# Diretório temporário
TMP_DIR=$(mktemp -d)
echo "[1/4] Extraindo backup para $TMP_DIR..."
tar -xzf "$BACKUP_FILE" -C "$TMP_DIR"

if [ ! -f "$TMP_DIR/database.sql" ]; then
    echo "Erro: database.sql não encontrado no arquivo de backup!"
    rm -rf "$TMP_DIR"
    exit 1
fi

echo "[2/4] Restaurando banco de dados..."
# Para as conexões do banco de dados temporariamente
docker exec -i $DB_CONTAINER psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Restaura o dump
cat "$TMP_DIR/database.sql" | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
if [ $? -eq 0 ]; then
    echo "Banco de dados restaurado com sucesso!"
else
    echo "Aviso: Ocorreram erros durante a restauração do banco de dados (frequentemente são apenas avisos se o banco já existir)."
fi

echo "[3/4] Restaurando arquivos de storage..."
if [ -d "$TMP_DIR/storage" ]; then
    # Copia os arquivos extraídos para o volume/diretório de storage do host
    # Assumindo que o comando é rodado na raiz do projeto (onde fica a pasta storage)
    if [ -d "./storage" ]; then
        cp -a "$TMP_DIR/storage/." "./storage/"
        echo "Arquivos de storage restaurados."
    else
        echo "Aviso: Diretório local ./storage não encontrado. Os arquivos de media não puderam ser restaurados automaticamente."
        echo "Você pode encontrar os arquivos em: $TMP_DIR/storage"
    fi
else
    echo "Aviso: Nenhuma pasta storage encontrada no backup."
fi

echo "[4/4] Limpeza..."
rm -rf "$TMP_DIR"

echo "================================================================"
echo "Restauração concluída!"
echo "Recomendamos reiniciar os containers da aplicação:"
echo "docker compose restart"
echo "================================================================"
