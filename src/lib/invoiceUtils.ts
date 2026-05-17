import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
  };

  return `Rupees ${convert(Math.floor(num)).trim()} Only`;
};

export const generateInvoice = (booking: any, organization: any, payment?: any) => {
  const doc = new jsPDF();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = format(new Date(), 'dd MMM yyyy');

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text(organization.name || 'Venue Name', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (organization.address) doc.text(organization.address, 14, 30);
  if (organization.gstin) doc.text(`GSTIN: ${organization.gstin}`, 14, 35);
  
  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('TAX INVOICE', 140, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice #: ${invoiceNumber}`, 140, 30);
  doc.text(`Date: ${date}`, 140, 35);

  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Bill To:', 14, 50);
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(booking.customers?.name || 'Customer Name', 14, 56);
  if (booking.customers?.address) doc.text(booking.customers.address, 14, 61);
  if (booking.customers?.phone) doc.text(`Phone: ${booking.customers.phone}`, 14, 66);
  if (booking.customers?.gstin) doc.text(`GSTIN: ${booking.customers.gstin}`, 14, 71);

  // Event Details
  doc.text('Event Details:', 140, 50);
  doc.text(`Booking #: ${booking.booking_number}`, 140, 56);
  doc.text(`Event Date: ${format(new Date(booking.event_date), 'dd MMM yyyy')}`, 140, 61);
  doc.text(`Hall: ${booking.halls?.name || 'Main Hall'}`, 140, 66);

  // Line Items
  const baseAmount = booking.total_amount / 1.18; // Assuming 18% GST inclusive for simplicity
  const cgst = baseAmount * 0.09;
  const sgst = baseAmount * 0.09;

  autoTable(doc, {
    startY: 85,
    head: [['Description', 'SAC Code', 'Amount (Rs)']],
    body: [
      [`Hall Rental & Services (${booking.event_type})`, '996331', baseAmount.toFixed(2)],
      ['CGST (9%)', '', cgst.toFixed(2)],
      ['SGST (9%)', '', sgst.toFixed(2)],
    ],
    foot: [['Total', '', booking.total_amount.toFixed(2)]],
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 130;

  // Amount in Words
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(`Amount in Words: ${numberToWords(booking.total_amount)}`, 14, finalY + 10);

  if (payment) {
    doc.text(`Payment Received: Rs. ${payment.amount.toFixed(2)} via ${payment.payment_method}`, 14, finalY + 18);
    if (payment.transaction_ref) doc.text(`Ref: ${payment.transaction_ref}`, 14, finalY + 23);
  }

  // Footer / Bank Details
  const bank = organization.settings?.bank || {};
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Bank Details for RTGS/NEFT:', 14, 250);
  doc.text(`Bank: ${bank.bank_name || 'State Bank of India'}`, 14, 255);
  doc.text(`Account No: ${bank.account_number || '1234567890'}`, 14, 260);
  doc.text(`IFSC: ${bank.ifsc || 'SBIN0001234'}`, 14, 265);
  if (bank.account_name) doc.text(`Account Name: ${bank.account_name}`, 14, 270);

  doc.text('Terms & Conditions:', 140, 250);
  doc.text('1. All payments are non-refundable.', 140, 255);
  doc.text('2. Subject to local jurisdiction.', 140, 260);

  // Output
  doc.save(`${invoiceNumber}_${booking.customers?.name || 'Customer'}.pdf`);
};
