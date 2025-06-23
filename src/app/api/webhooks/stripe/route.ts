import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import logger from '@/lib/logger';

async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_ID}/messages`;
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

export async function POST(req: NextRequest) {
  logger.info('Received Stripe webhook POST request');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
  });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    logger.info({ eventType: event.type }, 'Stripe event received');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    logger.error({ err }, 'Stripe webhook signature verification failed');
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { name, apartment, order } = session.metadata!;
    const total = session.amount_total! / 100;
    const orderList = JSON.parse(order).join(', ');
    const message = `🛎️ ¡Nuevo pedido pagado!\n\n📍 Nombre: ${name}\n🏠 Dirección: ${apartment}\n\n🧺 Pedido: ${orderList}\n\n💰 Total: $${total} MXN\n💳 Pago: Pagado en línea\n\n¡Gracias por elegir Alo! Coffee & Bakery ☕🥐`;
    try {
      await sendWhatsAppMessage(process.env.ALONDRA_PHONE_NUMBER!, message);
      logger.info('Stripe order WhatsApp notification sent');
    } catch (error) {
      logger.error({ error }, 'Failed to send WhatsApp message for Stripe order');
    }
  }
  return NextResponse.json({ received: true });
} 