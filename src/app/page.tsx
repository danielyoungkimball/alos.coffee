export default function Home() {
  return (
    <div className="bg-parchment min-h-screen text-richBlack font-nunito">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-richBlack text-parchment font-sansita">
        <h1 className="text-3xl font-bold">Alo! Coffee and Bakery</h1>
        <ul className="flex space-x-6">
          <li><a href="#" className="hover:text-teal">Shop</a></li>
          <li><a href="#" className="hover:text-teal">About</a></li>
          <li><a href="#" className="hover:text-teal">Contact</a></li>
          <li><a href="#" className="hover:text-teal">Cart</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
        <h2 className="text-5xl font-sansita font-bold">Welcome to Alo! Coffee and Bakery ☕</h2>
        <p className="text-xl text-cambridgeBlue mt-4 max-w-2xl font-nunito">
          Freshly brewed coffee and delicious pastries, crafted with love and adventure in mind.
        </p>
        <button className="mt-6 px-6 py-3 bg-teal text-parchment rounded-lg text-lg font-nunito font-medium hover:bg-ashGray transition">
          Order Now
        </button>
      </section>
    </div>
  );
}
