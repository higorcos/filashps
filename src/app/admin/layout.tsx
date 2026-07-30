import Link from "next/link";

const abas = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/unidades", label: "Unidades" },
  { href: "/admin/profissionais", label: "Profissionais" },
  { href: "/admin/especialidades", label: "Especialidades" },
  { href: "/admin/prioridades", label: "Prioridades" },
  { href: "/admin/vinculos", label: "Vínculos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-brand-950">Administração</h1>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-sm font-medium">
        {abas.map((aba) => (
          <Link
            key={aba.href}
            href={aba.href}
            className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-brand-950"
          >
            {aba.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
