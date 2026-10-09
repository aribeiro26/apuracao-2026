"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { intlLocale } from "@/lib/locale";

const INTERVALO = 7000;

export function Apresentador({ linhas }: { linhas: string[] }) {
  const { copy, locale } = useI18n();
  const [aberto, setAberto] = useState(true);
  const [audio, setAudio] = useState(false);
  const [falando, setFalando] = useState(false);
  const [indice, setIndice] = useState(0);
  const fala = linhas[indice] ?? linhas[0] ?? "";
  const pular = useRef(false);

  useEffect(() => {
    setIndice(0);
  }, [linhas]);

  useEffect(() => {
    if (!aberto || audio || linhas.length < 2) return;
    const id = window.setInterval(() => setIndice((atual) => (atual + 1) % linhas.length), INTERVALO);
    return () => window.clearInterval(id);
  }, [aberto, audio, linhas]);

  useEffect(() => {
    if (!audio || !fala || !aberto) return;
    if (pular.current) {
      pular.current = false;
      return;
    }
    return dizer(fala, locale, linhas.length, setFalando, setIndice);
  }, [aberto, audio, fala, linhas.length, locale]);

  if (!fala) return null;

  if (!aberto) {
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[var(--faixa)] text-[var(--faixa-texto)] shadow-card"
        aria-label={copy.apresentadorOuvir}
        onClick={() => setAberto(true)}
      >
        <Retrato falando={false} />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 z-30 w-[min(24rem,calc(100%-2rem))] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-card">
      <div className="flex items-center justify-between gap-3 bg-[var(--faixa)] px-4 py-2 text-[var(--faixa-texto)]">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className={`h-2 w-2 rounded-full bg-red-500 ${falando ? "pulso animate-pulse" : ""}`} aria-hidden />
          {copy.apresentador}
        </p>
        <button type="button" className="min-h-11 px-1 text-sm text-[var(--faixa-texto)] opacity-80" onClick={() => setAberto(false)}>
          {copy.fechar}
        </button>
      </div>
      <div className="flex items-start gap-3 p-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#1d4e89] text-white" aria-hidden>
          <Retrato falando={falando} />
        </span>
        <p className="min-h-16 text-sm leading-snug" aria-live="polite">
          {fala}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-3">
        {linhas.length > 1 ? (
          <div className="flex items-center gap-2">
            <span className="sr-only">{`${indice + 1}/${linhas.length}`}</span>
            {linhas.map((_, posicao) => (
              <button
                key={posicao}
                type="button"
                aria-label={`${posicao + 1}`}
                className={`h-1.5 rounded-full ${posicao === indice ? "w-6 bg-[var(--ink)]" : "w-1.5 bg-[var(--line)]"}`}
                onClick={() => setIndice(posicao)}
              />
            ))}
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="min-h-11 rounded-full border border-[var(--line)] px-3 text-sm"
          aria-pressed={audio}
          onClick={() => {
            if (audio) {
              setAudio(false);
              window.speechSynthesis.cancel();
              setFalando(false);
              return;
            }
            pular.current = true;
            setAudio(true);
            dizer(fala, locale, linhas.length, setFalando, setIndice);
          }}
        >
          {audio ? copy.pararAudio : copy.ativarAudio}
        </button>
      </div>
    </aside>
  );
}

function dizer(
  texto: string,
  locale: "pt-BR" | "pt-PT" | "es" | "en",
  total: number,
  setFalando: (valor: boolean) => void,
  setIndice: (valor: (atual: number) => number) => void,
) {
  const sintese = window.speechSynthesis;
  sintese.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  const idioma = intlLocale(locale);
  frase.lang = idioma;
  const voz = sintese.getVoices().find((item) => item.lang.toLowerCase().startsWith(idioma.slice(0, 2).toLowerCase()));
  if (voz) frase.voice = voz;
  let espera = 0;
  frase.onstart = () => setFalando(true);
  frase.onend = () => {
    setFalando(false);
    if (total > 1) espera = window.setTimeout(() => setIndice((atual) => (atual + 1) % total), 900);
  };
  frase.onerror = () => setFalando(false);
  sintese.speak(frase);
  return () => {
    window.clearTimeout(espera);
    sintese.cancel();
    setFalando(false);
  };
}

function Retrato({ falando }: { falando: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
      <circle cx="32" cy="24" r="12" fill="currentColor" />
      <circle cx="27" cy="22" r="1.4" fill="#1d4e89" />
      <circle cx="37" cy="22" r="1.4" fill="#1d4e89" />
      <ellipse cx="32" cy="28" rx="3.2" ry={falando ? 2.4 : 0.7} fill="#1d4e89" className={falando ? "boca-fala" : undefined} />
      <path d="M16 56c2.2-10 8.6-15 16-15s13.8 5 16 15" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
