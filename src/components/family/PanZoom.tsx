import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MIN = 0.3;
const MAX = 2.5;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

type T = { x: number; y: number; k: number };

/** Drag-to-pan + wheel/button zoom canvas. Content is laid out at natural size and transformed. */
export function PanZoom({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<T>({ x: 0, y: 0, k: 1 });
  const tRef = useRef(t);
  tRef.current = t;
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  const fit = useCallback(() => {
    const w = wrap.current, c = inner.current;
    if (!w || !c) return;
    const pad = 32;
    const k = clamp(Math.min((w.clientWidth - pad * 2) / c.offsetWidth, (w.clientHeight - pad * 2) / c.offsetHeight, 1.2));
    setT({ k, x: (w.clientWidth - c.offsetWidth * k) / 2, y: Math.max(pad, (w.clientHeight - c.offsetHeight * k) / 2) });
  }, []);

  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [fit]);

  const zoomAt = (next: number, px: number, py: number) => {
    const cur = tRef.current;
    const k2 = clamp(next);
    const r = k2 / cur.k;
    setT({ k: k2, x: px - (px - cur.x) * r, y: py - (py - cur.y) * r });
  };
  const zoomCenter = (f: number) => {
    const w = wrap.current;
    if (w) zoomAt(tRef.current.k * f, w.clientWidth / 2, w.clientHeight / 2);
  };

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const rect = wrap.current!.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(tRef.current.k * Math.exp(-dy * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
  };
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  return (
    <div
      ref={wrap}
      className="relative h-full w-full cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
        if (!d.moved && Math.hypot(dx, dy) < 5) return;
        if (!d.moved) {
          d.moved = true;
          wrap.current?.setPointerCapture(e.pointerId);
        }
        setT((p) => ({ ...p, x: d.ox + dx, y: d.oy + dy }));
      }}
      onPointerUp={() => {
        // keep `moved` until click fires so we can suppress it
        setTimeout(() => (drag.current = null), 0);
      }}
      onClickCapture={(e) => {
        if (drag.current?.moved) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      <div
        ref={inner}
        className="absolute left-0 top-0 w-max origin-top-left"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.k})` }}
      >
        {children}
      </div>

      <div
        className="absolute bottom-4 right-4 flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-lift"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <CtrlBtn label="Zoom out" onClick={() => zoomCenter(1 / 1.2)}>−</CtrlBtn>
        <span className="w-12 text-center text-xs font-semibold text-muted-foreground">{Math.round(t.k * 100)}%</span>
        <CtrlBtn label="Zoom in" onClick={() => zoomCenter(1.2)}>+</CtrlBtn>
        <CtrlBtn label="Fit to screen" onClick={fit}>⤢</CtrlBtn>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-lg bg-card/80 px-3 py-1.5 text-xs text-muted-foreground sm:block">
        Drag to move · Scroll to zoom
      </div>
    </div>
  );
}

function CtrlBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-primary transition hover:bg-secondary"
    >
      {children}
    </button>
  );
}
