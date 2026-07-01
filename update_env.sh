#!/bin/bash
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://imperiocrm.com.br|' .env
sed -i 's|^BACKEND_URL=.*|BACKEND_URL=https://imperiocrm.com.br/crm|' .env
echo "Variables fixed successfully."
