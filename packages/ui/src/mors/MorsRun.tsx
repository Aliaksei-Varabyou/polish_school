// Mors seen from the side, galloping on the spot, tail up — for screens where the user waits.
import { jagged } from "./fluff.ts";
import { COAT, COLLAR, EYE, GOLD, LINE, PINK, SHADE, TUFT } from "./Mors.tsx";
import { useMorsStyles } from "./styles.ts";

const BODY = jagged(112, 84, 60, 32, 20, 7, { lean: 0.3 });
const HEAD = jagged(172, 60, 31, 29, 14, 9, { lean: 0.4 });
// a short boxy muzzle with the beard underneath, not a snout
const MUZZLE = jagged(203, 70, 22, 13, 10, 4, { square: 3.4, lean: 0.3 });
const BEARD = jagged(200, 76, 24, 16, 6, 7, { from: 0.1, to: Math.PI - 0.1, square: 3, lean: 0.2 });
const stroke = { stroke: LINE, strokeWidth: 3.5, strokeLinejoin: "round" as const };

function Leg({ x, back, far }: { x: number; back?: boolean; far?: boolean }) {
  return (
    <g className={`mors-leg ${back ? "mors-leg-b" : ""}`}>
      <rect x={x} y={96} width={18} height={36} rx={8} fill={far ? SHADE : COAT} {...stroke} />
      <ellipse cx={x + 9} cy={130} rx={11} ry={6} fill={far ? SHADE : COAT} {...stroke} />
    </g>
  );
}

export function MorsRun({ size = 160, className = "", title }: { size?: number; className?: string; title?: string }) {
  useMorsStyles();
  return (
    <svg
      viewBox="0 0 250 150"
      width={size}
      height={(size * 150) / 250}
      className={`mors ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g className="mors-dust" fill="#CBD5E1">
        <circle cx={30} cy={128} r={7} />
        <circle cx={30} cy={124} r={9} />
        <circle cx={30} cy={130} r={6} />
      </g>
      <ellipse cx={130} cy={140} rx={78} ry={6} fill="#0F172A" opacity={0.08} />

      <g className="mors-run-body">
        {/* the carrot tail, held high and wagging */}
        <path className="mors-run-tail" d="M70 70 C58 56 50 40 46 22 C56 24 70 44 82 64 Z" fill={COAT} {...stroke} />
        <Leg x={70} back far />
        <Leg x={150} far />
        <path d={BODY} fill={COAT} {...stroke} />
        <path d="M80 100 q3 6 0 11 M110 104 q3 6 0 11 M140 102 q3 6 0 11" fill="none" stroke={TUFT} strokeWidth={2} strokeLinecap="round" />
        <Leg x={56} />
        <Leg x={138} back />

        {/* head */}
        <g>
          <path className="mors-run-ear" d="M152 44 L156 8 Q158 3 163 7 L180 36 Z" fill={COAT} {...stroke} />
          <path d="M172 38 L181 6 Q184 2 188 7 L194 40 Z" fill={COAT} {...stroke} />
          <path d="M178 34 L183 14 L188 36 Z" fill={PINK} opacity={0.7} />
          <path d={HEAD} fill={COAT} {...stroke} />
          <path d={BEARD} fill={COAT} {...stroke} strokeWidth={2.5} />
          <path d={MUZZLE} fill={COAT} {...stroke} strokeWidth={2.5} />
          <path d="M164 48 q6 -5 14 -3" fill="none" stroke={TUFT} strokeWidth={3} strokeLinecap="round" />
          <ellipse cx={176} cy={56} rx={5} ry={6} fill={EYE} />
          <circle cx={178} cy={54} r={2} fill="#fff" />
          <circle cx={222} cy={64} r={7.5} fill={EYE} />
          <circle cx={220} cy={61} r={2} fill="#fff" opacity={0.5} />
          <ellipse cx={186} cy={74} rx={6} ry={3.5} fill={PINK} opacity={0.6} />
          {/* tongue flapping in the wind */}
          <path className="mors-tongue" d="M204 84 C204 96 212 100 216 92 L214 84 Z" fill="#F07C8A" stroke={LINE} strokeWidth={2} />
          {/* collar */}
          <path d="M148 78 C156 88 166 92 174 92 L172 100 C162 100 150 94 142 84 Z" fill={COLLAR} {...stroke} strokeWidth={2.5} />
          <circle cx={166} cy={102} r={6} fill={GOLD} stroke={LINE} strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
}
