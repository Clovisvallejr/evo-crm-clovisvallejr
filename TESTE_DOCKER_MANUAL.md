# 🐳 GUIA DE TESTE NO DOCKER

**Status:** ✅ Pronto para você executar localmente  
**Ambiente:** Docker Desktop no Windows  
**Tempo Estimado:** 10-15 minutos

---

## 🚀 PASSO 1: INSTALAR DEPENDÊNCIAS

Execute no terminal na **raiz do projeto** (`C:\xampp\htdocs\imperio-crm\evo-crm-clovisvallejr_2`):

```bash
npm install html2pdf.js zod
```

**Esperado:**
```
added 2 packages
up to date, audited XXX packages
```

---

## 🏗️ PASSO 2: BUILD DO FRONTEND

Execute no terminal:

```bash
cd evo-ai-frontend-community
npm run build
cd ..
```

**Esperado:**
```
✓ 1,234 modules transformed
Building for production...
dist/index.html          XX.XX KiB
dist/js/main.XXXXX.js    XXX.XX KiB
```

---

## 🔧 PASSO 3: LIGAR DOCKER

Execute no terminal:

```bash
docker compose up -d
```

**Esperado:**
```
Creating container evo-crm...
Creating container evo-auth...
Creating container evo-processor...
Creating container evo-core...
Creating container evo-bot-runtime...
Creating container postgres...
Creating container redis...
```

---

## ✅ PASSO 4: VERIFICAR STATUS

Execute:

```bash
docker compose ps
```

**Esperado (todos "Up"):**
```
NAME                COMMAND             STATUS
evo-crm            "bundle exec rails"  Up 2 minutes
evo-auth           "bundle exec rails"  Up 2 minutes
evo-processor      "python -m"          Up 2 minutes
evo-core           "/app/main"          Up 2 minutes
evo-bot-runtime    "/app/main"          Up 2 minutes
postgres           "postgres"           Up 2 minutes
redis              "redis-server"       Up 2 minutes
```

---

## 🧪 PASSO 5: TESTAR ENDPOINTS

Abra **PowerShell** ou **Terminal** e execute os testes:

### 5.1 CRM API (Port 3000)
```powershell
curl http://localhost:3000/health
```
**Esperado:** Status 200

### 5.2 Auth API (Port 3001)
```powershell
curl http://localhost:3001/health
```
**Esperado:** Status 200

### 5.3 Processor API (Port 8000)
```powershell
curl http://localhost:8000/docs
```
**Esperado:** Swagger docs abrem

### 5.4 Core Service (Port 5555)
```powershell
curl http://localhost:5555/health
```
**Esperado:** Status 200

### 5.5 Bot Runtime (Port 8080)
```powershell
curl http://localhost:8080/health
```
**Esperado:** Status 200

---

## 🌐 PASSO 6: ACESSAR APLICAÇÃO

Abra no navegador:

```
http://localhost:5173
```

**Esperado:** Página de login do CRM carrega

---

## 🧬 PASSO 7: TESTAR FLUXO COMPLETO

### 7.1 Login
- Email: `admin@clovisvallejr.com`
- Senha: `Imperio@123`

### 7.2 Acessar Orçamentos
```
http://localhost:5173/customer/quotes
```

### 7.3 Criar Novo Orçamento
1. Clique "Novo Orçamento"
2. **Validação funcionando?** 
   - Deixe vazio e clique salvar
   - Deve aparecer erro em vermelho ✅

3. Preencha:
   - Contato ID: `1`
   - Produtos: Adicione 2 produtos
   - Quantidade/Preço

4. **Toast aparece?**
   - Ao adicionar produto → "Produto adicionado!" ✅
   - Ao salvar → "Orçamento criado!" ✅

5. **Cálculo automático?**
   - Mude quantidade ou preço
   - Total atualiza em tempo real ✅

### 7.4 Visualizar Orçamento
1. Clique "Visualizar Orçamento" no modal
2. **Preview carrega?** ✅
3. **Imagens aparecem?** ✅
4. **Botões funcionam?**
   - Imprimir → abre diálogo
   - Baixar PDF → salva arquivo
   - Confirmar e Salvar → volta à lista

### 7.5 Pedidos
Repita os mesmos testes em:
```
http://localhost:5173/customer/orders
```

---

## 🔍 PASSO 8: VALIDAR BANCO DE DADOS

Execute no terminal:

```bash
docker compose exec postgres psql -U postgres -d evo_community -c "SELECT COUNT(*) FROM quotes;"
```

**Esperado:** O número de orçamentos criados

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] npm install completou sem erros
- [ ] npm run build completou com sucesso
- [ ] docker compose up -d executou
- [ ] docker compose ps mostra todos "Up"
- [ ] CRM API responde (port 3000)
- [ ] Auth API responde (port 3001)
- [ ] Processor responde (port 8000)
- [ ] Core Service responde (port 5555)
- [ ] Bot Runtime responde (port 8080)
- [ ] Frontend carrega (localhost:5173)
- [ ] Login funciona
- [ ] Validação funciona (erros aparecem)
- [ ] Toasts funcionam (notificações)
- [ ] Cálculo automático funciona (total atualiza)
- [ ] Preview do orçamento carrega
- [ ] Imagens aparecem no orçamento
- [ ] PDF exporta sem erros
- [ ] Orçamento salva no banco
- [ ] Pedidos funcionam igual

---

## 🐛 TROUBLESHOOTING

### Docker não inicia
```bash
# Reiniciar Docker
docker compose restart

# Ou reconstruir
docker compose down
docker compose up -d --build
```

### Port já em uso
```bash
# Ver quem está usando port 3000
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <PID> /F
```

### Frontend não carrega
```bash
# Verificar se build completou
ls -la evo-ai-frontend-community/dist/

# Rebuild
cd evo-ai-frontend-community
npm run build
cd ..
docker compose restart evo-frontend
```

### Validação não funciona
```bash
# Verificar console do navegador (F12)
# Ver se há erros de import
# Verificar se html2pdf.js foi instalado
npm list html2pdf.js
```

---

## 🎯 RESULTADO ESPERADO

✅ Todos os endpoints respondendo  
✅ Frontend carregando e funcional  
✅ Validação funcionando  
✅ Toasts aparecendo  
✅ Cálculos automáticos  
✅ Preview e PDF exportando  
✅ Dados salvando no banco  

---

## 📝 NOTAS

1. **Primeira vez:** Pode demorar alguns minutos para o banco inicializar
2. **Imagens:** Se não houver imagem de produto, mostra "Sem imagem"
3. **PDF:** Abre em nova aba do navegador
4. **Banco:** PostgreSQL em port 5432 (local)
5. **Cache:** Redis em port 6379

---

**Status:** ✅ TUDO PRONTO PARA TESTAR

Execute os passos acima e valide o checklist!

