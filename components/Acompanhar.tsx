"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { montarBoletim } from "@/lib/boletim";
import { ufPorCoordenada } from "@/lib/geo";
import { intlLocale } from "@/lib/locale";
import type { Resultado } from "@/lib/conta";

const CHAVE = "apuracao-acompanhar";
const CHAVE_UF = "apuracao-uf";
const INTERVALO = 90_000;

type Modo = "voz" | "popup" | "nao";

type PromptInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function Acompanhar({
  presidente,
  governadores,
}: {
  presidente: Resultado | null;
  governadores: Resultado[];
}) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const [modo, setModo] = useState<Modo | null>(null);
  const [perguntar, setPerguntar] = useState(false);
  const [uf, setUf] = useState<string | null>(null);
  const [popup, setPopup] = useState<string | null>(null);
  const [ios, setIos] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const instalacao = useRef<PromptInstalacao | null>(null);
  const ultimoTexto = useRef("");
  const ultimoQuando = useRef(0);

  useEffect(() => {
    const iosSafari = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const sozinho = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIos(iosSafari);
    setInstalado(sozinho);
    const salvo = localStorage.getItem(CHAVE);
    const ufSalva = localStorage.getItem(CHAVE_UF);
    if (ufSalva) setUf(ufSalva);
    if (salvo === "voz" || salvo === "popup" || salvo === "nao") setModo(salvo);
    else setPerguntar(true);
    if (salvo === "voz" || salvo === "popup") void localSeJaPermitida(definirUf);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const guardar = (evento: Event) => {
      evento.preventDefault();
      instalacao.current = evento as PromptInstalacao;
    };
    window.addEventListener("beforeinstallprompt", guardar);
    return () => window.removeEventListener("beforeinstallprompt", guardar);
  }, []);

  useEffect(() => {
    if (!popup) return;
    const id = window.setTimeout(() => setPopup(null), 14000);
    return () => window.clearTimeout(id);
  }, [popup]);

  useEffect(() => {
    if ((modo !== "voz" && modo !== "popup") || !presidente) return;
    const texto = montarBoletim(presidente, governadores, uf, copy, locale, idioma);
    if (!texto) return;
    const agora = Date.now();
    const mudou = texto !== ultimoTexto.current;
    if (!mudou && agora - ultimoQuando.current < INTERVALO) return;
    ultimoTexto.current = texto;
    ultimoQuando.current = agora;
    if (modo === "voz" && document.visibilityState === "visible") falar(texto, idioma);
    else void avisarPopup(texto, copy.avisoTitulo, modo === "popup" ? setPopup : () => undefined);
  }, [presidente, governadores, uf, modo, copy, locale, idioma]);

  function definirUf(sigla: string | null) {
    if (!sigla) return;
    setUf(sigla);
    localStorage.setItem(CHAVE_UF, sigla);
  }

  async function aceitar(proximo: "voz" | "popup") {
    localStorage.setItem(CHAVE, proximo);
    setModo(proximo);
    setPerguntar(false);
    if (instalacao.current) {
      await instalacao.current.prompt().catch(() => undefined);
      instalacao.current = null;
    }
    if (proximo === "popup" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => "denied");
    }
    const texto = montarBoletim(presidente, governadores, uf, copy, locale, idioma);
    ultimoTexto.current = texto;
    ultimoQuando.current = Date.now();
    if (proximo === "voz") falar(texto || copy.vozConfirmada, idioma);
    else if (texto) void avisarPopup(texto, copy.avisoTitulo, setPopup);
    pedirLocalizacao(definirUf);
  }

  function recusar() {
    localStorage.setItem(CHAVE, "nao");
    setModo("nao");
    setPerguntar(false);
  }

  return (
    <>
      {perguntar && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4 sm:place-items-center">
          <div role="dialog" aria-labelledby="instalar-titulo" className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-card">
            <p className="text-sm font-medium text-[var(--green)]">{copy.kicker}</p>
            <h2 id="instalar-titulo" className="mt-1 font-serif text-3xl leading-tight">
              {copy.instalarTitulo}
            </h2>
            <p className="mt-3 text-[var(--muted)]">{copy.instalarTexto}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{copy.instalarLocal}</p>
            {ios && !instalado ? <p className="mt-2 text-sm">{copy.instalarIos}</p> : null}
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" className="min-h-11 rounded-full bg-[var(--ink)] px-4 text-sm text-[var(--paper)]" onClick={() => void aceitar("voz")}>
                {instalado ? copy.instalarVozApp : copy.instalarVoz}
              </button>
              <button type="button" className="min-h-11 rounded-full border border-[var(--line)] px-4 text-sm" onClick={() => void aceitar("popup")}>
                {instalado ? copy.instalarPopupApp : copy.instalarPopup}
              </button>
              <button type="button" className="min-h-11 rounded-full px-4 text-sm text-[var(--muted)]" onClick={recusar}>
                {copy.instalarAgoraNao}
              </button>
            </div>
          </div>
        </div>
      )}

      {modo === "nao" && !perguntar && (
        <button
          type="button"
          className="fixed bottom-4 left-4 z-30 min-h-11 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-sm shadow-card"
          onClick={() => setPerguntar(true)}
        >
          {copy.acompanharDeNovo}
        </button>
      )}

      {popup && modo === "popup" && (
        <div role="status" className="fixed bottom-24 left-4 right-4 z-40 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-card sm:right-auto sm:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green)]">{copy.avisoTitulo}</p>
          <p className="mt-1 text-sm leading-snug">{popup}</p>
        </div>
      )}
    </>
  );
}

function pedirLocalizacao(definir: (uf: string | null) => void) {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (posicao) => definir(ufPorCoordenada(posicao.coords.latitude, posicao.coords.longitude)),
    () => definir(null),
    { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8000 },
  );
}

async function localSeJaPermitida(definir: (uf: string | null) => void) {
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" });
    if (status && status.state !== "granted") return;
  } catch {
    return;
  }
  pedirLocalizacao(definir);
}

function falar(texto: string, idioma: string) {
  const sintese = window.speechSynthesis;
  if (!sintese) return;
  sintese.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = idioma;
  const voz = sintese.getVoices().find((item) => item.lang.toLowerCase().startsWith(idioma.slice(0, 2).toLowerCase()));
  if (voz) frase.voice = voz;
  sintese.speak(frase);
}

async function avisarPopup(texto: string, titulo: string, mostrar: (texto: string) => void) {
  mostrar(texto);
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const registro = await navigator.serviceWorker?.ready;
    if (registro) {
      await registro.showNotification(titulo, { body: texto, icon: "/icon-192.png", badge: "/icon-192.png", tag: "apuracao" });
      return;
    }
  } catch {
    /* segue para a notificacao da pagina */
  }
  new Notification(titulo, { body: texto, icon: "/icon-192.png", tag: "apuracao" });
}
