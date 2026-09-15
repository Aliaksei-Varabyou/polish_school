import type { Difficulty, Grade, Lang, Level } from "./schemas.ts";
import type { Topic } from "./topic.ts";

export type TaskKind = "input" | "choice";

/** One task to generate. A batch may mix topics. */
export interface TaskSlot {
  topic: Topic;
  difficulty: Difficulty;
  kind: TaskKind;
}

export interface TaskBatchInput {
  lang: Lang;
  grade: Grade;
  level?: Level;
  slots: TaskSlot[];
}
