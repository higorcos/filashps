"use client";

import { useEffect, useState } from "react";

type EventoChamada = {
  tipo: "chamada";
  unidadeId: string;
  filaId: string;
  senha: string;
  sala: string | null;
  especialidade: string;
  pacienteNome: string;
  chamadoEm: string;
};

// Fila de anúncios de voz: garante que, se duas senhas forem chamadas ao mesmo tempo,
// a segunda espera a primeira terminar em vez de sobrepor ou cortar o áudio.
const filaDeFala: string[] = [];
let falandoAgora = false;

function processarFilaDeFala() {
  if (falandoAgora) return;
  const texto = filaDeFala.shift();
  if (texto === undefined) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  falandoAgora = true;
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "pt-BR";
  const vozPtBr = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("pt"));
  if (vozPtBr) utterance.voice = vozPtBr;
  utterance.onend = avancarFilaDeFala;
  utterance.onerror = avancarFilaDeFala;
  window.speechSynthesis.speak(utterance);
}

function avancarFilaDeFala() {
  falandoAgora = false;
  processarFilaDeFala();
}

function falar(texto: string) {
  filaDeFala.push(texto);
  processarFilaDeFala();
}

function formatarHorario(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function PainelPublico({ unidadeId, unidadeNome }: { unidadeId: string; unidadeNome: string }) {
  const [atual, setAtual] = useState<EventoChamada | null>(null);
  const [historico, setHistorico] = useState<EventoChamada[]>([]);
  const [audioAtivo, setAudioAtivo] = useState(false);

  function ativarAudio() {
    falar("Áudio ativado");
    setAudioAtivo(true);
  }

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
    });

    es.addEventListener("chamada", (evento) => {
      const dados = JSON.parse((evento as MessageEvent).data) as EventoChamada;
      setAtual(dados);
      setHistorico((h) => [dados, ...h.filter((c) => c.filaId !== dados.filaId || c.chamadoEm !== dados.chamadoEm)].slice(0, 10));

      const destino = dados.sala
        ? `${dados.pacienteNome}, dirija-se a ${dados.sala}`
        : `${dados.pacienteNome}, dirija-se à recepção`;
      falar(destino);
    });

    return () => es.close();
  }, [unidadeId]);

  return (
    <div className="relative flex min-h-screen flex-col bg-brand-950 px-6 py-8 text-white sm:px-12">
      {!audioAtivo && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-brand-950/90 text-center">
          <p className="max-w-md text-lg text-brand-200">
            O navegador exige uma interação antes de permitir o som das chamadas.
          </p>
          <button
            type="button"
            onClick={ativarAudio}
            className="rounded-lg bg-brand-500 px-6 py-3 text-lg font-semibold text-white hover:bg-brand-600"
          >
            🔊 Toque para ativar o som
          </button>
        </div>
      )}

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-200">{unidadeNome}</h1>
        <span className="text-sm text-brand-400">Painel de chamadas</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center py-10">
        {atual ? (
          <div className="text-center">
            <p className="text-lg uppercase tracking-[0.3em] text-brand-300">{atual.especialidade}</p>
            <p className="mt-4 text-[clamp(2.5rem,8vw,6rem)] font-bold leading-tight text-white">
              {atual.pacienteNome}
            </p>
            <p className="mt-3 inline-block rounded-lg bg-brand-900 px-4 py-1 text-[clamp(1.25rem,3vw,2rem)] font-bold tabular-nums text-brand-200">
              {atual.senha}
            </p>
            <p className="mt-6 text-[clamp(1.5rem,4vw,3rem)] font-semibold text-brand-400">
              {atual.sala ? atual.sala : "Recepção"}
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
              <p className="truncate text-base font-bold text-white" title={c.pacienteNome}>
                {c.pacienteNome}
              </p>
              <p className="text-xs tabular-nums text-brand-300">{c.senha}</p>
              <p className="text-xs text-brand-300">{c.sala ? c.sala : "Recepção"}</p>
              <p className="text-xs text-brand-400">{formatarHorario(c.chamadoEm)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
