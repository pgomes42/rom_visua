import { Booking, Apartment } from '@/data/apartments';
import { startOfMonth, endOfMonth, format, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DashboardStats {
    totalRevenue: number;
    totalBookings: number;
    occupancyRate: number;
    avgBookingValue: number;
    revenueChange: number;
    bookingsChange: number;
}

export interface MonthlyData {
    name: string;
    receita: number;
    reservas: number;
}

export interface StatusData {
    name: string;
    value: number;
    color: string;
}

export const calculateDashboardStats = (bookings: Booking[], apartments: Apartment[]): DashboardStats => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Current month stats
    const currentMonthBookings = bookings.filter(b => {
        const bookingDate = parseISO(b.checkin);
        return isWithinInterval(bookingDate, { start: currentMonthStart, end: currentMonthEnd });
    });

    const currentMonthRevenue = currentMonthBookings.reduce((sum, b) => sum + b.total_estadia, 0);
    const currentMonthCount = currentMonthBookings.length;

    // Last month stats
    const lastMonthBookings = bookings.filter(b => {
        const bookingDate = parseISO(b.checkin);
        return isWithinInterval(bookingDate, { start: lastMonthStart, end: lastMonthEnd });
    });

    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + b.total_estadia, 0);
    const lastMonthCount = lastMonthBookings.length;

    // Calculate changes
    const revenueChange = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
    const bookingsChange = lastMonthCount > 0 
        ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 
        : 0;

    // Total stats (all time)
    const totalRevenue = bookings.reduce((sum, b) => sum + b.total_estadia, 0);
    const totalBookings = bookings.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate occupancy rate
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMADA' || b.status === 'FINALIZADA');
    const totalDays = apartments.length * 30; // Approximate for current month
    const occupiedDays = confirmedBookings.length * 2; // Approximate: 2 days average per booking
    const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

    return {
        totalRevenue,
        totalBookings,
        occupancyRate: Math.min(occupancyRate, 100),
        avgBookingValue,
        revenueChange: Math.round(revenueChange),
        bookingsChange: Math.round(bookingsChange),
    };
};

export const getMonthlyRevenueData = (bookings: Booking[]): MonthlyData[] => {
    const months: MonthlyData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        const monthBookings = bookings.filter(b => {
            const bookingDate = parseISO(b.checkin);
            return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
        });

        const receita = monthBookings.reduce((sum, b) => sum + b.total_estadia, 0);
        const reservas = monthBookings.length;

        months.push({
            name: format(monthDate, 'MMM', { locale: ptBR }),
            receita,
            reservas,
        });
    }

    return months;
};

export const getStatusDistribution = (bookings: Booking[]): StatusData[] => {
    const statusColors = {
        PENDENTE_PAGAMENTO: '#f59e0b',
        CONFIRMADA: '#10b981',
        CANCELADA: '#ef4444',
        FINALIZADA: '#3b82f6',
        CHECKIN_REALIZADO: '#8b5cf6',
        EXPIRADA: '#6b7280',
    };

    const statusLabels = {
        PENDENTE_PAGAMENTO: 'Pendente',
        CONFIRMADA: 'Confirmada',
        CANCELADA: 'Cancelada',
        FINALIZADA: 'Finalizada',
        CHECKIN_REALIZADO: 'Check-in',
        EXPIRADA: 'Expirada',
    };

    const statusCounts: Record<string, number> = {};
    
    bookings.forEach(booking => {
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
        name: statusLabels[status as keyof typeof statusLabels] || status,
        value: count as number,
        color: statusColors[status as keyof typeof statusColors] || '#6b7280',
    }));
};

export const getOccupancyByApartment = (bookings: Booking[], apartments: Apartment[]) => {
    return apartments.map(apt => {
        const aptBookings = bookings.filter(
            b => b.apartment_id === apt.id && (b.status === 'CONFIRMADA' || b.status === 'FINALIZADA')
        );
        
        return {
            name: apt.nome,
            occupied: aptBookings.length,
            available: 30 - aptBookings.length, // Simplificado: 30 dias disponíveis
        };
    });
};

export const getTopApartments = (bookings: Booking[], apartments: Apartment[]) => {
    const aptStats = apartments.map(apt => {
        const aptBookings = bookings.filter(b => b.apartment_id === apt.id);
        const revenue = aptBookings.reduce((sum, b) => sum + b.total_estadia, 0);
        
        return {
            name: apt.nome,
            bookings: aptBookings.length,
            revenue,
        };
    });

    return aptStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
};
