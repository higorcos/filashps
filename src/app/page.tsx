import Link from "next/link";

const cards = [
  {
    href: "/triagem",
    title: "Triagem / Cadastro",
    description: "Registrar paciente, coletar sinais vitais e gerar a senha de atendimento.",
  },
  {
    href: "/medico",
    title: "Painel do profissional",
    description: "Chamar o próximo paciente, iniciar e finalizar atendimentos.",
  },
  {
    href: "/painel",
    title: "Painel público",
    description: "Tela de TV com a senha em chamada e o histórico de chamadas recentes.",
  },
  {
    href: "/admin",
    title: "Administração",
    description: "Cadastrar unidades, profissionais, especialidades, vínculos e prioridades.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Sistema de Gerenciamento de Filas Hospitalares
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Triagem, priorização, chamada com voz e histórico de atendimento para múltiplas unidades
        de saúde operando simultaneamente.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-700">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
