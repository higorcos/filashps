import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FilasHPS — Gerenciamento de Filas Hospitalares",
  description: "Triagem, priorização e chamada de pacientes em múltiplas unidades de saúde",
};

const links = [
  { href: "/triagem", label: "Triagem" },
  { href: "/medico", label: "Painel do profissional" },
  { href: "/painel", label: "Painel público" },
  { href: "/admin", label: "Administração" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
              FilasHPS
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-slate-600">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-slate-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
