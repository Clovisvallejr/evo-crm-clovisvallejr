#!/bin/bash
# Script de Restauração de Backup - Evo CRM

if [ -z "$1" ]; then
  echo "Uso: ./restore_backup.sh <caminho_para_arquivo_de_backup.tar.gz>"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Erro: Arquivo $BACKUP_FILE não encontrado!"
  exit 1
fi

echo "Iniciando processo de restauração..."
echo "Aviso: Isso irá parar os serviços do CRM e substituir o banco de dados atual!"
read -p "Tem certeza que deseja continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

# 1. Parar serviços
echo "Parando os serviços (mantendo o banco de dados ativo para restauração)..."
docker compose stop evo-crm evo-frontend evo-processor evo-worker evo-core
docker compose up -d postgres redis

# 2. Descompactar o backup
TEMP_DIR=$(mktemp -d)
echo "Descompactando o backup para $TEMP_DIR..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# 3. Restaurar PostgreSQL
SQL_FILE=$(find "$TEMP_DIR" -name "*.sql" | head -n 1)
if [ -n "$SQL_FILE" ]; then
  echo "Restaurando banco de dados a partir de $SQL_FILE..."
  # Derrubar conexões existentes
  docker exec crm_conversacional-v1-postgres-1 psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'evo_community' AND pid <> pg_backend_pid();"
  docker exec crm_conversacional-v1-postgres-1 dropdb -U postgres evo_community
  docker exec crm_conversacional-v1-postgres-1 createdb -U postgres evo_community
  cat "$SQL_FILE" | docker exec -i crm_conversacional-v1-postgres-1 psql -U postgres -d evo_community
  echo "Banco de dados restaurado com sucesso."
else
  echo "Aviso: Nenhum arquivo SQL encontrado no backup. Pulando restauração de banco de dados."
fi

# 4. Restaurar Storage (se existir no backup)
STORAGE_DIR=$(find "$TEMP_DIR" -type d -name "storage" | head -n 1)
if [ -n "$STORAGE_DIR" ]; then
  echo "Restaurando arquivos de storage..."
  rm -rf ./evo-ai-crm-community/storage/*
  cp -r "$STORAGE_DIR"/* ./evo-ai-crm-community/storage/
  echo "Storage restaurado com sucesso."
fi

# 5. Reiniciar serviços
echo "Reiniciando todos os serviços..."
docker compose up -d

# Limpeza
rm -rf "$TEMP_DIR"

echo "Restauração concluída com sucesso!"
