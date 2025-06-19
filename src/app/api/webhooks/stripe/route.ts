import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Twilio } from 'twilio';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Initialize Twilio
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { name, apartment, order } = session.metadata!;

    const messageBody = `
      Nuevo Pedido Pagado ✨\n
      Nombre: ${name}\n
      Apartamento: ${apartment}\n
      Pedido: ${JSON.parse(order).join(', ')}\n
      Total: $${session.amount_total! / 100} MXN
    `;

    try {
      await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${process.env.ALONDRA_PHONE_NUMBER}`,
        body: messageBody,
      });
      console.log('WhatsApp message sent successfully.');
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      // Even if WhatsApp fails, we return a 200 to Stripe so it doesn't retry.
      // The error is logged for debugging.
    }
  }

  return NextResponse.json({ received: true });
} 