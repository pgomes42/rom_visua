# 🔐 Sistema de Permissões - Roomview Boutique

## 📋 Tipos de Utilizadores (Roles)

### 🔴 ADMIN (Administrador Geral)
**Acesso:** admin@roomview.com / admin

**Descrição:** Controlo total do sistema

**Permissões:**
- ✅ `MANAGE_APARTMENTS` - Criar, editar e eliminar apartamentos
- ✅ `VIEW_FINANCIALS` - Ver relatórios completos e estatísticas
- ✅ `MANAGE_USERS` - Gerir utilizadores do sistema
- ✅ `SET_PRICES` - Alterar preços dos apartamentos
- ✅ `MANAGE_BOOKINGS` - Confirmar ou cancelar reservas
- ✅ `CREATE_BOOKINGS` - Criar novas reservas
- ✅ `APPROVE_CANCEL` - Aprovar cancelamentos especiais
- ✅ `VIEW_AVAILABILITY` - Ver disponibilidade
- ✅ `MANAGE_SYSTEM` - Configurar sistema
- ✅ `MANAGE_EXTRAS` - Adicionar extras às reservas
- ✅ `PRINT_RECEIPTS` - Imprimir recibos
- ✅ `MANAGE_GUEST_ARRIVAL` - Registar check-in

---

### 🔵 GERENTE (Gerente)
**Acesso:** gerente@roomview.com / gerente

**Descrição:** Gestão e relatórios

**Permissões:**
- ✅ `VIEW_FINANCIALS` - Ver relatórios completos
- ✅ `MANAGE_BOOKINGS` - Gerir reservas
- ✅ `CREATE_BOOKINGS` - Criar reservas
- ✅ `APPROVE_CANCEL` - Aprovar cancelamentos especiais
- ✅ `VIEW_AVAILABILITY` - Ver disponibilidade
- ✅ `SET_PRICES` - Alterar preços temporários

**Não pode:**
- ❌ Eliminar apartamentos
- ❌ Criar utilizadores
- ❌ Alterar configurações do sistema

---

### 🟢 OPERADOR / CAIXA (Recepcionista)
**Acesso:** caixa@roomview.com / caixa

**Descrição:** Operações do balcão

**Permissões:**
- ✅ `MANAGE_BOOKINGS` - Gerir reservas
- ✅ `CREATE_BOOKINGS` - Criar reservas manualmente
- ✅ `VIEW_AVAILABILITY` - Ver disponibilidade
- ✅ `MANAGE_EXTRAS` - Adicionar extras (comida, bebidas, etc.)
- ✅ `PRINT_RECEIPTS` - Imprimir recibos
- ✅ `MANAGE_GUEST_ARRIVAL` - Registar chegada do hóspede

**Não pode:**
- ❌ Ver relatórios financeiros completos
- ❌ Alterar preços
- ❌ Eliminar apartamentos
- ❌ Criar utilizadores
- ❌ Alterar configurações

---

### ⚪ CLIENTE
**Descrição:** Utilizador do site público

**Permissões:**
- ✅ `CREATE_BOOKINGS` - Criar reservas online
- ✅ `VIEW_AVAILABILITY` - Ver disponibilidade

**Não pode:**
- ❌ Aceder ao painel administrativo
- ❌ Ver outras reservas
- ❌ Alterar preços ou configurações

---

## 🎯 Matriz de Permissões

| Permissão | ADMIN | GERENTE | OPERADOR | CLIENTE |
|-----------|:-----:|:-------:|:--------:|:-------:|
| MANAGE_APARTMENTS | ✅ | ❌ | ❌ | ❌ |
| VIEW_FINANCIALS | ✅ | ✅ | ❌ | ❌ |
| MANAGE_USERS | ✅ | ❌ | ❌ | ❌ |
| SET_PRICES | ✅ | ✅* | ❌ | ❌ |
| MANAGE_BOOKINGS | ✅ | ✅ | ✅ | ❌ |
| CREATE_BOOKINGS | ✅ | ✅ | ✅ | ✅ |
| APPROVE_CANCEL | ✅ | ✅ | ❌ | ❌ |
| VIEW_AVAILABILITY | ✅ | ✅ | ✅ | ✅ |
| MANAGE_SYSTEM | ✅ | ❌ | ❌ | ❌ |
| MANAGE_EXTRAS | ✅ | ❌ | ✅ | ❌ |
| PRINT_RECEIPTS | ✅ | ❌ | ✅ | ❌ |
| MANAGE_GUEST_ARRIVAL | ✅ | ❌ | ✅ | ❌ |

*Gerente pode alterar preços temporários

---

## 🔧 Como o Sistema Funciona

### Verificação de Permissões
```typescript
// No código, usa-se a função can() para verificar permissões:
if (can("MANAGE_APARTMENTS")) {
  // Mostrar botão de adicionar apartamento
}
```

### Autenticação
1. Utilizador faz login com e-mail e password
2. Sistema verifica credenciais
3. Sessão é criada no localStorage
4. Permissões são carregadas baseadas no role

### Proteção de Funcionalidades
- Tabs/Secções só aparecem se o utilizador tiver permissão
- Botões de ação são condicionalmente renderizados
- Ações críticas requerem confirmação adicional

---

## 📝 Notas Importantes

1. **Segurança:** Este é um sistema de demonstração. Em produção, as permissões devem ser verificadas no backend.

2. **Passwords:** As passwords são armazenadas em texto simples apenas para demonstração. Em produção, use hash bcrypt ou similar.

3. **Sessões:** O sistema usa localStorage para demonstração. Em produção, use JWT ou sessions seguras.

4. **Auditoria:** Todas as ações críticas devem ser registadas em logs.

---

## 🚀 Casos de Uso

### Dia-a-dia no Balcão (OPERADOR)
1. Cliente chega para fazer reserva
2. Operador cria reserva manualmente
3. Operador regista check-in quando cliente chega
4. Durante a estadia, operador adiciona extras (refeições, etc.)
5. No check-out, operador regista pagamento do saldo
6. Operador imprime recibo completo

### Gestão (GERENTE)
1. Revê relatórios diários
2. Aprova cancelamentos especiais
3. Ajusta preços para promoções temporárias
4. Monitora ocupação e receitas

### Administração (ADMIN)
1. Gere todos os apartamentos (adiciona/edita/elimina)
2. Cria utilizadores (operadores, gerentes)
3. Configura preços oficiais
4. Acesso total ao sistema
