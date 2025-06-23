export default function Menu() {
  return (
    <div className="bg-parchment min-h-screen flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-espresso">Menú</h1>
      <div className="w-full max-w-3xl">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-espresso">Bebidas 16 oz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Frío o Caliente</h3>
              <ul className="text-black">
                <li>Americano <span className="float-right">$60</span></li>
                <li>Cappuchino <span className="float-right">$65</span></li>
                <li>Moka <span className="float-right">$90</span></li>
                <li>Latte <span className="float-right">$80</span></li>
                <li>Caramel Latte <span className="float-right">$95</span></li>
                <li>Vainilla Latte <span className="float-right">$95</span></li>
                <li>Avellana Latte <span className="float-right">$95</span></li>
                <li>Matcha Latte <span className="float-right">$100</span></li>
                <li>Chai Latte <span className="float-right">$90</span></li>
                <li>Chocolate <span className="float-right">$80</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Jugos</h3>
              <ul className="text-black">
                <li>Naranja <span className="float-right">$60</span></li>
                <li>Verde <span className="float-right">$80</span></li>
                <li className="text-xs">(Jugo de naranja, nopal, espinaca, apio, piña)</li>
                <li>Zanahoria <span className="float-right">$60</span></li>
              </ul>
            </div>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-espresso">Alimentos</h2>
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-2">Repostería</h3>
            <ul className="text-black mb-4">
              <li>Postre de la semana <span className="float-right">(Preguntar por disponibilidad)</span></li>
              <li>Crepas de avena <span className="float-right">$75</span>
                <ul className="ml-4 text-xs list-disc">
                  <li>Nutella, cajeta, lechera, mermelada de fresa o zarzamora, queso crema, fresa, plátano, durazno, nuez, almendra</li>
                </ul>
              </li>
              <li>Hot Cakes de avena <span className="float-right">$65</span>
                <ul className="ml-4 text-xs list-disc">
                  <li>Con miel y mantequilla</li>
                </ul>
              </li>
              <li>Mini Sandwich de manzana <span className="float-right">$65</span>
                <ul className="ml-4 text-xs list-disc">
                  <li>Con lechera y granola</li>
                </ul>
              </li>
              <li>Pan francés <span className="float-right">$130</span>
                <ul className="ml-4 text-xs list-disc">
                  <li>Con frutos rojos y crema batida</li>
                </ul>
              </li>
              <li>Fresas con crema <span className="float-right">$85</span>
                <ul className="ml-4 text-xs list-disc">
                  <li>Con lechera y topping (chispas de chocolate, ajonjolí caramelizado, nuez, almendra, coco rallado)</li>
                </ul>
              </li>
              <li>Marquesitas <span className="float-right">$60</span>
                <ul className="ml-4 text-xs list-disc">
                  <li>Con queso de bola</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
} 