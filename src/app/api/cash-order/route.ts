import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

type CartItem = { 
  id: number; 
  name: string; 
  price: number; 
  qty: number;
  totalPrice?: number;
  addonPrices?: { [key: string]: number };
  options?: {
    hotCold?: string;
    size?: string;
    addons?: string[];
    notes?: string;
  };
};

async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_TEST_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: message },
  };
  logger.info({ to, payload }, 'Sending WhatsApp message');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.text();
    logger.error({ to, error }, 'WhatsApp API error');
    throw new Error(error);
  }
  logger.info({ to }, 'WhatsApp message sent successfully');
}

// Helper function to get addon details with prices
function getAddonDetails(addons: string[], addonPrices: { [key: string]: number } = {}, itemName?: string): string {
  if (!addons || addons.length === 0) return '';
  
  // Special pricing for crepes
  if (itemName && (itemName.toLowerCase().includes('crepa') || itemName.toLowerCase().includes('fresas con crema'))) {
    return addons.map((addon, index) => {
      const price = index < 2 ? 0 : (addonPrices[addon] || 0); // First 2 are free
      const label = addon.replace(/_/g, ' ');
      return `${label}${price > 0 ? ` (+$${price})` : ''}`;
    }).join(', ');
  }
  
  // Regular pricing for other items
  return addons.map(addon => {
    const price = addonPrices[addon] || 0;
    const label = addon.replace(/_/g, ' ');
    return `${label}${price > 0 ? ` (+$${price})` : ''}`;
  }).join(', ');
}

export async function POST(req: Request) {
  logger.info('Received cash order POST request');
  const { cart, name, apartment, phone, payment, bankInfo } = await req.json();
  logger.info({ cart, name, apartment, phone, payment, bankInfo }, 'Cash order details');
  const total = (cart as CartItem[]).reduce((sum, item) => sum + (item.totalPrice || item.price) * item.qty, 0);
  const orderList = (cart as CartItem[]).map((item) => {
    let details = '';
    if (item.options) {
      if (item.options.hotCold) details += ` (${item.options.hotCold})`;
      if (item.options.size && item.options.size !== '') details += ` [${item.options.size}]`;
      if (item.options.addons && item.options.addons.length > 0) {
        details += `\n  + ${getAddonDetails(item.options.addons, item.addonPrices, item.name)}`;
      }
      if (item.options.notes) details += `\n  Nota: ${item.options.notes}`;
    }
    return `${item.qty}x ${item.name}${details} - $${(item.totalPrice || item.price) * item.qty} MXN`;
  }).join('\n');
  const phoneLine = phone ? `\n📱 Teléfono del cliente: ${phone}\n💬 WhatsApp: https://wa.me/${phone.replace(/[^\d]/g, '')}` : '';
  
  // Determine payment method text
  let paymentText = '';
  if (payment === 'cash' || !payment) {
    paymentText = 'Pago pendiente en efectivo 💵';
  } else if (payment === 'transferencia') {
    paymentText = 'Pago pendiente por transferencia 💳';
    if (bankInfo) {
      paymentText += `\n🏦 Información bancaria: ${bankInfo}`;
    }
  }
  
  const message = `🛎️ ¡Nuevo pedido recibido!\n\n📍 Nombre: ${name}\n🏠 Dirección: ${apartment}\n${phoneLine}\n🧺 Pedido:\n${orderList}\n\n💰 Total: $${total} MXN\n💳 Pago: ${paymentText}\n\n¡Gracias por elegir Alo! Coffee & Bakery ☕🥐`;
  try {
    await sendWhatsAppMessage(process.env.ALONDRA_WORK_PHONE_NUMBER!, message);
    logger.info('Cash order WhatsApp notification sent');
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Failed to send WhatsApp message for cash order');
    return NextResponse.json({ error: 'Error sending WhatsApp message' }, { status: 500 });
  }
}
