"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldDef = { key: string; label: string; type?: "text" | "number" };

type Item = { id: string } & Record<string, unknown>;

export function EntityAdmin<T extends Item>({
  apiPath,
  fields,
  items,
}: {
  apiPath: string;
  fields: FieldDef[];
  items: T[];
}) {
  const router = useRouter();
  const estadoVazio = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [form, setForm] = useState<Record<string, string>>(estadoVazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function iniciarEdicao(item: T) {
    setEditandoId(item.id);
    setForm(Object.fromEntries(fields.map((f) => [f.key, String(item[f.key] ?? "")])));
    setErro(null);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(estadoVazio);
    setErro(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const url = editandoId ? `${apiPath}/${editandoId}` : apiPath;
      const method = editandoId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErro(data?.erro ?? "Não foi possível salvar.");
        return;
      }
      cancelarEdicao();
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.erro ?? "Não foi possível excluir.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {fields.map((f) => (
                <th key={f.key} className="px-4 py-2">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                {fields.map((f) => (
                  <td key={f.key} className="px-4 py-2">
                    {String(item[f.key] ?? "")}
                  </td>
                ))}
                <td className="space-x-3 px-4 py-2 text-right">
                  <button onClick={() => iniciarEdicao(item)} className="text-brand-600 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => excluir(item.id)} className="text-red-600 hover:underline">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1} className="px-4 py-6 text-center text-slate-400">
                  Nenhum registro cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={salvar} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700">
          {editandoId ? "Editar registro" : "Novo registro"}
        </h3>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              <input
                type={f.type ?? "text"}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {editandoId ? "Salvar alterações" : "Adicionar"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
