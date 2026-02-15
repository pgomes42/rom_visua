# 💳 Métodos de Pagamento - Roomview Boutique

## 📋 Visão Geral

O sistema oferece **4 métodos de pagamento** integrados para garantir máxima flexibilidade aos clientes:

---

## 1️⃣ Multicaixa Express

**Ícone:** 📱 Smartphone

**Descrição:** Pagamento rápido e seguro directamente no telemóvel do cliente.

### Como Funciona:
1. Cliente seleciona "Multicaixa Express"
2. Insere o número de telemóvel (9 dígitos)
3. Sistema envia pedido de pagamento para o aplicativo Multicaixa
4. Cliente confirma no telemóvel
5. Pagamento é confirmado automaticamente após 5 segundos (simulado)

### Vantagens:
- ✅ Processo rápido (menos de 1 minuto)
- ✅ Sem necessidade de sair de casa
- ✅ Confirmação instantânea
- ✅ Seguro e encriptado

### Código de Implementação:
```typescript
metodo_pagamento: "EXPRESS"
```

---

## 2️⃣ Pagamento por Referência

**Ícone:** 📋 ClipboardCheck

**Descrição:** Gera uma referência Multicaixa para pagamento em ATM, TPA ou Internet Banking.

### Como Funciona:
1. Cliente seleciona "Pagar por Referência"
2. Sistema exibe:
   - **Entidade:** 00567 (fictício)
   - **Referência:** 9 dígitos gerados automaticamente
   - **Valor:** 25.000 AKZ (sinal)
3. Cliente paga no Multicaixa (ATM/Internet Banking)
4. Cliente clica em "Já efectuei o pagamento"
5. Sistema aguarda confirmação bancária (manual no admin)

### Vantagens:
- ✅ Pode pagar em qualquer ATM Multicaixa
- ✅ Disponível 24/7
- ✅ Suporta todos os bancos angolanos
- ✅ Referência copiável para facilitar

### Código de Implementação:
```typescript
metodo_pagamento: "REFERENCIA"
referencia_pagamento: "123456789" // Gerado automaticamente
```

---

## 3️⃣ Transferência Bancária / IBAN

**Ícone:** 🏦 Building

**Descrição:** Transferência directa para a conta da Roomview Boutique com upload de comprovativo.

### Como Funciona:
1. Cliente seleciona "Transferência Bancária"
2. Sistema exibe dados bancários:
   - **Banco:** BAI
   - **Beneficiário:** Roomview Boutique Lda.
   - **IBAN:** AO06 0040 0000 0123 4567 8901 2
3. Cliente efectua transferência
4. Cliente faz upload do comprovativo (PDF, JPG, PNG - máx. 5MB)
5. Sistema valida e aguarda confirmação manual no admin

### Vantagens:
- ✅ Aceita qualquer banco
- ✅ Upload de comprovativo para rastreamento
- ✅ IBAN copiável
- ✅ Confirmação rápida pelo admin

### Validações Implementadas:
- ✅ Tipos de ficheiro: PDF, JPG, JPEG, PNG
- ✅ Tamanho máximo: 5MB
- ✅ Preview do ficheiro carregado
- ✅ Nome e tamanho visíveis

### Código de Implementação:
```typescript
metodo_pagamento: "TRANSFERENCIA"
```

---

## 4️⃣ Pagamento Presencial (Balcão)

**Ícone:** 💼 Wallet

**Descrição:** Cliente paga directamente no balcão da Roomview Boutique (dinheiro ou TPA).

### Como Funciona:
1. Cliente seleciona "Pagamento Presencial"
2. Sistema exibe informações do balcão:
   - **Morada:** Patriota, Via Principal, Luanda
   - **Horário:** Segunda a Domingo, 08:00 - 20:00
   - **Contacto:** +244 923 000 000
3. Reserva é mantida por 2 horas
4. Cliente visita o balcão
5. Operador confirma pagamento manualmente no sistema

### Vantagens:
- ✅ Aceita dinheiro (kwanzas)
- ✅ Aceita TPA (Multicaixa)
- ✅ Atendimento personalizado
- ✅ Sem taxas online
- ✅ Link para Google Maps

### Código de Implementação:
```typescript
metodo_pagamento: "PRESENCIAL"
```

---

## ⏱️ Sistema de Expiração

### Tempo Limite:
- **2 horas** após criação da reserva

### Avisos:
- 🟡 **5 minutos restantes:** Notificação de aviso
- 🔴 **Expirado:** Overlay vermelho com botão para nova reserva

### Comportamento:
1. Timer visível em tempo real (HH:MM:SS)
2. Barra de progresso visual
3. Cores dinâmicas:
   - Verde/Dourado: Tempo normal
   - Vermelho: < 10 minutos
4. Ao expirar:
   - Status muda para `EXPIRADA`
   - Métodos de pagamento desabilitados
   - Mensagem de erro exibida
   - Botão para criar nova reserva

---

## 📊 Valores de Pagamento

### Sinal (Obrigatório):
- **25.000 AKZ** - Pago online para confirmar reserva

### Saldo (Presencial):
- **Total da Estadia - 25.000 AKZ** - Pago no check-in

### Exemplo:
```
Apartamento T1 Prime - 3 noites
Valor por noite: 125.000 AKZ
Total: 375.000 AKZ

Sinal (Online): 25.000 AKZ ✅
Saldo (Check-in): 350.000 AKZ 💵
```

---

## 🔄 Fluxo de Confirmação

### Automático (Express):
1. Cliente confirma no telemóvel
2. Sistema recebe confirmação instantânea
3. Status muda para `CONFIRMADA`
4. E-mail de confirmação enviado

### Manual (Referência/Transferência/Presencial):
1. Cliente efectua pagamento
2. Operador/Admin verifica no sistema bancário
3. Operador confirma manualmente no dashboard
4. Status muda para `CONFIRMADA`
5. Cliente recebe notificação

---

## 🎨 Experiência do Utilizador

### Design:
- Cartões expansíveis para cada método
- Ícones intuitivos
- Cores da marca (dourado #d4af37)
- Animações suaves (framer-motion)
- Responsivo mobile

### Feedback:
- ✅ Toasts informativos (sonner)
- ✅ Estados de loading
- ✅ Confirmações visuais
- ✅ Erros claros

### Acessibilidade:
- ✅ Labels descritivas
- ✅ Botões grandes
- ✅ Contraste adequado
- ✅ Textos alternativos

---

## 🔐 Segurança

### Implementado:
- ✅ Validação de inputs
- ✅ Timeout de sessão (2h)
- ✅ Confirmação bancária manual
- ✅ Upload seguro com validação

### Recomendado para Produção:
- 🔒 Gateway de pagamento real (Multicaixa API)
- 🔒 Webhook para confirmação automática
- 🔒 Encriptação SSL/TLS
- 🔒 Armazenamento seguro de comprovativos
- 🔒 Autenticação 2FA para pagamentos

---

## 📝 Notas Técnicas

### Armazenamento:
```typescript
// LocalStorage (Demonstração)
interface Booking {
  metodo_pagamento?: "EXPRESS" | "REFERENCIA" | "TRANSFERENCIA" | "PRESENCIAL";
  referencia_pagamento: string; // 9 dígitos
  valor_sinal: 25000;
  restante_pagar: number;
  expires_at: string; // ISO timestamp
}
```

### Estados de Pagamento:
- `IDLE` - Nenhum método selecionado
- `AWAITING` - Aguardando confirmação
- `CONFIRMED` - Pagamento confirmado

### Estados de Reserva:
- `PENDENTE_PAGAMENTO` - Aguardando pagamento
- `CONFIRMADA` - Pagamento confirmado
- `EXPIRADA` - Tempo esgotado
- `CANCELADA` - Cancelada manualmente

---

## 🚀 Funcionalidades Futuras

### Sugeridas:
1. **WhatsApp Pay** - Pagamento via WhatsApp Business
2. **Pagamento Parcelado** - Dividir em 2-3x sem juros
3. **Cartão de Crédito Internacional** - Visa/Mastercard
4. **PayPal** - Para clientes internacionais
5. **Desconto por Pagamento Antecipado** - 5% se pagar 100% online
6. **Múltiplas Moedas** - USD, EUR, ZAR

---

## 📞 Suporte

Para dúvidas sobre pagamentos:
- **WhatsApp:** +244 923 000 000
- **E-mail:** pagamentos@roomview.com
- **Balcão:** Patriota, Luanda (08:00 - 20:00)
