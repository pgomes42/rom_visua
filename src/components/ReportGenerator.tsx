import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Printer, Calendar } from 'lucide-react';
import { reportService, ReportPeriod, ReportData } from '@/lib/reportService';
import { Booking, Apartment, formatCurrency } from '@/data/apartments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ReportGeneratorProps {
    bookings: Booking[];
    apartments: Apartment[];
}

const ReportGenerator = ({ bookings, apartments }: ReportGeneratorProps) => {
    const [period, setPeriod] = useState<ReportPeriod>('monthly');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const [includeDetails, setIncludeDetails] = useState(true);
    const [currentReport, setCurrentReport] = useState<ReportData | null>(null);

    const handleGenerateReport = () => {
        try {
            const report = reportService.generateReport(
                bookings,
                apartments,
                period,
                customDateFrom ? new Date(customDateFrom) : undefined,
                customDateTo ? new Date(customDateTo) : undefined
            );
            setCurrentReport(report);
            toast.success('Relatório gerado com sucesso!');
        } catch (error) {
            toast.error('Erro ao gerar relatório. Verifique as datas.');
        }
    };

    const handlePrintReport = () => {
        if (currentReport) {
            reportService.printReport(currentReport, includeDetails);
        }
    };

    return (
        <div className="space-y-6">
            {/* Report Configuration */}
            <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">Gerador de Relatórios</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="period">Período</Label>
                        <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                            <SelectTrigger id="period" className="bg-muted border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="daily">Diário (Hoje)</SelectItem>
                                <SelectItem value="weekly">Semanal (Esta Semana)</SelectItem>
                                <SelectItem value="monthly">Mensal (Este Mês)</SelectItem>
                                <SelectItem value="yearly">Anual (Este Ano)</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {period === 'custom' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="customFrom">Data Inicial</Label>
                                <Input
                                    id="customFrom"
                                    type="date"
                                    value={customDateFrom}
                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                    className="bg-muted border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customTo">Data Final</Label>
                                <Input
                                    id="customTo"
                                    type="date"
                                    value={customDateTo}
                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                    className="bg-muted border-border"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="details">Detalhes</Label>
                        <Select 
                            value={includeDetails ? 'yes' : 'no'} 
                            onValueChange={(value) => setIncludeDetails(value === 'yes')}
                        >
                            <SelectTrigger id="details" className="bg-muted border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="yes">Com Detalhes</SelectItem>
                                <SelectItem value="no">Apenas Resumo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button onClick={handleGenerateReport} className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Gerar Relatório
                    </Button>
                    {currentReport && (
                        <Button onClick={handlePrintReport} variant="outline" className="gap-2">
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </Button>
                    )}
                </div>
            </div>

            {/* Report Preview */}
            {currentReport && (
                <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">
                        Pré-visualização do Relatório
                    </h3>

                    <div className="bg-muted/50 p-4 rounded border border-border mb-6">
                        <p className="text-sm text-muted-foreground mb-2">
                            <strong>Período:</strong> {format(currentReport.dateFrom, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} 
                            {' até '} 
                            {format(currentReport.dateTo, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-muted/30 p-4 rounded border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Total Reservas</p>
                            <p className="text-2xl font-bold">{currentReport.totalBookings}</p>
                        </div>
                        <div className="bg-green-500/10 p-4 rounded border border-green-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Confirmadas</p>
                            <p className="text-2xl font-bold text-green-500">{currentReport.confirmedBookings}</p>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded border border-red-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Canceladas</p>
                            <p className="text-2xl font-bold text-red-500">{currentReport.cancelledBookings}</p>
                        </div>
                        <div className="bg-primary/10 p-4 rounded border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">Receita</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(currentReport.totalRevenue)}</p>
                        </div>
                        <div className="bg-blue-500/10 p-4 rounded border border-blue-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Sinais</p>
                            <p className="text-xl font-bold text-blue-500">{formatCurrency(currentReport.totalDeposits)}</p>
                        </div>
                        <div className="bg-yellow-500/10 p-4 rounded border border-yellow-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Extras</p>
                            <p className="text-xl font-bold text-yellow-500">{formatCurrency(currentReport.totalExtras)}</p>
                        </div>
                    </div>

                    {/* Payment Methods Summary */}
                    {currentReport.paymentMethods && currentReport.paymentMethods.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-foreground">Métodos de Pagamento (Saldo)</h4>
                            <div className="bg-muted/30 rounded border border-border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-semibold">Método</th>
                                            <th className="text-center p-3 text-sm font-semibold">Quantidade</th>
                                            <th className="text-right p-3 text-sm font-semibold">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentReport.paymentMethods.map((pm, idx) => {
                                            let methodIcon = '💰';
                                            let methodName = pm.method;
                                            if (pm.method === 'DINHEIRO') {
                                                methodIcon = '💵';
                                                methodName = 'Dinheiro (Cash)';
                                            } else if (pm.method === 'TRANSFERENCIA') {
                                                methodIcon = '🏦';
                                                methodName = 'Transferência Bancária';
                                            } else if (pm.method === 'TPA') {
                                                methodIcon = '💳';
                                                methodName = 'TPA (Cartão)';
                                            }
                                            
                                            return (
                                                <tr key={idx} className="border-t border-border">
                                                    <td className="p-3 text-sm">
                                                        <span className="mr-2">{methodIcon}</span>
                                                        {methodName}
                                                    </td>
                                                    <td className="p-3 text-sm text-center font-semibold">
                                                        {pm.count}
                                                    </td>
                                                    <td className="p-3 text-sm text-right font-bold text-primary">
                                                        {formatCurrency(pm.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {currentReport.paymentMethods.length > 1 && (
                                            <tr className="border-t-2 border-border bg-muted/50">
                                                <td className="p-3 text-sm font-bold">Total</td>
                                                <td className="p-3 text-sm text-center font-bold">
                                                    {currentReport.paymentMethods.reduce((sum, pm) => sum + pm.count, 0)}
                                                </td>
                                                <td className="p-3 text-sm text-right font-bold text-foreground">
                                                    {formatCurrency(currentReport.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0))}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Operator Activity */}
                    {currentReport.operatorActivity.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-foreground">Atividade dos Operadores</h4>
                            <div className="bg-muted/30 rounded border border-border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-semibold">Operador</th>
                                            <th className="text-center p-3 text-sm font-semibold">Check-ins</th>
                                            <th className="text-center p-3 text-sm font-semibold">Check-outs</th>
                                            <th className="text-center p-3 text-sm font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentReport.operatorActivity.map((op, idx) => (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="p-3 text-sm">{op.operator}</td>
                                                <td className="p-3 text-sm text-center">{op.checkIns}</td>
                                                <td className="p-3 text-sm text-center">{op.checkOuts}</td>
                                                <td className="p-3 text-sm text-center font-semibold">
                                                    {op.checkIns + op.checkOuts}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Apartment Occupancy */}
                    {currentReport.apartmentOccupancy.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-3 text-foreground">Ocupação por Apartamento</h4>
                            <div className="bg-muted/30 rounded border border-border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-semibold">Apartamento</th>
                                            <th className="text-center p-3 text-sm font-semibold">Reservas</th>
                                            <th className="text-right p-3 text-sm font-semibold">Receita</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentReport.apartmentOccupancy.map((apt, idx) => (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="p-3 text-sm">{apt.apartment}</td>
                                                <td className="p-3 text-sm text-center">{apt.bookings}</td>
                                                <td className="p-3 text-sm text-right font-semibold">
                                                    {formatCurrency(apt.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportGenerator;
