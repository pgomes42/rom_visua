# 🚀 Guia Rápido: Testar Estatísticas

## Passo a Passo

### 1️⃣ Acesse o Admin
```
http://localhost:8081/rom_visua/admin
```

### 2️⃣ Em Modo DEV, você verá:

**🔧 Modo Desenvolvimento** (caixa com fundo cinza):

```
┌─────────────────────────────────────────┐
│ 🔧 MODO DESENVOLVIMENTO                 │
├─────────────────────────────────────────┤
│ 🔴 ADMIN                                │
│ admin@roomview.com / admin    [Preencher]│
├─────────────────────────────────────────┤
│ 🔵 GERENTE                              │
│ gerente@roomview.com / gerente[Preencher]│
├─────────────────────────────────────────┤
│ 🟢 OPERADOR                             │
│ caixa@roomview.com / caixa    [Preencher]│
├─────────────────────────────────────────┤
│ 📊 DADOS DE TESTE                       │
│ [🌱 Gerar 50 Reservas de Teste]        │
│ [🗑️ Limpar Todas as Reservas]          │
└─────────────────────────────────────────┘
```

### 3️⃣ Clique em "🌱 Gerar 50 Reservas de Teste"

✅ **Resultado**: 
- Toast de sucesso: "50 reservas de teste geradas!"
- Console: Logs com distribuição de status

### 4️⃣ Faça Login como ADMIN

Clique em "Preencher" no card vermelho do ADMIN, depois clique em "Aceder ao Painel".

### 5️⃣ Vá para Aba "Estatísticas"

No menu superior, clique no ícone **📊 Estatísticas**.

### 6️⃣ Visualize os Dados! 🎉

Você verá:

**Cards de Métricas:**
- 💵 Receita Total: ~4.500.000 AKZ (com variação vs mês anterior)
- 📅 Reservas Totais: 50
- 📈 Taxa de Ocupação: ~30%
- 💰 Valor Médio: ~90.000 AKZ

**Gráfico de Barras:**
- Receita dos últimos 6 meses

**Gráfico de Linha:**
- Evolução de reservas

**Pizza Chart:**
- Distribuição por status (Finalizada, Confirmada, Cancelada, Pendente)

**Taxa de Ocupação:**
- Barras de progresso por apartamento

**Top 5 Apartamentos:**
- Ranking com receita e número de reservas

## 🔄 Regenerar Dados

Para testar com dados frescos:

1. Clique em **🗑️ Limpar Todas as Reservas**
2. Confirme no popup: "Tem a certeza..."
3. Clique em **🌱 Gerar 50 Reservas de Teste** novamente
4. Dados novos aparecerão!

## 🎮 Console do Browser (Opcional)

Abra o DevTools (F12) e digite:

```javascript
// Ver estatísticas atuais
getBookingsStats();

// Exemplo de output:
// 📈 Total de reservas: 50
// 📊 Status:
//    FINALIZADA: 27
//    CONFIRMADA: 15
//    CANCELADA: 7
//    PENDENTE_PAGAMENTO: 1
// 💰 Receita Total: 4.350.000 AKZ
```

## 💡 Dicas

### Variar Quantidade
```javascript
// Gerar mais ou menos reservas
seedBookings(100); // 100 reservas
seedBookings(25);  // 25 reservas
```

### Verificar Antes de Limpar
```javascript
// Sempre confira quantas reservas tem antes de deletar
getBookingsStats();
```

### Demonstração para Cliente
1. Limpar dados antigos: 🗑️
2. Gerar exatamente 75 reservas: `seedBookings(75)`
3. Mostrar dashboard limpo e organizado

## 🐛 Troubleshooting

### "Gráficos vazios"
**Solução**: Você precisa gerar dados primeiro!
- Clique em 🌱 Gerar 50 Reservas
- Ou execute `seedBookings(50)` no console

### "Não vejo o botão de Seed Data"
**Solução**: Certifique-se que está em modo DEV
- `npm run dev` (não build de produção)
- URL deve ter `localhost` ou `127.0.0.1`

### "localStorage cheio"
**Solução**: Limpar antes de gerar muitos dados
- Clique em 🗑️ Limpar Todas
- Não gere mais de 500 reservas de uma vez

### "Datas estranhas"
**Solução**: É normal! Dados são dos últimos 6 meses
- Janeiro a Junho 2026
- Algumas no futuro (reservas confirmadas)
- Algumas no passado (finalizadas)

## 📊 O Que Esperar

### Distribuição Típica (50 reservas):
- ✅ Finalizadas: ~25 (50%)
- 🟡 Confirmadas: ~15 (30%)
- ❌ Canceladas: ~8 (16%)
- ⏳ Pendentes: ~2 (4%)

### Receita Total:
- Média: **3.000.000 a 5.000.000 AKZ**
- Depende do mix de apartamentos sorteados
- Extras adicionam 10-20% ao total

### Top Apartamento:
Geralmente **Suite Presidencial** ou **Apartamento Familiar**
(preços mais altos = mais receita)

## 🎯 Casos de Uso

### ✅ Desenvolvimento
Testar rapidamente sem criar reservas manualmente.

### ✅ Apresentação
Mostrar sistema funcionando com dados realistas.

### ✅ Teste de Performance
Gerar 500 reservas e ver se dashboards ainda são rápidos.

### ✅ Validação de UI
Verificar se layouts funcionam com muitos dados.

---

**🚨 IMPORTANTE**: 
- Dados são apenas LOCAL (localStorage)
- Não afetam produção
- Podem ser limpos a qualquer momento
- Apenas em modo DEV!

**Pronto para testar? Boa sorte! 🎉**
