# 🔍 Página Gerenciar Reserva - Roomview Boutique

## 📋 Visão Geral

Página dedicada para clientes e staff consultarem e gerirem reservas através de busca segura por ID e contacto.

**URL:** `/gerenciar-reserva`

**Acessível via:** Link no Header principal "Gerenciar"

---

## 🎯 Objectivos

1. **Para Clientes:**
   - Consultar status da reserva
   - Ver detalhes completos da estadia
   - Acompanhar pagamento
   - Baixar comprovativo
   - Pagar sinal (se pendente)

2. **Para Staff (com login):**
   - Buscar reservas de clientes
   - Confirmar pagamentos manualmente
   - Liquidar saldo restante
   - Cancelar reservas
   - Reenviar referências

---

## 🔐 Sistema de Busca Segura

### Método: `getBookingSecure()`

```typescript
// Implementação no bookingService
getBookingSecure(id: string, contact: string): Booking | undefined {
    const bookings = this.getBookings();
    const searchId = id.toUpperCase().trim();
    const searchContact = contact.toLowerCase().trim();

    return bookings.find(b =>
        b.id === searchId &&
        (b.email.toLowerCase() === searchContact || 
         b.telefone.includes(searchContact))
    );
}
```

### Validações:
- ✅ ID da reserva (formato: RV-XXXXXXX)
- ✅ Email OU Telefone usado na reserva
- ✅ Ambos os campos são obrigatórios
- ✅ Busca case-insensitive

### Segurança:
- 🔒 Apenas quem tem os 2 dados pode acessar
- 🔒 Sem listagem de todas as reservas
- 🔒 Validação no frontend e backend (simulado)

---

## 🎨 Interface do Utilizador

### 1️⃣ Formulário de Busca

**Design:**
- Card centralizado com fundo dourado no header
- Ícone de lupa destacado
- 2 campos de input:
  - ID da Reserva (uppercase, monospace)
  - Telefone ou Email
- Botão grande de busca
- Links de ajuda no rodapé

**Estados:**
- `IDLE` - Aguardando input
- `SEARCHING` - Spinner animado (800ms simulado)
- `FOUND` - Exibe detalhes
- `NOT_FOUND` - Mensagem de erro

### 2️⃣ Detalhes da Reserva

Dividido em **2 colunas** (responsive):

#### Coluna Esquerda (2/3):

**Card 1: Informações Básicas**
- Nome do apartamento
- ID da reserva
- Data de criação
- Check-in / Check-out
- Cliente / Estadia (noites e pessoas)

**Card 2: Contacto & Pagamento**
- Email
- Telefone
- Método de pagamento (com ícone colorido):
  - 📱 Multicaixa Express (verde)
  - 📋 Referência (azul)
  - 🏦 Transferência (roxo)
  - 💼 Presencial (laranja)

**Card 3: Extras** (se houver)
- Lista de itens consumidos
- Quantidade × Preço unitário
- Data de consumo
- Total de extras

**Action Buttons:**
- 🟡 "Pagar Sinal Agora" (se pendente)
- 📄 "Visualizar Comprovativo" (se confirmada)
- 🔗 "Ver Apartamento"

**Staff Actions:** (apenas para utilizadores logados com permissões)
- ✅ Confirmar Pagamento
- 💰 Liquidar Saldo
- ❌ Cancelar Reserva
- 🔄 Reenviar Referência

#### Coluna Direita (1/3):

**Resumo Financeiro:**
- Preço Total
- Sinal Pago (verde se pago)
- Saldo Restante (vermelho se pendente)
- Nota sobre pagamento presencial

**Badge de Status:**
- 🟡 Aguardando Pagamento
- 🟢 Pago / Confirmada
- 🔵 Hóspede em Estadia
- ⚫ Concluída
- 🔴 Cancelada
- ⚪ Expirada

---

## 📄 Comprovativo / Recibo

### Formato:
- Modal full-screen em fundo branco
- Estilo de recibo térmico (mono uppercase)
- Preparado para impressão (`window.print()`)

### Conteúdo:

**Header:**
- Logo Roomview Boutique
- Morada completa
- ID do comprovativo
- Data/hora de emissão

**Dados do Cliente:**
- Nome do hóspede
- Tipo de apartamento
- Datas (check-in/out)
- Número de noites
- Método de pagamento

**Valores:**
```
TOTAL DA ESTADIA         375.000 AKZ

EXTRAS CONSUMIDOS:
2x Água Mineral            1.000 AKZ
1x Almoço                 15.000 AKZ
─────────────────────────
SUBTOTAL EXTRAS           16.000 AKZ

VALOR JÁ PAGO (SINAL)     25.000 AKZ ✅
═════════════════════════════════════
SALDO A PAGAR NO LOCAL   366.000 AKZ
```

**Footer:**
- QR Code da reserva (100x100px)
- ID da reserva em font-mono
- Instrução: "Apresente este QR Code no check-in"

### Funcionalidades:
- ✅ Botão "Imprimir / PDF" 
- ✅ Botão "Fechar"
- ✅ Download via navegador (Ctrl+P → Salvar como PDF)
- ✅ QR Code gerado dinamicamente (API pública)

---

## 🎭 Estados da Reserva

| Status | Badge | Ações Disponíveis (Cliente) | Ações Disponíveis (Staff) |
|--------|-------|------------------------------|---------------------------|
| PENDENTE_PAGAMENTO | 🟡 Aguardando | Pagar Sinal | Confirmar, Cancelar |
| CONFIRMADA | 🟢 Confirmada | Ver Comprovativo | Liquidar Saldo, Cancelar |
| CHECKIN_REALIZADO | 🔵 Em Estadia | Ver Comprovativo | Liquidar Saldo, Adicionar Extras |
| FINALIZADA | ⚫ Concluída | Ver Comprovativo | - |
| CANCELADA | 🔴 Cancelada | - | - |
| EXPIRADA | ⚪ Expirada | - | - |

---

## 💡 Funcionalidades Especiais

### 1. Detecção de Permissões

```typescript
const can = (permission: string) => {
    if (!currentUser) return false;
    return authService.hasPermission(currentUser, permission as any);
};

// Uso:
{can("MANAGE_BOOKINGS") && (
    <Button onClick={handleConfirmPayment}>
        Confirmar Pagamento
    </Button>
)}
```

### 2. Informações de Contacto

- 📧 Email do cliente
- 📱 Telefone do cliente
- Ambos exibidos de forma elegante em cards

### 3. Método de Pagamento

```typescript
const getPaymentMethodInfo = (method?: string) => {
    switch(method) {
        case "EXPRESS":
            return { 
                icon: Smartphone, 
                label: "Multicaixa Express", 
                color: "text-green-500" 
            };
        // ... outros métodos
    }
};
```

### 4. Cálculo de Extras

Saldo final inclui:
- Estadia restante
- + Extras consumidos
- - Sinal já pago

---

## 📱 Responsividade

### Desktop (lg+):
- Layout 2 colunas (67% / 33%)
- Todos os elementos visíveis
- Formulário de busca centralizado (max-width: 512px)

### Tablet (md):
- Colunas empilhadas
- Botões grid 2x2

### Mobile (sm):
- Tudo empilhado verticalmente
- Botões full-width
- Texto reduzido

---

## 🔗 Navegação

### Links no Formulário:
- 🔙 "Voltar à Home" → `/`
- 📞 "Precisa de ajuda?" → WhatsApp

### Após Buscar:
- 🔍 "Nova Pesquisa" → Limpa e volta ao formulário
- 🏠 "Ver Apartamento" → `/apartamento/:id`
- 💳 "Pagar Sinal Agora" → `/checkout/:id` (se pendente)

---

## 🎯 Casos de Uso

### Caso 1: Cliente Verifica Status

1. Cliente recebe email com ID: `RV-ABC1234`
2. Acessa `/gerenciar-reserva`
3. Insere ID + email usado na reserva
4. Vê status "Aguardando Pagamento"
5. Clica em "Pagar Sinal Agora"
6. Redireccionado para checkout

### Caso 2: Cliente Imprime Comprovativo

1. Cliente busca reserva confirmada
2. Clica em "Visualizar Comprovativo"
3. Modal abre com recibo completo
4. Clica "Imprimir / PDF"
5. Selecciona impressora ou "Salvar como PDF"
6. Guarda comprovativo para check-in

### Caso 3: Staff Confirma Pagamento Manual

1. Operador faz login no sistema
2. Cliente chega ao balcão com comprovante físico
3. Operador busca reserva no sistema
4. Vê botão "Confirmar Pagamento" (só staff vê)
5. Clica e confirma
6. Status muda para "Confirmada"
7. Cliente recebe confirmação

### Caso 4: Staff Adiciona Extras e Liquida

1. Cliente está em estadia (CHECKIN_REALIZADO)
2. Consome serviços extras (refeições, etc.)
3. Staff adiciona extras via Admin
4. No check-out, staff busca reserva
5. Vê saldo total (estadia + extras)
6. Clica "Liquidar Saldo"
7. Gera comprovativo final com tudo incluído

---

## 🚀 Melhorias Futuras

### Sugeridas:

1. **Sistema de Notificações**
   - Email automático quando buscar reserva
   - SMS com link directo para gerenciar

2. **Histórico de Mudanças**
   - Log de todas as alterações de status
   - Quem fez (staff) e quando

3. **Chat de Suporte**
   - Widget de WhatsApp integrado
   - Botão "Falar com Recepção"

4. **Upload de Documentos**
   - Cliente pode enviar ID/Passaporte
   - Agiliza check-in

5. **Avaliação Pós-Estadia**
   - Link para deixar review
   - Rating de 1-5 estrelas

6. **Reservas Múltiplas**
   - Ver histórico de estadias anteriores
   - Programa de fidelidade

---

## 📊 Métricas de Sucesso

### Indicadores:
- ✅ Taxa de uso da página (vs. ligar para recepção)
- ✅ Tempo médio de busca
- ✅ % de pagamentos concluídos após visualizar
- ✅ Quantidade de comprovativos baixados
- ✅ Redução de chamadas telefónicas

---

## 🔐 Segurança e Privacidade

### Medidas Implementadas:
- ✅ Busca requer 2 factores (ID + contacto)
- ✅ Dados sensíveis ocultados parcialmente
- ✅ Sem listagem pública de reservas
- ✅ Staff actions apenas com login
- ✅ Validação de permissões em cada acção

### Recomendado para Produção:
- 🔒 Rate limiting (max 5 buscas/minuto)
- 🔒 Captcha após 3 tentativas falhadas
- 🔒 Log de todos os acessos
- 🔒 2FA para ações críticas (cancelamento)
- 🔒 Encriptação de dados em trânsito

---

## 📝 Notas Técnicas

### Dependências Principais:
- `framer-motion` - Animações suaves
- `date-fns` - Formatação de datas
- `lucide-react` - Ícones
- `sonner` - Toasts/notificações

### Componentes Reutilizados:
- `Header` - Navegação principal
- `Footer` - Rodapé padrão
- `Badge` - Status badges
- `Button` - Botões do shadcn/ui
- `Input` / `Label` - Formulários

### Performance:
- Busca simulada com 800ms delay (realista)
- Lazy loading de imagens (apartment photos)
- Memoização de cálculos pesados
- Animações otimizadas (GPU acceleration)

---

## 📞 Suporte

Para dúvidas sobre o uso da página:
- **Cliente:** Botão "Precisa de ajuda?" → WhatsApp
- **Staff:** Documentação técnica no Admin
