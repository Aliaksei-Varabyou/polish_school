import type { TrainerServer } from "@portal/trainer-sdk";
import { bioTrainer } from "@portal/trainer-bio/server";
import { historyTrainer } from "@portal/trainer-history/server";
import { mathTrainer } from "@portal/trainer-math/server";

/** Server-side trainer registry: add new subjects here. */
export const trainers = new Map<string, TrainerServer>([
  [mathTrainer.id, mathTrainer],
  [bioTrainer.id, bioTrainer],
  [historyTrainer.id, historyTrainer],
]);
