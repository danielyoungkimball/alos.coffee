import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alo! Coffee and Bakery",
  description: "Made with Love",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600&family=Sansita:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-nunito">{children}</body>
    </html>
  );
}

