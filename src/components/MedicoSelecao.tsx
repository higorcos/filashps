"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Vinculo = {
  id: string;
  profissional: { id: string; nome: string; registro: string };
  unidade: { id: string; nome: string };
  especialidade: { id: string; nome: string };
};

export function MedicoSelecao({ vinculos }: { vinculos: Vinculo[] }) {
  const router = useRouter();
  const [profissionalId, setProfissionalId] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [especialidadeId, setEspecialidadeId] = useState("");

  const profissionais = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string }>();
    for (const v of vinculos) mapa.set(v.profissional.id, v.profissional);
    return Array.from(mapa.values());
  }, [vinculos]);

  const unidadesDisponiveis = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string }>();
    for (const v of vinculos) {
      if (v.profissional.id === profissionalId) mapa.set(v.unidade.id, v.unidade);
    }
    return Array.from(mapa.values());
  }, [vinculos, profissionalId]);

  const especialidadesDisponiveis = useMemo(() => {
    const mapa = new Map<string, { id: string; nome: string }>();
    for (const v of vinculos) {
      if (v.profissional.id === profissionalId && v.unidade.id === unidadeId) {
        mapa.set(v.especialidade.id, v.especialidade);
      }
    }
    return Array.from(mapa.values());
  }, [vinculos, profissionalId, unidadeId]);

  const podeContinuar = Boolean(profissionalId && unidadeId && especialidadeId);

  function continuar() {
    if (!podeContinuar) return;
    const profissional = profissionais.find((p) => p.id === profissionalId);
    const unidade = unidadesDisponiveis.find((u) => u.id === unidadeId);
    const especialidade = especialidadesDisponiveis.find((e) => e.id === especialidadeId);
    const params = new URLSearchParams({
      profissionalId,
      unidadeId,
      especialidadeId,
      profissionalNome: profissional?.nome ?? "",
      unidadeNome: unidade?.nome ?? "",
      especialidadeNome: especialidade?.nome ?? "",
    });
    router.push(`/medico/painel?${params.toString()}`);
  }

  if (vinculos.length === 0) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Nenhum vínculo profissional/unidade/especialidade cadastrado. Cadastre em{" "}
        <a href="/admin/vinculos" className="underline">
          Administração
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Profissional</label>
        <select
          value={profissionalId}
          onChange={(e) => {
            setProfissionalId(e.target.value);
            setUnidadeId("");
            setEspecialidadeId("");
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione...</option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Unidade</label>
        <select
          value={unidadeId}
          disabled={!profissionalId}
          onChange={(e) => {
            setUnidadeId(e.target.value);
            setEspecialidadeId("");
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
        >
          <option value="">Selecione...</option>
          {unidadesDisponiveis.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Especialidade</label>
        <select
          value={especialidadeId}
          disabled={!unidadeId}
          onChange={(e) => setEspecialidadeId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
        >
          <option value="">Selecione...</option>
          {especialidadesDisponiveis.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        disabled={!podeContinuar}
        onClick={continuar}
        className="w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        Entrar no painel
      </button>
    </div>
  );
}
