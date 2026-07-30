import Link from "next/link";

const cards = [
  {
    href: "/triagem",
    title: "Triagem / Cadastro",
    description: "Registrar paciente, coletar sinais vitais e gerar a senha de atendimento.",
    badge: "T",
  },
  {
    href: "/medico",
    title: "Painel do profissional",
    description: "Chamar o próximo paciente, iniciar e finalizar atendimentos.",
    badge: "M",
  },
  {
    href: "/painel",
    title: "Painel público",
    description: "Tela de TV com a senha em chamada e o histórico de chamadas recentes.",
    badge: "P",
  },
  {
    href: "/admin",
    title: "Administração",
    description: "Cadastrar unidades, profissionais, especialidades, vínculos e prioridades.",
    badge: "A",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
        Sistema de Gerenciamento de Filas Hospitalares
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-brand-700/80">
        Triagem, priorização, chamada com voz e histórico de atendimento para múltiplas unidades
        de saúde operando simultaneamente.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600 group-hover:bg-brand-100">
              {card.badge}
            </span>
            <h2 className="text-xl font-semibold text-brand-950 group-hover:text-brand-600">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-brand-700/70">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
