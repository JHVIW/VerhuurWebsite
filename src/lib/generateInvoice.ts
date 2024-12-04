import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Rental, Customer, Product, Settings } from '../types';

export function generateInvoice(
  rental: Rental,
  customer: Customer,
  product: Product,
  settings: Settings
): Blob {
  const doc = new jsPDF();
  const { invoiceTemplate } = settings;

  // Set font
  doc.setFont('helvetica');

  // Add company logo if available
  if (invoiceTemplate.logo) {
    doc.addImage(invoiceTemplate.logo, 'PNG', 15, 15, 50, 20);
  }

  // Company details
  doc.setFontSize(20);
  doc.text(invoiceTemplate.companyName, 15, 40);
  
  doc.setFontSize(10);
  doc.text([
    invoiceTemplate.companyAddress.street,
    `${invoiceTemplate.companyAddress.city}, ${invoiceTemplate.companyAddress.state} ${invoiceTemplate.companyAddress.zipCode}`,
    invoiceTemplate.companyAddress.country,
    `Phone: ${invoiceTemplate.companyPhone}`,
    `Email: ${invoiceTemplate.companyEmail}`,
    `VAT: ${invoiceTemplate.vatNumber}`,
  ], 15, 50);

  // Invoice details
  doc.setFontSize(16);
  doc.text('INVOICE', 150, 30);
  
  doc.setFontSize(10);
  doc.text([
    `Invoice Date: ${format(new Date(), settings.dateFormat)}`,
    `Invoice #: INV-${rental.id.slice(0, 8)}`,
    `Rental Period: ${format(new Date(rental.startDate), settings.dateFormat)} - ${format(new Date(rental.endDate), settings.dateFormat)}`,
  ], 150, 40);

  // Customer details
  doc.setFontSize(12);
  doc.text('Bill To:', 15, 90);
  
  doc.setFontSize(10);
  doc.text([
    `${customer.firstName} ${customer.lastName}`,
    customer.email,
    customer.phone,
    customer.homeAddress.street,
    `${customer.homeAddress.city}, ${customer.homeAddress.state} ${customer.homeAddress.zipCode}`,
    customer.homeAddress.country,
  ], 15, 100);

  // Rental details
  doc.setFontSize(12);
  doc.text('Rental Details:', 15, 140);
  
  // Table header
  const headers = ['Item', 'Description', 'Rate', 'Amount'];
  let y = 150;
  
  doc.setFontSize(10);
  doc.text(headers[0], 15, y);
  doc.text(headers[1], 60, y);
  doc.text(headers[2], 120, y);
  doc.text(headers[3], 170, y);
  
  y += 10;
  
  // Table content
  doc.text(product.name, 15, y);
  doc.text(product.description, 60, y);
  doc.text(`${settings.currency} ${product.price.daily}/day`, 120, y);
  doc.text(`${settings.currency} ${rental.totalPrice}`, 170, y);

  // Totals
  y += 20;
  doc.text('Subtotal:', 120, y);
  doc.text(`${settings.currency} ${rental.totalPrice}`, 170, y);
  
  y += 10;
  doc.text('Security Deposit:', 120, y);
  doc.text(`${settings.currency} ${rental.deposit}`, 170, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.text('Total:', 120, y);
  doc.text(`${settings.currency} ${rental.totalPrice + rental.deposit}`, 170, y);

  // Payment details
  y += 20;
  doc.setFontSize(10);
  doc.text('Payment Details:', 15, y);
  y += 10;
  doc.text([
    `Bank: ${invoiceTemplate.bankDetails.bankName}`,
    `Account Name: ${invoiceTemplate.bankDetails.accountName}`,
    `Account Number: ${invoiceTemplate.bankDetails.accountNumber}`,
    `SWIFT: ${invoiceTemplate.bankDetails.swiftCode}`,
    `IBAN: ${invoiceTemplate.bankDetails.iban}`,
  ], 15, y);

  // Footer
  doc.setFontSize(8);
  doc.text(invoiceTemplate.footer, 15, 280);

  return doc.output('blob');
}