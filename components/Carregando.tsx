"use client";

import { useI18n } from "@/components/LocaleProvider";

export function Carregando() {
  const { copy } = useI18n();
  return <p className="px-4 py-16 text-center text-[var(--muted)]">{copy.carregando}</p>;
}
