# Sistema de Gerenciamento de Extras

## Visão Geral
Sistema avançado para adicionar pedidos extras às reservas, com catálogo pré-definido e opção personalizada.

## Componente Principal: ExtrasManager.tsx

### Interface
```typescript
interface ExtraItem {
    item: string;
    quantidade: number;
    preco_unitario: number;
}

interface ExtrasManagerProps {
    onAddExtra: (extra: ExtraItem) => void;
    onClose: () => void;
}
```

### Funcionalidades

#### 1. Modo Pré-definido
Catálogo de 10 itens comuns:

**Bebidas:**
- Água Mineral 500ml: 500 AKZ
- Água Mineral 1.5L: 800 AKZ
- Refrigerante Lata: 1.000 AKZ

**Refeições:**
- Pequeno Almoço Continental: 8.000 AKZ
- Almoço Executivo: 15.000 AKZ
- Jantar Gourmet: 20.000 AKZ

**Serviços:**
- Lavandaria (por peça): 2.000 AKZ
- Transfer Aeroporto: 25.000 AKZ
- WiFi Premium 24h: 5.000 AKZ
- Late Checkout (3h extra): 12.000 AKZ

#### 2. Modo Personalizado
Permite adicionar itens customizados com:
- Descrição livre do item
- Quantidade
- Preço unitário definido manualmente

### UX/UI Features

#### Seleção de Presets
- Grid 2 colunas de cards clicáveis
- Card selecionado com borda destacada (ring-2 ring-primary)
- Hover effects suaves
- Nome e preço visíveis

#### Controles de Quantidade
- Botões +/- para ajuste rápido
- Input numérico para entrada direta
- Mínimo: 1 unidade
- Callback onChange em tempo real

#### Cálculo de Total
- **Total Dinâmico**: Quantidade × Preço Unitário
- Exibido em destaque com formatCurrency()
- Atualização instantânea ao alterar quantidade

#### Animações
- Modal com fade + scale (framer-motion)
- AnimatePresence para seção de quantidade
- Transições suaves entre modos

### Integração com Admin.tsx

#### Fluxo de Adição
1. Staff clica "Adicionar Extra" em uma reserva
2. `setIsAddingExtra(true)` e `setSelectedBookingForExtra(bookingId)`
3. Modal ExtrasManager é renderizado
4. Staff seleciona preset ou cria custom
5. Define quantidade
6. Clica "Adicionar Item"
7. `handleAddExtra(extra: ExtraItem)` é chamado
8. `bookingService.addExtra(bookingId, extra)` persiste
9. UI atualizada, modal fechado, toast de sucesso

#### Estados Removidos
Simplificação comparada à versão antiga:
- ❌ `extraItem` (string)
- ❌ `extraQty` (number)
- ❌ `extraPrice` (number)
- ✅ Gerenciado internamente pelo ExtrasManager

### bookingService.addExtra()
```typescript
addExtra(bookingId: string, extra: { 
  item: string; 
  quantidade: number; 
  preco_unitario: number 
}): boolean {
  const bookings = this.getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) return false;
  
  const newExtra: BookingExtra = {
    id: crypto.randomUUID(),
    item: extra.item,
    quantidade: extra.quantidade,
    preco_unitario: extra.preco_unitario,
    data: new Date().toISOString()
  };
  
  booking.extras = [...(booking.extras || []), newExtra];
  
  // Recalcular total da reserva
  const extrasTotal = booking.extras.reduce(
    (sum, e) => sum + (e.quantidade * e.preco_unitario), 
    0
  );
  booking.total_estadia = booking.total_estadia + extrasTotal;
  booking.restante_pagar = booking.restante_pagar + extrasTotal;
  
  this.saveBookings(bookings);
  return true;
}
```

## Exibição de Extras

### No Dashboard (Reserva Details)
Lista de extras com:
- Nome do item
- Quantidade × Preço Unitário = Subtotal
- Total de extras somado

### No Recibo (Receipt Modal)
Seção dedicada:
```
EXTRAS E SERVIÇOS ADICIONAIS
----------------------------------
Água Mineral 1.5L (x2)      1.600
Almoço Executivo (x1)      15.000
Transfer Aeroporto (x1)    25.000
----------------------------------
SUBTOTAL EXTRAS:           41.600
```

### No PDF (generateReceipt/generateInvoice)
Tabela formatada com:
- Cabeçalho: Item | Qtd | Unit | Total
- Linha por extra
- Subtotal de extras
- Integrado no cálculo total

## Permissões
Apenas usuários com permissão `CAN_MANAGE_EXTRAS` podem adicionar extras:
- ✅ ADMIN
- ✅ GERENTE
- ✅ OPERADOR
- ❌ CLIENTE

Verificação no Admin.tsx:
```typescript
{can('CAN_MANAGE_EXTRAS') && (
  <Button onClick={() => {
    setSelectedBookingForExtra(booking.id);
    setIsAddingExtra(true);
  }}>
    <Plus className="w-4 h-4 mr-2" />
    Adicionar Extra
  </Button>
)}
```

## Melhorias Futuras
- [ ] Histórico de extras por cliente
- [ ] Promoções em combos (ex: 3 águas pelo preço de 2)
- [ ] Integração com kitchen display system para refeições
- [ ] Aprovação de extras acima de X valor
- [ ] Extras recorrentes (ex: café da manhã todos os dias)
- [ ] Upload de foto/screenshot de pedido especial
- [ ] Avaliação de satisfação por extra

## Notas do Desenvolvedor
- Preços em AKZ ajustados para Luanda, Angola
- Late checkout calculado em 3 horas extras
- Transfer aeroporto preço médio para distância 15km
- WiFi Premium assume upgrade de velocidade/prioridade
- Lavandaria por peça (camisa, calça, vestido = 1 peça)
