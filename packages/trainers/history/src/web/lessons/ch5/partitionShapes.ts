// Schematic geometry of the Commonwealth before 1772 and of the eight pieces the three partitions
// cut from it, shared by the maps of §27 (first partition) and §31 (all three). The polygons tile
// the outline exactly (they share vertices), so the drawing reads as one country being carved up.
// Coordinates live in a 400 × 300 box; shapes are deliberately simple — the idea, not cartography.

export const VIEW = "0 0 400 318";

/** the Commonwealth within its 1772 borders */
export const OUTLINE = "M62 118 L100 78 L128 52 L160 62 L178 92 L215 78 L232 45 L300 30 L330 40 L395 48 L398 110 L392 175 L396 235 L340 262 L265 282 L195 292 L150 268 L115 245 L100 215 L68 180 Z";

/** Ducal Prussia — Prussian already, the reason Berlin wanted the Gdańsk corridor */
export const DUCAL_PRUSSIA = "M160 62 L170 38 L232 45 L215 78 L178 92 Z";

export type Taker = "rosja" | "prusy" | "austria";
export type Year = 1772 | 1793 | 1795;

export interface Piece {
  id: string;
  taker: Taker;
  year: Year;
  d: string;
  /** where the pin sits in "label it" mode: inside the piece, clear of city labels and edges */
  at: [number, number];
}

export const PIECES: Piece[] = [
  { id: "p1772", taker: "prusy", year: 1772, d: "M100 78 L128 52 L160 62 L178 92 L150 108 L105 105 Z", at: [138, 84] },
  { id: "a1772", taker: "austria", year: 1772, d: "M110 236 L160 222 L220 228 L270 240 L265 282 L195 292 L150 268 L115 245 Z", at: [195, 262] },
  { id: "r1772", taker: "rosja", year: 1772, d: "M325 75 L330 40 L395 48 L398 110 L392 175 L350 172 L340 120 Z", at: [348, 112] },
  { id: "p1793", taker: "prusy", year: 1793, d: "M62 118 L105 105 L150 108 L185 175 L160 200 L115 205 L100 215 L68 180 Z", at: [118, 158] },
  { id: "r1793", taker: "rosja", year: 1793, d: "M270 120 L340 120 L350 172 L392 175 L396 235 L340 262 L265 282 L270 240 L255 200 L250 140 Z", at: [322, 205] },
  { id: "p1795", taker: "prusy", year: 1795, d: "M150 108 L178 92 L230 100 L250 140 L240 185 L185 175 Z", at: [215, 125] },
  { id: "r1795", taker: "rosja", year: 1795, d: "M178 92 L215 78 L232 45 L300 30 L330 40 L325 75 L340 120 L270 120 L250 140 L230 100 Z", at: [258, 52] },
  { id: "a1795", taker: "austria", year: 1795, d: "M100 215 L115 205 L160 200 L185 175 L240 185 L255 200 L270 240 L220 228 L160 222 L110 236 Z", at: [185, 208] },
];

/** fill per taker and partition: the later the darker */
export const FILL: Record<Taker, Record<Year, string>> = {
  rosja: { 1772: "#bbf7d0", 1793: "#4ade80", 1795: "#15803d" },
  prusy: { 1772: "#bfdbfe", 1793: "#60a5fa", 1795: "#1d4ed8" },
  austria: { 1772: "#fde68a", 1793: "#fbbf24", 1795: "#b45309" },
};

export const TAKER_NAME: Record<Taker, { pl: string; ru: string }> = {
  rosja: { pl: "Rosja", ru: "Россия" },
  prusy: { pl: "Prusy", ru: "Пруссия" },
  austria: { pl: "Austria", ru: "Австрия" },
};

export interface City {
  name: string;
  x: number;
  y: number;
  /** label side */
  side?: "l" | "r";
}

export const CITIES: City[] = [
  { name: "Gdańsk", x: 130, y: 58, side: "r" },
  { name: "Toruń", x: 146, y: 104, side: "l" },
  { name: "Poznań", x: 95, y: 142, side: "l" },
  { name: "Warszawa", x: 200, y: 150, side: "r" },
  { name: "Kraków", x: 124, y: 220, side: "l" },
  { name: "Lwów", x: 215, y: 256, side: "r" },
  { name: "Wilno", x: 268, y: 72, side: "r" },
  { name: "Grodno", x: 246, y: 118, side: "r" },
  { name: "Mińsk", x: 312, y: 150, side: "r" },
  { name: "Kamieniec", x: 300, y: 258, side: "r" },
];

export const CITY_RU: Record<string, string> = {
  Gdańsk: "Гданьск",
  Toruń: "Торунь",
  Poznań: "Познань",
  Warszawa: "Варшава",
  Kraków: "Краков",
  Lwów: "Львов",
  Wilno: "Вильно",
  Grodno: "Гродно",
  Mińsk: "Минск",
  Kamieniec: "Каменец",
};
