import { UserRole, Permission } from "@/lib/authService";
import { Shield, Check, X } from "lucide-react";

interface PermissionsHelpProps {
  userRole: UserRole;
  permissions: Permission[];
}

const allPermissions: { key: Permission; label: string; description: string }[] = [
  { key: "MANAGE_APARTMENTS", label: "Gerir Apartamentos", description: "Criar, editar e eliminar apartamentos" },
  { key: "VIEW_FINANCIALS", label: "Ver Finanças", description: "Acesso a relatórios e estatísticas completas" },
  { key: "MANAGE_USERS", label: "Gerir Utilizadores", description: "Criar e gerir contas de utilizadores" },
  { key: "SET_PRICES", label: "Definir Preços", description: "Alterar preços dos apartamentos" },
  { key: "MANAGE_BOOKINGS", label: "Gerir Reservas", description: "Confirmar e cancelar reservas" },
  { key: "CREATE_BOOKINGS", label: "Criar Reservas", description: "Criar novas reservas manualmente" },
  { key: "APPROVE_CANCEL", label: "Aprovar Cancelamentos", description: "Aprovar cancelamentos especiais" },
  { key: "VIEW_AVAILABILITY", label: "Ver Disponibilidade", description: "Consultar disponibilidade de quartos" },
  { key: "MANAGE_SYSTEM", label: "Gerir Sistema", description: "Configurações gerais do sistema" },
  { key: "MANAGE_EXTRAS", label: "Gerir Extras", description: "Adicionar extras às reservas" },
  { key: "PRINT_RECEIPTS", label: "Imprimir Recibos", description: "Gerar e imprimir recibos" },
  { key: "MANAGE_GUEST_ARRIVAL", label: "Check-in", description: "Registar chegada de hóspedes" },
];

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "ADMIN": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "GERENTE": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "OPERADOR": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "CLIENTE": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default: return "bg-muted text-muted-foreground border-border/50";
  }
};

const getRoleDescription = (role: UserRole) => {
  switch (role) {
    case "ADMIN": return "Controlo total do sistema - pode realizar todas as operações";
    case "GERENTE": return "Gestão e relatórios - supervisiona operações e finanças";
    case "OPERADOR": return "Operações do balcão - atendimento e gestão diária";
    case "CLIENTE": return "Acesso limitado - apenas consultas e reservas pessoais";
    default: return "";
  }
};

export default function PermissionsHelp({ userRole, permissions }: PermissionsHelpProps) {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className="p-3 bg-primary/10 rounded-sm">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">As Suas Permissões</h2>
          <p className="text-sm text-muted-foreground">Veja o que pode fazer com o seu perfil</p>
        </div>
      </div>

      {/* Current Role Info */}
      <div className="mb-6 p-4 bg-muted/50 rounded-sm border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Perfil Actual:</span>
          <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded border ${getRoleBadgeColor(userRole)}`}>
            {userRole}
          </div>
        </div>
        <p className="text-sm text-foreground italic">{getRoleDescription(userRole)}</p>
      </div>

      {/* Permissions List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Capacidades</h3>
        {allPermissions.map((perm) => {
          const hasPermission = permissions.includes(perm.key);
          return (
            <div
              key={perm.key}
              className={`flex items-start gap-3 p-3 rounded-sm border transition-colors ${
                hasPermission
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-muted/30 border-border/50 opacity-50"
              }`}
            >
              <div className={`mt-0.5 ${hasPermission ? "text-green-500" : "text-muted-foreground"}`}>
                {hasPermission ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${hasPermission ? "text-foreground" : "text-muted-foreground"}`}>
                  {perm.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{perm.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground italic">
          Para solicitar permissões adicionais, contacte o administrador do sistema
        </p>
      </div>
    </div>
  );
}
