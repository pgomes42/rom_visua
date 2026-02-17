import { Booking, Apartment } from '@/data/apartments';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface ReportData {
    period: ReportPeriod;
    dateFrom: Date;
    dateTo: Date;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    totalDeposits: number;
    totalExtras: number;
    bookings: Booking[];
    operatorActivity: {
        operator: string;
        checkIns: number;
        checkOuts: number;
    }[];
    apartmentOccupancy: {
        apartment: string;
        bookings: number;
        revenue: number;
    }[];
    paymentMethods: {
        method: string;
        count: number;
        amount: number;
    }[];
}

const filterBookingsByPeriod = (bookings: Booking[], dateFrom: Date, dateTo: Date): Booking[] => {
    return bookings.filter(booking => {
        const bookingDate = parseISO(booking.checkin);
        return isWithinInterval(bookingDate, { start: dateFrom, end: dateTo });
    });
};

export const reportService = {
    generateReport(
        bookings: Booking[], 
        apartments: Apartment[], 
        period: ReportPeriod, 
        customDateFrom?: Date, 
        customDateTo?: Date
    ): ReportData {
        const now = new Date();
        let dateFrom: Date;
        let dateTo: Date;

        // Determine date range based on period
        switch (period) {
            case 'daily':
                dateFrom = startOfDay(now);
                dateTo = endOfDay(now);
                break;
            case 'weekly':
                dateFrom = startOfWeek(now, { locale: ptBR });
                dateTo = endOfWeek(now, { locale: ptBR });
                break;
            case 'monthly':
                dateFrom = startOfMonth(now);
                dateTo = endOfMonth(now);
                break;
            case 'yearly':
                dateFrom = startOfYear(now);
                dateTo = endOfYear(now);
                break;
            case 'custom':
                if (!customDateFrom || !customDateTo) {
                    throw new Error('Custom period requires dateFrom and dateTo');
                }
                dateFrom = startOfDay(customDateFrom);
                dateTo = endOfDay(customDateTo);
                break;
        }

        // Filter bookings for the period
        const periodBookings = filterBookingsByPeriod(bookings, dateFrom, dateTo);

        // Calculate statistics
        const confirmedBookings = periodBookings.filter(b => 
            ['CONFIRMADA', 'CHECKIN_REALIZADO', 'FINALIZADA'].includes(b.status)
        );
        const cancelledBookings = periodBookings.filter(b => 
            ['CANCELADA', 'EXPIRADA'].includes(b.status)
        );

        // Calculate revenue
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.total_estadia, 0);
        const totalDeposits = periodBookings.reduce((sum, b) => sum + b.valor_sinal, 0);
        const totalExtras = confirmedBookings.reduce((sum, b) => {
            const extrasSum = (b.extras || []).reduce((eSum, e) => 
                eSum + (e.preco_unitario * e.quantidade), 0
            );
            return sum + extrasSum;
        }, 0);

        // Operator activity
        const operatorMap = new Map<string, { checkIns: number; checkOuts: number }>();
        
        periodBookings.forEach(booking => {
            if (booking.operador_checkin) {
                const current = operatorMap.get(booking.operador_checkin) || { checkIns: 0, checkOuts: 0 };
                current.checkIns++;
                operatorMap.set(booking.operador_checkin, current);
            }
            if (booking.operador_checkout) {
                const current = operatorMap.get(booking.operador_checkout) || { checkIns: 0, checkOuts: 0 };
                current.checkOuts++;
                operatorMap.set(booking.operador_checkout, current);
            }
        });

        const operatorActivity = Array.from(operatorMap.entries()).map(([operator, activity]) => ({
            operator,
            checkIns: activity.checkIns,
            checkOuts: activity.checkOuts,
        }));

        // Apartment occupancy
        const apartmentMap = new Map<string, { bookings: number; revenue: number }>();
        
        periodBookings.forEach(booking => {
            const apt = apartments.find(a => a.id === booking.apartment_id);
            if (apt) {
                const current = apartmentMap.get(apt.nome) || { bookings: 0, revenue: 0 };
                current.bookings++;
                if (['CONFIRMADA', 'CHECKIN_REALIZADO', 'FINALIZADA'].includes(booking.status)) {
                    current.revenue += booking.total_estadia;
                }
                apartmentMap.set(apt.nome, current);
            }
        });

        const apartmentOccupancy = Array.from(apartmentMap.entries())
            .map(([apartment, data]) => ({
                apartment,
                bookings: data.bookings,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        // Payment methods summary
        const paymentMethodsMap = new Map<string, { count: number; amount: number }>();
        
        periodBookings.forEach(booking => {
            // Only count if payment method is defined and balance was paid (restante_pagar is 0)
            if (booking.metodo_pagamento_saldo && booking.restante_pagar === 0) {
                const paidAmount = booking.total_estadia - booking.valor_sinal;
                const current = paymentMethodsMap.get(booking.metodo_pagamento_saldo) || { count: 0, amount: 0 };
                current.count++;
                current.amount += paidAmount;
                paymentMethodsMap.set(booking.metodo_pagamento_saldo, current);
            }
        });

        const paymentMethods = Array.from(paymentMethodsMap.entries())
            .map(([method, data]) => ({
                method,
                count: data.count,
                amount: data.amount,
            }))
            .sort((a, b) => b.amount - a.amount);

        return {
            period,
            dateFrom,
            dateTo,
            totalBookings: periodBookings.length,
            confirmedBookings: confirmedBookings.length,
            cancelledBookings: cancelledBookings.length,
            totalRevenue,
            totalDeposits,
            totalExtras,
            bookings: periodBookings,
            operatorActivity,
            apartmentOccupancy,
            paymentMethods,
        };
    },

    formatReportForPrint(report: ReportData, includeDetails: boolean = true): string {
        const { dateFrom, dateTo, totalBookings, confirmedBookings, cancelledBookings, 
                totalRevenue, totalDeposits, totalExtras, operatorActivity, apartmentOccupancy, bookings } = report;

        let html = `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório RoomView Boutique</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 30px;
            color: #1a1a1a;
            background: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #d4af37;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #d4af37;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 5px 0;
        }
        .period {
            text-align: center;
            font-size: 16px;
            margin: 20px 0;
            color: #444;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }
        .summary-card {
            border: 1px solid #e0e0e0;
            padding: 15px;
            border-radius: 8px;
            background: #f9f9f9;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #d4af37;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table th {
            background: #1a1a1a;
            color: #d4af37;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
        }
        table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
        }
        table tr:hover {
            background: #f5f5f5;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
            .summary {
                page-break-inside: avoid;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RoomView Boutique</h1>
        <p>Relatório de Gestão</p>
    </div>

    <div class="period">
        <strong>Período:</strong> ${format(dateFrom, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} 
        até ${format(dateTo, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total de Reservas</h3>
            <div class="value">${totalBookings}</div>
        </div>
        <div class="summary-card">
            <h3>Confirmadas</h3>
            <div class="value">${confirmedBookings}</div>
        </div>
        <div class="summary-card">
            <h3>Canceladas</h3>
            <div class="value">${cancelledBookings}</div>
        </div>
        <div class="summary-card">
            <h3>Receita Total</h3>
            <div class="value">${(totalRevenue / 1000).toFixed(0)}k AKZ</div>
        </div>
        <div class="summary-card">
            <h3>Sinais Recebidos</h3>
            <div class="value">${(totalDeposits / 1000).toFixed(0)}k AKZ</div>
        </div>
        <div class="summary-card">
            <h3>Extras</h3>
            <div class="value">${(totalExtras / 1000).toFixed(0)}k AKZ</div>
        </div>
    </div>

    <div class="section">
        <h2>Atividade dos Operadores</h2>
        <table>
            <thead>
                <tr>
                    <th>Operador</th>
                    <th>Check-ins</th>
                    <th>Check-outs</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${operatorActivity.map(op => `
                    <tr>
                        <td>${op.operator}</td>
                        <td>${op.checkIns}</td>
                        <td>${op.checkOuts}</td>
                        <td><strong>${op.checkIns + op.checkOuts}</strong></td>
                    </tr>
                `).join('')}
                ${operatorActivity.length === 0 ? `
                    <tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma atividade registada</td></tr>
                ` : ''}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Ocupação por Apartamento</h2>
        <table>
            <thead>
                <tr>
                    <th>Apartamento</th>
                    <th>Reservas</th>
                    <th>Receita</th>
                </tr>
            </thead>
            <tbody>
                ${apartmentOccupancy.map(apt => `
                    <tr>
                        <td>${apt.apartment}</td>
                        <td>${apt.bookings}</td>
                        <td>${(apt.revenue / 1000).toFixed(1)}k AKZ</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;

        // Payment Methods Summary
        if (report.paymentMethods && report.paymentMethods.length > 0) {
            const totalCount = report.paymentMethods.reduce((sum, pm) => sum + pm.count, 0);
            const totalAmount = report.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
            
            html += `
    <div class="section">
        <h2>Métodos de Pagamento (Saldo)</h2>
        <table>
            <thead>
                <tr>
                    <th>Método</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${report.paymentMethods.map(pm => {
                    let methodName = pm.method;
                    if (pm.method === 'DINHEIRO') methodName = '💵 Dinheiro';
                    else if (pm.method === 'TRANSFERENCIA') methodName = '🏦 Transferência';
                    else if (pm.method === 'TPA') methodName = '💳 TPA (Cartão)';
                    
                    return `<tr>
                        <td>${methodName}</td>
                        <td>${pm.count}</td>
                        <td><strong>${(pm.amount / 1000).toFixed(1)}k AKZ</strong></td>
                    </tr>`;
                }).join('')}
                ${report.paymentMethods.length > 1 ? `
                <tr style="border-top: 2px solid #d4af37; background: #f9f9f9;">
                    <td><strong>TOTAL</strong></td>
                    <td><strong>${totalCount}</strong></td>
                    <td><strong>${(totalAmount / 1000).toFixed(1)}k AKZ</strong></td>
                </tr>` : ''}
            </tbody>
        </table>
    </div>`;
        }

        if (includeDetails && bookings.length > 0) {
            html += `
    <div class="section">
        <h2>Detalhes das Reservas</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Valor</th>
                    <th>Pgto. Saldo</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(b => {
                    let paymentMethod = '-';
                    if (b.metodo_pagamento_saldo) {
                        if (b.metodo_pagamento_saldo === 'DINHEIRO') paymentMethod = '💵 Dinheiro';
                        else if (b.metodo_pagamento_saldo === 'TRANSFERENCIA') paymentMethod = '🏦 Transfer.';
                        else if (b.metodo_pagamento_saldo === 'TPA') paymentMethod = '💳 TPA';
                    }
                    return `
                    <tr>
                        <td>${b.id}</td>
                        <td>${b.cliente_nome}</td>
                        <td>${format(parseISO(b.checkin), 'dd/MM/yyyy', { locale: ptBR })}</td>
                        <td>${format(parseISO(b.checkout), 'dd/MM/yyyy', { locale: ptBR })}</td>
                        <td>${b.status}</td>
                        <td>${(b.total_estadia / 1000).toFixed(1)}k AKZ</td>
                        <td>${paymentMethod}</td>
                    </tr>
                `;
                }).join('')}
            </tbody>
        </table>
    </div>`;
        }

        html += `
    <div class="footer">
        <p>Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        <p>RoomView Boutique - Patriota, Luanda</p>
    </div>
</body>
</html>`;

        return html;
    },

    printReport(report: ReportData, includeDetails: boolean = true): void {
        const html = this.formatReportForPrint(report, includeDetails);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    }
};
