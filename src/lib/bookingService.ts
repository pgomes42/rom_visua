import { Booking, BookingStatus, BOOKING_DEPOSIT, BookingExtra, PaymentMethod, RemainingPaymentMethod } from "@/data/apartments";
import { parseISO, areIntervalsOverlapping, addHours, isAfter, endOfDay, isSameDay } from "date-fns";

const STORAGE_KEY = "roomview_bookings";

export const bookingService = {
    // Check and update expired bookings
    checkExpirations(): void {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return;

        const bookings: Booking[] = JSON.parse(data);
        const now = new Date();
        let changed = false;

        const updatedBookings = bookings.map(b => {
            if (b.status === "PENDENTE_PAGAMENTO" && isAfter(now, parseISO(b.expires_at))) {
                changed = true;
                return { ...b, status: "EXPIRADA" as BookingStatus };
            }

            const isActive = !["FINALIZADA", "CANCELADA", "EXPIRADA"].includes(b.status);
            const isFullyPaid = (b.restante_pagar ?? 0) === 0;
            const checkoutDate = parseISO(b.checkout);
            const shouldFinalize = isSameDay(now, checkoutDate) || isAfter(now, checkoutDate);
            if (isActive && isFullyPaid && shouldFinalize) {
                changed = true;
                return {
                    ...b,
                    status: "FINALIZADA" as BookingStatus,
                    checkout_real: now.toISOString()
                };
            }

            return b;
        });

        if (changed) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookings));
        }
    },

    // Get all bookings
    getBookings(): Booking[] {
        this.checkExpirations();
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Get a single booking by ID
    getBookingById(id: string): Booking | undefined {
        return this.getBookings().find(b => b.id === id);
    },

    // Save bookings
    saveBookings(bookings: Booking[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    },

    // Create a new booking
    createBooking(bookingData: Omit<Booking, "id" | "created_at" | "status" | "referencia_pagamento" | "valor_sinal" | "expires_at" | "restante_pagar">): { success: boolean; booking?: Booking; error?: string } {
        const bookings = this.getBookings();

        // 1. Validate capacity (already done in UI but good for safety)

        // 2. Validate overlaps
        const hasOverlap = bookings.some(b => {
            if (b.apartment_id !== bookingData.apartment_id || b.status === "CANCELADA" || b.status === "EXPIRADA") {
                return false;
            }

            return areIntervalsOverlapping(
                { start: parseISO(bookingData.checkin), end: parseISO(bookingData.checkout) },
                { start: parseISO(b.checkin), end: parseISO(b.checkout) },
                { inclusive: false } // Check-out day can be next Check-in day
            );
        });

        if (hasOverlap) {
            return { success: false, error: "Este apartamento já está ocupado nas datas selecionadas." };
        }

        // 3. Generate reference (9 digits for Multicaixa style simulated)
        const referencia = Math.floor(100000000 + Math.random() * 900000000).toString();
        const id = "RV-" + Math.random().toString(36).substring(2, 9).toUpperCase();

        const newBooking: Booking = {
            ...bookingData,
            id,
            status: "PENDENTE_PAGAMENTO",
            referencia_pagamento: referencia,
            valor_sinal: BOOKING_DEPOSIT,
            restante_pagar: bookingData.total_estadia - BOOKING_DEPOSIT,
            created_at: new Date().toISOString(),
            expires_at: addHours(new Date(), 2).toISOString(),
        };

        bookings.push(newBooking);
        this.saveBookings(bookings);

        return { success: true, booking: newBooking };
    },

    // Update booking status
    updateBookingStatus(id: string, status: BookingStatus): boolean {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index === -1) return false;

        bookings[index].status = status;
        this.saveBookings(bookings);
        return true;
    },

    // Add extra order
    addExtra(bookingId: string, extraData: Omit<BookingExtra, "id" | "data">): boolean {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);

        if (index === -1) return false;

        const booking = bookings[index];
        const extras = booking.extras || [];

        const newExtra: BookingExtra = {
            ...extraData,
            id: Math.random().toString(36).substring(2, 9).toUpperCase(),
            data: new Date().toISOString()
        };

        booking.extras = [...extras, newExtra];
        this.saveBookings(bookings);
        return true;
    },

    // Register guest arrival
    registerCheckin(id: string, operadorEmail?: string): boolean {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index === -1) return false;

        bookings[index].checkin_real = new Date().toISOString();
        if (operadorEmail) {
            bookings[index].operador_checkin = operadorEmail;
        }
        if (bookings[index].status === "CONFIRMADA") {
            bookings[index].status = "CHECKIN_REALIZADO";
        }

        this.saveBookings(bookings);
        return true;
    },

    // Settle the remaining balance
    registerRemainingPayment(id: string, operadorEmail?: string, metodo?: RemainingPaymentMethod): boolean {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index === -1) return false;

        const booking = bookings[index];
        booking.restante_pagar = 0;
        if (metodo) {
            booking.metodo_pagamento_saldo = metodo;
        }

        const now = new Date();
        const checkoutDate = parseISO(booking.checkout);
        if (isSameDay(now, checkoutDate) || isAfter(now, checkoutDate)) {
            booking.status = "FINALIZADA" as BookingStatus;
            booking.checkout_real = now.toISOString();
            if (operadorEmail) {
                booking.operador_checkout = operadorEmail;
            }
        }
        this.saveBookings(bookings);
        return true;
    },

    // Register checkout manually
    registerCheckout(id: string, operadorEmail?: string): boolean {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index === -1) return false;

        const booking = bookings[index];
        booking.checkout_real = new Date().toISOString();
        booking.status = "FINALIZADA" as BookingStatus;
        if (operadorEmail) {
            booking.operador_checkout = operadorEmail;
        }

        this.saveBookings(bookings);
        return true;
    },

    // Secure search for guests
    getBookingSecure(id: string, contact: string): Booking | undefined {
        const bookings = this.getBookings();
        const searchId = id.toUpperCase().trim();
        const searchContact = contact.toLowerCase().trim();

        return bookings.find(b =>
            b.id === searchId &&
            (b.email.toLowerCase() === searchContact || b.telefone.includes(searchContact))
        );
    },

    // Get statistics
    getStats() {
        this.checkExpirations(); // Ensure stats are fresh
        const bookings = this.getBookings();
        const confirmed = bookings.filter(b => ["CONFIRMADA", "CHECKIN_REALIZADO", "FINALIZADA"].includes(b.status));

        const extrasRevenue = confirmed.reduce((acc, b) => {
            const bExtras = b.extras || [];
            return acc + bExtras.reduce((eAcc, e) => eAcc + (e.preco_unitario * e.quantidade), 0);
        }, 0);

        const totalRevenue = confirmed.reduce((acc, b) => acc + (b.total_estadia - b.restante_pagar), 0);

        return {
            total: bookings.length,
            pendentes: bookings.filter(b => b.status === "PENDENTE_PAGAMENTO").length,
            confirmadas: confirmed.length,
            receita: totalRevenue + extrasRevenue,
            ocupacao: 0,
        };
    }
};
