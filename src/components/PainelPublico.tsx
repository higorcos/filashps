"use client";

import { useEffect, useRef, useState } from "react";

type EventoChamada = {
  tipo: "chamada";
  unidadeId: string;
  filaId: string;
  senha: string;
  sala: string | null;
  especialidade: string;
  chamadoEm: string;
};

function falar(texto: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "pt-BR";
  const vozPtBr = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("pt"));
  if (vozPtBr) utterance.voice = vozPtBr;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function formatarHorario(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function PainelPublico({ unidadeId, unidadeNome }: { unidadeId: string; unidadeNome: string }) {
  const [atual, setAtual] = useState<EventoChamada | null>(null);
  const [historico, setHistorico] = useState<EventoChamada[]>([]);
  const primeiraCarga = useRef(true);

  useEffect(() => {
    // aquece a lista de vozes do navegador
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    const es = new EventSource(`/api/painel/eventos?unidadeId=${unidadeId}`);

    es.addEventListener("historico", (evento) => {
      const dados = JSON.parse((evento as MessageEvent).data) as EventoChamada[];
      setHistorico(dados);
      setAtual(dados[0] ?? null);
      primeiraCarga.current = true;
    });

    es.addEventListener("chamada", (evento) => {
      const dados = JSON.parse((evento as MessageEvent).data) as EventoChamada;
      setAtual(dados);
      setHistorico((h) => [dados, ...h.filter((c) => c.filaId !== dados.filaId || c.chamadoEm !== dados.chamadoEm)].slice(0, 10));

      if (primeiraCarga.current) {
        primeiraCarga.current = false;
        return;
      }

      const destino = dados.sala ? `Senha ${dados.senha}, comparecer à sala ${dados.sala}` : `Senha ${dados.senha}, comparecer à recepção`;
      falar(destino);
    });

    return () => es.close();
  }, [unidadeId]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-950 px-6 py-8 text-white sm:px-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-200">{unidadeNome}</h1>
        <span className="text-sm text-brand-400">Painel de chamadas</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center py-10">
        {atual ? (
          <div className="text-center">
            <p className="text-lg uppercase tracking-[0.3em] text-brand-300">{atual.especialidade}</p>
            <p className="mt-4 text-[clamp(4rem,16vw,12rem)] font-bold leading-none tabular-nums text-white">
              {atual.senha}
            </p>
            <p className="mt-6 text-[clamp(1.5rem,4vw,3rem)] font-semibold text-brand-400">
              {atual.sala ? `Sala ${atual.sala}` : "Recepção"}
            </p>
          </div>
        ) : (
          <p className="text-2xl text-brand-400">Aguardando a primeira chamada...</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-400">
          Últimas chamadas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {historico.slice(0, 10).map((c, i) => (
            <div
              key={`${c.filaId}-${c.chamadoEm}-${i}`}
              className="rounded-xl border border-brand-800 bg-brand-900 px-4 py-3"
            >
              <p className="text-xl font-bold tabular-nums text-white">{c.senha}</p>
              <p className="text-xs text-brand-300">{c.sala ? `Sala ${c.sala}` : "Recepção"}</p>
              <p className="text-xs text-brand-400">{formatarHorario(c.chamadoEm)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
