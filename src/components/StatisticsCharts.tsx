import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '@/data/apartments';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color?: string;
}

export const StatsCard = ({ title, value, change, icon: Icon, color = "primary" }: StatsCardProps) => {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        green: "bg-green-500/10 text-green-500",
        blue: "bg-blue-500/10 text-blue-500",
        yellow: "bg-yellow-500/10 text-yellow-500",
        red: "bg-red-500/10 text-red-500",
    };

    return (
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-grow">
                    <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold font-display text-foreground">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-semibold">{Math.abs(change)}%</span>
                            <span className="text-muted-foreground text-xs">vs. mês anterior</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

interface RevenueChartProps {
    data: Array<{ name: string; receita: number; reservas: number }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
    return (
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-6">Receita Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '12px' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #2a2a2a',
                            borderRadius: '4px',
                            color: '#fff'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    />
                    <Legend />
                    <Bar dataKey="receita" fill="#d4af37" name="Receita (AKZ)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface BookingsChartProps {
    data: Array<{ name: string; reservas: number }>;
}

export const BookingsChart = ({ data }: BookingsChartProps) => {
    return (
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-6">Evolução de Reservas</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #2a2a2a',
                            borderRadius: '4px',
                            color: '#fff'
                        }}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="reservas" 
                        stroke="#d4af37" 
                        strokeWidth={3}
                        name="Reservas"
                        dot={{ fill: '#d4af37', r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface StatusDistributionProps {
    data: Array<{ name: string; value: number; color: string }>;
}

export const StatusDistributionChart = ({ data }: StatusDistributionProps) => {
    return (
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-6">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #2a2a2a',
                            borderRadius: '4px',
                            color: '#fff'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

interface OccupancyRateProps {
    apartments: Array<{
        name: string;
        occupied: number;
        available: number;
    }>;
}

export const OccupancyRateChart = ({ apartments }: OccupancyRateProps) => {
    return (
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-6">Taxa de Ocupação por Apartamento</h3>
            <div className="space-y-4">
                {apartments.map((apt, index) => {
                    const total = apt.occupied + apt.available;
                    const percentage = total > 0 ? (apt.occupied / total) * 100 : 0;
                    return (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-foreground">{apt.name}</span>
                                <span className="text-sm font-bold text-primary">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface TopApartmentsProps {
    apartments: Array<{
        name: string;
        bookings: number;
        revenue: number;
    }>;
}

export const TopApartmentsChart = ({ apartments }: TopApartmentsProps) => {
    return (
        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-6">Top Apartamentos</h3>
            <div className="space-y-4">
                {apartments.map((apt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold text-sm">#{index + 1}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{apt.name}</p>
                                <p className="text-xs text-muted-foreground">{apt.bookings} reservas</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-primary">{formatCurrency(apt.revenue)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
