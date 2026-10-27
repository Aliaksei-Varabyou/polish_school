// Mors (Морс) — a West Highland White Terrier, the portal's mascot. Drawn as one inline SVG, sitting
// and facing the reader so his face can carry a mood; the mood only swaps eyes, brows, mouth and
// extras and sets a class, the movement itself is CSS (styles.ts). All white, so every outline is a
// tufted path (fluff.ts); named after the berry drink, hence the cranberry collar.
import { jagged } from "./fluff.ts";
import { useMorsStyles } from "./styles.ts";

export type MorsMood = "idle" | "happy" | "celebrate" | "wrong" | "think" | "pet" | "sleep";

export const COAT = "#FFFFFF";
export const SHADE = "#E6E9EF";
export const TUFT = "#C3C9D3";
export const LINE = "#262B33";
export const EYE = "#1C1917";
export const PINK = "#F4A6A0";
export const COLLAR = "#B3263E";
export const GOLD = "#F2C14E";

// outlines, computed once. The head is a wide box flaring into cheeks and a beard, its edge cut
// into uneven tufts; the body wears shorter ones.
const HEAD = jagged(100, 88, 56, 47, 18, 12, { square: 2.6, flare: 0.14, lean: 0.5, pattern: [1, 0.6, 0.85, 0.5, 0.95, 0.7] });
const TORSO = jagged(100, 160, 46, 42, 16, 7, { lean: 0.4 });
const HAUNCH_L = jagged(54, 180, 26, 20, 10, 5, { lean: 0.4 });
const HAUNCH_R = jagged(146, 180, 26, 20, 10, 5, { lean: 0.4 });
// the muzzle: the part of the face that sticks out forward, drawn as a softly tufted disc
const MUZZLE = jagged(100, 118, 31, 25, 14, 3.5, { lean: 0.3, pattern: [1, 0.6, 0.8] });
// the chest "skirt": a fringe hanging over the front legs
const SKIRT = jagged(100, 168, 30, 16, 7, 6, { from: 0.15, to: Math.PI - 0.15, lean: 0.2 });

interface Props {
  mood?: MorsMood;
  /** rendered width in px; height follows */
  size?: number;
  className?: string;
  /** accessible name; without it the drawing is decorative */
  title?: string;
}

export function Mors({ mood = "idle", size = 96, className = "", title }: Props) {
  useMorsStyles();
  const closedHappy = mood === "happy" || mood === "celebrate" || mood === "pet";
  const openMouth = mood === "happy" || mood === "celebrate";
  const stroke = { stroke: LINE, strokeWidth: 3.5, strokeLinejoin: "round" as const };

  return (
    <svg
      viewBox="0 0 200 210"
      width={size}
      height={(size * 210) / 200}
      className={`mors mors-${mood} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g className="mors-all">
        {/* ---- tail: the Westie's upright "carrot", behind everything ---- */}
        <g className="mors-tail">
          <path d="M138 150 C136 128 148 104 168 86 C176 92 174 120 158 152 Z" fill={COAT} {...stroke} />
          <path d="M150 128 l6 -4 M156 112 l6 -3" stroke={TUFT} strokeWidth={2} strokeLinecap="round" />
        </g>

        {/* ---- body ---- */}
        <g className="mors-body">
          <path d={HAUNCH_L} fill={COAT} {...stroke} />
          <path d={HAUNCH_R} fill={COAT} {...stroke} />
          <ellipse cx={36} cy={198} rx={14} ry={7} fill={COAT} {...stroke} />
          <ellipse cx={164} cy={198} rx={14} ry={7} fill={COAT} {...stroke} />
          <path d={TORSO} fill={COAT} {...stroke} />
          <path d="M66 156 q4 6 2 12 M134 156 q-4 6 -2 12 M72 182 q4 4 4 9 M128 182 q-4 4 -4 9" fill="none" stroke={TUFT} strokeWidth={2} strokeLinecap="round" />
          {/* collar with a name tag, half hidden under the chin fur */}
          <path d="M66 134 Q100 150 134 134 L135 143 Q100 159 65 143 Z" fill={COLLAR} {...stroke} strokeWidth={2.5} />
          <circle cx={100} cy={156} r={7} fill={GOLD} stroke={LINE} strokeWidth={2} />
          <text x={100} y={159} textAnchor="middle" fontSize={8} fontWeight={800} fill={LINE} fontFamily="ui-sans-serif, system-ui, sans-serif">
            M
          </text>
          {/* short front legs under a fringe of chest fur */}
          <rect x={77} y={166} width={20} height={34} rx={9} fill={COAT} {...stroke} />
          <rect x={103} y={166} width={20} height={34} rx={9} fill={COAT} {...stroke} />
          <path d="M83 193 L83 199 M89 193 L89 199 M109 193 L109 199 M115 193 L115 199" stroke={LINE} strokeWidth={2} />
          <path d={SKIRT} fill={COAT} stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" />
        </g>

        {/* ---- head ---- */}
        <g className="mors-head">
          {/* big triangular ears at the corners, tipped a little outwards */}
          <g className="mors-ear-l">
            <path d="M48 60 L44 16 Q44 9 50 12 L88 44 Z" fill={COAT} {...stroke} />
            <path d="M56 50 L54 27 L74 45" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M58 48 L56 31 L70 45 Z" fill={PINK} opacity={0.7} />
          </g>
          <g className="mors-ear-r">
            <path d="M152 60 L156 16 Q156 9 150 12 L112 44 Z" fill={COAT} {...stroke} />
            <path d="M144 50 L146 27 L126 45" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M142 48 L144 31 L130 45 Z" fill={PINK} opacity={0.7} />
          </g>

          <path d={HEAD} fill={COAT} {...stroke} />
          {/* fur strokes: a topknot, hair under the eyes sweeping towards the nose, the beard */}
          <g fill="none" stroke={LINE} strokeWidth={2.5} strokeLinecap="round">
            <path d="M92 44 l4 10 M100 40 l0 12 M108 44 l-4 10" />
            <path d="M84 136 l-3 8 M100 138 l0 9 M116 136 l3 8" strokeWidth={2} opacity={0.5} />
          </g>
          <path d={MUZZLE} fill={COAT} stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" />

          {/* blush */}
          <ellipse cx={60} cy={96} rx={8} ry={4.5} fill={PINK} opacity={mood === "pet" ? 0.95 : 0.45} />
          <ellipse cx={140} cy={96} rx={8} ry={4.5} fill={PINK} opacity={mood === "pet" ? 0.95 : 0.45} />

          {/* brows: thin strokes, raised when thinking, knitted when wrong */}
          <g fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round">
            {mood === "wrong" ? (
              <>
                <path d="M66 66 L84 60" />
                <path d="M116 60 L134 66" />
              </>
            ) : mood === "think" ? (
              <>
                <path d="M64 62 Q74 54 86 58" />
                <path d="M114 56 Q126 54 136 62" />
              </>
            ) : (
              <>
                <path d="M64 68 Q74 60 86 64" />
                <path d="M114 64 Q126 60 136 68" />
              </>
            )}
          </g>

          {/* eyes: dark ovals set wide */}
          {closedHappy ? (
            <g fill="none" stroke={EYE} strokeWidth={4.5} strokeLinecap="round">
              <path d="M66 86 Q76 74 86 86" />
              <path d="M114 86 Q124 74 134 86" />
            </g>
          ) : mood === "sleep" ? (
            <g fill="none" stroke={EYE} strokeWidth={4} strokeLinecap="round">
              <path d="M66 83 Q76 90 86 83" />
              <path d="M114 83 Q124 90 134 83" />
            </g>
          ) : (
            <g className="mors-eyes-open">
              <ellipse cx={76} cy={83} rx={7} ry={mood === "wrong" ? 7.5 : 8.5} fill={EYE} />
              <ellipse cx={124} cy={83} rx={7} ry={mood === "wrong" ? 7.5 : 8.5} fill={EYE} />
              <circle cx={mood === "think" ? 79 : 73.5} cy={mood === "think" ? 78 : 80} r={2.6} fill="#fff" />
              <circle cx={mood === "think" ? 127 : 121.5} cy={mood === "think" ? 78 : 80} r={2.6} fill="#fff" />
            </g>
          )}

          {/* the big nose, a rounded triangle */}
          <path d="M82 104 Q100 98 118 104 Q120 116 104 124 Q100 126 96 124 Q80 116 82 104 Z" fill={EYE} />
          <ellipse cx={92} cy={105} rx={4} ry={2} fill="#fff" opacity={0.45} />

          {/* mouth */}
          {openMouth ? (
            <g>
              <path d="M84 128 Q100 146 116 128 Q100 133 84 128 Z" fill="#7A1F2B" stroke={EYE} strokeWidth={2.5} strokeLinejoin="round" />
              <path d="M92 134 Q100 143 108 134 Q100 137 92 134 Z" fill={PINK} />
            </g>
          ) : mood === "wrong" ? (
            <path d="M88 133 Q94 129 100 132 Q106 135 112 131" fill="none" stroke={EYE} strokeWidth={2.5} strokeLinecap="round" />
          ) : mood === "think" ? (
            <ellipse cx={104} cy={133} rx={3.5} ry={3} fill="#7A1F2B" />
          ) : (
            <g fill="none" stroke={EYE} strokeWidth={2.5} strokeLinecap="round">
              <path d="M100 126 L100 131" />
              <path d="M86 128 Q93 137 100 131 Q107 137 114 128" />
            </g>
          )}
        </g>
      </g>

      {/* ---- extras that belong to a mood ---- */}
      {mood === "think" && (
        <text className="mors-bob" x={166} y={44} fontSize={34} fontWeight={800} fill="#6366F1" fontFamily="ui-sans-serif, system-ui, sans-serif">
          ?
        </text>
      )}
      {mood === "sleep" && (
        <g className="mors-zz" fill="#6366F1" fontWeight={800} fontFamily="ui-sans-serif, system-ui, sans-serif">
          <text x={150} y={46} fontSize={18}>z</text>
          <text x={150} y={46} fontSize={22}>z</text>
          <text x={150} y={46} fontSize={26}>Z</text>
        </g>
      )}
      {mood === "pet" && (
        <g className="mors-float" fill="#F43F5E">
          <Heart x={150} y={44} />
          <Heart x={34} y={50} />
          <Heart x={164} y={80} />
        </g>
      )}
      {mood === "celebrate" && (
        <g className="mors-confetti">
          {CONFETTI.map(([dx, dy, color, shape], i) =>
            shape === "bone" ? (
              <g key={i} style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px` }}>
                <Bone x={100} y={90} />
              </g>
            ) : (
              <rect
                key={i}
                x={97}
                y={86}
                width={8}
                height={shape === "strip" ? 14 : 8}
                rx={shape === "dot" ? 4 : 1.5}
                fill={color}
                style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px` }}
              />
            ),
          )}
        </g>
      )}
    </svg>
  );
}

const CONFETTI: [number, number, string, "dot" | "strip" | "bone"][] = [
  [-90, -70, "#F59E0B", "strip"],
  [85, -80, "#10B981", "dot"],
  [-60, -110, "#6366F1", "dot"],
  [60, -115, "#F43F5E", "strip"],
  [-105, -20, "#0EA5E9", "dot"],
  [100, -25, "#F59E0B", "dot"],
  [0, -125, "#B3263E", "strip"],
  [-30, -95, "#10B981", "strip"],
  [35, -100, "#0EA5E9", "dot"],
  [75, -60, "", "bone"],
];

function Heart({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y + 6} C${x - 10} ${y - 2} ${x - 6} ${y - 12} ${x} ${y - 6} C${x + 6} ${y - 12} ${x + 10} ${y - 2} ${x} ${y + 6} Z`} />;
}

export function Bone({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#FFF3D6" stroke={LINE} strokeWidth={2}>
      <path d="M-12 -3 L12 -3 A5 5 0 1 1 16 -8 A5 5 0 1 1 16 8 A5 5 0 1 1 12 3 L-12 3 A5 5 0 1 1 -16 8 A5 5 0 1 1 -16 -8 A5 5 0 1 1 -12 -3 Z" />
    </g>
  );
}
