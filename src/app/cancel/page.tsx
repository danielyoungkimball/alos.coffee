import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="bg-parchment min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-sansita font-bold text-red-600 mb-4">Pedido cancelado</h1>
      <p className="text-lg text-black mb-6">Tu orden fue cancelada. No se ha realizado ningún cargo.</p>
      <Link href="/" className="px-6 py-3 bg-black text-parchment rounded-lg hover:bg-teal transition-colors">
        Volver a intentarlo
      </Link>
    </div>
  );
} 