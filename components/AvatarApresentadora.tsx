"use client";

import { useEffect, useRef } from "react";

export function AvatarApresentadora({
  falando,
  ouvindo,
  pensando,
  acenar,
}: {
  falando: boolean;
  ouvindo: boolean;
  pensando: boolean;
  acenar: boolean;
}) {
  const raiz = useRef<HTMLSpanElement>(null);
  const cabeca = useRef<SVGGElement>(null);
  const olhos = useRef<SVGGElement>(null);
  const pupilaE = useRef<SVGCircleElement>(null);
  const pupilaD = useRef<SVGCircleElement>(null);
  const olhar = useRef({ x: 0, y: 0 });
  const pouco = useRef(false);
  const pensandoRef = useRef(pensando);
  pensandoRef.current = pensando;

  function pensarY(y: number) {
    return pensandoRef.current ? Math.min(y, -1.2) : y;
  }

  function aplicar(x: number, y: number) {
    olhar.current = { x, y };
    pupilaE.current?.setAttribute("cx", String(33 + x));
    pupilaE.current?.setAttribute("cy", String(38 + y));
    pupilaD.current?.setAttribute("cx", String(47 + x));
    pupilaD.current?.setAttribute("cy", String(38 + y));
    if (pouco.current) {
      cabeca.current?.removeAttribute("transform");
      return;
    }
    cabeca.current?.setAttribute("transform", `rotate(${x * 3.4} 40 48)`);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ler = () => {
      pouco.current = media.matches;
    };
    ler();
    media.addEventListener("change", ler);
    return () => media.removeEventListener("change", ler);
  }, []);

  useEffect(() => {
    aplicar(olhar.current.x, pensarY(olhar.current.y));
  });

  useEffect(() => {
    const mover = (evento: PointerEvent) => {
      const caixa = raiz.current?.getBoundingClientRect();
      if (!caixa) return;
      const dx = limite((evento.clientX - (caixa.left + caixa.width / 2)) / 90, -1, 1);
      const dy = limite((evento.clientY - (caixa.top + caixa.height / 2)) / 90, -1, 1);
      aplicar(dx * 1.8, pensarY(dy * 1.4));
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => window.removeEventListener("pointermove", mover);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    let espera = 0;
    let fechado = 0;
    const piscar = () => {
      olhos.current?.classList.add("avatar-pisca");
      fechado = window.setTimeout(() => olhos.current?.classList.remove("avatar-pisca"), 120);
      espera = window.setTimeout(piscar, 2600 + Math.random() * 3400);
    };
    espera = window.setTimeout(piscar, 1400);
    return () => {
      window.clearTimeout(espera);
      window.clearTimeout(fechado);
    };
  }, []);

  const sombrancelha = ouvindo ? "M27 30 q5 -5 10 0" : pensando ? "M27 31 q5 -4 10 1" : "M27 32 q5 -2 10 0";
  const sombrancelhaDir = ouvindo ? "M43 30 q5 -5 10 0" : "M43 32 q5 -2 10 0";

  return (
    <span ref={raiz} className="avatar-respira inline-grid h-full w-full" aria-hidden>
      <span className={falando ? "avatar-fala inline-grid" : "inline-grid"}>
        <svg viewBox="0 0 80 96" className="h-full w-full">
          <path d="M16 96c2-14 12-22 24-22s22 8 24 22" fill="#243656" />
          <path d="M28 70c2 2 6 4 12 4s10-2 12-4l2 26H26z" fill="#f7f1ea" />
          <path d="M36 64c1 6 2 10 4 12 2-2 3-6 4-12" fill="#e7b89a" />
          <g ref={cabeca}>
            <path d="M14 46c1-22 10-38 26-38s25 16 26 38c-2 6-8 8-14 6 2 10-4 16-12 16s-14-6-12-16c-6 2-12 0-14-6z" fill="#4a3428" />
            <path d="M22 78c4 8 10 12 18 12s14-4 18-12c-6 4-12 6-18 6s-12-2-18-6z" fill="#e7b89a" />
            <ellipse cx="18" cy="48" rx="3.2" ry="5" fill="#f0c2a4" />
            <ellipse cx="62" cy="48" rx="3.2" ry="5" fill="#f0c2a4" />
            <ellipse cx="40" cy="46" rx="17.5" ry="20.5" fill="#f3c7a8" />
            <ellipse cx="40" cy="50" rx="14" ry="15" fill="#f6d0b4" />
            <path d="M24 40c1-18 8-28 16-28s15 10 16 28c-4-9-10-13-16-13s-12 4-16 13z" fill="#3d2b22" />
            <path d="M22 42c3-4 6-2 8 1" stroke="#3d2b22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M58 42c-3-4-6-2-8 1" stroke="#3d2b22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d={sombrancelha} stroke="#3d2b22" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d={sombrancelhaDir} stroke="#3d2b22" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <g ref={olhos}>
              <path d="M28 36 q5 -3 10 0" stroke="#c98978" strokeWidth="1.1" fill="none" />
              <path d="M42 36 q5 -3 10 0" stroke="#c98978" strokeWidth="1.1" fill="none" />
              <ellipse cx="33" cy="38" rx="4.6" ry="3.6" fill="#fff" />
              <ellipse cx="47" cy="38" rx="4.6" ry="3.6" fill="#fff" />
              <circle cx="33" cy="38" r="2.5" fill="#6a4328" />
              <circle cx="47" cy="38" r="2.5" fill="#6a4328" />
              <circle ref={pupilaE} cx="33" cy="38" r="1.35" fill="#1c140f" />
              <circle ref={pupilaD} cx="47" cy="38" r="1.35" fill="#1c140f" />
              <circle cx="34.1" cy="37.1" r="0.55" fill="#fff" />
              <circle cx="48.1" cy="37.1" r="0.55" fill="#fff" />
            </g>
            <path d="M40 41c-.8 2.4-1 4.2 0 6.2" stroke="#d7a88e" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <ellipse cx="40" cy="48.2" rx="1.5" ry="1" fill="#e2b194" />
            <ellipse cx="31" cy="46" rx="2.4" ry="1.2" fill="#e7a08c" opacity="0.35" />
            <ellipse cx="49" cy="46" rx="2.4" ry="1.2" fill="#e7a08c" opacity="0.35" />
            {falando ? (
              <g className="avatar-boca">
                <ellipse cx="40" cy="54" rx="4.2" ry="2.8" fill="#8d3d4a" />
                <ellipse cx="40" cy="54.6" rx="2.4" ry="1.1" fill="#d07a86" />
              </g>
            ) : (
              <path d="M34.5 53.2c1.8 1.8 3.6 2.4 5.5 2.4s3.7-.6 5.5-2.4" stroke="#a85a66" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            )}
          </g>
          <g className={acenar ? "avatar-acena" : undefined}>
            <path d="M58 74c8-2 14-10 12-20" stroke="#f0c2a4" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="69" cy="52" r="3.2" fill="#f0c2a4" />
          </g>
        </svg>
      </span>
    </span>
  );
}

function limite(valor: number, minimo: number, maximo: number) {
  return Math.max(minimo, Math.min(maximo, valor));
}
