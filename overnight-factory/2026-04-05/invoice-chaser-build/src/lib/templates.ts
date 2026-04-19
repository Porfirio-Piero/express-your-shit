// Email template generator for InvoiceChaser Lite
import { Invoice, getSettings } from './storage';

export interface EmailTemplate {
  subject: string;
  body: string;
}

function replacePlaceholders(template: string, invoice: Invoice, daysOverdue: number): string {
  const settings = getSettings();
  return template
    .replace(/{client_name}/g, invoice.clientName)
    .replace(/{invoice_number}/g, invoice.invoiceNumber)
    .replace(/{amount}/g, `${invoice.currency} ${invoice.amount.toFixed(2)}`)
    .replace(/{due_date}/g, new Date(invoice.dueDate).toLocaleDateString())
    .replace(/{days_overdue}/g, daysOverdue.toString())
    .replace(/{your_name}/g, settings.yourName || 'Your Name');
}

export function generateDay7Template(invoice: Invoice): EmailTemplate {
  const settings = getSettings();
  const daysOverdue = Math.max(1, Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
  
  if (settings.customTemplateDay7) {
    const body = replacePlaceholders(settings.customTemplateDay7, invoice, daysOverdue);
    return { subject: `Quick reminder: Invoice #${invoice.invoiceNumber}`, body };
  }
  
  return {
    subject: `Quick reminder: Invoice #${invoice.invoiceNumber}`,
    body: `Hi ${invoice.clientName},

Just a friendly reminder that invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.amount.toFixed(2)} is now overdue.

Let me know if you have any questions!

Best,
${settings.yourName || 'Your Name'}`,
  };
}

export function generateDay14Template(invoice: Invoice): EmailTemplate {
  const settings = getSettings();
  const daysOverdue = Math.max(14, Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
  
  if (settings.customTemplateDay14) {
    const body = replacePlaceholders(settings.customTemplateDay14, invoice, daysOverdue);
    return { subject: `Payment needed: Invoice #${invoice.invoiceNumber}`, body };
  }
  
  return {
    subject: `Payment needed: Invoice #${invoice.invoiceNumber}`,
    body: `Hi ${invoice.clientName},

Following up on invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.amount.toFixed(2)}, which is now ${daysOverdue} days overdue.

Please let me know if there's an issue with the invoice or if you need more time.

Amount: ${invoice.currency} ${invoice.amount.toFixed(2)}
Due date: ${new Date(invoice.dueDate).toLocaleDateString()}

Best,
${settings.yourName || 'Your Name'}`,
  };
}

export function generateDay21Template(invoice: Invoice): EmailTemplate {
  const settings = getSettings();
  const daysOverdue = Math.max(21, Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
  
  if (settings.customTemplateDay21) {
    const body = replacePlaceholders(settings.customTemplateDay21, invoice, daysOverdue);
    return { subject: `URGENT: Invoice #${invoice.invoiceNumber} - Final notice`, body };
  }
  
  return {
    subject: `URGENT: Invoice #${invoice.invoiceNumber} - Final notice`,
    body: `Hi ${invoice.clientName},

Invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.amount.toFixed(2)} is now ${daysOverdue} days overdue.

Please contact me to arrange payment. I'm happy to discuss payment options if needed.

Amount: ${invoice.currency} ${invoice.amount.toFixed(2)}
Due date: ${new Date(invoice.dueDate).toLocaleDateString()}
Days overdue: ${daysOverdue}

Best,
${settings.yourName || 'Your Name'}`,
  };
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

export function getEmailClientLink(invoice: Invoice, template: EmailTemplate): string {
  const subject = encodeURIComponent(template.subject);
  const body = encodeURIComponent(template.body);
  return `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`;
}