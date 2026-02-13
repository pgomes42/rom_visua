import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, User, CreditCard, Clock, FileText, Download, CheckCircle, XCircle, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { Booking, Apartment, formatCurrency } from "@/data/apartments";
import { bookingService } from "@/lib/bookingService";
import { apartmentService } from "@/lib/apartmentService";
import { authService, User as AuthUser } from "@/lib/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
    PENDENTE_PAGAMENTO: { label: "Aguardando Pagamento", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
    CONFIRMADA: { label: "Pago / Confirmada", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
    CHECKIN_REALIZADO: { label: "Hóspede em Estadia", color: "bg-blue-500/10 text-blue-500", icon: User },
    FINALIZADA: { label: "Concluída", color: "bg-primary/10 text-primary", icon: FileText },
    CANCELADA: { label: "Cancelada", color: "bg-destructive/10 text-destructive", icon: XCircle },
    EXPIRADA: { label: "Expirada", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

const ManageBooking = () => {
    const [bookingId, setBookingId] = useState("");
    const [contact, setContact] = useState("");
    const [searching, setSearching] = useState(false);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [isViewingReceipt, setIsViewingReceipt] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentUser(authService.getCurrentUser());
    }, []);

    const can = (permission: string) => {
        if (!currentUser) return false;
        return authService.hasPermission(currentUser, permission as any);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        setBooking(null);

        setTimeout(() => {
            const found = bookingService.getBookingSecure(bookingId, contact);
            if (found) {
                setBooking(found);
                const apt = apartmentService.getApartments().find(a => a.id === found.apartment_id);
                if (apt) setApartment(apt);
                toast.success("Reserva localizada com sucesso!");
            } else {
                toast.error("Reserva não encontrada. Verifique o ID e os dados de contacto.");
            }
            setSearching(false);
        }, 800);
    };

    const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
        const config = statusConfig[status] || statusConfig.EXPIRADA;
        const Icon = config.icon;
        return (
            <Badge className={`${config.color} border-none flex items-center gap-1.5 px-3 py-1`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="font-display text-4xl font-bold mb-4">Gerenciar Reserva</h1>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Localize a sua estadia premium e acompanhe o estado do seu pagamento em tempo real.
                        </p>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {!booking ? (
                        <motion.div
                            key="search-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border rounded-sm p-8 shadow-xl max-w-md mx-auto"
                        >
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="booking-id">ID da Reserva</Label>
                                    <Input
                                        id="booking-id"
                                        placeholder="Ex: RV-XXXXXXX"
                                        value={bookingId}
                                        onChange={(e) => setBookingId(e.target.value)}
                                        className="bg-muted border-border font-mono uppercase"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact">Telefone ou Email</Label>
                                    <Input
                                        id="contact"
                                        placeholder="O dado usado na reserva"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="bg-muted border-border"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                                    disabled={searching}
                                >
                                    {searching ? "A pesquisar..." : (
                                        <>
                                            <Search className="w-4 h-4 mr-2" />
                                            Buscar Reserva
                                        </>
                                    )}
                                </Button>
                            </form>
                            <div className="mt-6 pt-6 border-t border-border text-center">
                                <p className="text-xs text-muted-foreground italic">
                                    Dica: Verifique o seu e-mail ou SMS para encontrar o seu ID de reserva.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="booking-details"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <Button variant="ghost" onClick={() => setBooking(null)} className="text-muted-foreground h-8 px-2">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Nova Pesquisa
                                </Button>
                                <StatusBadge status={booking.status as keyof typeof statusConfig} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Main Info */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
                                            <div>
                                                <h3 className="font-display text-xl font-bold">{apartment?.nome || "Apartamento"}</h3>
                                                <p className="text-sm text-muted-foreground">Reserva #{booking.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Criada em</p>
                                                <p className="text-sm font-medium">{format(parseISO(booking.created_at), "dd/MM/yyyy")}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Check-in</p>
                                                        <p className="text-sm font-medium">{format(parseISO(booking.checkin), "dd/MM/yyyy")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Cliente</p>
                                                        <p className="text-sm font-medium">{booking.cliente_nome}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Check-out</p>
                                                        <p className="text-sm font-medium">{format(parseISO(booking.checkout), "dd/MM/yyyy")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Estadia</p>
                                                        <p className="text-sm font-medium">{booking.noites} Noites · {booking.pessoas} Pessoas</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(booking.status === "PENDENTE_PAGAMENTO") && (
                                            <Button
                                                onClick={() => navigate(`/checkout/${booking.id}`)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white w-full h-12"
                                            >
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Pagar Sinal Agora
                                            </Button>
                                        )}
                                        {(booking.status === "CONFIRMADA" || booking.status === "CHECKIN_REALIZADO" || booking.status === "FINALIZADA") && (
                                            <Button
                                                variant="outline"
                                                className="border-primary text-primary hover:bg-primary/5 w-full h-12"
                                                onClick={() => setIsViewingReceipt(true)}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Visualizar Comprovativo
                                            </Button>
                                        )}

                                        {/* Staff Specific Actions */}
                                        {currentUser && can("MANAGE_BOOKINGS") && (
                                            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                                                <p className="sm:col-span-2 text-xs font-bold uppercase tracking-widest text-primary">Painel do Staff</p>

                                                {booking.status === "PENDENTE_PAGAMENTO" && (
                                                    <Button
                                                        variant="outline"
                                                        className="border-green-500 text-green-500 hover:bg-green-50"
                                                        onClick={() => {
                                                            if (window.confirm("Confirmar pagamento manual deste sinal?")) {
                                                                bookingService.updateBookingStatus(booking.id, "CONFIRMADA");
                                                                setBooking({ ...booking, status: "CONFIRMADA" });
                                                                toast.success("Pagamento confirmado manualmente!");
                                                            }
                                                        }}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Confirmar Pagamento
                                                    </Button>
                                                )}

                                                {booking.restante_pagar > 0 && booking.status !== "PENDENTE_PAGAMENTO" && (
                                                    <Button
                                                        variant="outline"
                                                        className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                                        onClick={() => {
                                                            if (window.confirm("Confirmar recebimento do saldo restante?")) {
                                                                bookingService.registerRemainingPayment(booking.id);
                                                                setBooking({ ...booking, restante_pagar: 0 });
                                                                toast.success("Saldo liquidado com sucesso!");
                                                            }
                                                        }}
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Liquidar Saldo
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/5"
                                                    onClick={() => {
                                                        if (window.confirm("TEM A CERTEZA que deseja cancelar esta reserva?")) {
                                                            bookingService.updateBookingStatus(booking.id, "CANCELADA");
                                                            setBooking({ ...booking, status: "CANCELADA" });
                                                            toast.error("Reserva cancelada pelo staff.");
                                                        }
                                                    }}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Cancelar Reserva
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toast.info("Link de pagamento enviado para o cliente.")}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Reenviar Referência
                                                </Button>
                                            </div>
                                        )}

                                        <Button
                                            variant="secondary"
                                            className="w-full h-12"
                                            asChild
                                        >
                                            <Link to={`/apartment/${booking.apartment_id}`}>
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Ver Apartamento
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="space-y-6">
                                    <div className="bg-card border border-border rounded-sm p-6 shadow-sm h-full">
                                        <h4 className="font-display font-bold mb-4 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                            Resumo Financeiro
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Preço Total</span>
                                                <span className="font-medium">{formatCurrency(booking.total_estadia)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Sinal Pago (Deposit)</span>
                                                <span className="text-green-500 font-bold">
                                                    {statusConfig[booking.status as keyof typeof statusConfig]?.label === "Aguardando Pagamento"
                                                        ? formatCurrency(0)
                                                        : formatCurrency(booking.valor_sinal || 25000)}
                                                </span>
                                            </div>
                                            <div className="pt-4 border-t border-border">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Restante</span>
                                                    <span className={`text-lg font-bold ${booking.restante_pagar > 0 ? "text-destructive" : "text-green-500"}`}>
                                                        {formatCurrency(booking.restante_pagar)}
                                                    </span>
                                                </div>
                                            </div>

                                            {booking.restante_pagar > 0 && booking.status !== "PENDENTE_PAGAMENTO" && (
                                                <div className="bg-muted p-3 rounded-sm mt-4">
                                                    <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                                                        O saldo remanescente deverá ser liquidado no acto do check-in presencial no Roomview Boutique.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Receipt Modal (Shared Logic with Admin but for Guest) */}
            <AnimatePresence>
                {isViewingReceipt && booking && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white text-slate-900 p-8 rounded-sm w-full max-w-2xl shadow-2xl my-8 relative"
                        >
                            <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6 print:hidden">
                                <h3 className="font-display text-2xl font-bold">Comprovativo de Reserva</h3>
                                <div className="flex gap-2">
                                    <Button onClick={() => window.print()} variant="outline" className="border-slate-300 text-slate-700">Imprimir / PDF</Button>
                                    <Button onClick={() => setIsViewingReceipt(false)} variant="ghost" className="text-slate-500">Fechar</Button>
                                </div>
                            </div>

                            <div id="receipt-content" className="space-y-6 font-mono text-sm uppercase tracking-tight p-4 border border-slate-200">
                                <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
                                    <h2 className="text-xl font-bold text-slate-900">Roomview Boutique</h2>
                                    <p className="text-slate-500">Luanda, Patriota, Via Principal</p>
                                    <div className="mt-4 py-1 bg-slate-100 font-bold border-y border-slate-200">
                                        COMPROVATIVO: {booking.id}
                                    </div>
                                    <p className="mt-2 text-[10px]">EMITIDO EM: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-b border-dashed border-slate-300 pb-4">
                                    <span className="text-slate-500 font-bold">HÓSPEDE:</span>
                                    <span className="text-right">{booking.cliente_nome}</span>
                                    <span className="text-slate-500 font-bold">TIPO:</span>
                                    <span className="text-right">{apartment?.nome}</span>
                                    <span className="text-slate-500 font-bold">DATAS:</span>
                                    <span className="text-right font-bold">{format(parseISO(booking.checkin), "dd/MM/yyyy")} - {format(parseISO(booking.checkout), "dd/MM/yyyy")}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[12px]">
                                        <span>TOTAL DA ESTADIA</span>
                                        <span className="font-bold">{formatCurrency(booking.total_estadia)}</span>
                                    </div>
                                    <div className="flex justify-between text-[12px] text-green-600">
                                        <span>VALOR JÁ PAGO (SINAL)</span>
                                        <span className="font-bold">{formatCurrency(booking.valor_sinal || 25000)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-900">
                                        <span>SALDO A PAGAR NO LOCAL</span>
                                        <span className="text-destructive">{formatCurrency(booking.restante_pagar)}</span>
                                    </div>
                                </div>

                                <div className="text-center space-y-2 mt-8 border-t border-dashed border-slate-300 pt-6">
                                    <p className="text-[12px] font-bold">Roomview - Luxury & Prestige</p>
                                    <div className="flex flex-col items-center gap-2 my-4">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${booking.id}`}
                                            alt="QR Code Reserva"
                                            className="w-20 h-20 border border-slate-100 p-1"
                                        />
                                        <span className="text-[8px] text-slate-400 font-mono tracking-widest">{booking.id}</span>
                                    </div>
                                    <p className="text-[10px] italic">Apresente este QR Code no acto do check-in.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageBooking;
