# ▶️ COMO EXECUTAR O SETUP DO IMPÉRIO CRM

**Não é programador?** Sem problemas! Siga os passos abaixo:

---

## 🎯 OPÇÃO 1: EXECUTAR SCRIPT AUTOMÁTICO (Recomendado)

### Passo 1: Abrir PowerShell

1. Pressione `Windows + X`
2. Clique em **"Windows PowerShell (Administrador)"**
3. Clique em **"Sim"** na janela de confirmação

### Passo 2: Navegar até a pasta do projeto

Cole isto no PowerShell e pressione `Enter`:

```powershell
cd C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2
```

### Passo 3: Executar o script

Cole isto no PowerShell e pressione `Enter`:

```powershell
.\SETUP_BUILD_DOCKER.ps1
```

**Aguarde!** O script vai:
- ✅ Instalar html2pdf.js e zod
- ✅ Buildar o frontend
- ✅ Ligar o Docker
- ✅ Validar que tudo está funcionando

⏱️ **Tempo estimado:** 5-10 minutos

---

## 📍 OPÇÃO 2: EXECUTAR MANUALMENTE (Se o script não funcionar)

Se receber erro de permissão ao executar o script, siga estes passos manualmente:

### Terminal 1 - Instalar + Build

```powershell
cd C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2
npm install html2pdf.js zod
cd evo-ai-frontend-community
npm run build
cd ..
```

### Terminal 2 - Docker

```powershell
cd C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2
docker compose up -d
docker compose ps
```

---

## ✅ VERIFICAR SE TUDO FUNCIONOU

Após executar o script ou os comandos, verifique:

### No PowerShell (após `docker compose ps`):

Deve aparecer algo como:

```
NAME             COMMAND              STATUS
evo-crm          "bundle exec rails"  Up 2 minutes
evo-auth         "bundle exec rails"  Up 2 minutes
evo-processor    "python -m"          Up 2 minutes
evo-core         "/app/main"          Up 2 minutes
evo-bot-runtime  "/app/main"          Up 2 minutes
postgres         "postgres"           Up 2 minutes
redis            "redis-server"       Up 2 minutes
```

Se todos estão **"Up"**, está tudo funcionando! ✅

---

## 🌐 ACESSAR A APLICAÇÃO

Abra seu navegador (Chrome, Edge, Firefox, etc) e vá para:

```
http://localhost:5173
```

### Login

- **Email:** admin@clovisvallejr.com
- **Senha:** Imperio@123

### Testar Orçamentos

1. Clique em **"Orçamentos"** ou acesse:
   ```
   http://localhost:5173/customer/quotes
   ```

2. Clique em **"Novo Orçamento"**

3. Preencha os campos e veja:
   - ✅ Validação funcionando (erros em vermelho)
   - ✅ Toasts aparecendo (notificações)
   - ✅ Total recalculando automaticamente
   - ✅ Imagens dos produtos aparecendo

4. Clique em **"Visualizar Orçamento"**

5. Na preview, clique **"Baixar PDF"** e salve o arquivo

6. Abra o PDF e verifique se tem:
   - ✅ Logo da empresa
   - ✅ Informações do cliente
   - ✅ Tabela de produtos com imagens
   - ✅ Cálculo correto do total
   - ✅ Condições gerais

---

## 🐛 PROBLEMAS E SOLUÇÕES

### "Permission denied" ao executar script

Execute como Administrador:

1. Abra **PowerShell** como Administrador
2. Execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Pressione `Y` para confirmar
4. Tente novamente

### Docker não inicia

```powershell
# Parar tudo
docker compose down

# Reiniciar
docker compose up -d

# Aguarde 2-3 minutos
```

### Build falha

Limpe o cache:

```powershell
cd evo-ai-frontend-community
rm node_modules -Recurse
npm install
npm run build
cd ..
```

### Port 5173 em uso

Se der erro de port em uso:

```powershell
# Matrar processo na port 5173
netstat -ano | findstr :5173
# Copie o PID e execute:
taskkill /PID <PID> /F
```

---

## 📞 PRECISA DE AJUDA?

Verifique:
1. **TESTE_DOCKER_MANUAL.md** — Guia completo de teste
2. **PROJETO_FINALIZADO.md** — Documentação geral
3. **DELIVERABLES.md** — O que foi entregue

---

## 🎉 TUDO PRONTO!

Quando tudo estiver funcionando, você terá um CRM profissional com:

✅ Orçamentos em PDF  
✅ Validação inteligente  
✅ Notificações visuais  
✅ Auto-cálculos  
✅ Imagens de produtos  
✅ Pronto para produção  

**Status:** 🟢 **TUDO FUNCIONANDO!**
