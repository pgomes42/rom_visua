# Sistema de Estatísticas do Dashboard

## Visão Geral
Sistema completo de estatísticas e análise de dados para o painel administrativo, utilizando gráficos interativos com Recharts.

## Componentes Principais

### 1. StatisticsCharts.tsx
Biblioteca de componentes de visualização de dados:

#### StatsCard
Cartão de estatística com:
- Título e valor principal
- Indicador de variação percentual (vs. mês anterior)
- Ícone temático
- Cores personalizáveis (primary, green, blue, yellow, red)

#### RevenueChart
Gráfico de barras mostrando receita mensal dos últimos 6 meses.

#### BookingsChart
Gráfico de linha mostrando evolução de reservas ao longo do tempo.

#### StatusDistributionChart
Gráfico de pizza mostrando distribuição das reservas por status:
- Pendente (amarelo)
- Confirmada (verde)
- Cancelada (vermelho)
- Finalizada (azul)
- Check-in (roxo)
- Expirada (cinza)

#### OccupancyRateChart
Barra de progresso mostrando taxa de ocupação por apartamento.

#### TopApartmentsChart
Lista ranqueada dos 5 apartamentos mais rentáveis com:
- Posição no ranking
- Nome do apartamento
- Número de reservas
- Receita total

### 2. statisticsService.ts
Serviço de cálculo de métricas:

#### calculateDashboardStats()
Calcula métricas principais:
- **Receita Total**: Soma de todas as reservas
- **Total de Reservas**: Contagem de reservas
- **Taxa de Ocupação**: Percentual de ocupação baseado em reservas confirmadas/finalizadas
- **Valor Médio**: Receita média por reserva
- **Variações**: Comparação percentual com mês anterior

#### getMonthlyRevenueData()
Retorna dados de receita e reservas dos últimos 6 meses formatados para gráficos.

#### getStatusDistribution()
Agrupa reservas por status e retorna dados formatados para gráfico de pizza.

#### getOccupancyByApartment()
Calcula ocupação individual de cada apartamento (simplificado: 30 dias disponíveis).

#### getTopApartments()
Ranqueia apartamentos por receita e retorna os top 5.

## Integração no Admin.tsx

### Layout da Aba "Estatísticas"
1. **Cards de Métricas** (Grid 4 colunas):
   - Receita Total (com variação mensal)
   - Reservas Totais (com variação mensal)
   - Taxa de Ocupação
   - Valor Médio por Reserva

2. **Gráficos Principais** (Grid 2 colunas):
   - Receita Mensal (barras)
   - Evolução de Reservas (linha)

3. **Análises Detalhadas** (Grid 2 colunas):
   - Distribuição por Status (pizza)
   - Taxa de Ocupação por Apartamento (barras de progresso)

4. **Top Apartamentos** (largura completa):
   - Lista ranqueada com cards

## Customização

### Cores do Tema
Todos os gráficos respeitam o tema dark do projeto:
- Background: #1a1a1a
- Borders: #2a2a2a
- Primary: #d4af37 (dourado)
- Text: #fff / #888 (muted)

### Tooltips
Tooltips customizados com:
- Background escuro
- Formatação de moeda (formatCurrency)
- Bordas sutis

### Responsividade
- ResponsiveContainer para gráficos fluidos
- Grid adaptativo (1 col mobile → 2-4 cols desktop)
- Scroll horizontal para thumbnails em mobile

## Dependências
```json
{
  "recharts": "^2.x",
  "date-fns": "^2.x",
  "lucide-react": "^0.x"
}
```

## Melhorias Futuras
- [ ] Filtro de período personalizado (date range picker)
- [ ] Exportar relatórios em PDF
- [ ] Comparação ano a ano
- [ ] Gráfico de receita por método de pagamento
- [ ] Dashboard em tempo real com WebSockets
- [ ] Previsão de ocupação usando Machine Learning

## Notas Técnicas
- Dados calculados em tempo real do localStorage
- Performance otimizada para até 1000 reservas
- Cálculo de ocupação simplificado (pode ser melhorado com lógica de overlapping de datas)
- Todos os valores monetários em AKZ (Kwanza Angolano)
