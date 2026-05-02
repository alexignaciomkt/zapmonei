import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ZapMonei | Seu Sócio-Assistente Financeiro",
  description: "A IA que entende o corre do motorista de aplicativo. Controle seus ganhos e gastos pelo WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
