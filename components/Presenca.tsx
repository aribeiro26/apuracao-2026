"use client";

import { createContext, useContext, useMemo, useState } from "react";

const Contexto = createContext<{ tem: boolean; marcar: (valor: boolean) => void } | null>(null);

export function PresencaProvider({ children }: { children: React.ReactNode }) {
  const [tem, setTem] = useState(false);
  const valor = useMemo(() => ({ tem, marcar: setTem }), [tem]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePresenca() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("Presença fora do provedor.");
  return ctx;
}
