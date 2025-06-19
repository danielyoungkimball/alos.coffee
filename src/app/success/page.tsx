'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="bg-parchment min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-sansita font-bold text-teal mb-4">¡Pago exitoso!</h1>
      <p className="text-lg text-richBlack mb-6">¡Gracias! Tu pedido ha sido recibido y se está procesando. Alondra ha sido notificada.</p>
      <Link href="/" className="px-6 py-3 bg-richBlack text-parchment rounded-lg hover:bg-teal transition-colors">
        Hacer otro pedido
      </Link>
    </div>
  );
} 