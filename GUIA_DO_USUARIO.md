# 📖 GUIA COMPLETO - O QUE FOI CRIADO E COMO USAR

**Para não-programadores** - Explicação simples e visual

---

## 🎯 O QUE VOCÊ GANHOU?

Seu CRM agora tem **5 novas melhorias + 1 sistema de PDF profissional**:

```
┌─────────────────────────────────────────────────────┐
│  IMPÉRIO CRM - NOVAS FUNCIONALIDADES                │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ✅ 1. VALIDAÇÃO INTELIGENTE                         │
│     - Aviso quando falta preencher campo             │
│     - Mensagens de erro em vermelho                  │
│                                                       │
│  ✅ 2. NOTIFICAÇÕES VISUAIS (TOASTS)                 │
│     - Mensagens que aparecem na tela                 │
│     - Confirmam suas ações                           │
│                                                       │
│  ✅ 3. EDIÇÃO DE ITENS DINÂMICA                      │
│     - Mudar quantidade e preço na tabela             │
│     - Total atualiza sozinho                         │
│                                                       │
│  ✅ 4. CÁLCULO AUTOMÁTICO DE TOTAL                   │
│     - Subtotal + Frete - Desconto = TOTAL            │
│     - Atualiza em tempo real                         │
│                                                       │
│  ✅ 5. SELETOR DE PRODUTOS INTELIGENTE               │
│     - Busca por nome ou SKU                          │
│     - Mostra preço imediatamente                     │
│                                                       │
│  ✅ 6. ORÇAMENTOS EM PDF PROFISSIONAL                │
│     - Visual idêntico ao PDF de referência           │
│     - Inclui imagens dos produtos                    │
│     - Exporta para download                          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ ONDE ESTÃO AS NOVAS FUNCIONALIDADES?

Todas estão em **uma única página**:

```
http://localhost:5173/customer/quotes
```

### Ou clique assim:
1. Abra http://localhost:5173
2. Faça login
3. No menu, clique em **"Orçamentos"**
4. Clique em **"Novo Orçamento"** ou **"Criar Orçamento"**

---

## 📝 O QUE VOCÊ VAI VER?

### **Tela 1: Formulário de Orçamento**

```
┌──────────────────────────────────────────────┐
│                                              │
│  📋 NOVO ORÇAMENTO                           │
│                                              │
│  ID do Contato: [    1      ]  ← Obrigatório │
│                 ❌ Campo obrigatório          │
│                                              │
│  Vendedor: [        ]                        │
│                                              │
│  Status: [Rascunho ▼]  Validade: [2026-07-03]
│                                              │
│  Buscar Produtos: [Buscar aqui...]          │
│                   ⬇️ Dropdown com produtos   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ Produto    │ Qtd │ Preço  │ Ação    │   │
│  ├──────────────────────────────────────┤   │
│  │ Tubo PVC   │ [5] │ [15.50]│ [Lixo] │   │
│  │ Conexão    │ [2] │ [8.00] │ [Lixo] │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  📍 RESUMO:                                  │
│  Subtotal: R$ 115.50                        │
│  Frete: R$ 20.00                            │
│  ─────────────────                          │
│  TOTAL: R$ 135.50                           │
│                                              │
│  [Cancelar]  [Visualizar]  [Criar]          │
│                                              │
└──────────────────────────────────────────────┘
```

---

## ⚙️ COMO USAR CADA FUNCIONALIDADE

### **1️⃣ VALIDAÇÃO INTELIGENTE**

**O que é?** Avisa quando você esquece de preencher algo importante.

**Como funciona:**
1. Deixe um campo vazio
2. Clique em "Criar"
3. Aparece mensagem de erro em vermelho

**Exemplo:**
```
❌ "ID do Contato é obrigatório"
❌ "Mínimo 1 produto necessário"
❌ "Quantidade deve ser maior que 0"
```

---

### **2️⃣ NOTIFICAÇÕES VISUAIS (TOASTS)**

**O que é?** Mensagens que aparecem no canto da tela confirmando suas ações.

**Como funciona:**
- Ao **adicionar produto** → Aparece: "Tubo PVC adicionado!"
- Ao **remover produto** → Aparece: "Tubo PVC removido"
- Ao **salvar orçamento** → Aparece: "Orçamento criado com sucesso!"

**Visual:**
```
┌──────────────────────────────┐
│ ✅ Tubo PVC adicionado!      │
└──────────────────────────────┘
(desaparece após 4 segundos)
```

---

### **3️⃣ EDIÇÃO DINÂMICA DE ITENS**

**O que é?** Você muda quantidade e preço direto na tabela, sem reabrir.

**Como funciona:**
1. Clique no campo de **Quantidade**
2. Mude de `5` para `10`
3. O total recalcula automaticamente
4. Faça o mesmo com **Preço**

**Antes:**
```
Tubo PVC | 5 | R$ 15.50 | Total: R$ 77.50
```

**Depois (muda qtd para 10):**
```
Tubo PVC | 10 | R$ 15.50 | Total: R$ 155.00  ← Automático!
```

---

### **4️⃣ CÁLCULO AUTOMÁTICO DE TOTAL**

**O que é?** O total é calculado automaticamente quando você muda quantidade, preço ou frete.

**Fórmula:**
```
TOTAL = (Qtd × Preço) + Frete - Desconto
```

**Exemplo:**
```
Produto 1: 5 × R$ 15.50 = R$ 77.50
Produto 2: 2 × R$ 8.00  = R$ 16.00
───────────────────────────────────
Subtotal: R$ 93.50
Frete: R$ 20.00
───────────────────────────────────
TOTAL: R$ 113.50  ← Atualiza sozinho!
```

---

### **5️⃣ SELETOR DE PRODUTOS INTELIGENTE**

**O que é?** Busca de produtos com dropdown.

**Como funciona:**
1. Clique em "Buscar produtos para adicionar..."
2. Digite nome do produto (ex: "Tubo")
3. Vê a lista de produtos encontrados
4. Clique no produto para adicionar

**O que você vê:**
```
Buscar: [Tu____]

Dropdown:
├─ Tubo PVC 50mm - R$ 15.50
├─ Tubo PVC 75mm - R$ 22.00
└─ Tubo Ferro - R$ 45.00

[Fechar]
```

---

### **6️⃣ ORÇAMENTOS EM PDF PROFISSIONAL**

**O que é?** Gera um PDF para enviar ao cliente com visual profissional.

**Como funciona:**

#### **Passo 1: Criar o orçamento**
1. Preencha os dados
2. Adicione produtos
3. Clique em **"Visualizar Orçamento"**

#### **Passo 2: Ver preview**
Aparece uma janela mostrando exatamente como vai ficar o PDF:

```
╔════════════════════════════════════════╗
║                                        ║
║      IMPERIO DO PLÁSTICO               ║
║      SOLUÇÕES EM PLÁSTICO              ║
║                                        ║
║                         ORÇAMENTO      ║
║                   Ref: #AB12CD34       ║
║                   Status: RASCUNHO     ║
║                                        ║
║  CLIENTE: João Silva                   ║
║  CONTATO: (11) 99999-9999              ║
║  ENDEREÇO: Rua das Flores, 123         ║
║  VENDEDOR: Carlos                      ║
║                                        ║
║  ┌─────────────────────────────────┐   ║
║  │ PRODUTO   │ QTDE │ VALOR │ IMG  │   ║
║  ├─────────────────────────────────┤   ║
║  │ Tubo PVC  │  5   │ 15.50 │ [IMG]│   ║
║  │ Conexão   │  2   │ 8.00  │ [IMG]│   ║
║  └─────────────────────────────────┘   ║
║                                        ║
║  Total dos Produtos: R$ 93.50          ║
║  Frete: R$ 20.00                       ║
║  TOTAL: R$ 113.50                      ║
║                                        ║
║  [Imprimir] [Baixar PDF] [Fechar]      ║
║                                        ║
╚════════════════════════════════════════╝
```

#### **Passo 3: Baixar PDF**
Clique em **"Baixar PDF"** e o arquivo é salvo no seu computador com o nome:
```
orcamento-123.pdf
```

#### **O que tem no PDF:**
- ✅ Logo da empresa
- ✅ Número de referência
- ✅ Status (RASCUNHO, ENVIADO, ACEITO, etc)
- ✅ Data de emissão
- ✅ Dados do cliente
- ✅ Tabela de produtos
- ✅ **IMAGENS DOS PRODUTOS** (80x80px)
- ✅ Cálculos (Subtotal, Frete, Total)
- ✅ Condições gerais da empresa
- ✅ Validade do orçamento

---

## 🎬 PASSO A PASSO COMPLETO

### **Seu primeiro orçamento:**

#### **1. Entrar no sistema**
```
URL: http://localhost:5173
Email: admin@clovisvallejr.com
Senha: Imperio@123
```

#### **2. Ir para Orçamentos**
```
Menu → Orçamentos
ou
http://localhost:5173/customer/quotes
```

#### **3. Clicar em "Novo Orçamento"**
Um modal (janela) aparece

#### **4. Preencher dados do cliente**
- ID do Contato: `1`
- Vendedor: `Carlos` (opcional)
- Status: `Rascunho`
- Validade: `deixa como está` (7 dias no futuro)

#### **5. Adicionar produtos**
1. Clique em "Buscar produtos para adicionar..."
2. Digite `Tubo` (ou outro nome)
3. Clique no produto encontrado
4. **Toast aparece**: "Tubo PVC adicionado!"
5. Repita para adicionar mais produtos

#### **6. Editar quantidade/preço (opcional)**
1. Clique no campo de quantidade
2. Mude para outra quantidade
3. Veja o total atualizar automaticamente ✨

#### **7. Preencher informações de entrega (opcional)**
- Método: Sedex
- Endereço: Rua das Flores, 123...
- Custo: 20.00

#### **8. Clicar em "Visualizar Orçamento"**
Um preview em HTML aparece mostrando o PDF

#### **9. Testar botões**
- **Imprimir**: Abre diálogo de impressão
- **Baixar PDF**: Salva arquivo `orcamento-123.pdf`
- **Confirmar e Salvar**: Salva no banco de dados

#### **10. Salvar**
Clique em **"Confirmar e Salvar"**
```
✅ Toast: "Orçamento criado com sucesso!"
```

---

## 🔍 ONDE ENCONTRAR CADA COISA?

### **Validação de Campos**
- **Localização**: No formulário de orçamento
- **Quando aparece**: Ao clicar "Criar" com campos vazios
- **Visual**: Texto vermelho de erro

### **Toasts (Notificações)**
- **Localização**: Canto superior direito da tela
- **Quando aparecem**: 
  - Ao adicionar produto
  - Ao remover produto
  - Ao salvar orçamento
  - Em caso de erro
- **Duração**: 4 segundos (desaparecem automaticamente)

### **Tabela Dinâmica**
- **Localização**: No modal de novo orçamento
- **O que pode fazer**: 
  - Mudar quantidade
  - Mudar preço
  - Deletar produto (botão com lixeira)
- **Como funciona**: Tudo em tempo real, sem recarregar

### **Resumo de Totais**
- **Localização**: Parte inferior do formulário
- **Mostra**: 
  - Subtotal (produtos)
  - Frete
  - Total final
- **Atualização**: Automática

### **Seletor de Produtos**
- **Localização**: Campo "Buscar produtos para adicionar..."
- **Funcionalidade**: Dropdown inteligente com busca
- **Busca por**: Nome do produto ou SKU

### **PDF e Impressão**
- **Localização**: Modal "Visualizar Orçamento"
- **Botões**:
  - **Imprimir**: Imprime direto na impressora
  - **Baixar PDF**: Salva arquivo no computador
  - **Fechar**: Fecha a preview
  - **Confirmar e Salvar**: Salva no banco de dados

---

## 📊 ARQUIVOS QUE FORAM CRIADOS

Se você quer entender melhor, estes são os arquivos criados (pasta: `evo-ai-frontend-community/src`):

```
📁 schemas/
  └─ quoteSchema.ts          ← Validação de orçamentos

📁 contexts/
  └─ ToastContext.tsx        ← Sistema de notificações

📁 components/shared/
  ├─ ItemsTable.tsx          ← Tabela editável de itens
  ├─ ProductSelector.tsx     ← Seletor de produtos
  ├─ QuoteTemplate.tsx       ← Template visual do PDF
  └─ QuotePreviewModal.tsx   ← Preview e botões PDF

📁 hooks/
  ├─ useFormValidation.ts    ← Hook de validação
  └─ usePdfExport.ts         ← Hook de exportação PDF

📁 components/quotes/
  └─ QuoteModal.tsx          ← Modal principal (atualizado)
```

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### **"Validação não aparece"**
- Certifique-se de deixar campo vazio
- Clique no botão "Criar"
- Mensagem deve aparecer em vermelho

### **"Toast não aparece"**
- Veja o canto superior direito da tela
- Deve aparecer por 4 segundos
- Se nada aparecer, abra console (F12) para ver erros

### **"Total não atualiza"**
- Clique fora do campo depois de mudar
- Ou pressione TAB ou ENTER
- Total deve recalcular automaticamente

### **"PDF não baixa"**
- Verifique bloqueador de pop-ups
- Veja pasta "Downloads"
- Arquivo chamado `orcamento-123.pdf`

### **"Produtos não aparecem no dropdown"**
- Certifique-se de estar logado
- Verifique se há produtos cadastrados no sistema
- Tente digitar nome do produto

---

## ✅ CHECKLIST DE TESTE

Quando estiver usando, teste:

- [ ] Deixar campo vazio → Ver validação
- [ ] Adicionar produto → Ver toast
- [ ] Mudar quantidade → Ver total atualizar
- [ ] Mudar preço → Ver total atualizar
- [ ] Mudar frete → Ver total atualizar
- [ ] Clicar "Visualizar" → Ver preview
- [ ] Clicar "Baixar PDF" → Ver arquivo baixar
- [ ] Clicar "Confirmar" → Ver toast de sucesso
- [ ] Abrir PDF → Ver imagens dos produtos
- [ ] Imprimir → Ver diálogo de impressão

---

## 🎓 RESUMO RÁPIDO

| Funcionalidade | Onde | Como Acessar |
|---|---|---|
| **Validação** | Formulário | Deixe campo vazio + clique "Criar" |
| **Toasts** | Canto superior direito | Adicione/remova produto ou salve |
| **Edição Dinâmica** | Tabela de itens | Clique em Qtd ou Preço e mude |
| **Auto-cálculo** | Resumo final | Mude qualquer valor |
| **Seletor** | Campo de busca | Digite nome do produto |
| **PDF** | Modal preview | Clique "Visualizar Orçamento" |

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Entender as funcionalidades (você está aqui!)
2. ⏭️ Testar cada uma (siga o checklist acima)
3. ⏭️ Enviar orçamentos aos clientes (usando o PDF)
4. ⏭️ Configurar produtos (adicionar mais produtos e preços)

---

**Dúvidas?** Releia este guia ou verifique os documentos técnicos em:
- `TESTE_DOCKER_MANUAL.md` - Teste completo
- `DELIVERABLES.md` - O que foi entregue
- `PROJETO_FINALIZADO.md` - Detalhes técnicos

**Status:** 🟢 **VOCÊ ESTÁ PRONTO!**
