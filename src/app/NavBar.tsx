"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-verde text-parchment shadow relative">
      <Link href="/" className="flex items-center gap-3 group">
        <span className="bg-white rounded-full p-1 flex items-center justify-center">
          <Image src="/Alo! Logo 1024x1024.png" alt="Alo! Coffee & Bakery Logo" width={40} height={40} className="rounded-full" />
        </span>
        <span className="text-xl font-bold tracking-wide group-hover:underline">Alo! Coffee & Bakery</span>
      </Link>
      {/* Desktop Nav */}
      <div className="gap-6 text-base font-semibold hidden md:flex">
        <Link href="/menu" className="hover:underline">Menú</Link>
        <Link href="/about" className="hover:underline">Sobre Nosotros</Link>
        <Link href="/contact" className="hover:underline">Contacto</Link>
      </div>
      {/* Hamburger for Mobile */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
      >
        <span className={`block w-6 h-0.5 bg-parchment mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-parchment mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-parchment transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex md:hidden" onClick={() => setMenuOpen(false)}>
          <nav
            className="bg-verde text-parchment w-full h-full p-8 flex flex-col gap-6 shadow-lg animate-slide-in-right"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/menu" className="text-lg font-bold hover:underline" onClick={() => setMenuOpen(false)}>Menú</Link>
            <Link href="/about" className="text-lg font-bold hover:underline" onClick={() => setMenuOpen(false)}>Sobre Nosotros</Link>
            <Link href="/contact" className="text-lg font-bold hover:underline" onClick={() => setMenuOpen(false)}>Contacto</Link>
          </nav>
        </div>
      )}
    </nav>
  );
} 