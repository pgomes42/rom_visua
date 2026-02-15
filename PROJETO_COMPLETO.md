# 🏨 Roomview Boutique - Sistema de Reservas Completo

Sistema completo de gerenciamento de reservas para hotel boutique em Luanda, Angola. Desenvolvido com React, TypeScript e Tailwind CSS.

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação e Permissões
- **4 Níveis de Acesso**: ADMIN, GERENTE, OPERADOR, CLIENTE
- **12 Permissões Granulares**: CAN_VIEW_DASHBOARD, CAN_MANAGE_BOOKINGS, CAN_MANAGE_APARTMENTS, etc.
- **Login Seguro**: Autenticação por e-mail e senha
- **Modo DEV**: Botões de login rápido para desenvolvimento
- **Badge de Papel**: Indicador visual do nível de acesso
- 📄 [Documentação Completa](docs/PERMISSOES.md)

### 💳 Métodos de Pagamento
- **Multicaixa Express**: Pagamento instantâneo com QR Code
- **Referência Multicaixa**: Pagamento via ATM com referência de 9 dígitos
- **Transferência Bancária**: Upload de comprovativo, aprovação manual
- **Pagamento Presencial**: Check-in com pagamento no hotel
- **Timer de Expiração**: 2 horas para confirmar pagamento
- 📄 [Documentação Completa](docs/METODOS_PAGAMENTO.md)

### 🔍 Gerenciar Reserva (Cliente)
- **Busca por Código**: Sistema de busca segura com código de confirmação
- **Detalhes Completos**: Todas as informações da reserva
- **Status em Tempo Real**: Atualização automática do status
- **Download de PDF**: Recibo e factura disponíveis
- **Design Responsivo**: Funciona perfeitamente em mobile
- 📄 [Documentação Completa](docs/GERENCIAR_RESERVA.md)

### 📄 Geração de PDF
- **Recibo de Quitação**: Documento programático com jsPDF
- **Factura Comercial**: Com informações fiscais
- **Captura HTML**: Conversão de elementos DOM para PDF
- **Extras Incluídos**: Tabela formatada de pedidos extras
- **Multi-formato**: Adequado para impressão ou e-mail
- 📄 [Documentação Completa](docs/GERACAO_PDF.md)

### 🍽️ Sistema de Extras
- **10 Itens Pré-definidos**: Bebidas, refeições, serviços
- **Modo Personalizado**: Adicionar itens customizados
- **Cálculo Automático**: Total atualizado em tempo real
- **Controle de Quantidade**: Botões +/- ou input direto
- **Integração Total**: Aparece em recibos, PDFs e relatórios
- 📄 [Documentação Completa](docs/SISTEMA_EXTRAS.md)

### 📊 Dashboard de Estatísticas
- **4 Cards de Métricas**: Receita, Reservas, Ocupação, Valor Médio
- **Gráfico de Receita**: Barras dos últimos 6 meses
- **Evolução de Reservas**: Linha temporal
- **Distribuição de Status**: Pizza chart interativo
- **Taxa de Ocupação**: Por apartamento
- **Top 5 Apartamentos**: Ranking de rentabilidade
- **Recharts**: Gráficos responsivos e interativos
- 📄 [Documentação Completa](docs/ESTATISTICAS_DASHBOARD.md)

### 🖼️ Galeria de Fotos
- **Visualização em Carrossel**: Navegação suave entre fotos
- **Thumbnails Clicáveis**: Grid de miniaturas
- **Zoom Interativo**: 1.5x com clique ou botão
- **Modo Fullscreen**: Experiência imersiva
- **Contador de Fotos**: 1/5 visível
- **Animações**: Transições fluidas com Framer Motion
- **Responsivo**: Touch-friendly em mobile
- 📄 [Documentação Completa](docs/GALERIA_FOTOS.md)

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── ExtrasManager.tsx
│   ├── PermissionsHelp.tsx
│   ├── PhotoGallery.tsx
│   └── StatisticsCharts.tsx
├── pages/
│   ├── Admin.tsx         # Dashboard staff
│   ├── ApartmentDetail.tsx
│   ├── Booking.tsx
│   ├── Checkout.tsx
│   ├── ManageBooking.tsx # Busca de reserva
│   └── Index.tsx
├── lib/
│   ├── apartmentService.ts
│   ├── authService.ts
│   ├── bookingService.ts
│   ├── pdfService.ts
│   └── statisticsService.ts
├── data/
│   └── apartments.ts     # Types e dados
└── hooks/
    ├── use-mobile.tsx
    └── use-toast.ts
```

### Stack Tecnológica

#### Frontend
- **React 18**: Library principal
- **TypeScript**: Type safety
- **Vite**: Build tool rápido
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Componentes acessíveis
- **Framer Motion**: Animações fluidas
- **Lucide React**: Ícones SVG

#### Bibliotecas Especializadas
- **jsPDF**: Geração de PDFs
- **html2canvas**: Captura de screenshots
- **Recharts**: Gráficos e charts
- **date-fns**: Manipulação de datas
- **React Router**: Client-side routing
- **Sonner**: Toast notifications

#### Dev Tools
- **ESLint**: Linting
- **Vitest**: Testing framework
- **TypeScript**: Static typing

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação
```bash
# Clonar repositório
git clone <repo-url>
cd rom_visua

# Instalar dependências
npm install

# Ou com bun
bun install
```

### Desenvolvimento
```bash
npm run dev
# Acesse http://localhost:5173
```

### Build para Produção
```bash
npm run build
npm run preview
```

### Testes
```bash
npm run test
```

## 🔑 Logins de Teste (Modo DEV)

### ADMIN
- **E-mail**: admin@roomview.ao
- **Senha**: admin123
- **Acesso**: Total

### GERENTE
- **E-mail**: gerente@roomview.ao
- **Senha**: gerente123
- **Acesso**: Gestão operacional

### OPERADOR
- **E-mail**: operador@roomview.ao
- **Senha**: operador123
- **Acesso**: Operações diárias

### CLIENTE
- **E-mail**: cliente@gmail.com
- **Senha**: cliente123
- **Acesso**: Visualização apenas

> **Nota**: Não usar em produção! Criar sistema de autenticação real.

## 🌱 Dados de Teste

### Interface Admin (Recomendado)
No **Modo Desenvolvimento**, na tela de login do Admin:
- 🌱 **Gerar 50 Reservas de Teste**: Cria reservas dos últimos 6 meses
- 🗑️ **Limpar Todas as Reservas**: Reset completo

### Console do Browser (Alternativa)
```javascript
// Gerar reservas simuladas
seedBookings(50);

// Ver estatísticas
getBookingsStats();

// Limpar tudo
clearAllBookings();
```

### O Que É Gerado?
- **50 reservas** distribuídas nos últimos 6 meses
- **Status variados**: Finalizadas (50%), Confirmadas (30%), Canceladas (15%), Pendentes (5%)
- **Clientes realistas**: 30 nomes portugueses com e-mails e telefones de Angola
- **Extras**: 40% das reservas têm extras (água, refeições, serviços)
- **Métodos de pagamento**: Express, Referência, Transferência, Presencial
- **Apartamentos**: Distribuição aleatória entre os 5 tipos

📄 [Documentação Completa de Seed Data](docs/SEED_DATA.md)

## 📱 Responsividade

### Mobile (< 768px)
- Menu hamburger
- Cards em coluna única
- Thumbnails scroll horizontal
- Botões touch-friendly

### Tablet (768px - 1024px)
- Grid 2 colunas
- Dashboard compacto
- Galeria otimizada

### Desktop (> 1024px)
- Grid 3-4 colunas
- Sidebar fixa
- Hover effects
- Atalhos de teclado

## 🎨 Design System

### Cores
```css
--primary: 45 81% 48%        /* #d4af37 - Dourado */
--background: 0 0% 10%       /* #1a1a1a - Preto suave */
--foreground: 0 0% 98%       /* Branco */
--muted: 0 0% 15%            /* Cinza escuro */
--border: 0 0% 20%           /* Bordas sutis */
```

### Tipografia
- **Display**: Playfair Display (títulos elegantes)
- **Body**: Inter (leitura confortável)

### Espaçamento
- Base: 4px (0.25rem)
- Escala: 4, 8, 12, 16, 24, 32, 48, 64

## 📐 Padrões de Código

### Componentes
```typescript
// Functional components com TypeScript
interface Props {
  title: string;
  onClose?: () => void;
}

export const Component = ({ title, onClose }: Props) => {
  return (/* JSX */);
};
```

### Serviços
```typescript
// Singleton pattern para serviços
export const myService = {
  getData(): Data[] {
    // Implementation
  },
  saveData(data: Data): void {
    // Implementation
  }
};
```

### Hooks
```typescript
// Custom hooks com 'use' prefix
export const useCustomHook = () => {
  const [state, setState] = useState(initial);
  
  useEffect(() => {
    // Side effect
  }, [dependencies]);
  
  return { state, setState };
};
```

## 🔒 Segurança

### Implementado
- ✅ Validação de inputs (e-mail, telefone, datas)
- ✅ Sanitização de dados antes de salvar
- ✅ Controle de acesso baseado em roles
- ✅ Código de confirmação para buscas
- ✅ Timer de expiração de pagamento

### TODO (Produção)
- [ ] Autenticação JWT com backend
- [ ] HTTPS obrigatório
- [ ] Rate limiting em APIs
- [ ] Validação server-side
- [ ] Logs de auditoria
- [ ] 2FA para admins
- [ ] CSP headers
- [ ] CORS configurado

## 🌐 Internacionalização

### Atualmente: Português (PT-AO)
- Moeda: Kwanza (AKZ)
- Formato de data: dd/MM/yyyy
- Fuso horário: Africa/Luanda (WAT)

### Expansão Futura
- [ ] Inglês (EN)
- [ ] Francês (FR)
- [ ] react-i18next para traduções

## 🚧 Roadmap

### Curto Prazo (1-2 meses)
- [ ] Backend API com Node.js/Express
- [ ] Banco de dados PostgreSQL
- [ ] Upload real de fotos (Cloudinary)
- [ ] Envio de e-mails (Mailgun/SendGrid)
- [ ] Pagamentos reais (Multicaixa API)

### Médio Prazo (3-6 meses)
- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Chat ao vivo (Socket.io)
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade

### Longo Prazo (6-12 meses)
- [ ] Multi-propriedade (vários hotéis)
- [ ] Channel manager (Booking.com, Airbnb)
- [ ] Revenue management
- [ ] CRM integrado
- [ ] Business intelligence

## 🤝 Contribuindo

### Branches
- `main`: Produção
- `develop`: Desenvolvimento
- `feature/*`: Novas features
- `bugfix/*`: Correções

### Commits
Seguir [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: adicionar sistema de extras
fix: corrigir cálculo de ocupação
docs: atualizar README
style: formatar código com Prettier
refactor: reorganizar serviços
test: adicionar testes de PDF
```

### Pull Requests
1. Fork o repositório
2. Crie branch feature
3. Faça commits descritivos
4. Abra PR com descrição detalhada
5. Aguarde review

## 📝 Licença
MIT License - veja [LICENSE](LICENSE) para detalhes.

## 👥 Time
- **Desenvolvedor Full Stack**: [Seu Nome]
- **Designer UI/UX**: [Nome]
- **Product Owner**: Roomview Boutique

## 📞 Contato
- **Website**: https://roomview.ao
- **E-mail**: contato@roomview.ao
- **Telefone**: +244 923 000 000
- **Endereço**: Luanda, Patriota, Via Principal

## 🙏 Agradecimentos
- shadcn/ui pelo sistema de componentes
- Vercel pelo hosting
- Comunidade React pelo suporte

---

**Desenvolvido com ❤️ em Luanda, Angola 🇦🇴**

**Status**: ✅ Todas as 7 features principais implementadas e documentadas!
