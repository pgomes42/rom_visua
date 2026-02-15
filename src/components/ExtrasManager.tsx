import { useState } from "react";
import { formatCurrency } from "@/data/apartments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ExtraItem {
    item: string;
    quantidade: number;
    preco_unitario: number;
}

interface ExtrasManagerProps {
    onAddExtra: (extra: ExtraItem) => void;
    onClose: () => void;
}

const PRESET_EXTRAS = [
    { id: 'agua-500ml', item: 'Água Mineral 500ml', preco: 500 },
    { id: 'agua-1.5l', item: 'Água Mineral 1.5L', preco: 800 },
    { id: 'refrigerante', item: 'Refrigerante Lata', preco: 1000 },
    { id: 'cafe-manha', item: 'Pequeno Almoço Continental', preco: 8000 },
    { id: 'almoco', item: 'Almoço Executivo', preco: 15000 },
    { id: 'jantar', item: 'Jantar Gourmet', preco: 20000 },
    { id: 'lavandaria', item: 'Serviço de Lavandaria (peça)', preco: 2000 },
    { id: 'transfer-aeroporto', item: 'Transfer Aeroporto', preco: 25000 },
    { id: 'wifi-premium', item: 'WiFi Premium 24h', preco: 5000 },
    { id: 'late-checkout', item: 'Late Checkout (3h extra)', preco: 12000 },
];

export const ExtrasManager = ({ onAddExtra, onClose }: ExtrasManagerProps) => {
    const [customMode, setCustomMode] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [quantidade, setQuantidade] = useState(1);
    
    // Custom mode states
    const [customItem, setCustomItem] = useState('');
    const [customPreco, setCustomPreco] = useState('');

    const handlePresetSelect = (presetId: string) => {
        setSelectedPreset(presetId);
        setQuantidade(1);
    };

    const handleAddPreset = () => {
        if (!selectedPreset) return;
        
        const preset = PRESET_EXTRAS.find(p => p.id === selectedPreset);
        if (!preset) return;

        onAddExtra({
            item: preset.item,
            quantidade,
            preco_unitario: preset.preco,
        });

        setSelectedPreset(null);
        setQuantidade(1);
    };

    const handleAddCustom = () => {
        if (!customItem || !customPreco) return;

        onAddExtra({
            item: customItem,
            quantidade,
            preco_unitario: parseFloat(customPreco),
        });

        setCustomItem('');
        setCustomPreco('');
        setQuantidade(1);
        setCustomMode(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
                <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                        <h3 className="font-display text-xl font-bold text-foreground">Adicionar Pedido Extra</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Mode Selector */}
                    <div className="flex gap-2">
                        <Button
                            variant={!customMode ? "default" : "outline"}
                            onClick={() => setCustomMode(false)}
                            className="flex-1"
                        >
                            Itens Pré-definidos
                        </Button>
                        <Button
                            variant={customMode ? "default" : "outline"}
                            onClick={() => setCustomMode(true)}
                            className="flex-1"
                        >
                            Item Personalizado
                        </Button>
                    </div>

                    {/* Preset Mode */}
                    {!customMode && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {PRESET_EXTRAS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetSelect(preset.id)}
                                        className={`p-4 rounded-sm border text-left transition-all ${
                                            selectedPreset === preset.id
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-muted/30 hover:border-primary/50'
                                        }`}
                                    >
                                        <p className="font-medium text-foreground">{preset.item}</p>
                                        <p className="text-sm text-primary font-bold mt-1">
                                            {formatCurrency(preset.preco)}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {selectedPreset && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-muted/30 border border-border rounded-sm p-4 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label>Quantidade</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={quantidade}
                                                    onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-20 text-center bg-background border-border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setQuantidade(quantidade + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                            <span className="text-sm text-muted-foreground">Total:</span>
                                            <span className="text-lg font-bold text-primary">
                                                {formatCurrency(
                                                    (PRESET_EXTRAS.find(p => p.id === selectedPreset)?.preco || 0) * quantidade
                                                )}
                                            </span>
                                        </div>

                                        <Button
                                            onClick={handleAddPreset}
                                            className="w-full"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adicionar Item
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {/* Custom Mode */}
                    {customMode && (
                        <div className="space-y-4 bg-muted/30 border border-border rounded-sm p-4">
                            <div className="space-y-2">
                                <Label>Descrição do Item</Label>
                                <Input
                                    value={customItem}
                                    onChange={(e) => setCustomItem(e.target.value)}
                                    placeholder="Ex: Toalhas Extra, Room Service..."
                                    required
                                    className="bg-background border-border"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quantidade</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Preço Unitário (AKZ)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={customPreco}
                                        onChange={(e) => setCustomPreco(e.target.value)}
                                        placeholder="0"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                            </div>

                            {customItem && customPreco && (
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="text-sm text-muted-foreground">Total:</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(parseFloat(customPreco) * quantidade)}
                                    </span>
                                </div>
                            )}

                            <Button
                                onClick={handleAddCustom}
                                className="w-full"
                                disabled={!customItem || !customPreco}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Item Personalizado
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ExtrasManager;
