"use client";
import { useState, useRef } from "react";
import { loadStripe } from '@stripe/stripe-js';
import clientLogger from '@/lib/clientLogger';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MENU = [
  {
    category: "Bebidas 16 oz",
    groups: [
      {
        name: "Frío o Caliente",
        items: [
          { id: 1, name: "☕ Americano", price: 60 },
          { id: 2, name: "☕ Cappuchino", price: 65 },
          { id: 3, name: "☕ Moka", price: 90 },
          { id: 4, name: "☕ Latte", price: 80 },
          { id: 5, name: "🍮 Caramel Latte", price: 95 },
          { id: 6, name: "🍦 Vainilla Latte", price: 95 },
          { id: 7, name: "🌰 Avellana Latte", price: 95 },
          { id: 8, name: "🍵 Matcha Latte", price: 100 },
          { id: 9, name: "🍵 Chai Latte", price: 90 },
          { id: 10, name: "🍫 Chocolate", price: 80 },
        ],
      },
      {
        name: "Jugos",
        items: [
          { id: 11, name: "🍊 Naranja", price: 60 },
          { id: 12, name: "🥤 Verde", price: 80, description: "(Jugo de naranja, nopal, espinaca, apio, piña)" },
          { id: 13, name: "🥕 Zanahoria", price: 60 },
        ],
      },
    ],
  },
  {
    category: "Alimentos",
    groups: [
      {
        name: "Repostería",
        items: [
          { id: 14, name: "🍰 Postre de la semana", price: 0, description: "(Preguntar por disponibilidad)" },
          { id: 15, name: "🥞 Crepas de avena", price: 75, description: "Nutella, cajeta, lechera, mermelada de fresa o zarzamora, queso crema, fresa, plátano, durazno, nuez, almendra" },
          { id: 16, name: "🥞 Hot Cakes de avena", price: 65, description: "Con miel y mantequilla" },
          { id: 17, name: "🥪 Mini Sandwich de manzana", price: 65, description: "Con lechera y granola" },
          { id: 18, name: "🍞 Pan francés", price: 130, description: "Con frutos rojos y crema batida" },
          { id: 19, name: "🍓 Fresas con crema", price: 85, description: "Con lechera y topping (chispas de chocolate, ajonjolí caramelizado, nuez, almendra, coco rallado)" },
          { id: 20, name: "🧇 Marquesitas", price: 60, description: "Con queso de bola" },
        ],
      },
    ],
  },
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [payment, setPayment] = useState("stripe");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("MX");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const addBtnRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

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

  function validatePhone(phone: string) {
    if (country === "MX") {
      return /^\+?52\d{10}$/.test(phone.replace(/\D/g, ""));
    } else {
      return /^\+?1\d{10}$/.test(phone.replace(/\D/g, ""));
    }
  }

  function validateAddress(address: string) {
    return address.length >= 5;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(e.target.value);
    let formattedPhone = e.target.value.replace(/\D/g, "");
    if (country === "MX" && !formattedPhone.startsWith("52")) formattedPhone = "52" + formattedPhone;
    if (country === "US" && !formattedPhone.startsWith("1")) formattedPhone = "1" + formattedPhone;
    if (!validatePhone(formattedPhone)) {
      setPhoneError(country === "MX" ? "El número debe tener 10 dígitos para México" : "Phone number must be 10 digits for US");
    } else {
      setPhoneError("");
    }
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setApartment(e.target.value);
    if (!validateAddress(e.target.value)) {
      setAddressError("Por favor ingresa una dirección válida (mínimo 5 caracteres)");
    } else {
      setAddressError("");
    }
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhoneError("");
    setAddressError("");
    let valid = true;
    let formattedPhone = phone.replace(/\D/g, "");
    if (country === "MX" && !formattedPhone.startsWith("52")) formattedPhone = "52" + formattedPhone;
    if (country === "US" && !formattedPhone.startsWith("1")) formattedPhone = "1" + formattedPhone;
    if (!validatePhone(formattedPhone)) {
      setPhoneError("Por favor ingresa un número válido (10 dígitos) para " + (country === "MX" ? "México" : "EE.UU."));
      valid = false;
    }
    if (!validateAddress(apartment)) {
      setAddressError("Por favor ingresa una dirección válida (mínimo 5 caracteres)");
      valid = false;
    }
    if (!valid) return;
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
        setCartDrawerOpen(false);
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

  function handleAddToCart(item: { id: number; name: string; price: number }) {
    addToCart(item);
    const btn = addBtnRefs.current[item.id];
    if (btn) {
      btn.classList.remove("animate-bounce");
      void btn.offsetWidth;
      btn.classList.add("animate-bounce");
    }
  }

  return (
    <div className="bg-parchment min-h-screen text-richBlack font-nunito">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 md:p-6 bg-richBlack text-parchment font-sansita">
        <h1 className="text-2xl md:text-3xl font-bold">Alo! Coffee and Bakery</h1>
        <button onClick={() => setCartDrawerOpen((v) => { clientLogger.info('Toggle cart', !v); return !v; })} className="relative bg-white rounded-full shadow-md p-3 hover:scale-105 transition-transform focus:outline-none">
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-2 text-xs font-bold border-2 border-white shadow">{cart.reduce((a, b) => a + b.qty, 0)}</span>
          )}
        </button>
      </nav>
    
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] text-center p-4 md:p-8">
        <h2 className="text-3xl md:text-5xl font-sansita font-bold mb-4 text-espresso">Menú</h2>
        <div className="space-y-10 w-full max-w-3xl">
          {MENU.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl md:text-3xl font-sansita font-bold mb-4 text-espresso">{section.category}</h2>
              {section.groups.map((group) => (
                <div key={group.name} className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-espresso">{group.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {group.items.map(item => (
            <div key={item.id} className="menu-card flex flex-col items-center">
                        <span className="font-bold text-lg mb-1 text-espresso">{item.name}</span>
                        {item.description && <span className="text-xs text-gray-600 mb-1 text-center">{item.description}</span>}
                        <span className="mb-2 font-semibold text-black">{item.price > 0 ? `$${item.price} MXN` : item.description}</span>
                        <button
                          ref={el => { addBtnRefs.current[item.id] = el; }}
                          onClick={e => {
                            handleAddToCart(item);
                            e.currentTarget.classList.remove('animate-bounce');
                            void e.currentTarget.offsetWidth;
                            e.currentTarget.classList.add('animate-bounce');
                          }}
                          className="px-3 py-1 bg-teal text-black rounded hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-espresso"
                        >Agregar</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {cartDrawerOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setCartDrawerOpen(false)} />
            <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="relative h-full flex flex-col p-6">
                <button onClick={() => setCartDrawerOpen(false)} className="absolute top-4 right-4 text-2xl">✕</button>
              <h3 className="text-xl font-bold mb-4">Tu Carrito</h3>
              {cart.length === 0 ? (
                <p>El carrito está vacío.</p>
              ) : (
                  <ul className="mb-4 flex-1 overflow-y-auto text-black">
                  {cart.map(item => (
                      <li key={item.id} className="flex justify-between items-center mb-2 text-black">
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
                  <input value={name} onChange={e => setName(e.target.value)} required className="p-2 rounded border border-gray-300 text-black bg-white placeholder-gray-400" placeholder="Tu nombre" />
                  <input value={apartment} onChange={handleAddressChange} required className={`p-2 rounded border ${addressError ? 'border-red-500' : 'border-gray-300'} text-black bg-white placeholder-gray-400`} placeholder="Apartamento / Cuarto" />
                  {addressError && <span className="text-red-500 text-xs mb-1">{addressError}</span>}
                  <div className="flex gap-2 items-center">
                    <select value={country} onChange={e => setCountry(e.target.value)} className="p-2 rounded border border-gray-300 bg-white text-black">
                      <option value="MX">🇲🇽 +52</option>
                      <option value="US">🇺🇸 +1</option>
                    </select>
                    <input
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      className={`flex-1 p-2 rounded border ${phoneError ? 'border-red-500' : 'border-gray-300'} text-black bg-white placeholder-gray-400`}
                      placeholder={country === 'MX' ? '10 dígitos (México)' : '10 digits (US)'}
                      maxLength={15}
                    />
                  </div>
                  {phoneError && <span className="text-red-500 text-xs mb-1">{phoneError}</span>}
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="payment" value="stripe" checked={payment === "stripe"} onChange={() => { setPayment("stripe"); clientLogger.info('Payment method selected', 'stripe'); }} /> Pago en línea
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="payment" value="cash" checked={payment === "cash"} onChange={() => { setPayment("cash"); clientLogger.info('Payment method selected', 'cash'); }} /> Efectivo
                  </label>
                </div>
                <button type="submit" className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-lg shadow hover:bg-green-700 transition-colors w-full">Checkout</button>
              </form>
            </div>
            </aside>
          </>
        )}
      </section>
    </div>
  );
}
