"use client";

import { Suspense } from "react";
import { MedicoPainelClient } from "@/components/MedicoPainelClient";

export default function MedicoPainelPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">Carregando...</div>}>
      <MedicoPainelClient />
    </Suspense>
  );
}
