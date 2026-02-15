import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    CreditCard,
    Smartphone,
    Building,
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    Upload,
    ExternalLink,
    ClipboardCheck,
    Wallet,
    FileCheck
} from "lucide-react";
import { format, parseISO, differenceInSeconds } from "date-fns";
import { pt } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { bookingService } from "@/lib/bookingService";
import { apartmentService } from "@/lib/apartmentService";
import { Booking, formatCurrency, BOOKING_DEPOSIT } from "@/data/apartments";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<"EXPRESS" | "REFERENCIA" | "TRANSFERENCIA" | "PRESENCIAL" | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "AWAITING" | "CONFIRMED">("IDLE");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    // Load booking
    useEffect(() => {
        const allBookings = bookingService.getBookings();
        const found = allBookings.find(b => b.id === id);
        if (!found) {
            toast.error("Reserva não encontrada");
            navigate("/");
            return;
        }
        setBooking(found);

        // Calculate initial timer
        const expiresAt = parseISO(found.expires_at);
        const diff = differenceInSeconds(expiresAt, new Date());
        setTimeLeft(diff > 0 ? diff : 0);
    }, [id, navigate]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) {
            // Booking expired
            if (booking && booking.status === "PENDENTE_PAGAMENTO") {
                bookingService.updateBookingStatus(booking.id, "EXPIRADA");
                toast.error("Reserva expirada!", {
                    description: "O prazo de pagamento terminou. Por favor, crie uma nova reserva.",
                    duration: 6000
                });
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                // Warning when 5 minutes left
                if (prev === 300) {
                    toast.warning("Apenas 5 minutos restantes!", {
                        description: "Complete o pagamento para garantir a sua reserva."
                    });
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, booking]);

    const formattedTime = useMemo(() => {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [timeLeft]);

    const apartment = useMemo(() => {
        return booking ? apartmentService.getApartments().find(a => a.id === booking.apartment_id) : null;
    }, [booking]);

    const handleMulticaixaExpress = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 9) {
            toast.error("Por favor, insira um número de telemóvel válido.");
            return;
        }
        setIsProcessing(true);
        setPaymentStatus("AWAITING");

        // Simulate gateway request
        setTimeout(() => {
            setIsProcessing(false);
            toast.success("Pedido de pagamento enviado para o seu telemóvel!");

            // Simulate confirmation after 5 seconds
            setTimeout(() => {
                // Update booking with payment method
                if (booking) {
                    const bookings = bookingService.getBookings();
                    const index = bookings.findIndex(b => b.id === booking.id);
                    if (index !== -1) {
                        bookings[index].status = "CONFIRMADA";
                        bookings[index].metodo_pagamento = "EXPRESS";
                        localStorage.setItem("roomview_bookings", JSON.stringify(bookings));
                        setBooking(bookings[index]);
                    }
                }
                setPaymentStatus("CONFIRMED");
                toast.success("Pagamento confirmado com sucesso!", {
                    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
                    description: "A sua reserva está garantida. Verifique o seu e-mail."
                });
            }, 5000);
        }, 2000);
    };

    const copyToClipboard = (text: string, msg: string) => {
        navigator.clipboard.writeText(text);
        toast.success(msg);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                toast.error("Formato inválido. Use PDF, JPG ou PNG.");
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ficheiro muito grande. Máximo 5MB.");
                return;
            }
            setUploadedFile(file);
            toast.success(`Ficheiro "${file.name}" carregado com sucesso!`);
        }
    };

    const handleSubmitProof = () => {
        if (!uploadedFile) {
            toast.error("Por favor, carregue o comprovativo de pagamento.");
            return;
        }
        setIsProcessing(true);
        // Simulate upload
        setTimeout(() => {
            setIsProcessing(false);
            toast.success("Comprovativo enviado! Aguarde a confirmação.", {
                description: "Iremos validar o pagamento e confirmar a sua reserva em breve."
            });
            setPaymentStatus("AWAITING");
        }, 2000);
    };

    if (!booking || !apartment) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-5xl">
                    {/* Header & Status */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-body text-xs uppercase tracking-widest">Voltar para a Home</span>
                            </button>
                            <h1 className="font-display text-4xl font-bold text-foreground">Finalizar <span className="text-gradient-gold">Pagamento</span></h1>
                            <p className="font-body text-muted-foreground mt-2 italic underline underline-offset-4 decoration-primary/30">ID da Reserva: {booking.id}</p>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-sm shadow-xl flex items-center gap-6 min-w-[280px]">
                            <div className={`p-3 rounded-full ${timeLeft < 300 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                                <Clock className={`w-6 h-6 ${timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Tempo Restante</p>
                                <p className={`font-display text-2xl font-bold ${timeLeft === 0 ? 'text-destructive' : timeLeft < 600 ? 'text-destructive' : 'text-foreground'}`}>
                                    {timeLeft > 0 ? formattedTime : "EXPIRADA"}
                                </p>
                                <Progress 
                                    value={(timeLeft / (2 * 60 * 60)) * 100} 
                                    className={`h-1 ${timeLeft < 300 ? 'bg-destructive/20' : ''}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Expired Overlay */}
                        {timeLeft === 0 && (
                            <div className="lg:col-span-12 mb-6">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-destructive/10 border-2 border-destructive/30 p-6 rounded-sm flex items-center gap-4"
                                >
                                    <AlertCircle className="w-10 h-10 text-destructive flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h3 className="font-display text-xl font-bold text-destructive">Reserva Expirada</h3>
                                        <p className="font-body text-sm text-destructive/80 mt-1">
                                            O prazo de pagamento terminou. Esta reserva foi cancelada. Por favor, crie uma nova reserva para garantir a sua estadia.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => navigate("/reservar")} 
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                    >
                                        Nova Reserva
                                    </Button>
                                </motion.div>
                            </div>
                        )}

                        {/* Left Column: Payment Options */}
                        <div className="lg:col-span-7 space-y-6">
                            <section className="bg-card border border-border p-0 rounded-sm shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-border bg-muted/30">
                                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Método de Pagamento
                                    </h2>
                                    <p className="font-body text-xs text-muted-foreground mt-1 text-balance">Escolha uma das opções abaixo para garantir a sua estadia.</p>
                                </div>

                                <div className="p-6 space-y-4">
                                    {timeLeft === 0 ? (
                                        <div className="p-8 text-center">
                                            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                                            <p className="font-body text-muted-foreground">
                                                Os métodos de pagamento não estão mais disponíveis porque o prazo expirou.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                    {/* Option 1: Express */}
                                    <div
                                        onClick={() => setPaymentMethod("EXPRESS")}
                                        className={`p-5 border cursor-pointer transition-all rounded-sm flex items-start gap-4 ${paymentMethod === "EXPRESS" ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/50 bg-muted/20'}`}
                                    >
                                        <div className="p-3 bg-card border border-border rounded-sm">
                                            <Smartphone className={`w-6 h-6 ${paymentMethod === "EXPRESS" ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-body font-bold text-foreground">Multicaixa Express</h3>
                                            <p className="font-body text-xs text-muted-foreground mt-1">Pague de forma rápida e segura directamente no seu telemóvel.</p>

                                            <AnimatePresence>
                                                {paymentMethod === "EXPRESS" && (
                                                    <motion.form
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        onSubmit={handleMulticaixaExpress}
                                                        className="mt-6 space-y-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Número de Telemóvel</Label>
                                                            <div className="flex gap-2">
                                                                <div className="bg-muted border border-border px-3 flex items-center rounded-sm font-body text-sm">+244</div>
                                                                <Input
                                                                    value={phoneNumber}
                                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                                    placeholder="9XX XXX XXX"
                                                                    className="bg-card border-border font-body"
                                                                    maxLength={9}
                                                                    required
                                                                    disabled={isProcessing || paymentStatus === "CONFIRMED"}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="submit"
                                                            className="w-full bg-primary text-primary-foreground font-body font-bold uppercase tracking-widest py-6"
                                                            disabled={isProcessing || paymentStatus === "CONFIRMED"}
                                                        >
                                                            {isProcessing ? "A processar..." : "Confirmar Pagamento"}
                                                        </Button>
                                                    </motion.form>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Option 2: Reference */}
                                    <div
                                        onClick={() => setPaymentMethod("REFERENCIA")}
                                        className={`p-5 border cursor-pointer transition-all rounded-sm flex items-start gap-4 ${paymentMethod === "REFERENCIA" ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/50 bg-muted/20'}`}
                                    >
                                        <div className="p-3 bg-card border border-border rounded-sm">
                                            <ClipboardCheck className={`w-6 h-6 ${paymentMethod === "REFERENCIA" ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-body font-bold text-foreground">Pagar por Referência</h3>
                                            <p className="font-body text-xs text-muted-foreground mt-1">Gere uma referência e pague no Multicaixa ou Internet Banking.</p>

                                            <AnimatePresence>
                                                {paymentMethod === "REFERENCIA" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-6 p-4 bg-card border border-border rounded-sm space-y-4"
                                                    >
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-3 bg-muted rounded-sm">
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Entidade</p>
                                                                <p className="text-lg font-mono font-bold text-foreground">00567</p>
                                                            </div>
                                                            <div className="p-3 bg-muted rounded-sm relative group">
                                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Referência</p>
                                                                <p className="text-lg font-mono font-bold text-foreground">{booking.referencia_pagamento}</p>
                                                                <button
                                                                    onClick={() => copyToClipboard(booking.referencia_pagamento, "Referência copiada!")}
                                                                    className="absolute right-2 top-11 p-1 hover:text-primary transition-colors"
                                                                >
                                                                    <ClipboardCheck className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm">
                                                            <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Valor do Sinal</p>
                                                            <p className="text-xl font-display font-bold text-primary">{formatCurrency(BOOKING_DEPOSIT)}</p>
                                                        </div>
                                                        <Button
                                                            onClick={() => {
                                                                setIsProcessing(true);
                                                                setTimeout(() => {
                                                                    setIsProcessing(false);
                                                                    toast.info("Estamos aguardando a confirmação do banco.");
                                                                }, 1500);
                                                            }}
                                                            className="w-full variant-outline bg-transparent border-primary/30 text-primary hover:bg-primary/5 font-body font-bold py-6"
                                                        >
                                                            Já efectuei o pagamento
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Option 3: Bank Transfer */}
                                    <div
                                        onClick={() => setPaymentMethod("TRANSFERENCIA")}
                                        className={`p-5 border cursor-pointer transition-all rounded-sm flex items-start gap-4 ${paymentMethod === "TRANSFERENCIA" ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/50 bg-muted/20'}`}
                                    >
                                        <div className="p-3 bg-card border border-border rounded-sm">
                                            <Building className={`w-6 h-6 ${paymentMethod === "TRANSFERENCIA" ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-body font-bold text-foreground">Transferência Bancária / IBAN</h3>
                                            <p className="font-body text-xs text-muted-foreground mt-1">Transfira directamente para a nossa conta e envie o comprovativo.</p>

                                            <AnimatePresence>
                                                {paymentMethod === "TRANSFERENCIA" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-6 p-4 bg-card border border-border rounded-sm space-y-4"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Banco</span>
                                                                <span className="font-bold">BAI</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">Beneficiário</span>
                                                                <span className="font-bold">Roomview Boutique Lda.</span>
                                                            </div>
                                                            <div className="flex flex-col gap-2 p-3 bg-muted rounded-sm">
                                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">IBAN (Clique para copiar)</span>
                                                                <button
                                                                    onClick={() => copyToClipboard("AO06004000000123456789012", "IBAN copiado!")}
                                                                    className="text-[13px] font-mono font-bold text-foreground text-left break-all hover:text-primary transition-colors"
                                                                >
                                                                    AO06 0040 0000 0123 4567 8901 2
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="border-t border-border pt-4">
                                                            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Submeter Comprovativo</Label>
                                                            <input 
                                                                type="file" 
                                                                id="proof-upload" 
                                                                className="hidden" 
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={handleFileUpload}
                                                            />
                                                            <label 
                                                                htmlFor="proof-upload"
                                                                className="border-2 border-dashed border-border rounded-sm p-8 text-center hover:border-primary/50 transition-colors group cursor-pointer block"
                                                            >
                                                                {uploadedFile ? (
                                                                    <div className="space-y-2">
                                                                        <FileCheck className="w-8 h-8 text-green-500 mx-auto" />
                                                                        <p className="font-body text-sm text-foreground font-medium">{uploadedFile.name}</p>
                                                                        <p className="font-body text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
                                                                        <p className="font-body text-xs text-muted-foreground">Clique para fazer upload ou arraste o ficheiro</p>
                                                                        <p className="font-body text-[10px] text-muted-foreground mt-1">(PDF, JPG, PNG - Máx. 5MB)</p>
                                                                    </>
                                                                )}
                                                            </label>
                                                            {uploadedFile && (
                                                                <Button
                                                                    onClick={handleSubmitProof}
                                                                    disabled={isProcessing}
                                                                    className="w-full mt-4 bg-primary text-primary-foreground font-body font-bold py-6"
                                                                >
                                                                    {isProcessing ? "A enviar..." : "Submeter Comprovativo"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Option 4: Presencial (Balcão) */}
                                    <div
                                        onClick={() => setPaymentMethod("PRESENCIAL")}
                                        className={`p-5 border cursor-pointer transition-all rounded-sm flex items-start gap-4 ${paymentMethod === "PRESENCIAL" ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/50 bg-muted/20'}`}
                                    >
                                        <div className="p-3 bg-card border border-border rounded-sm">
                                            <Wallet className={`w-6 h-6 ${paymentMethod === "PRESENCIAL" ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-body font-bold text-foreground">Pagamento Presencial</h3>
                                            <p className="font-body text-xs text-muted-foreground mt-1">Pague directamente no nosso balcão em dinheiro ou TPA.</p>

                                            <AnimatePresence>
                                                {paymentMethod === "PRESENCIAL" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-6 p-4 bg-card border border-border rounded-sm space-y-4"
                                                    >
                                                        <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <Building className="w-5 h-5 text-primary" />
                                                                <h4 className="font-bold text-foreground">Roomview Boutique</h4>
                                                            </div>
                                                            <div className="space-y-2 text-sm">
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-semibold text-foreground">Morada:</span> Patriota, Via Principal, Luanda
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-semibold text-foreground">Horário:</span> Segunda a Domingo, 08:00 - 20:00
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    <span className="font-semibold text-foreground">Contacto:</span> +244 923 000 000
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="bg-muted/50 border border-border rounded-sm p-4">
                                                            <p className="text-xs text-muted-foreground mb-3">
                                                                <span className="font-bold text-foreground">Atenção:</span> A reserva será mantida por 2 horas. Por favor, dirija-se ao balcão para efectuar o pagamento dentro deste prazo.
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                <span className="text-green-600 font-medium">Aceitamos dinheiro e TPA (Multicaixa)</span>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={() => {
                                                                toast.success("Reserva mantida!", {
                                                                    description: "Aguardamos a sua visita ao balcão para confirmar o pagamento."
                                                                });
                                                                // Update metodo_pagamento
                                                                if (booking) {
                                                                    const bookings = bookingService.getBookings();
                                                                    const index = bookings.findIndex(b => b.id === booking.id);
                                                                    if (index !== -1) {
                                                                        bookings[index].metodo_pagamento = "PRESENCIAL";
                                                                        localStorage.setItem("roomview_bookings", JSON.stringify(bookings));
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full bg-primary text-primary-foreground font-body font-bold py-6"
                                                        >
                                                            Confirmar Pagamento no Balcão
                                                        </Button>

                                                        <a
                                                            href="https://maps.google.com/?q=Patriota,Luanda"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 text-xs text-primary hover:underline"
                                                        >
                                                            Ver localização no mapa
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    </>
                                    )}
                                </div>
                            </section>

                            {/* Status Indicator */}
                            <AnimatePresence>
                                {paymentStatus !== "IDLE" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-6 border rounded-sm flex items-center gap-5 ${paymentStatus === "CONFIRMED" ? 'bg-green-500/10 border-green-500/30' : 'bg-primary/5 border-primary/20'}`}
                                    >
                                        <div className="relative">
                                            {paymentStatus === "CONFIRMED" ? (
                                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                            ) : (
                                                <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className={`font-display text-lg font-bold ${paymentStatus === "CONFIRMED" ? 'text-green-500' : 'text-primary'}`}>
                                                {paymentStatus === "CONFIRMED" ? "Pagamento Confirmado!" : "Aguardando Confirmação..."}
                                            </h4>
                                            <p className="font-body text-sm text-balance">
                                                {paymentStatus === "CONFIRMED"
                                                    ? "A sua reserva está garantida. Enviamos os detalhes para o seu e-mail."
                                                    : "Recebemos o seu pedido. Por favor, confirme no seu aplicativo Multicaixa Express."}
                                            </p>
                                        </div>
                                        {paymentStatus === "CONFIRMED" && (
                                            <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700 font-body uppercase text-xs tracking-widest">
                                                Ok, fechar
                                            </Button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Column: Reservation Summary */}
                        <div className="lg:col-span-5">
                            <div className="bg-card border border-border rounded-sm shadow-xl sticky top-32 overflow-hidden">
                                <div className="h-48 relative">
                                    <img
                                        src={apartment.fotos[0]}
                                        alt={apartment.nome}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                            {apartment.tipologia}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div>
                                        <h3 className="font-display text-2xl font-bold text-foreground leading-tight">{apartment.nome}</h3>
                                        <p className="font-body text-sm text-muted-foreground mt-1 italic">{apartment.localizacao}</p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Check-in</span>
                                            <span className="font-bold text-foreground">{format(parseISO(booking.checkin), "dd MMM yyyy", { locale: pt })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Check-out</span>
                                            <span className="font-bold text-foreground">{format(parseISO(booking.checkout), "dd MMM yyyy", { locale: pt })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-widest">Noites</span>
                                            <span className="font-bold text-foreground">{booking.noites}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-border">
                                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-sm border border-border/50">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Valor Total</p>
                                                <p className="text-lg font-display font-medium text-foreground">{formatCurrency(booking.total_estadia)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Valor a Pagar (Sinal)</p>
                                                <p className="text-2xl font-display font-bold text-primary">{formatCurrency(BOOKING_DEPOSIT)}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/10 border border-dashed border-border rounded-sm flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground italic">Saldo a pagar no local</span>
                                            <span className="text-sm font-body font-bold text-foreground">{formatCurrency(booking.restante_pagar)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-sm flex items-start gap-3">
                                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[11px] text-destructive font-bold uppercase tracking-wide">Atenção</p>
                                                <p className="text-[11px] text-destructive/80 leading-relaxed italic">Esta reserva será cancelada se o pagamento não for confirmado dentro do prazo limite (2 horas).</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-4 border-t border-border">
                                        <a
                                            href={`https://wa.me/244923000000?text=${encodeURIComponent(`Olá! Gostaria de ajuda com o pagamento da minha reserva ${booking.id}.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full text-xs font-bold uppercase tracking-widest text-[#25D366] hover:bg-[#25D366]/5 py-3 transition-colors"
                                        >
                                            Precisa de ajuda? Fale connosco
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// Simplified icon component that might be missing
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

export default Checkout;
