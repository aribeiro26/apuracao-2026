"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { perguntarApresentadora } from "@/app/acoes";
import { AvatarApresentadora } from "@/components/AvatarApresentadora";
import { useI18n } from "@/components/LocaleProvider";
import { intlLocale } from "@/lib/locale";
import type { TelaIa } from "@/lib/tela-ia";

const INTERVALO = 7000;

export function Apresentador({
  linhas,
  perguntas,
  tela,
}: {
  linhas: string[];
  perguntas: { id: string; pergunta: string; resposta: string }[];
  tela: TelaIa;
}) {
  const { copy, locale } = useI18n();
  const [aberto, setAberto] = useState(true);
  const [audio, setAudio] = useState(false);
  const [falando, setFalando] = useState(false);
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [livre, setLivre] = useState<string | null>(null);
  const [fontes, setFontes] = useState<string[]>([]);
  const [pergunta, setPergunta] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [acenar, setAcenar] = useState(false);
  const resposta = perguntas.find((item) => item.id === escolha)?.resposta;
  const fala = livre || resposta || linhas[indice] || linhas[0] || "";
  const pular = useRef(false);
  const segurar = useRef(false);

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
    if (!aberto || audio || escolha || livre || linhas.length < 2) return;
    const id = window.setInterval(() => setIndice((atual) => (atual + 1) % linhas.length), INTERVALO);
    return () => window.clearInterval(id);
  }, [aberto, audio, escolha, livre, linhas]);

  useEffect(() => {
    if (!audio || !fala || !aberto) return;
    if (pular.current) {
      pular.current = false;
      return;
    }
    const limpar = dizer(fala, locale, escolha || livre ? 1 : linhas.length, setFalando, setIndice);
    return () => {
      if (segurar.current) {
        segurar.current = false;
        return;
      }
      limpar();
    };
  }, [aberto, audio, escolha, fala, linhas.length, livre, locale]);

  function falarAgora(texto = fala, total = escolha || livre ? 1 : linhas.length) {
    if (!texto) return;
    if (!audio) pular.current = true;
    segurar.current = true;
    setAudio(true);
    dizer(texto, locale, total, setFalando, setIndice);
  }

  function abrirPergunta(id: string) {
    const proxima = escolha === id ? null : id;
    const texto = proxima ? perguntas.find((item) => item.id === proxima)?.resposta ?? "" : linhas[indice] || linhas[0] || "";
    setLivre(null);
    setFontes([]);
    setEscolha(proxima);
    if (texto) falarAgora(texto, proxima ? 1 : linhas.length);
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const texto = pergunta.trim();
    if (texto.length < 2 || ocupado) return;
    setOcupado(true);
    setAviso("");
    setEscolha(null);
    try {
      const json = await perguntarApresentadora(texto, tela, locale);
      if (!json.ok) {
        setAviso(json.erro === "limite" ? copy.perguntaLimite : copy.perguntaFalhou);
        return;
      }
      setLivre(json.texto);
      setFontes(json.fontes);
      setPergunta("");
      pular.current = false;
      setAudio(true);
    } catch {
      setAviso(copy.perguntaFalhou);
    } finally {
      setOcupado(false);
    }
  }

  if (!fala) return null;

  if (!aberto) {
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-30 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-[#d7e6f8] shadow-card"
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
    <aside className="fixed bottom-4 right-4 z-30 max-h-[calc(100vh-2rem)] w-[min(24rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-card">
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
          className="grid h-24 w-20 shrink-0 place-items-center rounded-2xl bg-[#d7e6f8]"
          aria-label={copy.ativarAudio}
          onClick={() => falarAgora()}
        >
          <AvatarApresentadora falando={falando} ouvindo={pergunta.trim().length > 0} pensando={ocupado} acenar={acenar} />
        </button>
        <p className="min-h-16 text-sm leading-snug" aria-live="polite">
          {fala}
        </p>
      </div>
      {fontes.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 px-4 pb-2 text-xs">
          {fontes.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                {rotuloFonte(url)}
              </a>
            </li>
          ))}
        </ul>
      )}
      <form className="border-t border-[var(--line)] px-3 py-2" onSubmit={(evento) => void enviar(evento)}>
        <label className="block px-1 text-xs text-[var(--muted)]" htmlFor="pergunta-livre">
          {copy.perguntaLivreNota}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="pergunta-livre"
            value={pergunta}
            maxLength={400}
            autoComplete="off"
            placeholder={copy.perguntaLivre}
            className="min-h-11 min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-3 text-sm"
            onChange={(evento) => setPergunta(evento.target.value)}
          />
          <button
            type="submit"
            disabled={ocupado || pergunta.trim().length < 2}
            className="min-h-11 shrink-0 rounded-full bg-[var(--faixa)] px-3 text-sm text-[var(--faixa-texto)] disabled:opacity-60"
          >
            {ocupado ? copy.perguntando : copy.perguntar}
          </button>
        </div>
        {aviso ? (
          <p className="mt-1 px-1 text-xs" role="alert">
            {aviso}
          </p>
        ) : null}
      </form>
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
                  setLivre(null);
                  setFontes([]);
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

function rotuloFonte(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
