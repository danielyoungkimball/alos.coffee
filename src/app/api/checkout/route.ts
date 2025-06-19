import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(req: NextRequest) {
  const { cart, name, apartment } = await req.json();

  try {
    const line_items = cart.map((item: any) => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Price in cents
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/`,
      metadata: {
        name,
        apartment,
        order: JSON.stringify(cart.map((i: any) => `${i.qty} x ${i.name}`)),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
} 