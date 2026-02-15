# Sistema de Geração de PDF

## Visão Geral
Sistema de geração de recibos e facturas em PDF usando jsPDF e html2canvas.

## Dependências
```bash
npm install jspdf html2canvas
```

## Serviço Principal: pdfService.ts

### 1. generateReceipt()
Gera recibo de quitação programaticamente com jsPDF API.

#### Parâmetros
```typescript
generateReceipt(booking: Booking, apartment: Apartment): void
```

#### Estrutura do PDF
1. **Cabeçalho**
   - Logo Roomview Boutique (centralized)
   - Endereço e NIF
   - Título "RECIBO DE QUITAÇÃO"
   - ID da reserva e data de emissão

2. **Dados do Cliente**
   - Nome completo
   - Telefone
   - E-mail
   - IDs (Reserva + Transação)

3. **Detalhes da Estadia**
   - Apartamento
   - Check-in / Check-out
   - Noites
   - Hóspedes

4. **Resumo Financeiro**
   - Valor da Estadia
   - Sinal Pago (30%)
   - Extras (se houver)
   - **Total Pago**

5. **Extras** (se existirem)
   - Tabela: Item | Qtd | Preço Unit | Total
   - Subtotal de extras

6. **Rodapé**
   - "Obrigado pela preferência!"
   - Nota: "Este documento é válido como comprovativo de pagamento"
   - Opcional: QR Code para verificação

#### Exemplo de Uso
```typescript
import { pdfService } from '@/lib/pdfService';

// No Admin.tsx ou ManageBooking.tsx
const handleDownloadReceipt = (booking: Booking) => {
  const apartment = apartmentService.getApartmentById(booking.apartment_id);
  if (apartment) {
    pdfService.generateReceipt(booking, apartment);
  }
};
```

### 2. generateInvoice()
Gera factura comercial com mais detalhes fiscais.

#### Diferenças do Recibo
- Título: "FACTURA COMERCIAL"
- Número de factura único
- Breakdown detalhado:
  - Subtotal (sem impostos)
  - IVA (se aplicável)
  - Total Final
- Informações fiscais adicionais
- Termos e condições de pagamento

#### Quando Usar
- Para empresas que precisam de factura para contabilidade
- Reservas corporativas
- Quando solicitado explicitamente pelo cliente

### 3. generateFromElement()
Captura elemento HTML e converte em PDF.

#### Parâmetros
```typescript
generateFromElement(elementId: string, filename: string): Promise<void>
```

#### Processo
1. Usa `html2canvas` para capturar elemento DOM
2. Converte canvas em imagem
3. Cria PDF com jsPDF
4. Adiciona imagem ao PDF
5. Faz download

#### Exemplo
```typescript
// Capturar modal de recibo
<div id="receipt-content">
  {/* Conteúdo do recibo */}
</div>

<Button onClick={() => pdfService.generateFromElement('receipt-content', 'recibo.pdf')}>
  Baixar PDF
</Button>
```

## Integração no Sistema

### ManageBooking.tsx

#### Botões de Download
```typescript
const [downloadingPDF, setDownloadingPDF] = useState(false);
const [downloadingInvoice, setDownloadingInvoice] = useState(false);

const handleDownloadPDF = async () => {
  setDownloadingPDF(true);
  try {
    const apartment = apartmentsList.find(a => a.id === booking.apartment_id);
    if (apartment) {
      pdfService.generateReceipt(booking, apartment);
      toast.success('PDF baixado com sucesso!');
    }
  } catch (error) {
    toast.error('Erro ao gerar PDF');
  } finally {
    setDownloadingPDF(false);
  }
};
```

#### UI
```tsx
{booking.status === 'CONFIRMADA' && (
  <Button onClick={handleDownloadPDF} disabled={downloadingPDF}>
    <FileDown className="w-4 h-4 mr-2" />
    {downloadingPDF ? 'Gerando...' : 'Baixar PDF'}
  </Button>
)}

{booking.status === 'FINALIZADA' && (
  <Button onClick={handleDownloadInvoice} disabled={downloadingInvoice}>
    <Receipt className="w-4 h-4 mr-2" />
    {downloadingInvoice ? 'Gerando...' : 'Baixar Factura'}
  </Button>
)}
```

### Admin.tsx

Similar ao ManageBooking, mas com verificação de permissões:
```typescript
{can('CAN_VIEW_REPORTS') && (
  <Button onClick={() => handleDownloadReceipt(booking)}>
    <FileDown className="w-4 h-4 mr-2" />
    Baixar Recibo
  </Button>
)}
```

## Formatação e Estilo

### Fonte
- **Helvetica** (padrão jsPDF)
- Normal para texto comum
- **Bold** para destaques (totais, títulos)

### Cores
- Texto Principal: #000000 (preto)
- Texto Secundário: #666666 (cinza)
- Primary (dourado): RGB(212, 175, 55)
- Bordas: #E5E7EB (cinza claro)

### Layout
- Margem: 20mm
- Largura útil: 170mm (A4 = 210mm - 2×20mm)
- Alinhamento: Esquerda (dados), Direita (valores monetários), Centro (cabeçalho)

### Tabelas
```typescript
// Exemplo de tabela de extras
doc.autoTable({
  startY: yPosition,
  head: [['Item', 'Qtd', 'Preço Unit.', 'Total']],
  body: extras.map(e => [
    e.item,
    e.quantidade,
    formatCurrency(e.preco_unitario),
    formatCurrency(e.quantidade * e.preco_unitario)
  ]),
  theme: 'grid',
  headStyles: { fillColor: [212, 175, 55] },
  columnStyles: {
    0: { cellWidth: 80 }, // Item
    1: { cellWidth: 20, halign: 'center' }, // Qtd
    2: { cellWidth: 35, halign: 'right' }, // Preço
    3: { cellWidth: 35, halign: 'right' }  // Total
  }
});
```

## Casos de Uso

### 1. Cliente Busca Reserva
- Cliente acessa "Gerenciar Reserva"
- Insere código de confirmação
- Vê detalhes da reserva
- Clica "Baixar PDF" → recibo gerado

### 2. Staff Finaliza Check-out
- Operador acessa Admin
- Muda status para "FINALIZADA"
- Clica "Baixar Factura"
- Imprime ou envia por e-mail ao cliente

### 3. Empresa Solicita Factura
- Cliente corporativo liga solicitando factura
- Staff acessa reserva
- Gera factura com informações fiscais
- Envia por e-mail

## Otimizações de Performance

### Compressão de Imagens
```typescript
// Ao usar html2canvas
html2canvas(element, {
  scale: 2, // Qualidade alta
  useCORS: true, // Para imagens externas
  backgroundColor: '#ffffff'
}).then(canvas => {
  const imgData = canvas.toDataURL('image/jpeg', 0.95); // 95% qualidade
  // ...
});
```

### Lazy Loading
PDFs só são gerados quando solicitados (não pré-gerados).

### Caching (Futuro)
Guardar PDFs gerados no localStorage com hash da reserva para evitar regeneração.

## Troubleshooting

### Imagens não aparecem
- Verificar CORS se imagens são externas
- Usar `useCORS: true` no html2canvas
- Considerar converter para base64

### Texto cortado
- Ajustar `pageWidth` e margens
- Usar `doc.splitTextToSize()` para textos longos

### PDF muito grande
- Reduzir escala do html2canvas (scale: 1)
- Comprimir imagens antes
- Usar formato JPEG em vez de PNG

### Fontes customizadas não funcionam
jsPDF suporta apenas fontes padrão. Para customizar:
```bash
npm install jspdf-autotable
```
E adicionar fonte via:
```typescript
doc.addFileToVFS('Montserrat.ttf', base64Font);
doc.addFont('Montserrat.ttf', 'Montserrat', 'normal');
doc.setFont('Montserrat');
```

## Melhorias Futuras
- [ ] Enviar PDF por e-mail automaticamente
- [ ] QR Code com link para verificação online
- [ ] Assinatura digital do documento
- [ ] Templates customizáveis por tipo de apartamento
- [ ] Multi-idioma (PT, EN, FR)
- [ ] Watermark para recibos não finalizados
- [ ] Integração com serviço de armazenamento em nuvem (S3, Cloudinary)
- [ ] Histórico de PDFs gerados por cliente

## Segurança
- PDFs são gerados no cliente (não enviados para servidor)
- Dados sensíveis (apenas visualizados pelo titular da reserva)
- Código de confirmação necessário para acesso

## Links Úteis
- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/)
- [html2canvas](https://html2canvas.hertzen.com/)
- [jspdf-autotable Plugin](https://github.com/simonbengtsson/jsPDF-AutoTable)
