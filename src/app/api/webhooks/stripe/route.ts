import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
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

// Helper function to get addon details with prices
function getAddonDetails(addons: string[], addonPrices: { [key: string]: number } = {}): string {
  if (!addons || addons.length === 0) return '';
  return addons.map(addon => {
    const price = addonPrices[addon] || 0;
    const label = addon.replace(/_/g, ' ');
    return `${label}${price > 0 ? ` (+$${price})` : ''}`;
  }).join(', ');
}

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
  return res.json();
}

export async function POST(req: NextRequest) {
  logger.info('Received Stripe webhook POST request');
  logger.info('Request headers', Object.fromEntries(req.headers.entries()));
  const rawBody = await req.text();
  logger.info('Raw request body', rawBody);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const payload = rawBody;
  const signature = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    logger.info({ eventType: event.type, event }, 'Stripe event received');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    logger.error({ err, rawBody, signature }, 'Stripe webhook signature verification failed');
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    logger.info('Stripe session metadata', session.metadata);
    const { name, apartment, order, phone } = session.metadata!;
    const total = session.amount_total! / 100;
    const orderList = JSON.parse(order).join(', ');
    const phoneLine = phone ? `\n📱 Teléfono del cliente: ${phone}\n💬 WhatsApp: https://wa.me/${phone.replace(/[^\d]/g, '')}` : '';
    const message = `🛎️ ¡Nuevo pedido pagado!\n\n📍 Nombre: ${name}\n🏠 Dirección: ${apartment}${phoneLine}\n\n🧺 Pedido: ${orderList}\n\n💰 Total: $${total} MXN\n💳 Pago: Pagado en línea\n\n¡Gracias por elegir Alo! Coffee & Bakery ☕🥐`;
    try {
      const waRes = await sendWhatsAppMessage(process.env.ALONDRA_WORK_PHONE_NUMBER!, message);
      logger.info('WhatsApp API response', waRes);
      logger.info('Stripe order WhatsApp notification sent');
    } catch (error) {
      logger.error({ error }, 'Failed to send WhatsApp message for Stripe order');
    }
  }
  return NextResponse.json({ received: true });
} 