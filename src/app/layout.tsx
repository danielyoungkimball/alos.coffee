import type { Metadata } from "next";
import { Nunito_Sans, Sansita } from 'next/font/google';
import "./globals.css";
import Link from 'next/link';

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
        {children}
        <footer className="w-full text-center p-4 text-xs text-gray-500 mt-8">
          <Link href="/privacy-policy" className="underline mx-2">Privacy Policy</Link>
          |
          <Link href="/terms-of-service" className="underline mx-2">Terms of Service</Link>
        </footer>
      </body>
    </html>
  );
}

