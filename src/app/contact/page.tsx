import Link from 'next/link';

export default function Contact() {
  return (
    <div className="bg-parchment min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-espresso">Contáctanos</h1>
      <p className="max-w-xl text-lg mb-6 text-black">¿Tienes preguntas, sugerencias o quieres hacer un pedido especial? ¡Estamos aquí para ti!</p>
      <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 max-w-md w-full mx-auto mb-6">
        <form className="flex flex-col gap-3">
          <input type="text" placeholder="Tu nombre" className="p-2 rounded border border-gray-300" required />
          <input type="email" placeholder="Tu correo electrónico" className="p-2 rounded border border-gray-300" required />
          <textarea placeholder="Tu mensaje" className="p-2 rounded border border-gray-300" rows={4} required />
          <button type="submit" className="mt-2 px-4 py-2 bg-espresso text-parchment rounded font-bold hover:bg-cambridgeBlue transition-colors w-full">Enviar</button>
        </form>
      </div>
      <div className="flex flex-col items-center gap-2 text-black">
        <span><b>Email:</b> <a href="mailto:alos.coffee@outlook.com" className="underline">alos.coffee@outlook.com</a></span>
        <span><b>WhatsApp:</b> <a href="https://wa.me/526242653144" className="underline">+52 624 265 3144</a></span>
        {/* <span><b>Dirección:</b> Calle Ejemplo 123, Ciudad, Estado</span> */}
        <div className="flex gap-4 mt-2">
          <Link href="https://facebook.com/aloscoffeebakery" className="underline">Facebook</Link>
          <Link href="https://instagram.com/aloscoffeebakery" className="underline">Instagram</Link>
        </div>
      </div>
    </div>
  );
} 