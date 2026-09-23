// The curriculum lists lektury per school stage (klasy 1–3, 4–6, 7–8, liceum) and leaves the exact year to
// each school, so the trainer lets students pick a stage rather than a single grade.
import type { Grade } from "@portal/core";

export const STAGES = [
  { id: "sp1-3", grades: ["sp1", "sp2", "sp3"] },
  { id: "sp4-6", grades: ["sp4", "sp5", "sp6"] },
  { id: "sp7-8", grades: ["sp7", "sp8"] },
  { id: "lo", grades: ["lo1", "lo2", "lo3", "lo4"] },
] as const satisfies readonly { id: string; grades: readonly Grade[] }[];

export type StageId = (typeof STAGES)[number]["id"];

export const DEFAULT_STAGE: StageId = "sp4-6";

export const stageGrades = (id: StageId): readonly Grade[] => STAGES.find((s) => s.id === id)?.grades ?? [];

export const stageOf = (grade: Grade): StageId | undefined =>
  STAGES.find((s) => (s.grades as readonly Grade[]).includes(grade))?.id;

export const isStageId = (value: unknown): value is StageId => STAGES.some((s) => s.id === value);
