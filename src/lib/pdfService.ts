import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Booking, Apartment, formatCurrency } from '@/data/apartments';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export const pdfService = {
    /**
     * Generate PDF from HTML element
     */
    async generateFromElement(elementId: string, filename: string): Promise<void> {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error('Element not found');
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    /**
     * Generate receipt PDF programmatically
     */
    async generateReceipt(booking: Booking, apartment: Apartment): Promise<void> {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 20;

        // Header
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ROOMVIEW BOUTIQUE', pageWidth / 2, y, { align: 'center' });
        
        y += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Luanda, Patriota, Via Principal', pageWidth / 2, y, { align: 'center' });
        
        y += 5;
        pdf.text('NIF: 5000123456 | Tel: +244 923 000 000', pageWidth / 2, y, { align: 'center' });

        // Divider
        y += 10;
        pdf.setLineWidth(0.5);
        pdf.line(20, y, pageWidth - 20, y);

        // Title
        y += 10;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('COMPROVATIVO DE RESERVA', pageWidth / 2, y, { align: 'center' });

        // Booking ID
        y += 8;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`ID: ${booking.id}`, pageWidth / 2, y, { align: 'center' });

        y += 5;
        pdf.setFontSize(9);
        pdf.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: pt })}`, pageWidth / 2, y, { align: 'center' });

        // Details
        y += 15;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        const leftMargin = 25;
        const rightMargin = pageWidth - 25;

        // Guest info
        pdf.text('HÓSPEDE:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(booking.cliente_nome, rightMargin, y, { align: 'right' });

        y += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('APARTAMENTO:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(apartment.nome, rightMargin, y, { align: 'right' });

        y += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('CHECK-IN:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(format(parseISO(booking.checkin), 'dd/MM/yyyy', { locale: pt }), rightMargin, y, { align: 'right' });

        y += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('CHECK-OUT:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(format(parseISO(booking.checkout), 'dd/MM/yyyy', { locale: pt }), rightMargin, y, { align: 'right' });

        y += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOITES:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(booking.noites.toString(), rightMargin, y, { align: 'right' });

        // Divider
        y += 10;
        pdf.setLineWidth(0.3);
        pdf.line(20, y, pageWidth - 20, y);

        // Financial summary
        y += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL DA ESTADIA:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formatCurrency(booking.total_estadia), rightMargin, y, { align: 'right' });

        // Extras
        if (booking.extras && booking.extras.length > 0) {
            y += 10;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text('EXTRAS CONSUMIDOS:', leftMargin, y);

            y += 5;
            pdf.setFont('helvetica', 'normal');
            booking.extras.forEach(extra => {
                y += 5;
                const itemText = `${extra.quantidade}x ${extra.item}`;
                const priceText = formatCurrency(extra.preco_unitario * extra.quantidade);
                pdf.text(itemText, leftMargin + 5, y);
                pdf.text(priceText, rightMargin, y, { align: 'right' });
            });

            y += 7;
            const extrasTotal = booking.extras.reduce((acc, e) => acc + (e.preco_unitario * e.quantidade), 0);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text('SUBTOTAL EXTRAS:', leftMargin, y);
            pdf.text(formatCurrency(extrasTotal), rightMargin, y, { align: 'right' });
        }

        y += 10;
        pdf.setLineWidth(0.3);
        pdf.line(20, y, pageWidth - 20, y);

        y += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 139, 34); // Green
        pdf.text('VALOR JÁ PAGO:', leftMargin, y);
        pdf.text(formatCurrency(booking.valor_sinal || 25000), rightMargin, y, { align: 'right' });

        y += 10;
        pdf.setLineWidth(0.8);
        pdf.line(20, y, pageWidth - 20, y);

        // Final balance
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(220, 38, 38); // Red
        pdf.text('SALDO A PAGAR:', leftMargin, y);
        const finalBalance = booking.restante_pagar + (booking.extras?.reduce((acc, e) => acc + (e.preco_unitario * e.quantidade), 0) || 0);
        pdf.text(formatCurrency(finalBalance), rightMargin, y, { align: 'right' });

        // Reset color
        pdf.setTextColor(0, 0, 0);

        // Footer
        y += 20;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Apresente este comprovativo no acto do check-in.', pageWidth / 2, y, { align: 'center' });
        
        y += 5;
        pdf.text('Obrigado pela sua preferência!', pageWidth / 2, y, { align: 'center' });

        y += 10;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Roomview Boutique - Luxury & Prestige', pageWidth / 2, y, { align: 'center' });

        // Save
        pdf.save(`Reserva_${booking.id}.pdf`);
    },

    /**
     * Generate invoice for completed stay
     */
    async generateInvoice(booking: Booking, apartment: Apartment): Promise<void> {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 20;

        // Header
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('FACTURA', pageWidth / 2, y, { align: 'center' });

        y += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('ROOMVIEW BOUTIQUE LDA.', pageWidth / 2, y, { align: 'center' });

        y += 5;
        pdf.text('Luanda, Patriota, Via Principal', pageWidth / 2, y, { align: 'center' });

        y += 5;
        pdf.text('NIF: 5000123456', pageWidth / 2, y, { align: 'center' });

        // Invoice details
        y += 15;
        const leftMargin = 25;
        const rightMargin = pageWidth - 25;

        pdf.setFont('helvetica', 'bold');
        pdf.text('FACTURA Nº:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`FT ${booking.id.replace('RV-', '')}/${new Date().getFullYear()}`, rightMargin, y, { align: 'right' });

        y += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('DATA:', leftMargin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(format(new Date(), 'dd/MM/yyyy', { locale: pt }), rightMargin, y, { align: 'right' });

        // Client info
        y += 15;
        pdf.setFont('helvetica', 'bold');
        pdf.text('CLIENTE:', leftMargin, y);

        y += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.text(booking.cliente_nome, leftMargin, y);

        y += 5;
        pdf.text(`Email: ${booking.email}`, leftMargin, y);

        y += 5;
        pdf.text(`Tel: ${booking.telefone}`, leftMargin, y);

        // Items table
        y += 15;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);

        // Table header
        pdf.text('DESCRIÇÃO', leftMargin, y);
        pdf.text('QTD', pageWidth - 70, y, { align: 'center' });
        pdf.text('PREÇO UNIT.', pageWidth - 50, y, { align: 'center' });
        pdf.text('TOTAL', rightMargin, y, { align: 'right' });

        y += 5;
        pdf.setLineWidth(0.3);
        pdf.line(leftMargin, y, rightMargin, y);

        // Accommodation
        y += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Alojamento - ${apartment.nome}`, leftMargin, y);
        pdf.text(booking.noites.toString(), pageWidth - 70, y, { align: 'center' });
        pdf.text(formatCurrency(apartment.preco_noite), pageWidth - 50, y, { align: 'center' });
        pdf.text(formatCurrency(booking.total_estadia), rightMargin, y, { align: 'right' });

        // Extras
        if (booking.extras && booking.extras.length > 0) {
            booking.extras.forEach(extra => {
                y += 6;
                pdf.text(extra.item, leftMargin, y);
                pdf.text(extra.quantidade.toString(), pageWidth - 70, y, { align: 'center' });
                pdf.text(formatCurrency(extra.preco_unitario), pageWidth - 50, y, { align: 'center' });
                pdf.text(formatCurrency(extra.preco_unitario * extra.quantidade), rightMargin, y, { align: 'right' });
            });
        }

        // Totals
        y += 10;
        pdf.setLineWidth(0.3);
        pdf.line(leftMargin, y, rightMargin, y);

        const extrasTotal = booking.extras?.reduce((acc, e) => acc + (e.preco_unitario * e.quantidade), 0) || 0;
        const grandTotal = booking.total_estadia + extrasTotal;

        y += 7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL:', pageWidth - 60, y);
        pdf.text(formatCurrency(grandTotal), rightMargin, y, { align: 'right' });

        // Footer
        y += 20;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Obrigado pela sua preferência!', pageWidth / 2, y, { align: 'center' });

        // Save
        pdf.save(`Factura_${booking.id}.pdf`);
    }
};
