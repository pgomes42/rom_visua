import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarIcon, Users, Phone, Mail, User, CheckCircle } from "lucide-react";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, BOOKING_DEPOSIT, Booking } from "@/data/apartments";
import { apartmentService } from "@/lib/apartmentService";
import { toast } from "sonner";
import { bookingService } from "@/lib/bookingService";


const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("apartment") || "";
  const navigate = useNavigate();

  const [selectedApartment, setSelectedApartment] = useState(preselectedId);
  const [checkin, setCheckin] = useState<Date>();
  const [checkout, setCheckout] = useState<Date>();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [pessoas, setPessoas] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  // Wait, I see lastBooking is a state. Let's keep it.

  const apartments = apartmentService.getApartments();
  const apartment = apartments.find((a) => a.id === selectedApartment);

  const nights = useMemo(() => {
    if (checkin && checkout) {
      const diff = differenceInDays(checkout, checkin);
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [checkin, checkout]);

  const selectedGuests = Number(pessoas);
  const totalPrice = apartment ? nights * apartment.preco_noite : 0;

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
  };

  const phoneDigitsCount = telefone.replace(/\D/g, "").length;
  const showPhoneError = telefone.trim().length > 0 && !isValidPhone(telefone);
  const showEmailError = email.trim().length > 0 && !isValidEmail(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apartment || !checkin || !checkout || nights < 1) {
      toast.error("Por favor preencha todos os campos obrigatórios.");
      return;
    }

    if (selectedGuests > apartment.capacidade) {
      toast.error(`Este apartamento suporta no máximo ${apartment.capacidade} hóspedes.`);
      return;
    }

    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      toast.error("Por favor preencha seus dados pessoais.");
      return;
    }

    if (!isValidPhone(telefone)) {
      toast.error("Número de telefone inválido. Informe pelo menos 9 dígitos.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("E-mail inválido. Verifique o formato informado.");
      return;
    }

    // Create booking using service
    const result = bookingService.createBooking({
      cliente_nome: nome,
      telefone,
      email,
      apartment_id: selectedApartment,
      checkin: checkin.toISOString(),
      checkout: checkout.toISOString(),
      noites: nights,
      total_estadia: totalPrice,
      pessoas: selectedGuests,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Reserva criada com sucesso!");
    navigate(`/checkout/${result.booking!.id}`);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-4">
          Reserva Confirmada!
        </h2>
        <p className="font-body text-muted-foreground mb-8">
          A sua reserva foi criada com sucesso. Para confirmar, efectue o pagamento do sinal de <strong className="text-primary">{formatCurrency(BOOKING_DEPOSIT)}</strong>.
        </p>
        <div className="bg-card border border-border rounded-sm p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Apartamento</span>
            <span className="text-foreground font-medium">{apartment?.nome}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Check-in</span>
            <span className="text-foreground">{checkin && format(checkin, "dd MMM yyyy", { locale: pt })}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Check-out</span>
            <span className="text-foreground">{checkout && format(checkout, "dd MMM yyyy", { locale: pt })}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Noites</span>
            <span className="text-foreground">{nights}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Total da estadia</span>
            <span className="text-primary font-bold">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Sinal obrigatório</span>
            <span className="text-primary font-bold">{formatCurrency(BOOKING_DEPOSIT)}</span>
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">ID da Reserva</span>
              <span className="text-foreground font-mono">{lastBooking?.id}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Referência para Pagamento</span>
              <span className="text-primary font-mono font-bold">{lastBooking?.referencia_pagamento}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Prazo Limite</span>
              <span className="text-destructive font-medium">
                {lastBooking && format(parseISO(lastBooking.expires_at), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <a
            href={`https://wa.me/244945176834?text=${encodeURIComponent(`Olá! Fiz uma reserva para ${apartment?.nome}, check-in ${checkin && format(checkin, "dd/MM/yyyy")}, check-out ${checkout && format(checkout, "dd/MM/yyyy")}. Total: ${formatCurrency(totalPrice)}. Sinal: ${formatCurrency(BOOKING_DEPOSIT)}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-gold text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase px-6 py-3 rounded-sm hover:shadow-gold transition-all duration-300"
          >
            Enviar por WhatsApp
          </a>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="font-body text-sm tracking-wider uppercase border-primary/30 text-primary hover:bg-primary/10"
          >
            Voltar ao Início
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* Apartment selector */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-medium text-foreground">Apartamento</Label>
        <Select value={selectedApartment} onValueChange={setSelectedApartment}>
          <SelectTrigger className="bg-muted border-border text-foreground font-body">
            <SelectValue placeholder="Selecione um apartamento" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {apartments.filter(a => a.status === "ativo").map((a) => (
              <SelectItem key={a.id} value={a.id} className="font-body">
                {a.nome} — {formatCurrency(a.preco_noite)}/noite
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-body text-sm font-medium text-foreground">Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-body bg-muted border-border",
                  !checkin && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkin ? format(checkin, "dd MMM yyyy", { locale: pt }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                mode="single"
                selected={checkin}
                onSelect={setCheckin}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="font-body text-sm font-medium text-foreground">Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-body bg-muted border-border",
                  !checkout && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkout ? format(checkout, "dd MMM yyyy", { locale: pt }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                mode="single"
                selected={checkout}
                onSelect={setCheckout}
                disabled={(date) => date < (checkin || new Date())}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Guest info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-body text-sm font-medium text-foreground">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do hóspede"
              className="pl-10 bg-muted border-border font-body"
              maxLength={100}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body text-sm font-medium text-foreground">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="+244 9XX XXX XXX"
                className="pl-10 bg-muted border-border font-body"
                maxLength={20}
              />
            </div>
            {showPhoneError && (
              <p className="text-destructive text-xs font-body">
                Telefone inválido: mínimo 9 dígitos (atual: {phoneDigitsCount}).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm font-medium text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="pl-10 bg-muted border-border font-body"
                maxLength={255}
              />
            </div>
            {showEmailError && (
              <p className="text-destructive text-xs font-body">
                E-mail inválido. Exemplo: nome@dominio.com
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-body text-sm font-medium text-foreground">Número de pessoas</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Select value={pessoas} onValueChange={setPessoas}>
              <SelectTrigger className="pl-10 bg-muted border-border font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Array.from({ length: Math.max(1, apartment?.capacidade ?? 1) }, (_, idx) => idx + 1).map((n) => (
                  <SelectItem key={n} value={String(n)} className="font-body">
                    {n} {n === 1 ? "pessoa" : "pessoas"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {apartment && selectedGuests > apartment.capacidade && (
            <p className="text-destructive text-xs font-body">
              Capacidade máxima: {apartment.capacidade} hóspedes
            </p>
          )}
        </div>
      </div>

      {/* Price summary */}
      {apartment && nights > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted border border-border rounded-sm p-6 space-y-3"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Resumo da Reserva</h3>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">{apartment.nome}</span>
            <span className="text-foreground">{formatCurrency(apartment.preco_noite)} × {nights} noites</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-body">
            <span className="text-foreground font-medium">Total</span>
            <span className="text-primary text-lg font-bold">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Sinal obrigatório</span>
            <span className="text-primary font-semibold">{formatCurrency(BOOKING_DEPOSIT)}</span>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-2">
            * Pequeno-almoço não incluído. Não há reembolso após confirmação.
          </p>
        </motion.div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-gold text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase py-6 rounded-sm hover:shadow-gold-lg transition-all duration-300"
        disabled={!apartment || nights < 1}
      >
        Confirmar Reserva
      </Button>
    </form>
  );
};

export default BookingForm;
