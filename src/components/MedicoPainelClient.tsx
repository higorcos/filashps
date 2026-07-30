"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { FilaResposta } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  aguardando: "Aguardando",
  chamado: "Chamado",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export function MedicoPainelClient() {
  const params = useSearchParams();
  const profissionalId = params.get("profissionalId") ?? "";
  const unidadeId = params.get("unidadeId") ?? "";
  const especialidadeId = params.get("especialidadeId") ?? "";
  const profissionalNome = params.get("profissionalNome") ?? "";
  const unidadeNome = params.get("unidadeNome") ?? "";
  const especialidadeNome = params.get("especialidadeNome") ?? "";

  const [fila, setFila] = useState<FilaResposta | null>(null);
  const [sala, setSala] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregarFila = useCallback(async () => {
    if (!unidadeId || !especialidadeId) return;
    const res = await fetch(`/api/fila?unidadeId=${unidadeId}&especialidadeId=${especialidadeId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      setFila(await res.json());
    }
  }, [unidadeId, especialidadeId]);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      if (!unidadeId || !especialidadeId) return;
      const res = await fetch(`/api/fila?unidadeId=${unidadeId}&especialidadeId=${especialidadeId}`, {
        cache: "no-store",
      });
      if (res.ok && !cancelado) {
        setFila(await res.json());
      }
    }

    buscar();
    const intervalo = setInterval(buscar, 5000);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [unidadeId, especialidadeId]);

  async function executarAcao(acao: () => Promise<Response>) {
    setCarregando(true);
    setMensagem(null);
    try {
      const res = await acao();
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMensagem(data?.erro ?? "Não foi possível completar a ação.");
      }
      await carregarFila();
    } catch {
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  function chamarProximo() {
    executarAcao(() =>
      fetch("/api/fila/chamar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unidadeId, especialidadeId, profissionalId, sala }),
      }),
    );
  }

  function chamarNovamente(filaId: string) {
    executarAcao(() => fetch(`/api/fila/${filaId}/chamar-novamente`, { method: "POST" }));
  }

  function iniciar(filaId: string) {
    executarAcao(() => fetch(`/api/fila/${filaId}/iniciar`, { method: "POST" }));
  }

  function finalizar(filaId: string) {
    executarAcao(() => fetch(`/api/fila/${filaId}/finalizar`, { method: "POST" }));
  }

  if (!profissionalId || !unidadeId || !especialidadeId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="text-sm text-slate-600">
          Selecione um profissional, unidade e especialidade para continuar.
        </p>
        <Link href="/medico" className="mt-4 inline-block text-sm font-semibold text-brand-600 underline">
          Voltar para seleção
        </Link>
      </div>
    );
  }

  const meuAtendimento = fila?.emAndamento.find((f) => f.profissionalId === profissionalId) ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-950">{especialidadeNome}</h1>
          <p className="text-sm text-slate-600">
            {profissionalNome} — {unidadeNome}
          </p>
        </div>
        <Link href="/medico" className="text-sm font-medium text-brand-600 hover:underline">
          Trocar seleção
        </Link>
      </div>

      {mensagem && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {mensagem}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">Sala</label>
        <input
          type="text"
          value={sala}
          onChange={(e) => setSala(e.target.value)}
          placeholder="Ex: Consultório 3"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {meuAtendimento ? (
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              {STATUS_LABEL[meuAtendimento.status]}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-brand-900">{meuAtendimento.senha}</p>
            <p className="mt-1 text-sm text-slate-700">
              {meuAtendimento.triagem.paciente.nomeCompleto} · Prioridade: {meuAtendimento.prioridade.nome}
              {meuAtendimento.tentativasChamada > 0 && ` · Tentativas: ${meuAtendimento.tentativasChamada}`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {meuAtendimento.status === "chamado" && (
                <>
                  <button
                    disabled={carregando}
                    onClick={() => chamarNovamente(meuAtendimento.id)}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    Chamar novamente
                  </button>
                  <button
                    disabled={carregando}
                    onClick={() => iniciar(meuAtendimento.id)}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    Iniciar atendimento
                  </button>
                </>
              )}
              <button
                disabled={carregando}
                onClick={() => finalizar(meuAtendimento.id)}
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-50"
              >
                Dar baixa / Finalizar
              </button>
            </div>
          </div>
        ) : (
          <button
            disabled={carregando || !fila || fila.aguardando.length === 0}
            onClick={chamarProximo}
            className="mt-6 w-full rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Chamar próximo
          </button>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-brand-950">
          Fila de espera {fila ? `(${fila.aguardando.length})` : ""}
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Senha</th>
                <th className="px-4 py-2">Paciente</th>
                <th className="px-4 py-2">Prioridade</th>
                <th className="px-4 py-2">Tentativas</th>
              </tr>
            </thead>
            <tbody>
              {fila?.aguardando.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-semibold tabular-nums">{f.senha}</td>
                  <td className="px-4 py-2">{f.triagem.paciente.nomeCompleto}</td>
                  <td className="px-4 py-2">{f.prioridade.nome}</td>
                  <td className="px-4 py-2">{f.tentativasChamada}</td>
                </tr>
              ))}
              {fila && fila.aguardando.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Nenhum paciente aguardando.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {fila && fila.emAndamento.filter((f) => f.id !== meuAtendimento?.id).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-brand-950">Em atendimento por outros profissionais</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Senha</th>
                  <th className="px-4 py-2">Paciente</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Profissional</th>
                </tr>
              </thead>
              <tbody>
                {fila.emAndamento
                  .filter((f) => f.id !== meuAtendimento?.id)
                  .map((f) => (
                    <tr key={f.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-semibold tabular-nums">{f.senha}</td>
                      <td className="px-4 py-2">{f.triagem.paciente.nomeCompleto}</td>
                      <td className="px-4 py-2">{STATUS_LABEL[f.status]}</td>
                      <td className="px-4 py-2">{f.profissional?.nome ?? "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
