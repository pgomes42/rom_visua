import { bookingService } from './bookingService';
import { apartmentService } from './apartmentService';
import { subDays, subMonths, format, addDays } from 'date-fns';

const CLIENTE_NAMES = [
    'João Silva', 'Maria Santos', 'Pedro Almeida', 'Ana Costa', 'Carlos Mendes',
    'Sofia Rodrigues', 'Miguel Ferreira', 'Beatriz Oliveira', 'Tiago Pereira', 'Inês Martins',
    'Ricardo Sousa', 'Catarina Gomes', 'André Lopes', 'Mariana Ribeiro', 'Bruno Costa',
    'Joana Fernandes', 'Nuno Carvalho', 'Patrícia Dias', 'Luís Gonçalves', 'Teresa Pinto',
    'David Machado', 'Isabel Correia', 'Fernando Rocha', 'Cristina Moreira', 'Rui Barbosa',
    'Helena Teixeira', 'Vasco Cunha', 'Rita Azevedo', 'Francisco Monteiro', 'Sara Baptista'
];

const STATUSES: Array<'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA' | 'PENDENTE_PAGAMENTO'> = [
    'CONFIRMADA', 'FINALIZADA', 'FINALIZADA', 'FINALIZADA', // Mais finalizadas
    'CONFIRMADA', 'CONFIRMADA', 'CANCELADA'
];

const PAYMENT_METHODS: Array<'EXPRESS' | 'REFERENCIA' | 'TRANSFERENCIA' | 'PRESENCIAL'> = [
    'EXPRESS', 'REFERENCIA', 'TRANSFERENCIA', 'PRESENCIAL'
];

const REMAINING_PAYMENT_METHODS: Array<'TRANSFERENCIA' | 'DINHEIRO' | 'TPA'> = [
    'TRANSFERENCIA', 'DINHEIRO', 'TPA'
];

const EXTRAS_POOL = [
    { item: 'Água Mineral 500ml', preco: 500 },
    { item: 'Água Mineral 1.5L', preco: 800 },
    { item: 'Refrigerante Lata', preco: 1000 },
    { item: 'Pequeno Almoço Continental', preco: 8000 },
    { item: 'Almoço Executivo', preco: 15000 },
    { item: 'Jantar Gourmet', preco: 20000 },
    { item: 'Lavandaria (peça)', preco: 2000 },
    { item: 'Transfer Aeroporto', preco: 25000 },
    { item: 'WiFi Premium 24h', preco: 5000 },
];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
    return `+244 9${getRandomInt(10, 99)} ${getRandomInt(100, 999)} ${getRandomInt(100, 999)}`;
}

function generateEmail(name: string): string {
    const cleanName = name.toLowerCase().replace(' ', '.');
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
    return `${cleanName}@${getRandomElement(domains)}`;
}

export const seedBookings = (count: number = 50) => {
    console.log(`🌱 Gerando ${count} reservas de teste...`);
    
    const apartments = apartmentService.getApartments();
    const now = new Date();
    const generatedBookings = [];

    for (let i = 0; i < count; i++) {
        const apartment = getRandomElement(apartments);
        
        // Datas: últimos 6 meses
        const monthsAgo = getRandomInt(0, 6);
        const daysOffset = getRandomInt(0, 28);
        const checkInDate = subDays(subMonths(now, monthsAgo), daysOffset);
        const noites = getRandomInt(1, 5);
        const checkOutDate = addDays(checkInDate, noites);
        const pessoas = getRandomInt(1, apartment.capacidade);
        
        const clienteNome = getRandomElement(CLIENTE_NAMES);
        const totalEstadia = apartment.preco_noite * noites;
        const valorSinal = Math.round(totalEstadia * 0.3); // 30% sinal
        const status = getRandomElement(STATUSES);
        const metodoPagamento = getRandomElement(PAYMENT_METHODS);
        
        // Criar reserva base
        const createdAt = subDays(checkInDate, getRandomInt(3, 15)); // Criada 3-15 dias antes
        
        const bookingData = {
            cliente_nome: clienteNome,
            telefone: generatePhone(),
            email: generateEmail(clienteNome),
            apartment_id: apartment.id,
            checkin: format(checkInDate, 'yyyy-MM-dd'),
            checkout: format(checkOutDate, 'yyyy-MM-dd'),
            noites,
            total_estadia: totalEstadia,
            pessoas,
        };

        const result = bookingService.createBooking(bookingData);
        
        if (result.success && result.booking) {
            const booking = result.booking;
            
            // Atualizar status e método de pagamento
            if (status !== 'PENDENTE_PAGAMENTO') {
                bookingService.updateBookingStatus(booking.id, status);
                
                // Adicionar extras aleatoriamente (40% de chance)
                if (Math.random() < 0.4 && status !== 'CANCELADA') {
                    const numExtras = getRandomInt(1, 3);
                    for (let j = 0; j < numExtras; j++) {
                        const extra = getRandomElement(EXTRAS_POOL);
                        bookingService.addExtra(booking.id, {
                            item: extra.item,
                            quantidade: getRandomInt(1, 3),
                            preco_unitario: extra.preco
                        });
                    }
                }
            }
            
            // Atualizar método de pagamento no localStorage diretamente
            const bookings = bookingService.getBookings();
            const bookingToUpdate = bookings.find(b => b.id === booking.id);
            if (bookingToUpdate) {
                bookingToUpdate.metodo_pagamento = metodoPagamento;
                bookingToUpdate.created_at = createdAt.toISOString();
                
                // Registar horários de check-in e check-out
                if (status === 'CHECKIN_REALIZADO' || status === 'FINALIZADA') {
                    // Check-in entre 13:00 e 18:00
                    const checkinHour = getRandomInt(13, 18);
                    const checkinMinute = getRandomInt(0, 59);
                    const checkinTime = new Date(checkInDate);
                    checkinTime.setHours(checkinHour, checkinMinute, 0, 0);
                    bookingToUpdate.checkin_real = checkinTime.toISOString();
                }
                
                // Para reservas finalizadas, também registar check-out
                if (status === 'FINALIZADA') {
                    // Check-out entre 09:00 e 12:00
                    const checkoutHour = getRandomInt(9, 12);
                    const checkoutMinute = getRandomInt(0, 59);
                    const checkoutTime = new Date(checkOutDate);
                    checkoutTime.setHours(checkoutHour, checkoutMinute, 0, 0);
                    bookingToUpdate.checkout_real = checkoutTime.toISOString();
                }
                
                // Para reservas finalizadas e confirmadas, simular pagamento completo
                if (status === 'FINALIZADA' || status === 'CONFIRMADA') {
                    // 70% de chance de pagar tudo, 30% de pagar parcial
                    if (Math.random() < 0.7) {
                        // Pagamento completo
                        bookingToUpdate.restante_pagar = 0;
                    } else {
                        // Pagamento parcial - adicionar método de pagamento para saldo
                        const restante = totalEstadia - valorSinal; // Falta pagar o resto
                        bookingToUpdate.restante_pagar = restante;
                        bookingToUpdate.metodo_pagamento_saldo = getRandomElement(REMAINING_PAYMENT_METHODS);
                    }
                }
            }
            bookingService.saveBookings(bookings);
            
            generatedBookings.push(booking);
        }
    }

    console.log(`✅ ${generatedBookings.length} reservas geradas com sucesso!`);
    console.log(`📊 Distribuição:`);
    
    const statusCount = generatedBookings.reduce((acc, b) => {
        const bookings = bookingService.getBookings();
        const booking = bookings.find(bb => bb.id === b.id);
        if (booking) {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
    });
    
    return generatedBookings;
};

export const clearAllBookings = () => {
    localStorage.removeItem('roomview_bookings');
    console.log('🗑️ Todas as reservas foram removidas');
};

export const getBookingsStats = () => {
    const bookings = bookingService.getBookings();
    console.log(`📈 Total de reservas: ${bookings.length}`);
    
    const byStatus = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const byApartment = bookings.reduce((acc, b) => {
        const apt = apartmentService.getApartments().find(a => a.id === b.apartment_id);
        if (apt) {
            acc[apt.nome] = (acc[apt.nome] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    
    const totalRevenue = bookings.reduce((sum, b) => {
        if (b.status !== 'CANCELADA' && b.status !== 'PENDENTE_PAGAMENTO') {
            return sum + b.total_estadia;
        }
        return sum;
    }, 0);
    
    console.log('\n📊 Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
    });
    
    console.log('\n🏢 Por Apartamento:');
    Object.entries(byApartment).forEach(([apt, count]) => {
        console.log(`   ${apt}: ${count}`);
    });
    
    console.log(`\n💰 Receita Total: ${totalRevenue.toLocaleString('pt-AO')} AKZ`);
};

// Expor no window para uso no console do browser
if (typeof window !== 'undefined') {
    (window as any).seedBookings = seedBookings;
    (window as any).clearAllBookings = clearAllBookings;
    (window as any).getBookingsStats = getBookingsStats;
}
