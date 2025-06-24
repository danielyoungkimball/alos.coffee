import Image from 'next/image';

export default function About() {
  return (
    <div className="bg-parchment min-h-screen flex flex-col items-center justify-center text-center p-4">
      <Image src="/Alo! Logo 1024x1024.png" alt="Alo! Coffee & Bakery Logo" width={180} height={180} className="mx-auto mb-6 rounded-full shadow-lg" />
      <h1 className="text-4xl font-bold mb-4 text-espresso">Sobre Nosotros</h1>
      <p className="max-w-2xl text-lg mb-6 text-black">
        Alo! Coffee & Bakery nació de una pasión por el café de calidad y la repostería artesanal. Somos un equipo familiar dedicado a crear experiencias cálidas y deliciosas para nuestra comunidad. Nuestra misión es ofrecer bebidas y alimentos frescos, preparados con amor y los mejores ingredientes, en un ambiente acogedor y moderno.
      </p>
      <div className="max-w-xl mx-auto text-left bg-white bg-opacity-80 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2 text-espresso">Nuestro Equipo</h2>
        <ul className="list-disc pl-6 text-black">
          <li><b>Alondra</b> – Fundadora y barista principal, apasionada por el café y la hospitalidad.</li>
        </ul>
      </div>
    </div>
  );
} 