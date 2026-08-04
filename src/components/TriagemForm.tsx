"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Unidade, Especialidade, Prioridade } from "@/generated/prisma/client";
import { triagemSchema } from "@/lib/validation";
import { calcularIdade } from "@/lib/idade";
import {
  COMORBIDADES_COMUNS,
  GLICEMIA_MIN,
  GLICEMIA_MAX,
  PESO_MIN,
  PESO_MAX,
  IDADE_PRIORIDADE_IDOSO,
  TELEFONE_DIGITOS_MIN,
} from "@/lib/constants";

type Vinculo = { unidadeId: string; especialidadeId: string };

type Props = {
  unidades: Unidade[];
  especialidades: Especialidade[];
  prioridades: Prioridade[];
  vinculos: Vinculo[];
};

type FormState = {
  nomeCompleto: string;
  telefone: string;
  dataNascimento: string;
  unidadeId: string;
  especialidadeIds: string[];
  prioridadeId: string;
  medicamentos: string;
  observacoes: string;
  pressao: string;
  glicemia: string;
  pesoKg: string;
  criadoPor: string;
};

const estadoInicial: FormState = {
  nomeCompleto: "",
  telefone: "",
  dataNascimento: "",
  unidadeId: "",
  especialidadeIds: [],
  prioridadeId: "",
  medicamentos: "",
  observacoes: "",
  pressao: "",
  glicemia: "",
  pesoKg: "",
  criadoPor: "",
};

export function TriagemForm({ unidades, especialidades, prioridades, vinculos }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submetendo, setSubmetendo] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ senha: string; especialidade: string }[] | null>(null);
  const [comorbidadesSelecionadas, setComorbidadesSelecionadas] = useState<string[]>([]);
  const [comorbidadeOutra, setComorbidadeOutra] = useState("");

  const idade = useMemo(() => {
    if (!form.dataNascimento) return null;
    const data = new Date(form.dataNascimento);
    if (Number.isNaN(data.getTime())) return null;
    return calcularIdade(data);
  }, [form.dataNascimento]);

  // sugestão automática de prioridade a partir da idade; some valor derivado, não altera o estado do formulário
  // até que o atendente escolha manualmente, para não sobrescrever uma escolha já feita
  const prioridadeSugeridaId = useMemo(() => {
    if (idade === null || prioridades.length === 0) return "";
    const nomeAlvo = idade >= IDADE_PRIORIDADE_IDOSO ? "idoso" : "normal";
    return prioridades.find((p) => p.nome.toLowerCase() === nomeAlvo)?.id ?? "";
  }, [idade, prioridades]);

  const prioridadeEfetiva = form.prioridadeId || prioridadeSugeridaId;

  const especialidadesDaUnidade = useMemo(() => {
    if (!form.unidadeId) return [];
    const idsDaUnidade = new Set(
      vinculos.filter((v) => v.unidadeId === form.unidadeId).map((v) => v.especialidadeId),
    );
    return especialidades.filter((esp) => idsDaUnidade.has(esp.id));
  }, [especialidades, vinculos, form.unidadeId]);

  const comorbidadesTexto = useMemo(() => {
    const partes = [...comorbidadesSelecionadas];
    if (comorbidadeOutra.trim()) partes.push(comorbidadeOutra.trim());
    return partes.join(", ");
  }, [comorbidadesSelecionadas, comorbidadeOutra]);

  const payload = useMemo(
    () => ({
      nomeCompleto: form.nomeCompleto,
      telefone: form.telefone,
      dataNascimento: form.dataNascimento,
      unidadeId: form.unidadeId,
      especialidadeIds: form.especialidadeIds,
      prioridadeId: prioridadeEfetiva,
      comorbidades: comorbidadesTexto,
      medicamentos: form.medicamentos,
      observacoes: form.observacoes,
      pressao: form.pressao,
      glicemia: form.glicemia === "" ? undefined : form.glicemia,
      pesoKg: form.pesoKg === "" ? undefined : form.pesoKg,
      criadoPor: form.criadoPor,
    }),
    [form, prioridadeEfetiva, comorbidadesTexto],
  );

  const validacao = useMemo(() => triagemSchema.safeParse(payload), [payload]);

  const erros = useMemo(() => {
    const mapa: Record<string, string> = {};
    if (!validacao.success) {
      for (const issue of validacao.error.issues) {
        const campo = String(issue.path[0]);
        if (!(campo in mapa)) mapa[campo] = issue.message;
      }
    }
    return mapa;
  }, [validacao]);

  function marcarTocado(campo: string) {
    setTouched((t) => ({ ...t, [campo]: true }));
  }

  function erroDoCampo(campo: string) {
    return touched[campo] ? erros[campo] : undefined;
  }

  function alternarEspecialidade(id: string) {
    setForm((f) => ({
      ...f,
      especialidadeIds: f.especialidadeIds.includes(id)
        ? f.especialidadeIds.filter((e) => e !== id)
        : [...f.especialidadeIds, id],
    }));
  }

  function alternarComorbidade(nome: string) {
    setComorbidadesSelecionadas((atual) =>
      atual.includes(nome) ? atual.filter((c) => c !== nome) : [...atual, nome],
    );
  }

  const glicemiaForaDaFaixa =
    form.glicemia !== "" &&
    (() => {
      const valor = Number(form.glicemia);
      return !Number.isNaN(valor) && (valor < GLICEMIA_MIN || valor > GLICEMIA_MAX);
    })();

  const pesoForaDaFaixa =
    form.pesoKg !== "" &&
    (() => {
      const valor = Number(form.pesoKg);
      return !Number.isNaN(valor) && (valor < PESO_MIN || valor > PESO_MAX);
    })();

  const telefoneIncompleto =
    form.telefone.trim() !== "" && form.telefone.replace(/\D/g, "").length < TELEFONE_DIGITOS_MIN;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      nomeCompleto: true,
      dataNascimento: true,
      unidadeId: true,
      especialidadeIds: true,
      prioridadeId: true,
      pressao: true,
      criadoPor: true,
    });
    setErroGeral(null);

    if (!validacao.success) return;

    setSubmetendo(true);
    try {
      const res = await fetch("/api/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validacao.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErroGeral(data?.erro ?? "Não foi possível registrar a triagem.");
        return;
      }

      const data = await res.json();
      setResultado(
        data.filas.map((f: { senha: string; especialidade: { nome: string } }) => ({
          senha: f.senha,
          especialidade: f.especialidade.nome,
        })),
      );
      setForm(estadoInicial);
      setTouched({});
      setComorbidadesSelecionadas([]);
      setComorbidadeOutra("");
      router.refresh();
    } catch {
      setErroGeral("Não foi possível conectar ao servidor.");
    } finally {
      setSubmetendo(false);
    }
  }

  if (resultado) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-brand-900">Triagem registrada com sucesso</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {resultado.map((r) => (
            <div key={r.senha} className="rounded-xl border border-brand-300 bg-white px-6 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-brand-700/60">{r.especialidade}</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-brand-700">{r.senha}</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setResultado(null)}
          className="mt-8 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Nova triagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {erroGeral && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroGeral}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Campo label="Nome completo" erro={erroDoCampo("nomeCompleto")}>
          <input
            type="text"
            value={form.nomeCompleto}
            onChange={(e) => setForm((f) => ({ ...f, nomeCompleto: e.target.value }))}
            onBlur={() => marcarTocado("nomeCompleto")}
            className={inputClass(erroDoCampo("nomeCompleto"))}
            placeholder="Nome e sobrenome"
          />
        </Campo>

        <Campo label="Telefone" opcional>
          <input
            type="tel"
            value={form.telefone}
            onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            className={inputClass()}
            placeholder="(11) 91234-5678"
          />
          {telefoneIncompleto && (
            <p className="mt-1 text-xs text-amber-600">Telefone parece incompleto. O cadastro não será bloqueado.</p>
          )}
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Campo label="Data de nascimento" erro={erroDoCampo("dataNascimento")}>
          <input
            type="date"
            value={form.dataNascimento}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
            onBlur={() => marcarTocado("dataNascimento")}
            className={inputClass(erroDoCampo("dataNascimento"))}
          />
          {idade !== null && idade >= 0 && <p className="mt-1 text-xs text-slate-500">Idade: {idade} anos</p>}
        </Campo>

        <Campo label="Unidade" erro={erroDoCampo("unidadeId")}>
          <select
            value={form.unidadeId}
            onChange={(e) => setForm((f) => ({ ...f, unidadeId: e.target.value, especialidadeIds: [] }))}
            onBlur={() => marcarTocado("unidadeId")}
            className={inputClass(erroDoCampo("unidadeId"))}
          >
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo label="Especialidade(s)" erro={erroDoCampo("especialidadeIds")}>
        {!form.unidadeId ? (
          <p className="text-sm text-slate-500">Selecione a unidade para ver as especialidades disponíveis.</p>
        ) : especialidadesDaUnidade.length === 0 ? (
          <p className="text-sm text-amber-600">
            Nenhuma especialidade vinculada a esta unidade ainda. Cadastre um vínculo em Administração.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {especialidadesDaUnidade.map((esp) => (
              <label
                key={esp.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  form.especialidadeIds.includes(esp.id)
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-300 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-brand-600"
                  checked={form.especialidadeIds.includes(esp.id)}
                  onChange={() => alternarEspecialidade(esp.id)}
                  onBlur={() => marcarTocado("especialidadeIds")}
                />
                {esp.nome}
              </label>
            ))}
          </div>
        )}
      </Campo>

      <Campo label="Prioridade" erro={erroDoCampo("prioridadeId")}>
        <select
          value={prioridadeEfetiva}
          onChange={(e) => setForm((f) => ({ ...f, prioridadeId: e.target.value }))}
          onBlur={() => marcarTocado("prioridadeId")}
          className={inputClass(erroDoCampo("prioridadeId"))}
        >
          <option value="">Selecione...</option>
          {prioridades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        {idade !== null && idade >= IDADE_PRIORIDADE_IDOSO && (
          <p className="mt-1 text-xs text-brand-600">
            Sugestão automática: paciente com 60 anos ou mais — prioridade &quot;Idoso&quot;.
          </p>
        )}
      </Campo>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Campo label="Pressão arterial" erro={erroDoCampo("pressao")} opcional>
          <input
            type="text"
            value={form.pressao}
            onChange={(e) => setForm((f) => ({ ...f, pressao: e.target.value }))}
            onBlur={() => marcarTocado("pressao")}
            className={inputClass(erroDoCampo("pressao"))}
            placeholder="120/80"
          />
        </Campo>

        <Campo label="Glicemia (mg/dL)" opcional>
          <input
            type="number"
            value={form.glicemia}
            onChange={(e) => setForm((f) => ({ ...f, glicemia: e.target.value }))}
            className={inputClass()}
            placeholder="90"
          />
          {glicemiaForaDaFaixa && (
            <p className="mt-1 text-xs text-amber-600">
              Valor fora da faixa usual ({GLICEMIA_MIN}–{GLICEMIA_MAX} mg/dL). O cadastro não será bloqueado.
            </p>
          )}
        </Campo>

        <Campo label="Peso (kg)" opcional>
          <input
            type="number"
            step="0.1"
            value={form.pesoKg}
            onChange={(e) => setForm((f) => ({ ...f, pesoKg: e.target.value }))}
            className={inputClass()}
            placeholder="70"
          />
          {pesoForaDaFaixa && (
            <p className="mt-1 text-xs text-amber-600">
              Valor fora da faixa usual ({PESO_MIN}–{PESO_MAX} kg). O cadastro não será bloqueado.
            </p>
          )}
        </Campo>
      </div>

      <Campo label="Comorbidades" opcional>
        <div className="flex flex-wrap gap-3">
          {COMORBIDADES_COMUNS.map((nome) => (
            <label
              key={nome}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                comorbidadesSelecionadas.includes(nome)
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-300 text-slate-700"
              }`}
            >
              <input
                type="checkbox"
                className="accent-brand-600"
                checked={comorbidadesSelecionadas.includes(nome)}
                onChange={() => alternarComorbidade(nome)}
              />
              {nome}
            </label>
          ))}
        </div>
        <input
          type="text"
          value={comorbidadeOutra}
          onChange={(e) => setComorbidadeOutra(e.target.value)}
          placeholder="Outra comorbidade (opcional)"
          className={`${inputClass()} mt-3`}
        />
      </Campo>

      <Campo label="Medicamentos em uso" opcional>
        <textarea
          value={form.medicamentos}
          onChange={(e) => setForm((f) => ({ ...f, medicamentos: e.target.value }))}
          className={inputClass()}
          rows={2}
        />
      </Campo>

      <Campo label="Observações / queixas" opcional>
        <textarea
          value={form.observacoes}
          onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
          className={inputClass()}
          rows={3}
        />
      </Campo>

      <Campo label="Triagem realizada por" erro={erroDoCampo("criadoPor")}>
        <input
          type="text"
          value={form.criadoPor}
          onChange={(e) => setForm((f) => ({ ...f, criadoPor: e.target.value }))}
          onBlur={() => marcarTocado("criadoPor")}
          className={inputClass(erroDoCampo("criadoPor"))}
          placeholder="Nome do atendente"
        />
      </Campo>

      <button
        type="submit"
        disabled={submetendo}
        className="w-full rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submetendo ? "Registrando..." : "Registrar triagem e gerar senha"}
      </button>
    </form>
  );
}

function Campo({
  label,
  erro,
  opcional,
  children,
}: {
  label: string;
  erro?: string;
  opcional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {opcional && <span className="ml-1 font-normal text-slate-400">(opcional)</span>}
      </label>
      {children}
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

function inputClass(erro?: string) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-brand-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
    erro ? "border-red-400" : "border-slate-300"
  }`;
}
