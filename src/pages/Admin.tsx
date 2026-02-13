import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, CalendarDays, Building2, BarChart3, LogIn, LogOut, ClipboardList, Check, X, RefreshCcw, Plus, Edit2, Trash2, Save, X as CloseX, CheckCircle } from "lucide-react";
import { Apartment, BookingStatus, Booking, formatCurrency } from "@/data/apartments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apartmentService } from "@/lib/apartmentService";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingService } from "@/lib/bookingService";
import { authService, User } from "@/lib/authService";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";
import { useSearchParams } from "react-router-dom";

const statusColors: Record<string, string> = {
  PENDENTE_PAGAMENTO: "bg-yellow-500/10 text-yellow-500",
  CONFIRMADA: "bg-green-500/10 text-green-500",
  CHECKIN_REALIZADO: "bg-blue-500/10 text-blue-500",
  FINALIZADA: "bg-primary/10 text-primary",
  CANCELADA: "bg-destructive/10 text-destructive",
  EXPIRADA: "bg-muted text-muted-foreground",
};

type Tab = "reservas" | "apartamentos" | "estatisticas";

const Admin = () => {
  const [searchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("reservas");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(bookingService.getBookings());
  const [apartmentsList, setApartmentsList] = useState<Apartment[]>(apartmentService.getApartments());

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);

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
  const [extraItem, setExtraItem] = useState("");
  const [extraQty, setExtraQty] = useState(1);
  const [extraPrice, setExtraPrice] = useState(0);

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

  const can = (permission: any) => currentUser ? authService.hasPermission(currentUser, permission) : false;

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
    if (bookingService.registerCheckin(id)) {
      setBookings(bookingService.getBookings());
      toast.success("Check-in registado com sucesso!");
    }
  };

  const handleRegisterPayment = (id: string) => {
    if (bookingService.registerRemainingPayment(id)) {
      setBookings(bookingService.getBookings());
      toast.success("Pagamento de saldo registado com sucesso!");
    }
  };

  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingForExtra && extraItem && extraQty > 0) {
      if (bookingService.addExtra(selectedBookingForExtra, {
        item: extraItem,
        quantidade: extraQty,
        preco_unitario: extraPrice
      })) {
        setBookings(bookingService.getBookings());
        setIsAddingExtra(false);
        setExtraItem("");
        setExtraQty(1);
        setExtraPrice(0);
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="Roomview Boutique" className="h-16 mx-auto mb-6" />
            {/*<h1 className="font-display text-4xl font-bold tracking-tighter text-foreground mb-2">Roomview <span className="text-gradient-gold">Boutique</span></h1>*/}
            <p className="font-body text-muted-foreground italic">Painel Administrativo v2.0</p>
          </div>
          <div className="bg-card border border-border p-8 rounded-sm shadow-xl">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6 text-center italic underline underline-offset-8 decoration-primary/30">Autenticação</h2>
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
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 hidden lg:block">
        <div className="flex flex-col h-full">
          <div className="mb-10">
            <img src={logo} alt="Roomview Boutique" className="h-10 mb-6" />
            <div className="mt-4 p-3 bg-muted rounded-sm border border-border/50">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">{currentUser?.role}</p>
              <p className="text-sm font-medium text-foreground truncate">{currentUser?.nome}</p>
            </div>
          </div>

          <nav className="space-y-1 flex-grow">
            {tabs.filter(tab => {
              if (tab.id === "apartamentos") return can("MANAGE_APARTMENTS");
              if (tab.id === "estatisticas") return can("VIEW_FINANCIALS");
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
        {/* Mobile tabs */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.filter(tab => {
            if (tab.id === "apartamentos") return can("MANAGE_APARTMENTS");
            if (tab.id === "estatisticas") return can("VIEW_FINANCIALS");
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      {["ID", "Cliente", "Apartamento", "Check-in", "Total", "Pago", "Restante", "Status", "Acções"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.length > 0 ? bookings.map((r) => {
                      const apt = apartments.find(a => a.id === r.apartment_id);
                      return (
                        <tr key={r.id} className="hover:bg-muted/50 transition-colors">
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
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            {formatCurrency(r.total_estadia)}
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-green-600 font-medium">
                            {formatCurrency(r.total_estadia - (r.restante_pagar ?? 0))}
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-destructive font-medium">
                            {formatCurrency(r.restante_pagar ?? 0)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-body text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${statusColors[r.status]}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {r.status === "CONFIRMADA" && can("MANAGE_GUEST_ARRIVAL") && !r.checkin_real && (
                                <button
                                  onClick={() => handleCheckin(r.id)}
                                  className="p-1 hover:text-primary transition-colors"
                                  title="Registar Check-in"
                                >
                                  <LogIn className="w-4 h-4" />
                                </button>
                              )}
                              {r.restante_pagar > 0 && (r.status === "CONFIRMADA" || r.status === "CHECKIN_REALIZADO") && can("MANAGE_BOOKINGS") && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Confirmar recebimento de ${formatCurrency(r.restante_pagar)}?`)) {
                                      handleRegisterPayment(r.id);
                                    }
                                  }}
                                  className="p-1 hover:text-green-500 transition-colors"
                                  title="Liquidar Saldo"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {(r.status === "CONFIRMADA" || r.status === "CHECKIN_REALIZADO" || r.status === "FINALIZADA") && can("MANAGE_EXTRAS") && (
                                <button
                                  onClick={() => {
                                    setSelectedBookingForExtra(r.id);
                                    setIsAddingExtra(true);
                                  }}
                                  className="p-1 hover:text-primary transition-colors"
                                  title="Adicionar Extra"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                              {(r.status === "CONFIRMADA" || r.status === "CHECKIN_REALIZADO" || r.status === "FINALIZADA") && can("PRINT_RECEIPTS") && (
                                <button
                                  onClick={() => setViewingReceipt(r)}
                                  className="p-1 hover:text-primary transition-colors"
                                  title="Imprimir Recibo"
                                >
                                  <ClipboardList className="w-4 h-4" />
                                </button>
                              )}
                              {r.status === "PENDENTE_PAGAMENTO" && can("MANAGE_BOOKINGS") && (
                                <button
                                  onClick={() => handleStatusUpdate(r.id, "CONFIRMADA")}
                                  className="p-1 hover:text-green-500 transition-colors"
                                  title="Confirmar Pagamento"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {(r.status === "PENDENTE_PAGAMENTO" || r.status === "CONFIRMADA") && (
                                ((r.status === "CONFIRMADA") ? can("APPROVE_CANCEL") : can("MANAGE_BOOKINGS")) && (
                                  <button
                                    onClick={() => handleStatusUpdate(r.id, "CANCELADA")}
                                    className="p-1 hover:text-destructive transition-colors"
                                    title="Cancelar Reserva"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )
                              )}
                              {r.status === "CANCELADA" && can("APPROVE_CANCEL") && (
                                <button
                                  onClick={() => handleStatusUpdate(r.id, "PENDENTE_PAGAMENTO")}
                                  className="p-1 hover:text-primary transition-colors"
                                  title="Reativar Reserva"
                                >
                                  <RefreshCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-muted-foreground italic">
                          Nenhuma reserva encontrada.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-sm p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Receita Total</h3>
              <p className="font-display text-3xl font-bold text-primary">{formatCurrency(stats.receita)}</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Acumulado (Confirmado)</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Taxa de Ocupação</h3>
              <p className="font-display text-3xl font-bold text-primary">{bookings.length > 0 ? "Em tempo real" : "N/A"}</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Baseado em reservas activas</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Reservas Totais</h3>
              <p className="font-display text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Desde o início</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Status Pendente</h3>
              <p className="font-display text-xl font-bold text-foreground">{stats.pendentes}</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Aguardam acção</p>
            </div>
          </div>
        )}
      </main>

      {/* Extras Modal */}
      {isAddingExtra && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border p-6 rounded-sm w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Adicionar Pedido Extra</h3>
              <button onClick={() => setIsAddingExtra(false)} className="text-muted-foreground hover:text-foreground"><CloseX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddExtra} className="space-y-4">
              <div className="space-y-2">
                <Label>Item (Comida, Bebida, etc.)</Label>
                <Input value={extraItem} onChange={(e) => setExtraItem(e.target.value)} placeholder="Ex: Garrafa de Água" required className="bg-muted border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" min="1" value={extraQty} onChange={(e) => setExtraQty(Number(e.target.value))} required className="bg-muted border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário (AKZ)</Label>
                  <Input type="number" min="0" value={extraPrice} onChange={(e) => setExtraPrice(Number(e.target.value))} required className="bg-muted border-border" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-body font-bold py-6 mt-4">Confirmar Pedido</Button>
            </form>
          </motion.div>
        </div>
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
                  <img src={logo} alt="Roomview" className="h-12 w-auto invert brightness-0" />
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
    </div>
  );
};

export default Admin;
