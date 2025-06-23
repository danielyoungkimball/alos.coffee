import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
  });
  
  const { cart, name, apartment }: { cart: CartItem[], name: string, apartment: string } = await req.json();

  try {
    const line_items = cart.map((item: CartItem) => ({
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
        order: JSON.stringify(cart.map((i: CartItem) => `${i.qty} x ${i.name}`)),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred.';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
} 