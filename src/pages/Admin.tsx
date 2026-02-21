import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, Building2, BarChart3, LogIn, LogOut, ClipboardList, Check, X, RefreshCcw, Plus, Edit2, Trash2, Save, X as CloseX, CheckCircle, Shield, DollarSign, Users, Percent, FileText } from "lucide-react";
import { Apartment, BookingStatus, Booking, formatCurrency, RemainingPaymentMethod, EXTRA_GUEST_FEE, MAX_EXTRA_GUESTS } from "@/data/apartments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apartmentService } from "@/lib/apartmentService";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { bookingService } from "@/lib/bookingService";
import { authService, User, UserRole, Permission, ROLE_PERMISSIONS } from "@/lib/authService";
import { format, parseISO, isSameDay, endOfDay, isAfter } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import PermissionsHelp from "@/components/PermissionsHelp";
import ExtrasManager, { ExtraItem } from "@/components/ExtrasManager";
import ReportGenerator from "@/components/ReportGenerator";
import { 
  StatsCard, 
  RevenueChart, 
  BookingsChart, 
  StatusDistributionChart, 
  OccupancyRateChart, 
  TopApartmentsChart 
} from "@/components/StatisticsCharts";
import { 
  calculateDashboardStats, 
  getMonthlyRevenueData, 
  getStatusDistribution, 
  getOccupancyByApartment, 
  getTopApartments,
  StatisticsFilters 
} from "@/lib/statisticsService";
import { seedBookings, clearAllBookings } from "@/lib/seedData";

const logoSrc = `${import.meta.env.BASE_URL}tranferencia/Logo-page.png`;

const statusColors: Record<string, string> = {
  PENDENTE_PAGAMENTO: "bg-yellow-500/10 text-yellow-500",
  CONFIRMADA: "bg-green-500/10 text-green-500",
  CHECKIN_REALIZADO: "bg-blue-500/10 text-blue-500",
  FINALIZADA: "bg-primary/10 text-primary",
  CANCELADA: "bg-destructive/10 text-destructive",
  EXPIRADA: "bg-muted text-muted-foreground",
};

type Tab = "reservas" | "apartamentos" | "estatisticas" | "relatorios" | "usuarios" | "perfil";

const Admin = () => {
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("reservas");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(bookingService.getBookings());
  const [apartmentsList, setApartmentsList] = useState<Apartment[]>(apartmentService.getApartments());
  const [users, setUsers] = useState<User[]>(authService.getUsers());
  const [userForm, setUserForm] = useState({
    nome: "",
    email: "",
    role: "OPERADOR" as UserRole,
    customPermissions: [] as Permission[]
  });
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [showOnlyPendingCheckout, setShowOnlyPendingCheckout] = useState(false);

  // Statistics filters
  const [statsDateFrom, setStatsDateFrom] = useState<string>("");
  const [statsDateTo, setStatsDateTo] = useState<string>("");
  const [statsApartmentType, setStatsApartmentType] = useState<string>("");
  const [statsApartmentId, setStatsApartmentId] = useState<string>("");

  // Payment method modal
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<RemainingPaymentMethod>("DINHEIRO");

  // Booking detail panel
  const [showBookingDetailPanel, setShowBookingDetailPanel] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [isAddingExtraDetail, setIsAddingExtraDetail] = useState(false);
  const [extraDetailForm, setExtraDetailForm] = useState({
    item: "",
    quantidade: 1,
    preco_unitario: 0
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setUsers(authService.getUsers());
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const intervalId = setInterval(() => {
      setBookings(bookingService.getBookings());
      setApartmentsList(apartmentService.getApartments());
      setUsers(authService.getUsers());
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) return;
    const auto = searchParams.get("auto");
    if (import.meta.env.DEV && auto === "admin") {
      const user = authService.login("admin@roomview.com", "admin");
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      }
    }
  }, [isLoggedIn, searchParams]);

  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const apartments = apartmentService.getApartments();
  const allBookingsSorted = bookings
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const activeBookings = bookings
    .filter(b => !["FINALIZADA", "CANCELADA", "EXPIRADA"].includes(b.status))
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const bookingsToDisplay = showAllBookings ? allBookingsSorted : activeBookings;
  const normalizedSearch = bookingSearch.trim().toLowerCase();
  const filteredBookings = normalizedSearch.length > 0
    ? bookingsToDisplay.filter(b => {
      const id = b.id.toLowerCase();
      const nome = b.cliente_nome.toLowerCase();
      const email = b.email.toLowerCase();
      const telefone = b.telefone.toLowerCase();
      return id.includes(normalizedSearch)
        || nome.includes(normalizedSearch)
        || email.includes(normalizedSearch)
        || telefone.includes(normalizedSearch);
    })
    : bookingsToDisplay;
  
  // Filtrar apenas reservas sem checkout se o filtro estiver ativo
  const finalFilteredBookings = showOnlyPendingCheckout
    ? filteredBookings.filter(b => !b.checkout_real && (b.status === "CHECKIN_REALIZADO" || b.status === "CONFIRMADA"))
    : filteredBookings;

  // Apartment Form State
  const [isEditingApt, setIsEditingApt] = useState(false);
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [aptFormData, setAptFormData] = useState<Omit<Apartment, "id">>({
    nome: "",
    tipologia: "",
    descricao: "",
    preco_noite: 0,
    capacidade: 2,
    suites: 1,
    banheiros: 1,
    dimensao: "",
    localizacao: "Patriota, Luanda",
    fotos: [""],
    status: "ativo"
  });

  const stats = bookingService.getStats();

  // Operator Action Modals
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [selectedBookingForExtra, setSelectedBookingForExtra] = useState<string | null>(null);

  const [isCreatingManualBooking, setIsCreatingManualBooking] = useState(false);

  const [viewingReceipt, setViewingReceipt] = useState<Booking | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.login(email, password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      toast.success(`Bem-vindo, ${user.nome}`);
    } else {
      toast.error("E-mail ou password incorrectos");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!can("MANAGE_USERS")) return;

    const created = authService.addUser({
      nome: userForm.nome.trim(),
      email: userForm.email.trim(),
      role: userForm.role,
      customPermissions: userForm.customPermissions.length > 0 ? userForm.customPermissions : undefined
    });

    if (!created) {
      toast.error("Ja existe um utilizador com este e-mail");
      return;
    }

    setUsers(authService.getUsers());
    setUserForm({ nome: "", email: "", role: "OPERADOR", customPermissions: [] });
    toast.success("Utilizador criado. Password padrao: 123456");
  };

  const handleDeleteUser = (id: string) => {
    if (!can("MANAGE_USERS")) return;
    if (currentUser?.id === id) {
      toast.error("Nao e possivel eliminar o proprio perfil");
      return;
    }
    if (window.confirm("Tem a certeza que deseja eliminar este utilizador?")) {
      const success = authService.deleteUser(id);
      if (success) {
        setUsers(authService.getUsers());
        toast.success("Utilizador eliminado com sucesso");
      } else {
        toast.error("Nao foi possivel eliminar o utilizador");
      }
    }
  };

  const can = (permission: any) => currentUser ? authService.hasPermission(currentUser, permission) : false;

  // Build statistics filters object
  const getStatisticsFilters = (): StatisticsFilters => {
    const filters: StatisticsFilters = {};
    
    if (statsDateFrom) {
      filters.dateFrom = new Date(statsDateFrom);
    }
    if (statsDateTo) {
      filters.dateTo = new Date(statsDateTo);
    }
    if (statsApartmentType) {
      filters.apartmentType = statsApartmentType;
    }
    if (statsApartmentId) {
      filters.apartmentId = statsApartmentId;
    }
    
    return filters;
  };

  const handleClearFilters = () => {
    setStatsDateFrom("");
    setStatsDateTo("");
    setStatsApartmentType("");
    setStatsApartmentId("");
  };

  // Get unique apartment types
  const apartmentTypes = Array.from(new Set(apartmentsList.map(apt => apt.tipologia))).sort();

  const handleStatusUpdate = (id: string, status: BookingStatus) => {
    const success = bookingService.updateBookingStatus(id, status);
    if (success) {
      setBookings(bookingService.getBookings());
      toast.success(`Reserva ${id} actualizada para ${status}`);
    } else {
      toast.error("Erro ao actualizar reserva");
    }
  };

  const handleCheckin = (id: string) => {
    const booking = bookingService.getBookingById(id);
    if (!booking) {
      toast.error("Reserva não encontrada.");
      return;
    }

    const apartment = apartments.find((a) => a.id === booking.apartment_id);
    if (!apartment) {
      toast.error("Apartamento associado não encontrado.");
      return;
    }

    let extraGuests = 0;
    if (apartment.capacidade > 4) {
      const answer = window.prompt(
        `Adicionar hóspedes no check-in? (0 a ${MAX_EXTRA_GUESTS})\nCusto: ${formatCurrency(EXTRA_GUEST_FEE)} por pessoa.`,
        "0"
      );

      if (answer === null) {
        return;
      }

      const parsed = Number(answer);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_EXTRA_GUESTS) {
        toast.error(`Informe um número inteiro entre 0 e ${MAX_EXTRA_GUESTS}.`);
        return;
      }
      extraGuests = parsed;
    }

    const success = bookingService.registerCheckin(id, currentUser?.email, extraGuests);
    if (!success) {
      toast.error("Não foi possível registar check-in.");
      return;
    }

    setBookings(bookingService.getBookings());
    if (selectedBookingDetail?.id === id) {
      const updated = bookingService.getBookingById(id);
      if (updated) {
        setSelectedBookingDetail(updated);
      }
    }

    if (extraGuests > 0) {
      toast.success(`Check-in registado com ${extraGuests} hóspede(s) adicional(is).`);
      return;
    }

    toast.success("Check-in registado!");
  };

  const handleCheckout = (id: string) => {
    const bookings = bookingService.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    
    if (index !== -1) {
      const booking = bookings[index];
      
      // Calcular total de extras
      const extrasTotal = (booking.extras || []).reduce((sum, e) => 
        sum + (e.preco_unitario * e.quantidade), 0
      );
      
      // Calcular saldo final: (estadia + extras) - sinal já pago
      const totalFinal = booking.total_estadia + extrasTotal;
      const saldoFinal = totalFinal - booking.valor_sinal;
      
      // Registar checkout
      booking.checkout_real = new Date().toISOString();
      booking.operador_checkout = currentUser?.email;
      booking.status = "FINALIZADA";
      booking.restante_pagar = saldoFinal > 0 ? saldoFinal : 0; // Atualizar com saldo final
      
      bookingService.saveBookings(bookings);
      setBookings(bookingService.getBookings());
      // Atualizar painel se estiver aberto
      if (selectedBookingDetail?.id === id) {
        const updated = bookingService.getBookingById(id);
        if (updated) {
          setSelectedBookingDetail(updated);
        }
      }
      toast.success("Check-out registado! Conta finalizada.");
    }
  };

  const handleRegisterPayment = (booking: Booking) => {
    // Só permitir pagamento se a conta estiver aberta (durante estadia) ou no checkout
    // Atualmente impedimos pagamento durante CHECKIN_REALIZADO
    if (booking.status === "CHECKIN_REALIZADO") {
      toast.error("Conta aberta - Finalize no checkout para liquidar o saldo");
      return;
    }
    
    setSelectedBookingForPayment(booking);
    setSelectedPaymentMethod("DINHEIRO");
    setShowPaymentMethodDialog(true);
  };

  const openBookingDetailPanel = (booking: Booking) => {
    setSelectedBookingDetail(booking);
    setShowBookingDetailPanel(true);
  };

  const addExtraToBookingDetail = () => {
    if (selectedBookingDetail && extraDetailForm.item.trim()) {
      if (bookingService.addExtra(selectedBookingDetail.id, {
        item: extraDetailForm.item,
        quantidade: extraDetailForm.quantidade,
        preco_unitario: extraDetailForm.preco_unitario
      })) {
        const updated = bookingService.getBookingById(selectedBookingDetail.id);
        if (updated) {
          setSelectedBookingDetail(updated);
          setBookings(bookingService.getBookings());
          setExtraDetailForm({ item: "", quantidade: 1, preco_unitario: 0 });
          setIsAddingExtraDetail(false);
          toast.success("Serviço adicional adicionado!");
        }
      }
    }
  };

  const confirmPayment = () => {
    if (selectedBookingForPayment && bookingService.registerRemainingPayment(
      selectedBookingForPayment.id, 
      currentUser?.email,
      selectedPaymentMethod
    )) {
      setBookings(bookingService.getBookings());
      // Atualizar painel de detalhes se estiver aberto
      if (selectedBookingDetail?.id === selectedBookingForPayment.id) {
        const updated = bookingService.getBookingById(selectedBookingForPayment.id);
        if (updated) {
          setSelectedBookingDetail(updated);
        }
      }
      toast.success("Pagamento de saldo registado com sucesso!");
      setShowPaymentMethodDialog(false);
      setSelectedBookingForPayment(null);
    }
  };

  const handleAddExtra = (extra: ExtraItem) => {
    if (selectedBookingForExtra) {
      if (bookingService.addExtra(selectedBookingForExtra, extra)) {
        setBookings(bookingService.getBookings());
        toast.success("Extra adicionado com sucesso!");
      }
    }
  };

  const handleEditApt = (apt: Apartment) => {
    setEditingAptId(apt.id);
    setAptFormData({
      nome: apt.nome,
      tipologia: apt.tipologia,
      descricao: apt.descricao,
      preco_noite: apt.preco_noite,
      capacidade: apt.capacidade,
      suites: apt.suites,
      banheiros: apt.banheiros,
      dimensao: apt.dimensao,
      localizacao: apt.localizacao,
      fotos: apt.fotos,
      status: apt.status
    });
    setIsEditingApt(true);
  };

  const handleAddNewApt = () => {
    setEditingAptId(null);
    setAptFormData({
      nome: "",
      tipologia: "",
      descricao: "",
      preco_noite: 0,
      capacidade: 2,
      suites: 1,
      banheiros: 1,
      dimensao: "",
      localizacao: "Patriota, Luanda",
      fotos: [""],
      status: "ativo"
    });
    setIsEditingApt(true);
  };

  const handleDeleteApt = (id: string) => {
    if (window.confirm("Tem certeza que deseja eliminar este apartamento?")) {
      const success = apartmentService.deleteApartment(id);
      if (success) {
        setApartmentsList(apartmentService.getApartments());
        toast.success("Apartamento eliminado com sucesso");
      }
    }
  };

  const handleSaveApt = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAptId) {
      apartmentService.updateApartment(editingAptId, aptFormData);
      toast.success("Apartamento actualizado");
    } else {
      apartmentService.addApartment(aptFormData);
      toast.success("Apartamento adicionado");
    }
    setApartmentsList(apartmentService.getApartments());
    setIsEditingApt(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "GERENTE": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "OPERADOR": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CLIENTE": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN": return "Controlo total do sistema";
      case "GERENTE": return "Gestão e relatórios";
      case "OPERADOR": return "Operações do balcão";
      case "CLIENTE": return "Acesso limitado";
      default: return "";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logoSrc} alt="Roomview Boutique" className="h-[5.4rem] mx-auto mb-6 rotate-0 object-contain" />
            {/*<h1 className="font-display text-4xl font-bold tracking-tighter text-foreground mb-2">Roomview <span className="text-gradient-gold">Boutique</span></h1>*/}
            <p className="font-body text-muted-foreground italic">Painel Administrativo v2.0</p>
          </div>
          <div className="bg-card border border-border p-8 rounded-sm shadow-xl">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6 text-center italic underline underline-offset-8 decoration-primary/30">Autenticação</h2>
            
            {/* Seed Data Helper */}
            <div className="mb-6 p-4 bg-muted/50 border border-border rounded-sm">
              <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">📊 Dados de Demonstração</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const count = 50;
                    seedBookings(count);
                    setBookings(bookingService.getBookings());
                    toast.success(`${count} reservas de teste geradas com diferentes modalidades de pagamento!`);
                  }}
                  className="w-full text-xs px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition font-medium"
                >
                  🌱 Gerar 50 Reservas de Teste
                </button>
                <button
                  onClick={() => {
                    const count = 100;
                    seedBookings(count);
                    setBookings(bookingService.getBookings());
                    toast.success(`${count} reservas de teste geradas! Com modalidades: EXPRESS, REFERENCIA, TRANSFERENCIA, PRESENCIAL`);
                  }}
                  className="w-full text-xs px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition font-medium"
                >
                  💰 Gerar 100 Reservas com Pagamentos Variados
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Tem a certeza que deseja limpar TODAS as reservas?')) {
                      clearAllBookings();
                      setBookings([]);
                      toast.info('Todas as reservas foram removidas');
                    }
                  }}
                  className="w-full text-xs px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition font-medium"
                >
                  🗑️ Limpar Todas as Reservas
                </button>
              </div>
            </div>

            {/* DEV Mode Quick Login */}
            {import.meta.env.DEV && (
              <div className="mb-6 p-4 bg-muted/50 border border-border rounded-sm">
                <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">🔧 Modo Desenvolvimento</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-red-500/5 rounded border border-red-500/10">
                    <div>
                      <p className="font-bold text-red-400">ADMIN</p>
                      <p className="text-[10px] text-muted-foreground">admin@roomview.com / admin</p>
                    </div>
                    <button
                      onClick={() => { setEmail("admin@roomview.com"); setPassword("admin"); }}
                      className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
                    >
                      Preencher
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-500/5 rounded border border-blue-500/10">
                    <div>
                      <p className="font-bold text-blue-400">GERENTE</p>
                      <p className="text-[10px] text-muted-foreground">gerente@roomview.com / gerente</p>
                    </div>
                    <button
                      onClick={() => { setEmail("gerente@roomview.com"); setPassword("gerente"); }}
                      className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                    >
                      Preencher
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-500/5 rounded border border-green-500/10">
                    <div>
                      <p className="font-bold text-green-400">OPERADOR</p>
                      <p className="text-[10px] text-muted-foreground">caixa@roomview.com / caixa</p>
                    </div>
                    <button
                      onClick={() => { setEmail("caixa@roomview.com"); setPassword("caixa"); }}
                      className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition"
                    >
                      Preencher
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@roomview.com"
                  required
                  className="bg-muted border-border font-body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-muted border-border font-body"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold py-6 mt-4 hover:shadow-gold transition-all">
                <LogIn className="w-4 h-4 mr-2" /> Aceder ao Painel
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body">Roomview Prestige & Loyalty</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "reservas" as Tab, label: "Reservas", icon: CalendarDays },
    { id: "apartamentos" as Tab, label: "Apartamentos", icon: Building2 },
    { id: "estatisticas" as Tab, label: "Estatísticas", icon: BarChart3 },
    { id: "relatorios" as Tab, label: "Relatórios", icon: FileText },
    { id: "usuarios" as Tab, label: "Usuarios", icon: Users },
    { id: "perfil" as Tab, label: "Perfil", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 hidden lg:block">
        <div className="flex flex-col h-full">
          <div className="mb-10">
            <img src={logoSrc} alt="Roomview Boutique" className="h-[3.4rem] mb-6 rotate-0 object-contain" />
            <div className="mt-4 p-3 bg-muted rounded-sm border border-border/50">
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 px-2 py-1 rounded border inline-block ${getRoleBadgeColor(currentUser?.role || '')}`}>
                {currentUser?.role}
              </div>
              <p className="text-sm font-medium text-foreground truncate mt-2">{currentUser?.nome}</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">{getRoleDescription(currentUser?.role || '')}</p>
            </div>
          </div>

          <nav className="space-y-1 flex-grow">
            {tabs.filter(tab => {
              if (tab.id === "apartamentos") return can("MANAGE_APARTMENTS");
              if (tab.id === "estatisticas") return can("VIEW_FINANCIALS");
              if (tab.id === "relatorios") return can("VIEW_FINANCIALS");
              if (tab.id === "usuarios") return can("MANAGE_USERS");
              return true;
            }).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-body text-sm transition-all ${activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-body text-sm text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 flex items-center justify-between bg-card border border-border p-4 rounded-sm">
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border inline-block mb-2 ${getRoleBadgeColor(currentUser?.role || '')}`}>
              {currentUser?.role}
            </div>
            <p className="text-sm font-medium text-foreground">{currentUser?.nome}</p>
            <p className="text-[10px] text-muted-foreground italic">{getRoleDescription(currentUser?.role || '')}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Mobile tabs */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.filter(tab => {
            if (tab.id === "apartamentos") return can("MANAGE_APARTMENTS");
            if (tab.id === "estatisticas") return can("VIEW_FINANCIALS");
            if (tab.id === "relatorios") return can("VIEW_FINANCIALS");
            if (tab.id === "usuarios") return can("MANAGE_USERS");
            return true;
          }).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-body text-sm whitespace-nowrap ${activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          {activeTab === "reservas" && can("CREATE_BOOKINGS") && (
            <Button
              onClick={() => setIsCreatingManualBooking(true)}
              className="bg-primary text-primary-foreground font-body text-xs font-bold uppercase tracking-widest px-6"
            >
              <Plus className="w-4 h-4 mr-2" /> Criar Reserva
            </Button>
          )}
        </div>

        {activeTab === "reservas" && (
          <div className="space-y-4">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total.toString(), sub: "reservas" },
                { label: "Pendentes", value: stats.pendentes.toString(), sub: "aguardam pagamento" },
                { label: "Confirmadas", value: stats.confirmadas.toString(), sub: "garantidas" },
                { label: "Receita", value: formatCurrency(stats.receita), sub: "valor em caixa" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-sm p-4">
                  <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Reservations table */}
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Pesquisar reserva</Label>
                  <Input
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="ID, nome, e-mail ou telemovel"
                    className="mt-2 bg-muted border-border"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Resultados: <span className="text-foreground font-semibold">{finalFilteredBookings.length}</span>
                </div>
              </div>
              {(currentUser?.role === "GERENTE" || currentUser?.role === "ADMIN") && (
                <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    A visualizar: <span className="text-foreground font-semibold">{showAllBookings ? "Todas as reservas" : "Reservas activas"}</span>
                    {showOnlyPendingCheckout && <span className="text-amber-400 ml-2">🔔 Sem checkout</span>}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOnlyPendingCheckout((prev) => !prev)}
                      className={`text-xs ${showOnlyPendingCheckout ? "bg-amber-500/20 text-amber-500 border-amber-500" : ""}`}
                    >
                      {showOnlyPendingCheckout ? "Ver todas" : "Sem checkout"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllBookings((prev) => !prev)}
                      className="text-xs"
                    >
                      {showAllBookings ? "Ver apenas activas" : "Ver todas as reservas"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      {["ID", "Cliente", "Apartamento", "Check-in", "Horários", "Total", "Pago", "Restante", "Status"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {finalFilteredBookings.length > 0 ? finalFilteredBookings.map((r) => {
                      const apt = apartments.find(a => a.id === r.apartment_id);
                      const checkoutDate = parseISO(r.checkout);
                      const isCheckoutToday = isSameDay(checkoutDate, new Date());
                      const isCheckoutOverdue = isAfter(new Date(), endOfDay(checkoutDate));
                      const hasOutstandingBalance = (r.restante_pagar ?? 0) > 0;
                      return (
                        <tr 
                          key={r.id} 
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => openBookingDetailPanel(r)}
                        >
                          <td className="px-4 py-3 font-body text-sm text-primary font-medium">{r.id}</td>
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            <div className="flex flex-col">
                              <span>{r.cliente_nome}</span>
                              <span className="text-xs text-muted-foreground">{r.telefone}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-muted-foreground">{apt?.nome || r.apartment_id}</td>
                          <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                            {format(parseISO(r.checkin), "dd/MM/yyyy")}
                          </td>
                          <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                            <div className="flex flex-col gap-1">
                              {r.checkin_real ? (
                                <span className="text-blue-400">
                                  ✅ {format(parseISO(r.checkin_real), "HH:mm")}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">- Entrada</span>
                              )}
                              {r.checkout_real ? (
                                <span className="text-amber-400">
                                  ✅ {format(parseISO(r.checkout_real), "HH:mm")}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">- Saída</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            {formatCurrency(r.total_estadia)}
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-green-600 font-medium">
                            {formatCurrency(r.total_estadia - (r.restante_pagar ?? 0))}
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-destructive font-medium">
                            {formatCurrency(r.restante_pagar ?? 0)}
                            {r.metodo_pagamento_saldo && (
                              <span className="block text-[10px] text-muted-foreground mt-1">
                                {r.metodo_pagamento_saldo === "DINHEIRO" && "💵 Dinheiro"}
                                {r.metodo_pagamento_saldo === "TRANSFERENCIA" && "🏦 Transferência"}
                                {r.metodo_pagamento_saldo === "TPA" && "💳 TPA"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${statusColors[r.status]}`}>
                                {r.status}
                              </span>
                              {isCheckoutToday && (
                                <span className="font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-500">
                                  Checkout hoje
                                </span>
                              )}
                              {isCheckoutOverdue && hasOutstandingBalance && (
                                <span className="font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-red-500/10 text-red-500">
                                  Divida pendente
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center font-body text-sm text-muted-foreground italic">
                          {normalizedSearch
                            ? "Nenhuma reserva encontrada para esta pesquisa."
                            : showOnlyPendingCheckout
                            ? "Nenhuma reserva pendente de checkout encontrada."
                            : (showAllBookings ? "Nenhuma reserva encontrada." : "Nenhuma reserva activa encontrada.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "apartamentos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Gestão de Apartamentos</h2>
              {!isEditingApt && (
                <Button onClick={handleAddNewApt} className="bg-gradient-gold text-primary-foreground font-body text-sm">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Novo
                </Button>
              )}
            </div>

            {isEditingApt ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <form onSubmit={handleSaveApt} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nome do Apartamento</Label>
                      <Input
                        value={aptFormData.nome}
                        onChange={e => setAptFormData({ ...aptFormData, nome: e.target.value })}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipologia</Label>
                      <Input
                        value={aptFormData.tipologia}
                        onChange={e => setAptFormData({ ...aptFormData, tipologia: e.target.value })}
                        required
                        placeholder="Ex: T1, Estúdio, Box Executiva"
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço por Noite (AKZ)</Label>
                      <Input
                        type="number"
                        value={aptFormData.preco_noite}
                        onChange={e => setAptFormData({ ...aptFormData, preco_noite: Number(e.target.value) })}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dimensão (m²)</Label>
                      <Input
                        value={aptFormData.dimensao}
                        onChange={e => setAptFormData({ ...aptFormData, dimensao: e.target.value })}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacidade (Hóspedes)</Label>
                      <Input
                        type="number"
                        value={aptFormData.capacidade}
                        onChange={e => setAptFormData({ ...aptFormData, capacidade: Number(e.target.value) })}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Suites</Label>
                        <Input
                          type="number"
                          value={aptFormData.suites}
                          onChange={e => setAptFormData({ ...aptFormData, suites: Number(e.target.value) })}
                          required
                          className="bg-muted border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WC</Label>
                        <Input
                          type="number"
                          value={aptFormData.banheiros}
                          onChange={e => setAptFormData({ ...aptFormData, banheiros: Number(e.target.value) })}
                          required
                          className="bg-muted border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Localização</Label>
                      <Input
                        value={aptFormData.localizacao}
                        onChange={e => setAptFormData({ ...aptFormData, localizacao: e.target.value })}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={aptFormData.descricao}
                        onChange={e => setAptFormData({ ...aptFormData, descricao: e.target.value })}
                        required
                        className="bg-muted border-border min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>URL da Foto Principal</Label>
                      <Input
                        value={aptFormData.fotos[0]}
                        onChange={e => setAptFormData({ ...aptFormData, fotos: [e.target.value] })}
                        required
                        className="bg-muted border-border"
                      />
                      <p className="text-xs text-muted-foreground italic">Nota: Para simplificar, estamos a usar URLs diretas de imagens.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={aptFormData.status}
                        onValueChange={v => setAptFormData({ ...aptFormData, status: v as "ativo" | "inativo" })}
                      >
                        <SelectTrigger className="bg-muted border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingApt(false)}
                      className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-gold text-primary-foreground font-body">
                      <Save className="w-4 h-4 mr-2" /> {editingAptId ? "Guardar Alterações" : "Adicionar Apartamento"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apartmentsList.map((a) => (
                  <div key={a.id} className="bg-card border border-border rounded-sm overflow-hidden flex flex-col sm:flex-row group">
                    <div className="w-full sm:w-40 h-40 overflow-hidden">
                      <img src={a.fotos[0]} alt={a.nome} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-display text-base font-semibold text-foreground">{a.nome}</h3>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditApt(a)} className="p-1.5 hover:text-primary transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteApt(a.id)} className="p-1.5 hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mb-2">{a.tipologia} · {a.dimensao}</p>
                      <div className="mt-auto flex justify-between items-end">
                        <p className="font-display text-sm font-bold text-primary">{formatCurrency(a.preco_noite)}/noite</p>
                        <span className={`font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${a.status === "ativo" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                          }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "estatisticas" && (
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Filtros de Relatório</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Data Inicial</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={statsDateFrom}
                    onChange={(e) => setStatsDateFrom(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Data Final</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={statsDateTo}
                    onChange={(e) => setStatsDateTo(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartmentType">Tipologia</Label>
                  <Select
                    value={statsApartmentType || undefined}
                    onValueChange={(value) => setStatsApartmentType(value)}
                  >
                    <SelectTrigger id="apartmentType" className="bg-muted border-border">
                      <SelectValue placeholder="Todas as tipologias" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {apartmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartmentId">Quarto</Label>
                  <Select
                    value={statsApartmentId || undefined}
                    onValueChange={(value) => setStatsApartmentId(value)}
                  >
                    <SelectTrigger id="apartmentId" className="bg-muted border-border">
                      <SelectValue placeholder="Todos os quartos" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {apartmentsList
                        .filter(apt => !statsApartmentType || apt.tipologia === statsApartmentType)
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map((apt) => (
                          <SelectItem key={apt.id} value={apt.id.toString()}>
                            {apt.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(statsDateFrom || statsDateTo || statsApartmentType || statsApartmentId) && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Receita Total"
                value={formatCurrency((() => {
                  const filters = getStatisticsFilters();
                  const dashboardStats = calculateDashboardStats(bookings, apartmentsList, filters);
                  return dashboardStats.totalRevenue;
                })())}
                change={(() => {
                  const filters = getStatisticsFilters();
                  const dashboardStats = calculateDashboardStats(bookings, apartmentsList, filters);
                  return dashboardStats.revenueChange;
                })()}
                icon={DollarSign}
                color="green"
              />
              <StatsCard
                title="Reservas Totais"
                value={(() => {
                  const filters = getStatisticsFilters();
                  const dashboardStats = calculateDashboardStats(bookings, apartmentsList, filters);
                  return dashboardStats.totalBookings;
                })()}
                change={(() => {
                  const filters = getStatisticsFilters();
                  const dashboardStats = calculateDashboardStats(bookings, apartmentsList, filters);
                  return dashboardStats.bookingsChange;
                })()}
                icon={CalendarDays}
                color="blue"
              />
              <StatsCard
                title="Taxa de Ocupação"
                value={`${(() => {
                  const filters = getStatisticsFilters();
                  const dashboardStats = calculateDashboardStats(bookings, apartmentsList, filters);
                  return dashboardStats.occupancyRate.toFixed(0);
                })()}%`}
                icon={Percent}
                color="yellow"
              />
              <StatsCard
                title="Valor Médio"
                value={formatCurrency((() => {
                  const filters = getStatisticsFilters();
                  const dashboardStats = calculateDashboardStats(bookings, apartmentsList, filters);
                  return dashboardStats.avgBookingValue;
                })())}
                icon={Users}
                color="primary"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={getMonthlyRevenueData(bookings, apartmentsList, getStatisticsFilters())} />
              <BookingsChart data={getMonthlyRevenueData(bookings, apartmentsList, getStatisticsFilters())} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusDistributionChart data={getStatusDistribution(bookings, apartmentsList, getStatisticsFilters())} />
              <OccupancyRateChart apartments={getOccupancyByApartment(bookings, apartmentsList, getStatisticsFilters())} />
            </div>

            {/* Top Apartments */}
            <TopApartmentsChart apartments={getTopApartments(bookings, apartmentsList, getStatisticsFilters())} />
          </div>
        )}

        {activeTab === "relatorios" && can("VIEW_FINANCIALS") && (
          <ReportGenerator bookings={bookings} apartments={apartmentsList} />
        )}

        {activeTab === "usuarios" && can("MANAGE_USERS") && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Novo Utilizador</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={userForm.nome}
                      onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                      placeholder="Ex: Ana Costa"
                      required
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="ana@roomview.com"
                      required
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value) => setUserForm({ ...userForm, role: value as UserRole })}
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="GERENTE">GERENTE</SelectItem>
                        <SelectItem value="OPERADOR">OPERADOR</SelectItem>
                        <SelectItem value="CLIENTE">CLIENTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Permissões Personalizadas</Label>
                      <span className="text-xs text-muted-foreground">(Opcional)</span>
                    </div>
                    <div className="bg-muted/30 border border-border rounded p-3 space-y-2 max-h-48 overflow-y-auto">
                      {Object.entries(ROLE_PERMISSIONS).flatMap(([_, perms]) => [...new Set(perms)]).map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`perm-${permission}`}
                            checked={userForm.customPermissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserForm({
                                  ...userForm,
                                  customPermissions: [...userForm.customPermissions, permission]
                                });
                              } else {
                                setUserForm({
                                  ...userForm,
                                  customPermissions: userForm.customPermissions.filter(p => p !== permission)
                                });
                              }
                            }}
                            className="rounded cursor-pointer"
                          />
                          <label htmlFor={`perm-${permission}`} className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                            {permission.replace(/_/g, ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Se deixar em branco, as permissões do perfil serão usadas
                    </p>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-body">
                    <Plus className="w-4 h-4 mr-2" /> Criar Utilizador
                  </Button>
                  <p className="text-[10px] text-muted-foreground italic">
                    Password padrao: 123456
                  </p>
                </form>
              </div>

              <div className="lg:col-span-2 bg-card border border-border rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">Utilizadores</h2>
                    <p className="text-xs text-muted-foreground">Gestao de perfis com permissao de acesso</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total: <span className="text-foreground font-semibold">{users.length}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        {['Nome', 'E-mail', 'Perfil', 'Permissões', 'Acoes'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            <div className="flex flex-col">
                              <span className="font-medium">{u.nome}</span>
                              {currentUser?.id === u.id && (
                                <span className="text-[10px] text-muted-foreground">Este e voce</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-muted-foreground">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm border ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {u.customPermissions && u.customPermissions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                  Customizadas
                                </span>
                                <span className="text-[10px] text-muted-foreground">({u.customPermissions.length})</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Padrão do perfil</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 hover:text-destructive transition-colors disabled:opacity-40"
                                title="Eliminar"
                                disabled={currentUser?.id === u.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "perfil" && currentUser && (
          <PermissionsHelp 
            userRole={currentUser.role} 
            permissions={ROLE_PERMISSIONS[currentUser.role]} 
          />
        )}
      </main>

      {/* Extras Modal */}
      {isAddingExtra && (
        <ExtrasManager
          onAddExtra={handleAddExtra}
          onClose={() => setIsAddingExtra(false)}
        />
      )}

      {/* Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white text-slate-900 p-8 rounded-sm w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6 print:hidden">
              <h3 className="font-display text-2xl font-bold">Recibo de Estadia</h3>
              <div className="flex gap-2">
                <Button onClick={() => window.print()} variant="outline" className="border-slate-300 text-slate-700">Imprimir</Button>
                <Button onClick={() => setViewingReceipt(null)} variant="ghost" className="text-slate-500">Fechar</Button>
              </div>
            </div>

            <div id="receipt-content" className="space-y-6 font-mono text-sm uppercase tracking-tight p-4 border border-slate-200">
              <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
                <div className="flex justify-center mb-4">
                  <img src={logoSrc} alt="Roomview" className="h-[4rem] w-auto rotate-0 object-contain" />
                </div>
                <h2 className="text-xl font-bold">Roomview Boutique</h2>
                <p>Luanda, Patriota, Via Principal</p>
                <p>NIF: 5000123456 | Tel: +244 923 000 000</p>
                <div className="mt-4 py-1 bg-slate-100 font-bold border-y border-slate-200">
                  RECIBO DE QUITAÇÃO: {viewingReceipt.id}
                </div>
                <p className="mt-2 text-[10px]">DATA DE EMISSÃO: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-b border-dashed border-slate-300 pb-4">
                <span className="text-slate-500 font-bold">CLIENTE:</span>
                <span className="text-right">{viewingReceipt.cliente_nome}</span>
                <span className="text-slate-500 font-bold">TIPO:</span>
                <span className="text-right">{apartments.find(a => a.id === viewingReceipt.apartment_id)?.nome}</span>
                <span className="text-slate-500 font-bold">ESTADIA:</span>
                <span className="text-right">{format(parseISO(viewingReceipt.checkin), "dd/MM/yyyy")} - {format(parseISO(viewingReceipt.checkout), "dd/MM/yyyy")}</span>
                <span className="text-slate-500 font-bold">DURAÇÃO:</span>
                <span className="text-right">{viewingReceipt.noites} NOITES</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between font-bold border-b border-slate-100 pb-1">
                  <span>DESCRIÇÃO</span>
                  <span>TOTAL</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span>ESTADIA BASE</span>
                  <span>{formatCurrency(viewingReceipt.total_estadia)}</span>
                </div>

                {viewingReceipt.extras && viewingReceipt.extras.length > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between font-bold text-[10px] mb-1 border-b border-slate-50">
                      <span>SERVIÇOS EXTRAS</span>
                    </div>
                    {viewingReceipt.extras.map(e => (
                      <div key={e.id} className="flex justify-between text-[11px] py-0.5">
                        <span>{e.quantidade}X {e.item}</span>
                        <span>{formatCurrency(e.preco_unitario * e.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t-2 border-slate-900">
                <div className="flex justify-between text-base font-bold">
                  <span>VALOR TOTAL PAGO</span>
                  <span>{formatCurrency(
                    viewingReceipt.total_estadia +
                    (viewingReceipt.extras?.reduce((acc, e) => acc + (e.preco_unitario * e.quantidade), 0) || 0)
                  )}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>SINAL (PAGO ONLINE):</span>
                  <span className="font-bold">{formatCurrency(viewingReceipt.valor_sinal || 25000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SALDO (PAGO PRESENCIAL):</span>
                  <span className="font-bold">{formatCurrency(viewingReceipt.total_estadia - (viewingReceipt.valor_sinal || 25000))}</span>
                </div>
                {viewingReceipt.extras && (
                  <div className="flex justify-between">
                    <span>EXTRAS CONSUMIDOS:</span>
                    <span className="font-bold">{formatCurrency(viewingReceipt.extras.reduce((acc, e) => acc + (e.preco_unitario * e.quantidade), 0))}</span>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2 mt-8 border-t border-dashed border-slate-300 pt-6">
                <p className="text-[12px] font-bold">Roomview - Luxury & Prestige</p>
                <div className="flex flex-col items-center gap-2 my-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${viewingReceipt.id}`}
                    alt="QR Code Reserva"
                    className="w-20 h-20 border border-slate-100 p-1"
                  />
                  <span className="text-[8px] text-slate-400 font-mono">{viewingReceipt.id}</span>
                </div>
                <p className="text-[10px] italic">Documento processado por computador.</p>
                <p className="text-[10px]">Obrigado pela sua visita à nossa Boutique.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manual Booking Modal */}
      {isCreatingManualBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border p-8 rounded-sm w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-2xl font-bold text-foreground">Nova Reserva Manual</h3>
              <button onClick={() => setIsCreatingManualBooking(false)} className="text-muted-foreground hover:text-foreground"><CloseX className="w-6 h-6" /></button>
            </div>

            <p className="font-body text-sm text-muted-foreground mb-6">Utilize esta ferramenta para criar reservas diretamente no balcão.</p>

            {/* Aqui poderíamos embutir o BookingForm alterado, mas por agora vamos simplificar ou instruir o user */}
            <div className="bg-muted/50 p-6 rounded-sm border border-border text-center">
              <p className="font-body text-foreground">Funcionalidade de Reserva Manual em integração...</p>
              <p className="text-xs text-muted-foreground mt-2 italic">Dica: O Operador pode usar o formulário público em modo "Balcão" ou podemos replicar os campos aqui.</p>
              <Button
                onClick={() => {
                  window.open('/reservar', '_blank');
                  setIsCreatingManualBooking(false);
                }}
                className="mt-6 bg-primary"
              >
                Abrir Portal de Reservas
              </Button>
            </div>
          </motion.div>
        </div>
      )}


      {/* Payment Method Dialog */}
      <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Confirmar Pagamento do Saldo</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedBookingForPayment && (
                <>
                  <p className="mb-2">
                    Reserva: <strong>{selectedBookingForPayment.id}</strong>
                  </p>
                  <p className="mb-4">
                    Valor a receber: <strong className="text-primary">{formatCurrency(selectedBookingForPayment.restante_pagar)}</strong>
                  </p>
                </>
              )}
              Selecione a forma de pagamento utilizada pelo cliente:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={(value) => setSelectedPaymentMethod(value as RemainingPaymentMethod)}
              >
                <SelectTrigger id="paymentMethod" className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="DINHEIRO">💵 Dinheiro (Cash)</SelectItem>
                  <SelectItem value="TRANSFERENCIA">🏦 Transferência Bancária</SelectItem>
                  <SelectItem value="TPA">💳 TPA (Máquina de Cartão)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentMethodDialog(false)}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Panel */}
      <Drawer open={showBookingDetailPanel} onOpenChange={setShowBookingDetailPanel}>
        <DrawerContent className="bg-card border-border">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="font-display text-2xl text-foreground">
                  {selectedBookingDetail?.cliente_nome}
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground mt-2">
                  Reserva: <strong className="text-primary">{selectedBookingDetail?.id}</strong>
                </DrawerDescription>
              </div>
              <DrawerClose />
            </div>
          </DrawerHeader>

          {selectedBookingDetail && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
              {/* Detalhes Principais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded p-3 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Apartamento</p>
                  <p className="text-sm text-foreground font-medium">
                    {apartmentsList.find(a => a.id === selectedBookingDetail.apartment_id)?.nome}
                  </p>
                </div>
                <div className="bg-muted/30 rounded p-3 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[selectedBookingDetail.status]}`}>
                    {selectedBookingDetail.status}
                  </span>
                </div>
                <div className="bg-muted/30 rounded p-3 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Check-in</p>
                  <p className="text-sm text-foreground">{format(parseISO(selectedBookingDetail.checkin), "dd/MM/yyyy")}</p>
                  {selectedBookingDetail.checkin_real && (
                    <p className="text-xs text-blue-400 mt-1">✅ {format(parseISO(selectedBookingDetail.checkin_real), "HH:mm")}</p>
                  )}
                </div>
                <div className="bg-muted/30 rounded p-3 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Check-out</p>
                  <p className="text-sm text-foreground">{format(parseISO(selectedBookingDetail.checkout), "dd/MM/yyyy")}</p>
                  {selectedBookingDetail.checkout_real && (
                    <p className="text-xs text-amber-400 mt-1">✅ {format(parseISO(selectedBookingDetail.checkout_real), "HH:mm")}</p>
                  )}
                </div>
              </div>

              {/* Contacto */}
              <div className="bg-muted/30 rounded p-4 border border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Contacto</p>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Email:</span> {selectedBookingDetail.email}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {selectedBookingDetail.telefone}</p>
                  <p><span className="text-muted-foreground">Pessoas:</span> {selectedBookingDetail.pessoas}</p>
                </div>
              </div>

              {/* Financeiro */}
              <div className="bg-muted/30 rounded p-4 border border-border space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Detalhes Financeiros</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total da Estadia:</span>
                    <span className="text-foreground font-medium">{formatCurrency(selectedBookingDetail.total_estadia)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sinal Pago:</span>
                    <span className="text-green-500 font-medium">{formatCurrency(selectedBookingDetail.valor_sinal)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Restante:</span>
                    <span className={`font-medium ${selectedBookingDetail.restante_pagar > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatCurrency(selectedBookingDetail.restante_pagar)}
                    </span>
                  </div>
                  {selectedBookingDetail.metodo_pagamento && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Forma de Pagamento:</p>
                      <p className="text-sm text-foreground">{selectedBookingDetail.metodo_pagamento}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Extras */}
              <div className="bg-muted/30 rounded p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Serviços Adicionais</p>
                  {(selectedBookingDetail.status === "CONFIRMADA" || selectedBookingDetail.status === "CHECKIN_REALIZADO") && can("MANAGE_EXTRAS") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingExtraDetail(!isAddingExtraDetail)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Adicionar
                    </Button>
                  )}
                </div>

                {isAddingExtraDetail && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded border border-border">
                    <div>
                      <Label htmlFor="extraItem" className="text-xs">Serviço</Label>
                      <Input
                        id="extraItem"
                        value={extraDetailForm.item}
                        onChange={(e) => setExtraDetailForm({ ...extraDetailForm, item: e.target.value })}
                        placeholder="Ex: Pequeno Almoço"
                        className="bg-muted border-border mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="extraQty" className="text-xs">Quantidade</Label>
                        <Input
                          id="extraQty"
                          type="number"
                          min="1"
                          value={extraDetailForm.quantidade}
                          onChange={(e) => setExtraDetailForm({ ...extraDetailForm, quantidade: parseInt(e.target.value) || 1 })}
                          className="bg-muted border-border mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="extraPrice" className="text-xs">Preço</Label>
                        <Input
                          id="extraPrice"
                          type="number"
                          min="0"
                          value={extraDetailForm.preco_unitario}
                          onChange={(e) => setExtraDetailForm({ ...extraDetailForm, preco_unitario: parseFloat(e.target.value) || 0 })}
                          className="bg-muted border-border mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={addExtraToBookingDetail}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingExtraDetail(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {selectedBookingDetail.extras && selectedBookingDetail.extras.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBookingDetail.extras.map((extra) => (
                      <div key={extra.id} className="flex justify-between text-sm p-2 bg-muted/50 rounded border border-border">
                        <div>
                          <p className="text-foreground font-medium">{extra.item}</p>
                          <p className="text-xs text-muted-foreground">{extra.quantidade}x {formatCurrency(extra.preco_unitario)}</p>
                        </div>
                        <p className="text-foreground font-medium">{formatCurrency(extra.preco_unitario * extra.quantidade)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Nenhum serviço adicional</p>
                )}
              </div>

              {/* Ações */}
              <div className="space-y-2 pt-4 border-t border-border">
                {selectedBookingDetail.status === "CONFIRMADA" && can("MANAGE_GUEST_ARRIVAL") && !selectedBookingDetail.checkin_real && (
                  <Button
                    onClick={() => {
                      setShowBookingDetailPanel(false);
                      openBookingDetailPanel(selectedBookingDetail);
                      handleCheckin(selectedBookingDetail.id);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Registar Check-in
                  </Button>
                )}

                {selectedBookingDetail.restante_pagar > 0 && selectedBookingDetail.status === "CONFIRMADA" && can("MANAGE_BOOKINGS") && (
                  <Button
                    onClick={() => {
                      setShowBookingDetailPanel(false);
                      handleRegisterPayment(selectedBookingDetail);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Liquidar Saldo: {formatCurrency(selectedBookingDetail.restante_pagar)}
                  </Button>
                )}

                {selectedBookingDetail.status === "CHECKIN_REALIZADO" && can("MANAGE_BOOKINGS") && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      💡 Conta aberta durante a estadia. Finalize no checkout para liquidar.
                    </p>
                  </div>
                )}

                {selectedBookingDetail.restante_pagar > 0 && selectedBookingDetail.status === "FINALIZADA" && can("MANAGE_BOOKINGS") && (
                  <Button
                    onClick={() => {
                      setShowBookingDetailPanel(false);
                      handleRegisterPayment(selectedBookingDetail);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Liquidar Saldo Final: {formatCurrency(selectedBookingDetail.restante_pagar)}
                  </Button>
                )}

                {(selectedBookingDetail.status === "CHECKIN_REALIZADO" || selectedBookingDetail.status === "FINALIZADA") && can("MANAGE_GUEST_ARRIVAL") && selectedBookingDetail.checkin_real && !selectedBookingDetail.checkout_real && (
                  <Button
                    onClick={() => {
                      setShowBookingDetailPanel(false);
                      handleCheckout(selectedBookingDetail.id);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <LogIn className="w-4 h-4 mr-2 rotate-180" /> Registar Check-out
                  </Button>
                )}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>    </div>
  );
};

export default Admin;