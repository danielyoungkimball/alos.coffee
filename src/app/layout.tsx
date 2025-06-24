import type { Metadata } from "next";
import { Nunito_Sans, Sansita } from 'next/font/google';
import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';

const nunito_sans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito-sans',
  weight: ['300', '400', '600'],
});

const sansita = Sansita({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sansita',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "Alo! Coffee and Bakery",
  description: "Made with Love",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito_sans.variable} ${sansita.variable}`}>
      <body className="font-nunito">
        <nav className="flex items-center justify-between px-6 py-4 bg-espresso text-parchment shadow">
          <div className="flex items-center gap-3">
            <Image src="/Alo! Logo 1024x1024.png" alt="Alo! Coffee & Bakery Logo" width={48} height={48} className="rounded-full" />
            <span className="text-xl font-bold tracking-wide">Alo! Coffee & Bakery</span>
          </div>
          <div className="flex gap-6 text-base font-semibold">
            <Link href="/" className="hover:underline">Inicio</Link>
            <Link href="/menu" className="hover:underline">Menú</Link>
            <Link href="/about" className="hover:underline">Sobre Nosotros</Link>
            <Link href="/contact" className="hover:underline">Contacto</Link>
          </div>
        </nav>
        {children}
        <footer className="w-full text-center p-4 text-xs text-gray-500 mt-8">
          <Link href="/privacy-policy" className="underline mx-2">Privacy Policy</Link>
          |
          <Link href="/terms-of-service" className="underline mx-2">Terms of Service</Link>
          |
          <Link href="/data-deletion" className="underline mx-2">Data Deletion</Link>
        </footer>
      </body>
    </html>
  );
}

