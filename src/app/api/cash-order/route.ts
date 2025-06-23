import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

type CartItem = { id: number; name: string; price: number; qty: number };

async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`;
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
      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
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

export async function POST(req: Request) {
  logger.info('Received cash order POST request');
  const { cart, name, apartment, phone } = await req.json();
  logger.info({ cart, name, apartment, phone }, 'Cash order details');
  const total = (cart as CartItem[]).reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderList = (cart as CartItem[]).map((item) => `${item.qty}x ${item.name} - $${item.price * item.qty} MXN`).join('\n');
  const phoneLine = phone ? `\n📱 Teléfono del cliente: ${phone}\n💬 WhatsApp: https://wa.me/${phone.replace(/[^\d]/g, '')}` : '';
  const message = `🛎️ ¡Nuevo pedido recibido!\n\n📍 Nombre: ${name}\n🏠 Dirección: ${apartment}\n${phoneLine}\n🧺 Pedido:\n${orderList}\n\n💰 Total: $${total} MXN\n💳 Pago: Pago pendiente en efectivo 💵\n\n¡Gracias por elegir Alo! Coffee & Bakery ☕🥐`;
  try {
    await sendWhatsAppMessage(process.env.ALONDRA_PHONE_NUMBER!, message);
    logger.info('Cash order WhatsApp notification sent');
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Failed to send WhatsApp message for cash order');
    return NextResponse.json({ error: 'Error sending WhatsApp message' }, { status: 500 });
  }
}
