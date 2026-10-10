"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarApresentadora } from "@/components/AvatarApresentadora";
import { useI18n } from "@/components/LocaleProvider";
import { intlLocale } from "@/lib/locale";

const INTERVALO = 7000;
const CHAVE_VOZ = "apresentadora-voz";

export function Apresentador({
  linhas,
  perguntas,
}: {
  linhas: string[];
  perguntas: { id: string; pergunta: string; resposta: string }[];
}) {
  const { copy, locale } = useI18n();
  const [aberto, setAberto] = useState(true);
  const [audio, setAudio] = useState(false);
  const [falando, setFalando] = useState(false);
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [acenar, setAcenar] = useState(false);
  const [vozes, setVozes] = useState<SpeechSynthesisVoice[]>([]);
  const [voz, setVoz] = useState("");
  const resposta = perguntas.find((item) => item.id === escolha)?.resposta;
  const fala = resposta || linhas[indice] || linhas[0] || "";
  const pular = useRef(false);
  const segurar = useRef(false);

  useEffect(() => {
    const ler = () => {
      const lista = window.speechSynthesis.getVoices().filter((item) => item.lang.toLowerCase().startsWith(locale.slice(0, 2)));
      setVozes(lista);
      let salva = "";
      try {
        salva = localStorage.getItem(CHAVE_VOZ) ?? "";
      } catch {
        salva = "";
      }
      setVoz(lista.some((item) => item.voiceURI === salva) ? salva : (escolherVoz(intlLocale(locale))?.voiceURI ?? ""));
    };
    ler();
    window.speechSynthesis.addEventListener("voiceschanged", ler);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", ler);
  }, [locale]);

  useEffect(() => {
    setIndice(0);
  }, [linhas]);

  useEffect(() => {
    if (!aberto) return;
    setAcenar(true);
    const id = window.setTimeout(() => setAcenar(false), 1700);
    return () => window.clearTimeout(id);
  }, [aberto]);

  useEffect(() => {
    if (!aberto || audio || escolha || linhas.length < 2) return;
    const id = window.setInterval(() => setIndice((atual) => (atual + 1) % linhas.length), INTERVALO);
    return () => window.clearInterval(id);
  }, [aberto, audio, escolha, linhas]);

  useEffect(() => {
    if (!audio || !fala || !aberto) return;
    if (pular.current) {
      pular.current = false;
      return;
    }
    const limpar = dizer(fala, locale, escolha ? 1 : linhas.length, setFalando, setIndice);
    return () => {
      if (segurar.current) {
        segurar.current = false;
        return;
      }
      limpar();
    };
  }, [aberto, audio, escolha, fala, linhas.length, locale]);

  function falarAgora(texto = fala, total = escolha ? 1 : linhas.length) {
    if (!texto) return;
    if (!audio) pular.current = true;
    segurar.current = true;
    setAudio(true);
    dizer(texto, locale, total, setFalando, setIndice);
  }

  function abrirPergunta(id: string) {
    const proxima = escolha === id ? null : id;
    const texto = proxima ? perguntas.find((item) => item.id === proxima)?.resposta ?? "" : linhas[indice] || linhas[0] || "";
    setEscolha(proxima);
    if (texto) falarAgora(texto, proxima ? 1 : linhas.length);
  }

  if (!fala) return null;

  if (!aberto) {
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-[80] grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-[#f3d7c4] shadow-card"
        aria-label={copy.apresentadorOuvir}
        onClick={() => {
          setAberto(true);
          falarAgora();
        }}
      >
        <AvatarApresentadora falando={falando} ouvindo={false} pensando={false} acenar={false} />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[80] max-h-[calc(100vh-2rem)] w-[min(24rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-card">
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
        <button
          type="button"
          className="grid h-24 w-20 shrink-0 place-items-center rounded-2xl bg-[#f6e4d8]"
          aria-label={copy.ativarAudio}
          onClick={() => falarAgora()}
        >
          <AvatarApresentadora falando={falando} ouvindo={false} pensando={false} acenar={acenar} />
        </button>
        <p className="min-h-16 text-sm leading-snug" aria-live="polite">
          {fala}
        </p>
      </div>
      {perguntas.length > 0 && (
        <div className="border-t border-[var(--line)] px-3 py-2">
          <p className="px-1 text-xs font-medium text-[var(--muted)]">{copy.perguntasProntas}</p>
          <div className="mt-1 max-h-40 space-y-1 overflow-y-auto" role="group" aria-label={copy.perguntasProntas}>
            {perguntas.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={escolha === item.id}
                className={`min-h-11 w-full rounded-2xl border px-3 text-left text-sm ${escolha === item.id ? "border-[var(--ink)] bg-[var(--bg)]" : "border-[var(--line)]"}`}
                onClick={() => abrirPergunta(item.id)}
              >
                {item.pergunta}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-4 pb-3">
        {linhas.length > 1 ? (
          <div className="flex items-center gap-2">
            <span className="sr-only">{`${indice + 1}/${linhas.length}`}</span>
            {linhas.map((_, posicao) => (
              <button
                key={posicao}
                type="button"
                aria-label={copy.falaNumero(posicao + 1, linhas.length)}
                aria-current={posicao === indice ? "true" : undefined}
                className={`h-1.5 rounded-full ${posicao === indice ? "w-6 bg-[var(--ink)]" : "w-1.5 bg-[var(--line)]"}`}
                onClick={() => {
                  setEscolha(null);
                  setIndice(posicao);
                }}
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
            falarAgora();
          }}
        >
          {audio ? copy.pararAudio : copy.ativarAudio}
        </button>
      </div>
      {vozes.length > 0 && (
        <div className="px-4 pb-3">
          <label className="block text-xs text-[var(--muted)]" htmlFor="voz-apresentadora">
            {copy.voz}
          </label>
          <select
            id="voz-apresentadora"
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 text-sm"
            value={voz}
            onChange={(evento) => {
              const proxima = evento.target.value;
              setVoz(proxima);
              try {
                localStorage.setItem(CHAVE_VOZ, proxima);
              } catch {
                /* o celular pode bloquear o armazenamento */
              }
            }}
          >
            {vozes.map((item) => (
              <option key={item.voiceURI} value={item.voiceURI}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">{copy.vozNota}</p>
        </div>
      )}
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
  frase.rate = 0.96;
  frase.pitch = 1.02;
  const voz = escolherVoz(idioma);
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

function escolherVoz(idioma: string): SpeechSynthesisVoice | undefined {
  const prefixo = idioma.slice(0, 2).toLowerCase();
  const voces = window.speechSynthesis.getVoices().filter((item) => item.lang.toLowerCase().startsWith(prefixo));
  let salva = "";
  try {
    salva = localStorage.getItem(CHAVE_VOZ) ?? "";
  } catch {
    salva = "";
  }
  return (
    voces.find((item) => item.voiceURI === salva) ??
    voces.find((item) => /luciana|francisca|maria|fernanda|vitória|vitoria|google português do brasil/i.test(item.name)) ??
    voces.find((item) => item.lang.toLowerCase() === idioma.toLowerCase()) ??
    voces[0]
  );
}
