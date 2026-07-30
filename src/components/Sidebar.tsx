"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/triagem", label: "Triagem", icon: IconClipboard },
  { href: "/medico", label: "Painel do profissional", icon: IconStethoscope },
  { href: "/painel", label: "Painel público", icon: IconMonitor },
  { href: "/admin", label: "Administração", icon: IconSettings },
];

function ativo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  // o painel público (telão) fica sem navegação, para não poluir uma tela de TV
  if (pathname.startsWith("/painel")) return null;

  return (
    <>
      <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand-900">
          <LogoMark />
          FilasHPS
        </Link>
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-brand-200 p-2 text-brand-700"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {aberto && (
        <div className="fixed inset-0 z-40 bg-brand-950/40 lg:hidden" onClick={() => setAberto(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-brand-950 text-brand-100 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6 text-lg font-semibold text-white">
          <LogoMark />
          FilasHPS
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isAtivo = ativo(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAberto(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isAtivo
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-brand-200 hover:bg-brand-900 hover:text-white"
                }`}
              >
                <Icon />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-5 text-xs text-brand-300">
          Sistema de Filas Hospitalares
        </div>
      </aside>
    </>
  );
}

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
      F
    </span>
  );
}

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <path
        d="M3 9.5 10 3l7 6.5V17a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect x="4" y="3.5" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 3.5V3a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 12.5 3v.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9h6M7 12h6M7 15h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconStethoscope() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <path
        d="M6 3v5a3 3 0 0 0 6 0V3M6 3H4.5M12 3h1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M9 8v3a5 5 0 0 0 10 0v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="19" cy="9.5" r="1.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 17.5h6M10 14v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
