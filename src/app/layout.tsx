import type { Metadata } from "next";
import { Nunito_Sans, Sansita } from 'next/font/google';
import "./globals.css";

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
      <body className="font-nunito">{children}</body>
    </html>
  );
}

