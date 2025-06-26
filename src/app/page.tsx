"use client";
import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import clientLogger from '@/lib/clientLogger';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { ALL_ADDONS, AddonKey, DRINK_ADDON_KEYS, CREPE_TOPPING_KEYS, FRESAS_TOPPING_KEYS } from '@/lib/addons';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const VERIFIED_WHATSAPP = process.env.VERIFIED_WHATSAPP === 'true';

// Update MENU to use these keys
const MENU = [
  {
    category: "Bebidas 16 oz",
    groups: [
      {
        name: "Café",
        items: [
          { id: 1, name: "☕ Americano", price: 60, image: "/menu-items/americano.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 2, name: "☕ Cappuchino", price: 65, image: "/menu-items/cappuchino.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 3, name: "☕ Moka", price: 90, image: "/menu-items/moka.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 4, name: "☕ Latte", price: 80, image: "/menu-items/latte.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 5, name: "🍮 Caramel Latte", price: 95, image: "/menu-items/caramel-latte.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 6, name: "🍦 Vainilla Latte", price: 95, image: "/menu-items/vainilla-latte.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 7, name: "🌰 Avellana Latte", price: 95, image: "/menu-items/avellana-latte.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 8, name: "🍵 Matcha Latte", price: 100, image: "/menu-items/matcha-latte.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 9, name: "🍵 Chai Latte", price: 90, image: "/menu-items/chai-latte.png", possibleAddons: DRINK_ADDON_KEYS },
          { id: 10, name: "🍫 Chocolate", price: 80, image: "/menu-items/chocolate.png", possibleAddons: DRINK_ADDON_KEYS },
        ],
      },
      {
        name: "Jugos",
        items: [
          { id: 11, name: "🍊 Naranja", price: 60, image: "/menu-items/naranja.png" },
          { id: 12, name: "🥤 Verde", price: 80, description: "(Jugo de naranja, nopal, espinaca, apio, piña)", image: "/menu-items/verde.png" },
          { id: 13, name: "🥕 Zanahoria", price: 60, image: "/menu-items/zanahoria.png" },
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
          { id: 14, name: "🍰 Postre de la semana", price: 0, description: "(Preguntar por disponibilidad)" }, // image: "/menu-items/postre-semana.png"
          { id: 15, name: "🥞 Crepas de avena", price: 75, description: "Dos toppings a elegir", possibleAddons: CREPE_TOPPING_KEYS }, //image: "/menu-items/crepas-avena.png",
          { id: 16, name: "🥞 Hot Cakes de avena", price: 65, description: "Con miel y mantequilla", possibleAddons: ['frutas'] }, //image: "/menu-items/hot-cakes-avena.png"
          { id: 17, name: "🧇 Marquesitas", price: 60, description: "Con Queso de Bola y\nuno topping a elegir", possibleAddons: CREPE_TOPPING_KEYS }, //image: "/menu-items/marquesitas.png", 
          { id: 18, name: "🥪 Mini Sandwich de manzana", price: 65, description: "Con lechera y granola" }, //image: "/menu-items/mini-sandwich-manzana.png"
          { id: 19, name: "🍞 Pan francés", price: 130, description: "Con frutos rojos y crema batida" }, //image: "/menu-items/pan-frances.png"
          { id: 20, name: "🍓 Fresas con crema", price: 85, description: "Con lechera y dos toppings", possibleAddons: FRESAS_TOPPING_KEYS }, //image: "/menu-items/fresas-crema.png",

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
  options?: {
    hotCold?: string;
    size?: string;
    addons?: string[];
    notes?: string;
  };
  addonPrices?: { [key: string]: number };
  totalPrice?: number;
};

// Update MenuItem type
type MenuItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  possibleAddons?: AddonKey[];
};

// Helper function to get addon price
function getAddonPrice(value: string): number {
  return ALL_ADDONS[value]?.price || 0;
}

// Helper function to calculate total price with addons
function calculateTotalPrice(basePrice: number, addons: string[], itemName?: string): number {
  // Special pricing for crepes: first 2 toppings free
  if (itemName && (itemName.toLowerCase().includes('crepa') || itemName.toLowerCase().includes('fresas con crema'))) {
    if (addons.length <= 2) {
      return basePrice; // First 2 toppings are free
    } else {
      // Charge for toppings beyond the first 2
      const paidAddons = addons.slice(2);
      const addonTotal = paidAddons.reduce((sum, addon) => sum + getAddonPrice(addon), 0);
      return basePrice + addonTotal;
    }
  } else if (itemName && itemName.toLowerCase().includes('marquesita')) {
    if (addons.length <= 1) {
      return basePrice; // First 1 topping is free
    } else {
      // Charge for toppings beyond the first 1
      const paidAddons = addons.slice(1);
      const addonTotal = paidAddons.reduce((sum, addon) => sum + getAddonPrice(addon), 0);
      return basePrice + addonTotal;
    }
  }

  // Regular pricing for other items
  const addonTotal = addons.reduce((sum, addon) => sum + getAddonPrice(addon), 0);
  return basePrice + addonTotal;
}

// Helper function to get addon details with prices (updated for special pricing)
function getAddonDetails(addons: string[], itemName?: string): { label: string; price: number }[] {
  // Special pricing for crepes, fresas con crema: first 2 toppings free
  if (itemName && (itemName.toLowerCase().includes('crepa') || itemName.toLowerCase().includes('fresas con crema'))) {
    return addons.map((value, index) => {
      const addon = ALL_ADDONS[String(value)];
      const price = index < 2 ? 0 : (addon?.price || 0); // First 2 are free
      return {
        label: addon?.label || String(value).replace(/_/g, ' '),
        price: price
      };
    });
  }
  // Regular pricing for other items
  return addons.map(value => {
    const addon = ALL_ADDONS[String(value)];
    return {
      label: addon?.label || String(value).replace(/_/g, ' '),
      price: addon?.price || 0
    };
  });
}

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
  const [showWhatsAppMsg, setShowWhatsAppMsg] = useState(false);
  const [waMsg, setWaMsg] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const router = useRouter();
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customOptions, setCustomOptions] = useState({ hotCold: '', size: '', addons: [] as string[], notes: '' });

  function addToCart(item: { id: number; name: string; price: number; options?: { hotCold?: string; size?: string; addons?: string[]; notes?: string } }) {
    clientLogger.info('Add to cart', item);

    // Calculate addon prices and total
    const addons = item.options?.addons || [];
    const addonPrices: { [key: string]: number } = {};

    // Special pricing for crepes 
    if (item.name.toLowerCase().includes('crepa') || item.name.toLowerCase().includes('fresas con crema')) {
      addons.forEach((addon, index) => {
        // First 2 toppings are free, charge for additional ones
        addonPrices[addon] = index < 2 ? 0 : getAddonPrice(addon);
      });
    } else if (item.name.toLowerCase().includes('marquesitas')) {
      addons.forEach((addon, index) => {
        // First 1 topping is free, charge for additional ones
        addonPrices[addon] = index < 1 ? 0 : getAddonPrice(addon);
      });
    } else {
      // Regular pricing for other items
      addons.forEach(addon => {
        addonPrices[addon] = getAddonPrice(addon);
      });
    }

    const totalPrice = calculateTotalPrice(item.price, addons, item.name);

    const cartItem: CartItem = {
      ...item,
      qty: 1,
      addonPrices,
      totalPrice
    };

    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options));
      if (found) {
        return prev.map((i) => (i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options)) ? { ...i, qty: i.qty + 1 } : i);
      } else {
        return [...prev, cartItem];
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

    if (!VERIFIED_WHATSAPP) {
      // Only allow cash, format WhatsApp message
      const total = cart.reduce((sum, item) => sum + (item.totalPrice || item.price) * item.qty, 0);
      const orderList = cart.map((item) => {
        let details = '';
        if (item.options) {
          if (item.options.hotCold) details += ` (${item.options.hotCold})`;
          if (item.options.size && item.options.size !== '') details += ` [${item.options.size}]`;
          if (item.options.addons && item.options.addons.length > 0) {
            const addonDetails = getAddonDetails(item.options.addons, item.name);
            details += `\n  + ${addonDetails.map(addon =>
              `${addon.label}${addon.price > 0 ? ` (+$${addon.price})` : ''}`
            ).join(', ')}`;
          }
          if (item.options.notes) details += `\n  Nota: ${item.options.notes}`;
        }
        return `${item.qty}x ${item.name}${details} - $${(item.totalPrice || item.price) * item.qty} MXN`;
      }).join('\n');
      const phoneLine = phone ? `\n📱 Teléfono del cliente: ${phone}\n💬 WhatsApp: https://wa.me/${formattedPhone}` : '';

      // Determine payment method text
      let paymentText = '';
      if (payment === 'cash') {
        paymentText = 'Pago pendiente en efectivo 💵';
      } else if (payment === 'transferencia') {
        paymentText = 'Pago pendiente por transferencia 💳';
        if (bankInfo) {
          paymentText += `\n🏦 Información bancaria: ${bankInfo}`;
        }
      }

      const message = `🛎️ ¡Nuevo pedido recibido!\n\n📍 Nombre: ${name}\n🏠 Dirección: ${apartment}${phoneLine}\n🧺 Pedido:\n${orderList}\n\n💰 Total: $${total} MXN\n💳 Pago: ${paymentText}\n\n¡Gracias por elegir Alo! Coffee & Bakery ☕🥐`;
      setWaMsg(message);
      setShowWhatsAppMsg(true);
      setCart([]);
      setCartDrawerOpen(false);
      return;
    }

    if (payment === 'cash') {
      try {
        const response = await fetch('/api/cash-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, name, apartment, phone, payment, bankInfo }),
        });
        if (!response.ok) throw new Error('No se pudo enviar el pedido.');
        clientLogger.info('Cash order sent successfully');
        setCart([]);
        setCartDrawerOpen(false);
        router.push('/success');
      } catch (error) {
        clientLogger.error('Error sending cash order', error);
        alert('Hubo un error al enviar el pedido. Intenta de nuevo.');
      }
      return;
    }

    if (payment === 'transferencia') {
      try {
        const response = await fetch('/api/cash-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, name, apartment, phone, payment, bankInfo }),
        });
        if (!response.ok) throw new Error('No se pudo enviar el pedido.');
        clientLogger.info('Transfer order sent successfully');
        setCart([]);
        setCartDrawerOpen(false);
        router.push('/success');
      } catch (error) {
        clientLogger.error('Error sending transfer order', error);
        alert('Hubo un error al enviar el pedido. Intenta de nuevo.');
      }
      return;
    }

    // Stripe checkout
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, name, apartment, phone }),
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

  function openCustomizeModal(item: MenuItem) {
    // Default hot/cold for drinks, toppings for crepes, etc.
    let hotCold = '';
    let size = '';

    // Check if it's a drink (has hot/cold option)
    if (item.name.toLowerCase().includes('latte') || item.name.toLowerCase().includes('americano') || item.name.toLowerCase().includes('cappuchino') || item.name.toLowerCase().includes('moka') || item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('matcha') || item.name.toLowerCase().includes('chocolate')) {
      hotCold = 'caliente';
      size = '16oz'; // Set size for drinks
    }
    // For food items, size remains empty string

    setCustomOptions({ hotCold, size, addons: [], notes: '' });
    setCustomizingItem(item);
  }

  function handleAddonToggle(value: string, limit?: number) {
    setCustomOptions((opts) => {
      let newAddons = opts.addons.includes(value)
        ? opts.addons.filter((a) => a !== value)
        : [...opts.addons, value];
      if (limit && newAddons.length > limit) newAddons = newAddons.slice(1);
      return { ...opts, addons: newAddons };
    });
  }

  function finalizeAddToCart() {
    if (customizingItem) {
      addToCart({ ...customizingItem, options: { ...customOptions } });
      setCustomizingItem(null);
    }
  }

  return (
    <div className="bg-parchment min-h-screen text-black font-nunito relative z-10 overflow-hidden">
      {/* Alo! Banner background - responsive for web and mobile */}
      {/* <div className="absolute top-0 left-0 w-full h-40 md:h-[30vw] lg:h-[22vw] z-0 pointer-events-none flex justify-center">
        <img
          src="/alo-banner.png"
          alt="Alo! Banner"
          className="w-full h-full object-cover opacity-10"
        />
      </div> */}
      {/* Hero/Menu Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] text-center p-4 md:p-8">
        <h2 className="text-3xl md:text-5xl font-sansita font-bold mb-4 text-verde">Menú</h2>
        <div className="space-y-10 w-full max-w-3xl">
          {MENU.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl md:text-3xl font-sansita font-bold mb-4 text-verde">{section.category}</h2>
              {section.groups.map((group) => (
                <div key={group.name} className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-verde">{group.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {group.items.map(item => {
                      const menuItem = item as MenuItem;
                      return (
                        <div key={menuItem.id} className="bg-white rounded-xl shadow-lg flex flex-col items-center p-2 relative aspect-square group hover:shadow-2xl transition-all">
                          {menuItem.image && (
                            <div className="w-full h-32 md:h-40 flex items-center justify-center overflow-hidden rounded-lg">
                              <Image src={menuItem.image} alt={menuItem.name} width={200} height={200} className="object-cover w-full h-full" />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-between w-full items-center mt-2">
                            <span className="font-bold text-lg text-verde text-center">{menuItem.name.replace(/^[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+/, '')}</span>
                            <span className="font-semibold text-black text-center">${menuItem.price} MXN</span>
                          </div>
                          <button
                            onClick={() => openCustomizeModal(menuItem)}
                            className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-2xl shadow-lg border-2 border-white transition-all"
                            aria-label={`Agregar ${menuItem.name}`}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {cart.length > 0 && !cartDrawerOpen && (
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md bg-green-600 text-white rounded-full font-bold text-lg py-4 shadow-lg md:left-auto md:right-8 md:translate-x-0 md:w-auto md:px-8 md:py-4 md:rounded-full md:bottom-8"
            style={{ minWidth: '180px' }}
          >
            Ver Carrito ({cart.reduce((a, b) => a + b.qty, 0)})
          </button>
        )}
        {cartDrawerOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setCartDrawerOpen(false)} />
            <aside className="fixed md:top-0 md:right-0 md:h-full md:w-full md:max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 bottom-0 left-0 w-full h-[80vh] rounded-t-2xl md:rounded-none md:bottom-auto md:left-auto md:rounded-none " style={{ transform: cartDrawerOpen ? 'translateY(0)' : 'translateY(100%)' }}>
              <div className="relative h-full flex flex-col p-6">
                <button onClick={() => setCartDrawerOpen(false)} className="absolute top-4 right-4 text-2xl">✕</button>
                <h3 className="text-xl font-bold mb-4">Tu Carrito</h3>
                {cart.length === 0 ? (
                  <p>El carrito está vacío.</p>
                ) : (
                  <>
                    <ul className="mb-4 flex-1 overflow-y-auto text-black">
                      {cart.map(item => {
                        const isSpecialToppingItem = ["crepa", "fresas con crema", "marquesita"].some(keyword => item.name.toLowerCase().includes(keyword));
                        return (
                          <li key={item.id + JSON.stringify(item.options)} className="flex flex-col gap-1 mb-4 pb-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-lg flex items-center gap-2">
                                {item.qty} x {item.name}
                              </span>
                              <span className="font-bold text-verde text-lg">${item.totalPrice || item.price} MXN</span>
                            </div>
                            <div className="flex flex-col ml-2 mt-1 gap-1">
                              <span className="text-xs text-gray-500">Base: ${item.price} {item.totalPrice && item.totalPrice > item.price && (<>&nbsp;Add-ons: ${item.totalPrice - item.price}</>)}</span>
                              {item.options?.hotCold && <span className="text-sm">• {item.options.hotCold === 'frio' ? 'Frío' : 'Caliente'}</span>}
                              {item.options?.size && item.options.size !== '' && <span className="text-sm">• Tamaño: {item.options.size}</span>}
                              {item.options?.addons && item.options.addons.length > 0 && (
                                <div className="text-sm flex flex-col gap-0.5 mt-1">
                                  <span className="font-semibold">• Add-ons:</span>
                                  {isSpecialToppingItem && (
                                    <span className="text-xs text-gray-500">Primeros 2 toppings gratis, después se cobra cada uno.</span>
                                  )}
                                  <ul className="ml-4 list-disc">
                                    {getAddonDetails(item.options.addons ?? [], item.name).map((addon, idx) => {
                                      const key = item.options?.addons?.[idx];
                                      const price = key ? item.addonPrices?.[String(key)] || 0 : 0;
                                      return (
                                        <li key={addon.label} className="flex justify-between text-xs">
                                          <span>{addon.label}</span>
                                          {isSpecialToppingItem
                                            ? (idx >= 2 && price > 0 && <span className="text-gray-500 ml-2">+${price}</span>)
                                            : (price > 0 && <span className="text-gray-500 ml-2">+${price}</span>)}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                              {item.options?.notes && <span className="text-xs text-gray-700">• Nota: {item.options.notes}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="px-2">-</button>
                              <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2">+</button>
                              <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-semibold">Eliminar</button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="border-t pt-3 mb-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-verde">${cart.reduce((sum, item) => sum + (item.totalPrice || item.price) * item.qty, 0)} MXN</span>
                      </div>
                    </div>
                  </>
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
                    {/* Only show Stripe if VERIFIED_WHATTSAPP is true */}
                    {VERIFIED_WHATSAPP && (
                      <label className="flex items-center gap-1">
                        <input type="radio" name="payment" value="stripe" checked={payment === "stripe"} onChange={() => { setPayment("stripe"); clientLogger.info('Payment method selected', 'stripe'); }} /> Pago en línea
                      </label>
                    )}
                    <label className="flex items-center gap-1">
                      <input type="radio" name="payment" value="cash" checked={payment === "cash"} onChange={() => { setPayment("cash"); clientLogger.info('Payment method selected', 'cash'); }} /> Efectivo
                      <input type="radio" name="payment" value="transferencia" checked={payment === "transferencia"} onChange={() => { setPayment("transferencia"); clientLogger.info('Payment method selected', 'transferencia'); }} /> Transferencia
                    </label>
                  </div>
                  {payment === "transferencia" && (
                    <div className="mb-2">
                      <input
                        value={bankInfo}
                        onChange={e => setBankInfo(e.target.value)}
                        className="w-full p-2 rounded border border-gray-300 text-black bg-white placeholder-gray-400"
                        placeholder="Información bancaria (opcional)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Puedes incluir tu información bancaria o dejar en blanco para usar la información de Alo! Coffee
                      </p>
                    </div>
                  )}
                  <button type="submit" className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-lg shadow hover:bg-green-700 transition-colors w-full">Checkout</button>
                </form>
              </div>
            </aside>
          </>
        )}
      </section>
      {/* WhatsApp message modal */}
      {showWhatsAppMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2 text-verde">¡Casi listo!</h2>
            <p className="mb-4 text-center">Copia este mensaje y envíalo por WhatsApp al <a href="https://wa.me/526242653144" target="_blank" rel="noopener noreferrer" className="underline text-verde">+52 624 265 3144</a> para completar tu pedido:</p>
            <textarea className="w-full p-2 border rounded mb-2 text-xs" rows={6} value={waMsg} readOnly />
            <div className="flex gap-2 w-full">
              <button className="flex-1 bg-green-600 text-white rounded px-4 py-2 font-bold" onClick={() => { navigator.clipboard.writeText(waMsg); }}>Copiar</button>
              <a className="flex-1 bg-verde text-white rounded px-4 py-2 font-bold text-center" href={`https://wa.me/526242653144?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
            </div>
            <button className="mt-4 text-sm underline text-gray-500" onClick={() => setShowWhatsAppMsg(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {/* Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2 text-verde">Personaliza tu pedido</h2>
            <p className="mb-2 text-center font-semibold">{customizingItem.name}</p>
            <p className="mb-2 text-center text-gray-500 font-semibold">{customizingItem.description}</p>
            {customizingItem.image && (
              <Image
                src={customizingItem.image}
                alt={customizingItem.name}
                className="w-full max-w-xs h-32 object-cover rounded-xl mb-2 mx-auto"
                width={100}
                height={100}
              />
            )}
            {/* Hot/Cold for drinks */}
            {customizingItem.name.match(/americano|latte|cappuchino|moka|chai|matcha|chocolate/i) && (
              <div className="mb-2 w-full">
                <label className="block font-semibold mb-1">¿Frío o Caliente?</label>
                <div className="flex gap-2">
                  <button type="button" className={`flex-1 rounded px-2 py-1 border ${customOptions.hotCold === 'caliente' ? 'bg-verde text-white' : 'bg-gray-100'}`} onClick={() => setCustomOptions(o => ({ ...o, hotCold: 'caliente' }))}>Caliente</button>
                  <button type="button" className={`flex-1 rounded px-2 py-1 border ${customOptions.hotCold === 'frio' ? 'bg-verde text-white' : 'bg-gray-100'}`} onClick={() => setCustomOptions(o => ({ ...o, hotCold: 'frio' }))}>Frío</button>
                </div>
              </div>
            )}
            {/* Size (only for drinks) */}
            {customizingItem.name.match(/americano|latte|cappuchino|moka|chai|matcha|chocolate|naranja|verde|zanahoria/i) && (
              <div className="mb-2 w-full">
                <label className="block font-semibold mb-1">Tamaño</label>
                <select className="w-full p-2 border rounded bg-gray-100" value={customOptions.size} disabled>
                  <option value="16oz">16 oz</option>
                </select>
              </div>
            )}
            {/* Add-ons/toppings */}
            {customizingItem.possibleAddons && customizingItem.possibleAddons.length > 0 && (
              <div className="mb-2 w-full">
                <label className="block font-semibold mb-1">Add-ons</label>
                <div className="flex flex-wrap gap-2">
                  {customizingItem.possibleAddons.map(key => {
                    const isSpecialToppingItem = ["crepa", "fresas con crema"].some(keyword =>
                      customizingItem.name.toLowerCase().includes(keyword)
                    );
                    const isSpecialToppingItemOnlyOne = ["marquesita"].some(keyword =>
                      customizingItem.name.toLowerCase().includes(keyword)
                    );
                    const selectedCount = customOptions.addons.length;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`px-2 py-1 rounded border text-xs ${customOptions.addons.includes(String(key)) ? 'bg-verde text-white' : 'bg-gray-100'}`}
                        onClick={() => handleAddonToggle(String(key))}
                      >
                        {ALL_ADDONS[String(key)].label}
                        {/* Special topping item with 2 free toppings */}
                        {isSpecialToppingItem ? (selectedCount >= 2 && ALL_ADDONS[String(key)].price > 0 && !customOptions.addons.includes(String(key)) ? ` (+$${ALL_ADDONS[String(key)].price})` : '') : ('')}
                        {/* Special topping item with 1 free topping */}
                        {isSpecialToppingItemOnlyOne ? (selectedCount >= 1 && ALL_ADDONS[String(key)].price > 0 && !customOptions.addons.includes(String(key)) ? ` (+$${ALL_ADDONS[String(key)].price})` : '') : ('')}
                        {/* Regular topping item */}
                        {!isSpecialToppingItem && !isSpecialToppingItemOnlyOne && ALL_ADDONS[String(key)].price > 0 && !customOptions.addons.includes(String(key)) ? ` (+$${ALL_ADDONS[String(key)].price})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Price display */}
            <div className="mb-2 w-full text-center">
              <div className="text-lg font-bold text-verde">
                ${calculateTotalPrice(customizingItem.price, customOptions.addons, customizingItem.name)} MXN
              </div>
              {customOptions.addons.length > 0 && (
                <div className="text-xs text-gray-500">
                  Base: ${customizingItem.price} + Add-ons: ${calculateTotalPrice(customizingItem.price, customOptions.addons, customizingItem.name) - customizingItem.price}
                </div>
              )}
            </div>
            {/* Notes */}
            <div className="mb-2 w-full">
              <label className="block font-semibold mb-1">Notas especiales</label>
              <textarea className="w-full p-2 border rounded" rows={2} value={customOptions.notes} onChange={e => setCustomOptions(o => ({ ...o, notes: e.target.value }))} placeholder="¿Algo más?" />
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button className="flex-1 bg-green-600 text-white rounded px-4 py-2 font-bold" onClick={finalizeAddToCart}>Agregar al carrito</button>
              <button className="flex-1 bg-gray-300 text-black rounded px-4 py-2 font-bold" onClick={() => setCustomizingItem(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}