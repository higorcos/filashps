"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Ref = { id: string; nome: string };
type Vinculo = {
  id: string;
  profissional: Ref;
  unidade: Ref;
  especialidade: Ref;
};

export function VinculosAdmin({
  vinculos,
  profissionais,
  unidades,
  especialidades,
}: {
  vinculos: Vinculo[];
  profissionais: Ref[];
  unidades: Ref[];
  especialidades: Ref[];
}) {
  const router = useRouter();
  const [profissionalId, setProfissionalId] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [especialidadeId, setEspecialidadeId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const res = await fetch("/api/vinculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissionalId, unidadeId, especialidadeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErro(data?.erro ?? "Não foi possível salvar o vínculo.");
        return;
      }
      setProfissionalId("");
      setUnidadeId("");
      setEspecialidadeId("");
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Remover este vínculo?")) return;
    const res = await fetch(`/api/vinculos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Profissional</th>
              <th className="px-4 py-2">Unidade</th>
              <th className="px-4 py-2">Especialidade</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {vinculos.map((v) => (
              <tr key={v.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{v.profissional.nome}</td>
                <td className="px-4 py-2">{v.unidade.nome}</td>
                <td className="px-4 py-2">{v.especialidade.nome}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => excluir(v.id)} className="text-red-600 hover:underline">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {vinculos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Nenhum vínculo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={adicionar} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700">Novo vínculo</h3>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Profissional</label>
            <select
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
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
              onChange={(e) => setUnidadeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {unidades.map((u) => (
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
              onChange={(e) => setEspecialidadeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={salvando || !profissionalId || !unidadeId || !especialidadeId}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Adicionar vínculo
        </button>
      </form>
    </div>
  );
}
