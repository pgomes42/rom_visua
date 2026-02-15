# Sistema de Galeria de Fotos

## Visão Geral
Galeria de fotos interativa com visualização em carrossel, thumbnails, zoom e modo fullscreen.

## Componente Principal: PhotoGallery.tsx

### Interfaces
```typescript
interface PhotoGalleryProps {
    photos: string[];           // Array de URLs das fotos
    apartmentName: string;       // Nome do apartamento
    onClose?: () => void;        // Callback opcional para fechar
}

interface PhotoGalleryModalProps {
    photos: string[];
    apartmentName: string;
    initialIndex?: number;       // Foto inicial (padrão: 0)
    onClose: () => void;         // Obrigatório para modal
}
```

## Funcionalidades

### 1. Navegação
- **Setas Laterais**: Prev/Next com ChevronLeft/ChevronRight
- **Thumbnails**: Grid clicável de miniaturas
- **Teclado** (futuro): ← → para navegar, Esc para fechar

### 2. Zoom
- **Clique na Imagem**: Toggle zoom in/out
- **Botão Dedicado**: Ícone ZoomIn/ZoomOut
- **Nível de Zoom**: 1.5x quando ativado
- **Cursor**: zoom-in/zoom-out conforme estado

### 3. Fullscreen
- **Botão Maximize**: Expande galeria para tela cheia
- **Background Escuro**: Black overlay para destaque
- **Responsivo**: Funciona em desktop e mobile

### 4. Contador
Badge flutuante mostrando: `1 / 5` (foto atual / total)

## Estados Gerenciados

```typescript
const [currentIndex, setCurrentIndex] = useState(0);        // Foto atual
const [isZoomed, setIsZoomed] = useState(false);           // Zoom ativo?
const [isFullscreen, setIsFullscreen] = useState(false);   // Fullscreen?
```

## Animações (Framer Motion)

### Transição de Fotos
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentIndex}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
  >
    <img src={photos[currentIndex]} />
  </motion.div>
</AnimatePresence>
```

### Modal de Entrada
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
>
  {/* Conteúdo */}
</motion.div>
```

## Integração no ApartmentDetail.tsx

### Imports
```typescript
import { PhotoGalleryModal } from "@/components/PhotoGallery";
import { useState } from "react";
import { Images } from "lucide-react";
```

### Estado
```typescript
const [isGalleryOpen, setIsGalleryOpen] = useState(false);
```

### Hero Image Clicável
```tsx
<div 
  className="relative h-[50vh] min-h-[400px] group cursor-pointer" 
  onClick={() => setIsGalleryOpen(true)}
>
  <img src={apartment.fotos[0]} alt={apartment.nome} />
  
  {/* Botão de Galeria (aparece no hover) */}
  {apartment.fotos.length > 1 && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsGalleryOpen(true);
      }}
      className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-sm transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
    >
      <Images className="w-4 h-4" />
      <span>Ver Galeria ({apartment.fotos.length} fotos)</span>
    </button>
  )}
</div>
```

### Modal Renderizado
```tsx
{isGalleryOpen && (
  <PhotoGalleryModal
    photos={apartment.fotos}
    apartmentName={apartment.nome}
    onClose={() => setIsGalleryOpen(false)}
  />
)}
```

## Layout Responsivo

### Desktop
- Hero Image altura: 50vh (mín 400px)
- Thumbnails: Grid horizontal com scroll
- Setas: Visíveis permanentemente nos lados

### Mobile
- Thumbnails: Scroll horizontal
- Setas: Ligeiramente menores
- Fullscreen: Ocupa 100% da viewport
- Pinch to zoom (nativo do navegador)

### Tablet
- Comportamento híbrido
- Thumbnails em 2 linhas opcional

## Estilo e UX

### Thumbnails
```tsx
<button
  className={`relative w-20 h-20 rounded-sm overflow-hidden transition-all ${
    index === currentIndex
      ? 'ring-2 ring-primary scale-110'        // Ativo
      : 'hover:scale-105 opacity-70 hover:opacity-100'  // Inativo
  }`}
>
  <img src={photo} className="w-full h-full object-cover" />
</button>
```

### Controles
- **Background**: `bg-black/50 backdrop-blur-sm` (glassmorphism)
- **Hover**: `hover:bg-black/70` (escurece)
- **Transições**: `transition-all` (suave)
- **Arredondamento**: `rounded-full` para botões circulares

### Contador de Fotos
```tsx
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
  {currentIndex + 1} / {photos.length}
</div>
```

## Casos de Uso

### 1. Cliente Explora Apartamento
- Cliente acessa página do apartamento
- Vê foto principal (hero)
- Passa mouse → botão "Ver Galeria" aparece
- Clica → modal fullscreen abre
- Navega com setas ou thumbnails
- Fecha com X ou ESC

### 2. Mobile Touch
- Cliente em smartphone
- Toca na imagem hero → galeria abre
- Swipe left/right para navegar (futuro)
- Pinch to zoom (nativo)
- Toca X para fechar

### 3. Apresentação de Vendas
- Staff mostra apartamento para cliente presencialmente
- Abre galeria em modo fullscreen
- Navega com teclado ou mouse
- Usa zoom para destacar detalhes (acabamentos, vista)

## Performance

### Lazy Loading de Imagens
```tsx
<img 
  src={photo} 
  loading="lazy"  // Carrega sob demanda
  alt={apartmentName}
/>
```

### Pré-carregamento Adjacentes
```typescript
useEffect(() => {
  // Pré-carregar imagem anterior e próxima
  const preloadImages = [
    photos[currentIndex - 1],
    photos[currentIndex + 1]
  ].filter(Boolean);
  
  preloadImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}, [currentIndex, photos]);
```

### Otimização de Imagens
Sugestão: usar serviço de CDN com transformações:
```
https://img.roomview.ao/apartments/studio-1.jpg?w=1920&q=80
```

## Acessibilidade

### ARIA Labels
```tsx
<button aria-label="Foto anterior" onClick={goToPrevious}>
  <ChevronLeft />
</button>

<button aria-label={isZoomed ? "Diminuir zoom" : "Aumentar zoom"}>
  {isZoomed ? <ZoomOut /> : <ZoomIn />}
</button>
```

### Keyboard Navigation (Futuro)
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose?.();
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Focus Management
- Quando modal abre, foco vai para botão de fechar
- Tab navega entre controles (setas, zoom, fullscreen, close)
- Enter/Space ativa botão focado

## Melhorias Futuras

### Touch Gestures
```bash
npm install react-use-gesture
```
```typescript
const bind = useGesture({
  onSwipeLeft: () => goToNext(),
  onSwipeRight: () => goToPrevious(),
  onPinch: ({ offset: [scale] }) => setZoomLevel(scale),
});
```

### Compartilhamento
```tsx
<Button onClick={() => {
  navigator.share({
    title: apartmentName,
    text: `Confira ${apartmentName} no Roomview Boutique`,
    url: window.location.href
  });
}}>
  <Share2 className="w-4 h-4" />
</Button>
```

### Download de Foto
```tsx
<Button onClick={() => {
  fetch(photos[currentIndex])
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${apartmentName}-${currentIndex + 1}.jpg`;
      a.click();
    });
}}>
  <Download className="w-4 h-4" />
</Button>
```

### Slideshow Automático
```typescript
const [isPlaying, setIsPlaying] = useState(false);

useEffect(() => {
  if (!isPlaying) return;
  
  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % photos.length);
  }, 3000); // 3 segundos
  
  return () => clearInterval(interval);
}, [isPlaying, photos.length]);
```

### Comparação Lado a Lado
Mostrar 2 fotos lado a lado para comparação.

### 360° Virtual Tour
Integração com Matterport ou similar.

### Upload de Fotos (Admin)
```tsx
// Admin.tsx - Gerenciar fotos do apartamento
<input 
  type="file" 
  accept="image/*" 
  multiple 
  onChange={handlePhotoUpload}
/>
```

## Integração com Backend (Futuro)

### Estrutura de Dados
```typescript
interface ApartmentPhoto {
  id: string;
  apartment_id: string;
  url: string;
  thumbnail_url: string;
  caption?: string;
  order: number;              // Ordem de exibição
  is_primary: boolean;        // Foto principal?
  uploaded_at: string;
  uploaded_by: string;        // User ID
}
```

### API Endpoints
```
GET    /api/apartments/:id/photos
POST   /api/apartments/:id/photos       // Upload
DELETE /api/apartments/:id/photos/:pid  // Remover
PATCH  /api/apartments/:id/photos/:pid  // Reordenar, set primary
```

## Segurança
- Validação de tipo de arquivo (apenas imagens)
- Limite de tamanho (máx 5MB por foto)
- Sanitização de nomes de arquivo
- CDN com signed URLs para prevenir hotlinking

## Casos de Erro

### Foto Não Carrega
```tsx
<img 
  src={photo}
  onError={(e) => {
    e.currentTarget.src = '/placeholder-room.jpg'; // Fallback
  }}
/>
```

### Array Vazio
```tsx
if (photos.length === 0) {
  return (
    <div className="bg-muted rounded-sm p-12 text-center">
      <p className="text-muted-foreground">Nenhuma foto disponível</p>
    </div>
  );
}
```

## Testes Sugeridos

### E2E com Playwright
```typescript
test('deve navegar pela galeria', async ({ page }) => {
  await page.goto('/apartamento/estudio-boutique');
  await page.click('.hero-image'); // Abre galeria
  await page.click('button[aria-label="Próxima foto"]');
  await expect(page.locator('.photo-counter')).toHaveText('2 / 5');
});
```

### Unit Tests
```typescript
describe('PhotoGallery', () => {
  it('deve iniciar no índice 0', () => {
    render(<PhotoGallery photos={mockPhotos} apartmentName="Test" />);
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });
  
  it('deve fazer zoom ao clicar na imagem', () => {
    const { container } = render(<PhotoGallery photos={mockPhotos} apartmentName="Test" />);
    const img = container.querySelector('img');
    fireEvent.click(img);
    expect(img).toHaveStyle('transform: scale(1.5)');
  });
});
```

## Notas do Desenvolvedor
- Componente totalmente controlado por props
- Sem dependências externas além de framer-motion
- Compatível com SSR (Next.js) com `dynamic(() => import(), { ssr: false })`
- Theme-aware (respeita dark mode automático)
- Mobile-first design

## Referências de Inspiração
- Airbnb photo viewer
- Booking.com gallery
- Lightbox2 (mas modernizado)
- PhotoSwipe (touch gestures)
