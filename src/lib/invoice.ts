import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Rental, Customer, Product, RentalItem } from '../types';

interface InvoiceData {
  rental: Rental;
  customer: Customer;
  products: Array<Product & { quantity: number; dailyPrice: number; deposit: number }>;
  date: string;
}

export async function generateInvoice(data: InvoiceData) {
  const { rental, customer, products, date } = data;
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.text('RENTAL INVOICE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${date}`, 20, 30);
  doc.text(`Invoice #: ${rental.id.slice(0, 8)}`, 20, 35);
  
  // Company Details
  doc.setFontSize(12);
  doc.text('RentalPro', 20, 50);
  doc.setFontSize(10);
  doc.text('123 Business Street', 20, 55);
  doc.text('City, State 12345', 20, 60);
  doc.text('Phone: (555) 123-4567', 20, 65);
  
  // Customer Details
  doc.setFontSize(12);
  doc.text('Bill To:', 120, 50);
  doc.setFontSize(10);
  doc.text(`${customer.firstName} ${customer.lastName}`, 120, 55);
  doc.text(customer.homeAddress.street, 120, 60);
  doc.text(`${customer.homeAddress.city}, ${customer.homeAddress.state} ${customer.homeAddress.zipCode}`, 120, 65);
  doc.text(`Phone: ${customer.phone}`, 120, 70);
  
  // Rental Details
  doc.setFontSize(12);
  doc.text('Rental Details', 20, 85);
  
  // Table Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Description', 20, 95);
  doc.text('Quantity', 80, 95);
  doc.text('Daily Rate', 110, 95);
  doc.text('Deposit', 140, 95);
  doc.text('Amount', 170, 95);
  
  // Line
  doc.setDrawColor(200);
  doc.line(20, 98, 190, 98);
  
  // Table Content
  let yPos = 105;
  doc.setTextColor(0);
  
  products.forEach((product, index) => {
    doc.text(product.name, 20, yPos);
    doc.text(product.quantity.toString(), 80, yPos);
    doc.text(`$${product.dailyPrice.toFixed(2)}`, 110, yPos);
    doc.text(`$${product.deposit.toFixed(2)}`, 140, yPos);
    doc.text(`$${(product.dailyPrice * product.quantity).toFixed(2)}`, 170, yPos);
    yPos += 10;
  });
  
  yPos += 5;
  
  // Rental Period
  doc.text('Rental Period:', 20, yPos);
  doc.text(`${format(new Date(rental.startDate), 'MMM dd, yyyy')} - ${format(new Date(rental.endDate), 'MMM dd, yyyy')}`, 80, yPos);
  
  yPos += 10;
  
  // Security Deposit
  doc.text('Total Security Deposit:', 20, yPos);
  doc.text(`$${rental.totalDeposit.toFixed(2)}`, 170, yPos);
  
  yPos += 10;
  
  // Subtotal
  doc.text('Rental Subtotal:', 20, yPos);
  doc.text(`$${rental.totalPrice.toFixed(2)}`, 170, yPos);
  
  yPos += 15;
  
  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 130, yPos);
  doc.text(`$${(rental.totalPrice + rental.totalDeposit).toFixed(2)}`, 170, yPos);
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, 180, { align: 'center' });
  doc.text('Please return all items in the same condition as received.', 105, 185, { align: 'center' });
  doc.text('Security deposit will be refunded upon successful return of all items.', 105, 190, { align: 'center' });
  
  // Save the PDF
  doc.save(`rental-invoice-${rental.id.slice(0, 8)}.pdf`);
}