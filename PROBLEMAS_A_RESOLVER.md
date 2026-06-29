# 🔧 PROBLEMAS A RESOLVER - EVO CRM COMMUNITY

**Status do Projeto:** Atualizações para testar novas funcionalidades agentic  
**Objetivo:** Solucionar todos os problemas HOJE  
**Data:** 26 de Junho de 2026

---

## 📋 CHECKLIST DE PROBLEMAS

### 🔴 CRÍTICOS (Bloqueadores)

- [ ] **Submodelos Git**
  - [ ] Verificar se todos os 9 submodelos estão inicializados
  - [ ] Executar: `git submodule update --init --recursive`
  - [ ] Validar commit hashes em cada submodulo
  - **Arquivo de ref:** `.gitmodules`

- [ ] **Docker Compose**
  - [ ] Verificar se todos os 6 serviços principais estão rodando
  - [ ] Check: `docker compose ps` → todos "Up"
  - [ ] Validar connectivity entre serviços
  - [ ] **Arquivo de config:** `docker-compose.yml`

- [ ] **Banco de Dados**
  - [ ] PostgreSQL respondendo em `postgres:5432`
  - [ ] Banco `evo_community` criado e acessível
  - [ ] Migrações aplicadas (sem erros)
  - [ ] Seed data carregado
  - **Comando:** `docker compose exec postgres psql -U postgres -d evo_community -c "SELECT count(*) FROM users;"`

- [ ] **Redis**
  - [ ] Verificar conectividade em `redis:6379`
  - [ ] Senha `evoai_redis_password` funcionando
  - [ ] Cache operacional
  - **Comando:** `docker compose exec redis redis-cli -a evoai_redis_password ping`

- [ ] **Variáveis de Ambiente**
  - [ ] `.env` existe e tem todas as vars necessárias
  - [ ] Secrets não estão vencidos
  - [ ] URLs de serviços estão corretas (localhost para dev)
  - [ ] **Arquivo:** `.env`

### 🟠 ALTOS (Impactam funcionalidades)

- [ ] **Auth Service (Port 3001)**
  - [ ] Responde em `http://localhost:3001`
  - [ ] JWT funcionando
  - [ ] OAuth 2.0 configurado
  - [ ] Doorkeeper JWT setup correto
  - [ ] SMTP/Mailhog funcionando
  - **Logs:** `make logs SERVICE=evo-auth`

- [ ] **CRM Service (Port 3000)**
  - [ ] Responde em `http://localhost:3000`
  - [ ] Conversas carregando
  - [ ] Contatos sincronizados
  - [ ] Inboxes funcionando
  - [ ] CORS headers corretos
  - **Logs:** `make logs SERVICE=evo-crm`

- [ ] **Processor Service (Port 8000)**
  - [ ] Responde em `http://localhost:8000`
  - [ ] Agentes IA carregando
  - [ ] Ferramentas (tools) registradas
  - [ ] MCP funcionando
  - [ ] APIs de IA conectadas
  - **Logs:** `make logs SERVICE=evo-processor`

- [ ] **Core Service (Port 5555)**
  - [ ] Responde em `http://localhost:5555`
  - [ ] Agentes retornando dados
  - [ ] API Keys encriptadas
  - [ ] Pastas e organização funcionando
  - **Logs:** `make logs SERVICE=evo-core`

- [ ] **Bot Runtime (Port 8080)**
  - [ ] Responde em `http://localhost:8080`
  - [ ] Pipelines de bot executando
  - [ ] Debouncing funcionando
  - [ ] Dispatch operacional
  - **Logs:** `make logs SERVICE=evo-bot-runtime`

- [ ] **Frontend (Port 5173)**
  - [ ] Build completa em `/dist`
  - [ ] Assets carregando
  - [ ] Chamadas API funcionando
  - [ ] Vite dev server OK
  - **Logs:** `make logs SERVICE=evo-frontend`

### 🟡 MÉDIOS (Funcionalidades secundárias)

- [ ] **WhatsApp Integration (Evolution API)**
  - [ ] WebSocket conectado
  - [ ] Mensagens sendo sincronizadas
  - [ ] Webhooks respondendo
  - [ ] Rate limits OK
  - **Arquivo de config:** `evolution-api/.env`

- [ ] **APIs de IA**
  - [ ] Google Gemini testada
  - [ ] Groq API testada
  - [ ] OpenRouter funcionando
  - [ ] OpenAI fallback OK
  - [ ] Rate limits respeitados
  - **Keys em:** `credentials/dados_de_Acesso.txt`

- [ ] **Nginx Proxy Manager**
  - [ ] Admin acessível em `http://72.61.37.39:81/`
  - [ ] Proxy rules para subdomínios
  - [ ] SSL certificates válidos
  - [ ] Redirects funcionando

- [ ] **EasyPanel (Painel de Controle)**
  - [ ] Acessível em `https://hpanel.hostinger.com`
  - [ ] Containers visíveis
  - [ ] Backups configurados
  - [ ] Alertas funcionando

### 🟢 BAIXA PRIORIDADE (Nice-to-have)

- [ ] **Documentação**
  - [ ] README atualizado
  - [ ] CHANGELOG refletindo mudanças
  - [ ] EXTENSION_POINTS.md documentado

- [ ] **Testes**
  - [ ] Suite de testes rodando
  - [ ] Coverage aceitável
  - [ ] CI/CD green

- [ ] **Performance**
  - [ ] Queries otimizadas
  - [ ] Cache funcionando
  - [ ] Indices de BD OK

---

## 🎯 PROBLEMAS ESPECÍFICOS DETECTADOS

### 1. Sistema de Orçamentos & Pedidos
**Status:** Phase 1 - Mockup  
**Problema:** Necessário criar HTML mockup para aprovação visual  
**Solução:**
- [ ] Criar `Quotes.html` mockup com lista de orçamentos
- [ ] Criar `Orders.html` mockup com lista de pedidos
- [ ] Design responsivo (mobile + desktop)
- [ ] Integrações simuladas
- [ ] Enviar para aprovação do cliente
- **Próximo:** Phase 2 (Database + API)

### 2. Funcionalidades Agentic
**Status:** Em desenvolvimento  
**Problema:** Novas ferramentas agentic não estão funcionando  
**Verificações:**
- [ ] Tools registradas no Processor
- [ ] Agent schemas corretos
- [ ] Tool output formatting OK
- [ ] Error handling implementado
- [ ] Testes de agent execution

### 3. Integração IA Multi-Provider
**Status:** Parcialmente funcional  
**Problema:** Alguns providers retornando erros  
**Debug:**
- [ ] Test Gemini: `curl -X POST http://localhost:8000/api/v1/test-gemini`
- [ ] Test Groq: `curl -X POST http://localhost:8000/api/v1/test-groq`
- [ ] Test OpenRouter: `curl -X POST http://localhost:8000/api/v1/test-openrouter`
- [ ] Verificar rate limits e quotas
- [ ] Verificar expiry das keys

### 4. CORS & Security Headers
**Status:** Configurado, necessário validar  
**Problema:** Possível misconfiguration em produção  
**Verificações:**
- [ ] Access-Control-Allow-Origin headers
- [ ] Content-Security-Policy correct
- [ ] CSRF tokens funcionando
- [ ] XSS prevention OK
- [ ] Rate limiting ativo

### 5. Sincronização de Dados
**Status:** Básica funcionando, edge cases pendentes  
**Problema:** Possíveis inconsistências em cenários paralelos  
**Validações:**
- [ ] Contatos sincronizados corretamente
- [ ] Conversas sem duplicatas
- [ ] Mensagens em ordem cronológica
- [ ] Eventos disparados corretamente

---

## 🚀 PROCEDIMENTOS DE RESOLUÇÃO

### Procedure 1: Verificar Status Geral

```bash
# Logs completos
make status

# Database check
docker compose exec postgres psql -U postgres -d evo_community -c "
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema='public' 
  ORDER BY table_name;
"

# Redis check
docker compose exec redis redis-cli -a evoai_redis_password info

# Network check
docker compose exec evo-crm curl -s http://localhost:3000/health
docker compose exec evo-auth curl -s http://localhost:3001/health
docker compose exec evo-core curl -s http://localhost:5555/health
docker compose exec evo-processor curl -s http://localhost:8000/health
docker compose exec evo-bot-runtime curl -s http://localhost:8080/health
```

### Procedure 2: Rebuild Completo

```bash
# Stop everything
make stop

# Remove volumes (⚠️ Deleta dados!)
docker compose down -v

# Restart from scratch
make setup
```

### Procedure 3: Debug de Serviço Específico

```bash
# Entrar em um container
make shell-crm

# Dentro do container:
rails db:migrate:status
rails routes | grep -i quote
bundle exec rspec spec/
```

### Procedure 4: Deploy em Produção

```bash
# Na VPS
ssh root@72.61.37.39

cd /path/to/evo-crm-community
git pull origin main
git submodule update --recursive

# Rebuild
docker compose build
docker compose up -d

# Validate
curl https://imperio.clovisvallejr.com
```

---

## 📊 CHECKLIST DE VALIDAÇÃO FINAL

### Antes de Enviar para Produção

- [ ] Todos os 6 serviços respondendo
- [ ] Testes passando (locais + CI/CD)
- [ ] Features agentic testadas end-to-end
- [ ] Orçamentos & Pedidos Phase 1 aprovados
- [ ] Sem erros em logs críticos
- [ ] Database migrations OK
- [ ] Performance aceitável (<200ms avg response)
- [ ] Segurança: CORS, CSRF, XSS validados
- [ ] Backup de produção feito
- [ ] Rollback plan documentado

### Checklist de Deployment

- [ ] Feature branch mergeado em main
- [ ] Version bump em package.json / Gemfile
- [ ] CHANGELOG atualizado
- [ ] Release tag criada
- [ ] Docker images buildadas com novo tag
- [ ] Push para registry (se aplicável)
- [ ] SSH na VPS e pull do main
- [ ] Containers restarted
- [ ] Health checks passando
- [ ] Smoke tests em produção
- [ ] Monitoramento ativado

---

## 📝 NOTAS IMPORTANTES

### Ordem de Atualização (Crítico!)
1. **Auth Service PRIMEIRO** — necessário para CRM
2. **CRM Service** — depende de Auth
3. **Frontend** — depende de CRM + Auth
4. **Processor** — depende de Core
5. **Core Service** — independente
6. **Bot Runtime** — depende de Processor

### Variáveis Compartilhadas (Devem ser idênticas!)
```
SECRET_KEY_BASE
JWT_SECRET_KEY
ENCRYPTION_KEY
EVOAI_CRM_API_TOKEN
```

### Dados Sensíveis (NUNCA commitar!)
- `.env` ❌
- Credentials `.txt` ❌
- API Keys ❌
- Database passwords ❌

---

## 🔗 Links Úteis

| Resource | Link |
|----------|------|
| Docs | https://docs.evolutionfoundation.com.br |
| Community | https://evolutionfoundation.com.br/community |
| GitHub Main | https://github.com/evolution-foundation/evo-crm-community |
| VPS SSH | `ssh root@72.61.37.39` |
| CRM Prod | https://imperio.clovisvallejr.com |
| Painel EasyPanel | https://hpanel.hostinger.com |

---

## ✅ STATUS FINAL

**Análise completada:** 26/06/2026 - 13:15 UTC  
**Pronto para começar:** ✅ SIM  
**Documento de ref:** `/ANALISE_PROJETO_COMPLETA.md`  
**Proxima ação:** Começar com validação dos serviços

