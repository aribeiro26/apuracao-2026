"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { FIM_VOTACAO, INICIO_VOTACAO } from "@/lib/eleicao";
import type { Copy } from "@/lib/i18n";

const INICIO = INICIO_VOTACAO;
const FIM = FIM_VOTACAO;
const CHAVE = "aviso-2turno";
const ENVIADO = "aviso-2turno-dia";
const LIMITE_TIMER = 2_147_000_000;

type Estado = "off" | "ligado" | "negado" | "sem";

function mostrar(copy: Copy, corpo: string, tag: string) {
  const nota = new Notification(copy.avisoTitulo, { body: corpo, tag });
  nota.onclick = () => {
    window.focus();
    nota.close();
  };
}

function dispararDia(copy: Copy) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CHAVE) !== "1") return;
  if (localStorage.getItem(ENVIADO) === "1") return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const agora = Date.now();
  if (agora < INICIO || agora >= FIM + 3 * 60 * 60 * 1000) return;
  localStorage.setItem(ENVIADO, "1");
  try {
    mostrar(copy, copy.avisoCorpoDia, "2turno-dia");
  } catch {
    localStorage.removeItem(ENVIADO);
  }
}

export function DataTurno() {
  const { copy } = useI18n();
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const [texto, setTexto] = useState<string | null>(null);
  const [quero, setQuero] = useState(false);
  const [estado, setEstado] = useState<Estado>("off");
  const [passou, setPassou] = useState(false);

  useEffect(() => {
    function atualizar() {
      const falta = FIM - Date.now();
      setPassou(falta <= 0);
      if (falta <= 0) {
        setTexto(copyRef.current.countdownPast);
        return;
      }
      const dias = Math.floor(falta / 86400000);
      const horas = Math.floor((falta % 86400000) / 3600000);
      setTexto(copyRef.current.countdownFuture(dias, horas));
    }
    atualizar();
    const id = window.setInterval(atualizar, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    const pedido = localStorage.getItem(CHAVE) === "1";
    if (!pedido) return;
    if (Notification.permission === "granted") {
      setQuero(true);
      setEstado("ligado");
      return;
    }
    if (Notification.permission === "denied") setEstado("negado");
  }, []);

  useEffect(() => {
    if (!quero) return;
    const tick = () => dispararDia(copyRef.current);
    tick();
    const falta = INICIO - Date.now();
    const timeout = falta > 0 && falta < LIMITE_TIMER ? window.setTimeout(tick, falta) : 0;
    const intervalo = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(intervalo);
    };
  }, [quero]);

  async function alternar(marcado: boolean) {
    if (!marcado) {
      localStorage.removeItem(CHAVE);
      setQuero(false);
      setEstado("off");
      return;
    }
    if (typeof Notification === "undefined") {
      setQuero(false);
      setEstado("sem");
      return;
    }
    let permissao = Notification.permission;
    if (permissao !== "granted") permissao = await Notification.requestPermission();
    if (permissao !== "granted") {
      localStorage.removeItem(CHAVE);
      setQuero(false);
      setEstado(permissao === "denied" ? "negado" : "off");
      return;
    }
    localStorage.setItem(CHAVE, "1");
    setQuero(true);
    setEstado("ligado");
    const agora = Date.now();
    if (agora >= INICIO && agora < FIM + 3 * 60 * 60 * 1000) {
      dispararDia(copy);
      return;
    }
    if (agora < INICIO) {
      try {
        mostrar(copy, copy.avisoCorpoConfirmado, "2turno-ok");
      } catch {
        setEstado("sem");
      }
    }
  }

  const nota = estado === "ligado" ? copy.avisoLigado : estado === "negado" ? copy.avisoNegado : estado === "sem" ? copy.avisoSemSuporte : "";

  return (
    <section className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5" aria-labelledby="data-segundo-turno">
      <p className="text-sm font-medium text-[var(--green)]">{copy.turno2}</p>
      <p id="data-segundo-turno" className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">{copy.dataTurnoQuando}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{copy.dataTurnoHorario}</p>
      {texto ? <p className="mt-2 text-sm">{texto}</p> : null}
      {!passou && (
        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ink)]"
            checked={quero}
            aria-describedby={nota ? "aviso-nota" : undefined}
            onChange={(evento) => void alternar(evento.target.checked)}
          />
          <span>{copy.avisoQuero}</span>
        </label>
      )}
      {nota ? <p id="aviso-nota" className="mt-2 text-sm text-[var(--muted)]">{nota}</p> : null}
    </section>
  );
}
