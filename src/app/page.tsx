"use client";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import clientLogger from '@/lib/clientLogger';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MENU = [
  { id: 1, name: "Espresso", price: 40 },
  { id: 2, name: "Americano", price: 45 },
  { id: 3, name: "Cappuccino", price: 50 },
  { id: 4, name: "Latte", price: 50 },
  { id: 5, name: "Mocha", price: 55 },
  { id: 6, name: "Croissant", price: 35 },
  { id: 7, name: "Pan de Chocolate", price: 40 },
  { id: 8, name: "Muffin", price: 30 },
  { id: 9, name: "Concha", price: 25 },
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [payment, setPayment] = useState("stripe");
  const [phone, setPhone] = useState("");

  function addToCart(item: { id: number; name: string; price: number }) {
    clientLogger.info('Add to cart', item);
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  }

  function removeFromCart(id: number) {
    clientLogger.info('Remove from cart', id);
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: number, qty: number) {
    clientLogger.info('Update quantity', { id, qty });
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clientLogger.info('Checkout submitted', { name, apartment, cart, payment, phone });
    if (!name || !apartment || cart.length === 0) {
      clientLogger.warn('Checkout validation failed', { name, apartment, cart });
      alert("Por favor llena tu nombre, apartamento y agrega productos al carrito.");
      return;
    }

    if (payment === 'cash') {
      try {
        const response = await fetch('/api/cash-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, name, apartment, phone }),
        });
        if (!response.ok) throw new Error('No se pudo enviar el pedido.');
        clientLogger.info('Cash order sent successfully');
        alert('¡Pedido enviado! Alondra ha sido notificada por WhatsApp.');
        setCart([]);
        setShowCart(false);
      } catch (error) {
        clientLogger.error('Error sending cash order', error);
        alert('Hubo un error al enviar el pedido. Intenta de nuevo.');
      }
      return;
    }

    // Stripe checkout
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, name, apartment }),
      });

      const { sessionId } = await response.json();
      if (!sessionId) {
        clientLogger.error('Failed to create Stripe session');
        throw new Error('Failed to create Stripe session');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        clientLogger.error('Stripe.js not loaded');
        throw new Error('Stripe.js not loaded');
      }
      clientLogger.info('Redirecting to Stripe checkout', { sessionId });
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      clientLogger.error('Stripe checkout error', error);
      alert("Hubo un error al procesar el pago. Por favor, intenta de nuevo.");
    }
  }

  return (
    <div className="bg-parchment min-h-screen text-richBlack font-nunito">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 md:p-6 bg-richBlack text-parchment font-sansita">
        <h1 className="text-2xl md:text-3xl font-bold">Alo! Coffee and Bakery</h1>
        <button onClick={() => setShowCart((v) => { clientLogger.info('Toggle cart', !v); return !v; })} className="relative">
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-teal text-parchment rounded-full px-2 text-xs">{cart.reduce((a, b) => a + b.qty, 0)}</span>
          )}
        </button>
      </nav>
    
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] text-center p-4 md:p-8">
        <h2 className="text-3xl md:text-5xl font-sansita font-bold mb-4 text-espresso">Menú</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {MENU.map(item => (
            <div key={item.id} className="menu-card flex flex-col items-center">
              <span className="font-bold text-lg mb-1">{item.name}</span>
              <span className="text-cambridgeBlue mb-2 font-semibold">${item.price} MXN</span>
              <button onClick={() => addToCart(item)} className="px-3 py-1 bg-teal text-parchment rounded hover:bg-accent transition-colors">Agregar</button>
            </div>
          ))}
        </div>
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button onClick={() => setShowCart(false)} className="absolute top-2 right-2 text-xl">✕</button>
              <h3 className="text-xl font-bold mb-4">Tu Carrito</h3>
              {cart.length === 0 ? (
                <p>El carrito está vacío.</p>
              ) : (
                <ul className="mb-4">
                  {cart.map(item => (
                    <li key={item.id} className="flex justify-between items-center mb-2">
                      <span>{item.qty} x {item.name}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="px-2">-</button>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2">+</button>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleCheckout} className="flex flex-col gap-3">
                <input value={name} onChange={e => setName(e.target.value)} required className="p-2 rounded border border-gray-300" placeholder="Tu nombre" />
                <input value={apartment} onChange={e => setApartment(e.target.value)} required className="p-2 rounded border border-gray-300" placeholder="Apartamento / Cuarto" />
                <input value={phone} onChange={e => setPhone(e.target.value)} required className="p-2 rounded border border-gray-300" placeholder="Tu teléfono (WhatsApp)" />
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="payment" value="stripe" checked={payment === "stripe"} onChange={() => { setPayment("stripe"); clientLogger.info('Payment method selected', 'stripe'); }} /> Pago en línea
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="payment" value="cash" checked={payment === "cash"} onChange={() => { setPayment("cash"); clientLogger.info('Payment method selected', 'cash'); }} /> Efectivo
                  </label>
                </div>
                <button type="submit" className="mt-2 px-4 py-2 bg-teal text-parchment rounded font-bold hover:bg-ashGray transition-colors w-full">Finalizar pedido</button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
