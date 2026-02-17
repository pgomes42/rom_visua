export type UserRole = "ADMIN" | "GERENTE" | "OPERADOR" | "CLIENTE";

export interface User {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    password?: string; // Simulado
    customPermissions?: Permission[]; // Permissões personalizadas opcionais
}

export type Permission =
    | "MANAGE_APARTMENTS"
    | "VIEW_FINANCIALS"
    | "MANAGE_USERS"
    | "SET_PRICES"
    | "MANAGE_BOOKINGS"
    | "CREATE_BOOKINGS"
    | "APPROVE_CANCEL"
    | "VIEW_AVAILABILITY"
    | "MANAGE_SYSTEM"
    | "MANAGE_EXTRAS"
    | "PRINT_RECEIPTS"
    | "MANAGE_GUEST_ARRIVAL";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    ADMIN: [
        "MANAGE_APARTMENTS",
        "VIEW_FINANCIALS",
        "MANAGE_USERS",
        "SET_PRICES",
        "MANAGE_BOOKINGS",
        "CREATE_BOOKINGS",
        "APPROVE_CANCEL",
        "VIEW_AVAILABILITY",
        "MANAGE_SYSTEM",
        "MANAGE_EXTRAS",
        "PRINT_RECEIPTS",
        "MANAGE_GUEST_ARRIVAL"
    ],
    GERENTE: [
        "VIEW_FINANCIALS",
        "MANAGE_BOOKINGS",
        "CREATE_BOOKINGS",
        "APPROVE_CANCEL",
        "VIEW_AVAILABILITY",
        "SET_PRICES" // Preços temporários
    ],
    OPERADOR: [
        "MANAGE_BOOKINGS",
        "CREATE_BOOKINGS",
        "VIEW_AVAILABILITY",
        "MANAGE_EXTRAS",
        "PRINT_RECEIPTS",
        "MANAGE_GUEST_ARRIVAL"
    ],
    CLIENTE: [
        "CREATE_BOOKINGS",
        "VIEW_AVAILABILITY"
    ]
};

export { ROLE_PERMISSIONS };

const STORAGE_KEY = "roomview_users";
const SESSION_KEY = "roomview_session";

// Mock initial users
const INITIAL_USERS: User[] = [
    { id: "u1", nome: "Admin Roomview", email: "admin@roomview.com", role: "ADMIN", password: "admin" },
    { id: "u2", nome: "Gerente Pedro", email: "gerente@roomview.com", role: "GERENTE", password: "gerente" },
    { id: "u3", nome: "Operador Maria", email: "caixa@roomview.com", role: "OPERADOR", password: "caixa" }
];

export const authService = {
    getUsers(): User[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }
        return JSON.parse(data);
    },

    login(email: string, password: string): User | null {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const sessionUser = { ...user };
            delete sessionUser.password;
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
            return sessionUser;
        }
        return null;
    },

    getCurrentUser(): User | null {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },

    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    },

    addUser(user: Omit<User, "id">): User | null {
        const users = this.getUsers();
        const alreadyExists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (alreadyExists) {
            return null;
        }

        const newUser: User = {
            id: `u${Date.now()}`,
            ...user,
            password: user.password ?? "123456",
            customPermissions: user.customPermissions || undefined
        };

        const nextUsers = [...users, newUser];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
        return newUser;
    },

    deleteUser(id: string): boolean {
        const users = this.getUsers();
        const nextUsers = users.filter(u => u.id !== id);
        if (nextUsers.length === users.length) {
            return false;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
        return true;
    },

    hasPermission(user: User, permission: Permission): boolean {
        // Se tem permissões personalizadas, usa elas
        if (user.customPermissions) {
            return user.customPermissions.includes(permission);
        }
        // Caso contrário, usa as permissões do role
        return ROLE_PERMISSIONS[user.role].includes(permission);
    },

    isRole(user: User, role: UserRole): boolean {
        return user.role === role;
    }
};
