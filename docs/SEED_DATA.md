# 🌱 Seed Data - Dados de Teste

## Visão Geral
Sistema de geração de dados simulados para popular o banco de dados local com reservas realistas dos últimos 6 meses.

## Como Usar

### Opção 1: Via Interface Admin (Recomendado)

1. Acesse `/admin` no navegador
2. Na tela de login, em **Modo Desenvolvimento** você verá:
   - 🌱 **Gerar 50 Reservas de Teste**: Cria 50 reservas aleatórias
   - 🗑️ **Limpar Todas as Reservas**: Remove todas as reservas do localStorage

### Opção 2: Via Console do Browser

Abra o Developer Console (F12) e execute:

```javascript
// Gerar 50 reservas
seedBookings(50);

// Gerar 100 reservas
seedBookings(100);

// Ver estatísticas das reservas
getBookingsStats();

// Limpar todas as reservas
clearAllBookings();
```

## Dados Gerados

### Distribuição de Reservas

#### Por Período
- **Últimos 6 meses**: Distribuição aleatória uniforme
- **Datas de Check-in**: Variadas ao longo do período
- **Noites**: 1 a 5 noites por reserva
- **Criação**: 3 a 15 dias antes do check-in

#### Por Status
- **FINALIZADA**: ~50% (maioria concluída)
- **CONFIRMADA**: ~30% (ativas/futuras)
- **CANCELADA**: ~15% (algumas canceladas)
- **PENDENTE_PAGAMENTO**: ~5% (aguardando)

#### Por Método de Pagamento
- Multicaixa Express
- Referência Multicaixa
- Transferência Bancária
- Pagamento Presencial

#### Apartamentos
- Distribuição aleatória entre todos os 5 apartamentos
- Respeitando capacidade de cada um

### Clientes Simulados
30 nomes portugueses realistas:
- João Silva, Maria Santos, Pedro Almeida...
- E-mails gerados: `nome.sobrenome@gmail.com`
- Telefones: `+244 9XX XXX XXX` (formato Angola)

### Extras
40% das reservas têm extras adicionados:
- Água Mineral (500ml, 1.5L)
- Refrigerantes
- Refeições (Pequeno Almoço, Almoço, Jantar)
- Serviços (Lavandaria, Transfer, WiFi Premium)
- 1 a 3 itens por reserva

## Funcionalidades do Sistema

### seedBookings(count: number)
```typescript
import { seedBookings } from '@/lib/seedData';

// Gera X reservas de teste
seedBookings(50); // 50 reservas
seedBookings(100); // 100 reservas
```

**Retorna**: Array de reservas criadas

**Logs no Console**:
```
🌱 Gerando 50 reservas de teste...
✅ 50 reservas geradas com sucesso!
📊 Distribuição:
   FINALIZADA: 25
   CONFIRMADA: 15
   CANCELADA: 8
   PENDENTE_PAGAMENTO: 2
```

### clearAllBookings()
```typescript
import { clearAllBookings } from '@/lib/seedData';

// Remove todas as reservas
clearAllBookings();
// 🗑️ Todas as reservas foram removidas
```

### getBookingsStats()
```typescript
import { getBookingsStats } from '@/lib/seedData';

// Mostra estatísticas das reservas atuais
getBookingsStats();
```

**Output**:
```
📈 Total de reservas: 50

📊 Status:
   FINALIZADA: 25
   CONFIRMADA: 15
   CANCELADA: 8
   PENDENTE_PAGAMENTO: 2

🏢 Por Apartamento:
   Estúdio Boutique: 12
   Apartamento T1 Prime: 8
   Suite Executiva: 10
   Apartamento Familiar: 9
   Suite Presidencial: 11

💰 Receita Total: 4.250.000 AKZ
```

## Por Que Usar?

### 1. Testar Dashboard de Estatísticas
- Gráficos de receita mensal ficam populados
- Distribuição de status visível no pizza chart
- Taxa de ocupação calculada corretamente
- Top 5 apartamentos ranqueados

### 2. Validar Funcionalidades
- Sistema de busca na página "Gerenciar Reserva"
- Filtros e ordenação no Admin
- Geração de PDFs com dados reais
- Cálculo de extras e totais

### 3. Demonstrações
- Apresentar o sistema com dados realistas
- Showcase para clientes
- Testes de usabilidade

### 4. Desenvolvimento
- Não precisa criar reservas manualmente
- Reset rápido do banco de dados
- Testes automatizados

## Estrutura dos Dados

### Reserva Simulada
```typescript
{
  id: "RV-A1B2C3D4",
  cliente_nome: "João Silva",
  telefone: "+244 923 456 789",
  email: "joao.silva@gmail.com",
  apartment_id: "estudio-boutique",
  checkin: "2026-01-15",
  checkout: "2026-01-18",
  noites: 3,
  total_estadia: 270000, // 3 × 90.000
  valor_sinal: 81000, // 30%
  restante_pagar: 189000, // Ou 0 se finalizada
  status: "CONFIRMADA",
  pessoas: 2,
  metodo_pagamento: "EXPRESS",
  created_at: "2026-01-05T10:30:00Z",
  expires_at: "2026-01-05T12:30:00Z",
  referencia_pagamento: "123456789",
  extras: [
    {
      id: "uuid-v4",
      item: "Pequeno Almoço Continental",
      quantidade: 3,
      preco_unitario: 8000,
      data: "2026-01-15T08:00:00Z"
    }
  ]
}
```

## Casos de Uso

### Cenário 1: Teste Inicial
```javascript
// Limpar dados antigos
clearAllBookings();

// Gerar 50 reservas frescas
seedBookings(50);

// Ver distribuição
getBookingsStats();
```

### Cenário 2: Stress Test
```javascript
// Testar com muitos dados
seedBookings(500);

// Verificar performance do dashboard
// Acessar /admin → Estatísticas
```

### Cenário 3: Demo para Cliente
```javascript
// Preparar demo
clearAllBookings();
seedBookings(75);

// Agora tem dados bonitos para mostrar
```

## Limitações

### Tempo
- Geração de 50 reservas: ~500ms
- Geração de 100 reservas: ~1s
- Geração de 500 reservas: ~5s

### localStorage
- Limite: ~5MB por domínio
- ~500-1000 reservas max antes de atingir limite

### Aleatoriedade
- Nomes repetidos podem ocorrer
- Alguns apartamentos podem ter mais reservas que outros (aleatório)
- Distribuição de status não é exatamente igual

## Boas Práticas

### DO ✅
- Gerar dados antes de testar estatísticas
- Limpar antes de gerar novos dados para demo
- Usar `getBookingsStats()` para validar geração

### DON'T ❌
- Não usar em produção (apenas DEV)
- Não gerar mais de 1000 reservas (localStorage)
- Não compartilhar dados de teste como reais

## Troubleshooting

### "Não vejo dados no gráfico"
```javascript
// Verificar se há reservas
getBookingsStats();

// Se 0, gerar:
seedBookings(50);
```

### "localStorage cheio"
```javascript
// Limpar tudo
clearAllBookings();

// Gerar menos dados
seedBookings(50); // Em vez de 500
```

### "Datas muito antigas"
- O código gera dos últimos 6 meses automaticamente
- Se precisar de período específico, editar `seedData.ts`

## Personalização

### Mudar Quantidade Padrão
```typescript
// Em seedData.ts, linha ~87
const monthsAgo = getRandomInt(0, 6); // Mudar 6 para 12 (1 ano)
```

### Adicionar Mais Nomes
```typescript
// Em seedData.ts, linha ~5
const CLIENTE_NAMES = [
    'João Silva',
    'Maria Santos',
    'Seu Nome Aqui', // Adicionar aqui
    // ...
];
```

### Mudar Distribuição de Status
```typescript
// Em seedData.ts, linha ~15
const STATUSES = [
    'CONFIRMADA', 'CONFIRMADA', // Mais confirmadas
    'FINALIZADA', // Menos finalizadas
    // ...
];
```

## Integração com Backend (Futuro)

Quando conectar ao backend real:

```typescript
// seedData.ts
export const seedBookingsToAPI = async (count: number) => {
    for (let i = 0; i < count; i++) {
        const bookingData = generateRandomBooking();
        await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
    }
};
```

## Notas do Desenvolvedor

- Usa `crypto.randomUUID()` para IDs únicos
- Datas sempre em formato ISO (YYYY-MM-DD)
- Valores em AKZ (Kwanza Angolano)
- Telefones no formato +244 (código Angola)
- E-mails sempre lowercase
- Extras adicionados após criação da reserva
- Status atualizado via `bookingService.updateBookingStatus()`

## Referências

- **Código**: [src/lib/seedData.ts](../src/lib/seedData.ts)
- **Uso no Admin**: [src/pages/Admin.tsx](../src/pages/Admin.tsx#L267)
- **bookingService**: [src/lib/bookingService.ts](../src/lib/bookingService.ts)

---

**Última Atualização**: 15 Fevereiro 2026  
**Versão**: 1.0.0  
**Autor**: Roomview Dev Team
