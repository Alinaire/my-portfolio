import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

function createMotionState() {
  return {
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    vx: 0,
    vy: 0,
    vrx: 0,
    vry: 0,
    vrz: 0,
    targetX: 0,
    targetY: 0,
    targetRx: 0,
    targetRy: 0,
    targetRz: 0,
    stretch: 1,
    targetStretch: 1,
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    baseRx: 0,
    baseRy: 0,
    baseRz: 0,
    lastMoveX: 0,
    lastMoveY: 0,
    lastMoveTime: 0,
  };
}

function Header() {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(135deg,var(--accent-strong)_0%,var(--accent)_58%,#19a79f_100%)] px-5 pb-6 pt-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-9 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-white/82">
            Portfolio ID
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClassName = '' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-3 last:border-b-0">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
        {label}
      </p>
      <p className={`text-sm font-semibold text-[var(--text)] ${valueClassName}`}>{value}</p>
    </div>
  );
}

function CardBody() {
  return (
    <div className="px-5 pb-5 pt-4">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="relative h-28 w-28 flex-none overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] shadow-[0_20px_40px_rgba(15,23,42,0.16)] sm:h-32 sm:w-32">
          <img
            src="/IMG_20260501_153833.png"
            alt="Portrait of Alinaire Cunan"
            className="h-full w-full object-cover object-center"
            draggable="false"
            loading="eager"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_36%,rgba(255,255,255,0.02))]" />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <h4 className="font-poppins text-[1.5rem] font-semibold leading-[0.96] tracking-tight text-[var(--text)] sm:text-[1.8rem]">
            Alinaire
            <br />
            Cunan
          </h4>
        </div>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-1.5 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
        <InfoRow label="Technologies" value="React • Laravel" />
        <InfoRow label="Location" value="Philippines" />
        <InfoRow
          label="Status"
          value="Available"
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface-strong)] px-5 pb-5 pt-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.38em] text-[var(--muted)]">
        Portfolio
      </p>
      <p className="mt-3 font-poppins text-[1.2rem] font-semibold tracking-tight text-[var(--text)] sm:text-[1.35rem]">
        alinairecunan.dev
      </p>
    </div>
  );
}

export default function DraggableIdCard() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const lanyardRef = useRef(null);
  const ringRef = useRef(null);
  const motionRef = useRef(createMotionState());

  useEffect(() => {
    const motion = motionRef.current;
    let raf = 0;
    let previousTime = performance.now();

    const applyTransforms = () => {
      if (!cardRef.current || !lanyardRef.current || !ringRef.current) return;

      const card = cardRef.current;
      const lanyard = lanyardRef.current;
      const ring = ringRef.current;

      card.style.transform = [
        `translate3d(calc(-50% + ${motion.x}px), ${motion.y}px, 0)`,
        `rotateX(${motion.rx}deg)`,
        `rotateY(${motion.ry}deg)`,
        `rotateZ(${motion.rz}deg)`,
      ].join(' ');

      const stretch = motion.stretch;
      lanyard.style.transform = [
        'translateX(-50%)',
        `rotate(${motion.rz * 0.28}deg)`,
        `scaleY(${stretch})`,
      ].join(' ');

      ring.style.transform = [
        'translateX(-50%)',
        `translateY(${Math.min(18, Math.abs(motion.y) * 0.03 + Math.abs(motion.x) * 0.04)}px)`,
        `scale(${1 + Math.min(0.12, Math.hypot(motion.x, motion.y) * 0.001)})`,
      ].join(' ');
    };

    const tick = (time) => {
      const dt = Math.min(0.032, (time - previousTime) / 1000 || 0.016);
      previousTime = time;

      if (!motion.dragging) {
        motion.targetX = 0;
        motion.targetY = 0;
        motion.targetRx = 0;
        motion.targetRy = 0;
        motion.targetRz = 0;
        motion.targetStretch = 1;
      }

      if (motion.dragging) {
        motion.x = lerp(motion.x, motion.targetX, 0.22);
        motion.y = lerp(motion.y, motion.targetY, 0.22);
        motion.rx = lerp(motion.rx, motion.targetRx, 0.18);
        motion.ry = lerp(motion.ry, motion.targetRy, 0.18);
        motion.rz = lerp(motion.rz, motion.targetRz, 0.18);
        motion.stretch = lerp(motion.stretch, motion.targetStretch, 0.18);
      } else {
        motion.vx += (-motion.x) * 0.022 * dt * 60;
        motion.vy += (-motion.y) * 0.022 * dt * 60;
        motion.vrx += (-motion.rx) * 0.014 * dt * 60;
        motion.vry += (-motion.ry) * 0.014 * dt * 60;
        motion.vrz += (-motion.rz) * 0.014 * dt * 60;

        motion.x += motion.vx * dt * 60;
        motion.y += motion.vy * dt * 60;
        motion.rx += motion.vrx * dt * 60;
        motion.ry += motion.vry * dt * 60;
        motion.rz += motion.vrz * dt * 60;

        motion.vx *= Math.pow(0.88, dt * 60);
        motion.vy *= Math.pow(0.88, dt * 60);
        motion.vrx *= Math.pow(0.86, dt * 60);
        motion.vry *= Math.pow(0.86, dt * 60);
        motion.vrz *= Math.pow(0.86, dt * 60);

        const speed = Math.hypot(motion.vx, motion.vy);
        motion.stretch = lerp(motion.stretch, 1 + Math.min(0.14, speed * 0.01), 0.1);

        if (Math.abs(motion.x) < 0.05) motion.x = 0;
        if (Math.abs(motion.y) < 0.05) motion.y = 0;
        if (Math.abs(motion.rx) < 0.02) motion.rx = 0;
        if (Math.abs(motion.ry) < 0.02) motion.ry = 0;
        if (Math.abs(motion.rz) < 0.02) motion.rz = 0;
      }

      applyTransforms();
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const onPointerDown = (event) => {
    const motion = motionRef.current;
    if (event.button != null && event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    motion.dragging = true;
    motion.pointerId = event.pointerId;
    motion.startX = event.clientX;
    motion.startY = event.clientY;
    motion.baseX = motion.x;
    motion.baseY = motion.y;
    motion.baseRx = motion.rx;
    motion.baseRy = motion.ry;
    motion.baseRz = motion.rz;
    motion.lastMoveX = event.clientX;
    motion.lastMoveY = event.clientY;
    motion.lastMoveTime = performance.now();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const motion = motionRef.current;
    if (!motion.dragging || motion.pointerId !== event.pointerId) return;

    const dx = event.clientX - motion.startX;
    const dy = event.clientY - motion.startY;
    const magnitude = Math.hypot(dx, dy);
    const now = performance.now();
    const elapsed = Math.max(8, now - motion.lastMoveTime);
    const velocityScale = 16 / elapsed;

    motion.targetX = clamp(motion.baseX + dx * 0.34, -112, 112);
    motion.targetY = clamp(motion.baseY + dy * 0.28, -96, 116);
    motion.targetRx = clamp(motion.baseRx - dy * 0.04, -18, 18);
    motion.targetRy = clamp(motion.baseRy + dx * 0.035, -20, 20);
    motion.targetRz = clamp(motion.baseRz + dx * 0.01, -12, 12);
    motion.targetStretch = clamp(1 + magnitude * 0.0016, 1, 1.22);

    motion.vx = (event.clientX - motion.lastMoveX) * velocityScale * 0.42;
    motion.vy = (event.clientY - motion.lastMoveY) * velocityScale * 0.42;
    motion.vrx = -motion.vy * 0.08;
    motion.vry = motion.vx * 0.08;
    motion.vrz = motion.vx * 0.03;

    motion.lastMoveX = event.clientX;
    motion.lastMoveY = event.clientY;
    motion.lastMoveTime = now;
  };

  const endDrag = (event) => {
    const motion = motionRef.current;
    if (!motion.dragging) return;
    if (event?.pointerId != null && motion.pointerId !== event.pointerId) return;

    motion.dragging = false;
    motion.pointerId = null;
    event?.currentTarget?.releasePointerCapture?.(event.pointerId);
  };

  return (
    <div
      ref={stageRef}
      className="relative mx-auto w-full max-w-[480px] select-none lg:justify-self-end"
      style={{ perspective: '1700px' }}
    >
      <div className="relative h-[600px] w-full sm:h-[660px] lg:h-[720px]">
        <div
          ref={lanyardRef}
          className="pointer-events-none absolute left-1/2 top-0 z-10 w-[30px] origin-top"
          style={{ transform: 'translateX(-50%) scaleY(1)' }}
        >
          <div className="absolute left-1/2 top-0 h-[116px] w-[22px] -translate-x-1/2 overflow-hidden rounded-b-[24px] bg-[linear-gradient(180deg,var(--accent-strong)_0%,var(--accent)_56%,rgba(20,184,166,0.86)_100%)] shadow-[0_18px_28px_rgba(15,118,110,0.18)]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.14)_0_6px,rgba(255,255,255,0)_6px_12px)] opacity-70" />
            <div className="absolute inset-x-[3px] top-0 h-full rounded-b-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0)_42%,rgba(255,255,255,0.08))]" />
            <div className="absolute inset-y-0 left-1/2 w-[4px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.06))] opacity-80" />
          </div>
          <div
            ref={ringRef}
            className="absolute left-1/2 top-[108px] h-8 w-8 -translate-x-1/2 rounded-full border-[4px] border-[rgba(15,118,110,0.2)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(234,225,212,0.96))] shadow-[0_10px_24px_rgba(15,118,110,0.12)]"
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>

        <div
          ref={cardRef}
          role="presentation"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          className="absolute left-1/2 top-[116px] z-20 w-[min(90vw,372px)] cursor-grab active:cursor-grabbing"
          style={{
            transform: 'translate3d(calc(-50% + 0px), 0px, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
            transformOrigin: '50% 14%',
            willChange: 'transform',
          }}
        >
          <div className="overflow-hidden rounded-[2rem] bg-[var(--surface-strong)] shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            <Header />
            <CardBody />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
