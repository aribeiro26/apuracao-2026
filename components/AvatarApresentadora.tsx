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
          <path d="M12 94c3-16 14-24 28-24s25 8 28 24" fill="#1d4e89" />
          <path d="M30 72h20l3 22H27z" fill="#f4f7fb" />
          <rect x="34" y="60" width="12" height="12" rx="4" fill="#f3c7a6" />
          <g ref={cabeca}>
            <path d="M18 40c0-16 9-30 22-30s22 14 22 30v18H18z" fill="#3b2a24" />
            <ellipse cx="40" cy="42" rx="18" ry="20" fill="#f6d2b0" />
            <path d="M21 36c2-16 10-24 19-24s17 8 19 24c-5-8-11-11-19-11s-14 3-19 11z" fill="#3b2a24" />
            <path d={sombrancelha} stroke="#3b2a24" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d={sombrancelhaDir} stroke="#3b2a24" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <g ref={olhos}>
              <ellipse cx="33" cy="38" rx="4.2" ry="4.4" fill="#fff" />
              <ellipse cx="47" cy="38" rx="4.2" ry="4.4" fill="#fff" />
              <circle ref={pupilaE} cx="33" cy="38" r="2" fill="#1d4e89" />
              <circle ref={pupilaD} cx="47" cy="38" r="2" fill="#1d4e89" />
            </g>
            {falando ? (
              <ellipse className="avatar-boca" cx="40" cy="51" rx="4.4" ry="3.6" fill="#b64b5c" />
            ) : (
              <path d="M34 50 q6 5 12 0" stroke="#b64b5c" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            )}
          </g>
          <g className={acenar ? "avatar-acena" : undefined}>
            <path d="M58 74c8-2 14-10 12-20" stroke="#f6d2b0" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="69" cy="52" r="3.2" fill="#f6d2b0" />
          </g>
        </svg>
      </span>
    </span>
  );
}

function limite(valor: number, minimo: number, maximo: number) {
  return Math.max(minimo, Math.min(maximo, valor));
}
