import { mathTrainerWeb } from "@portal/trainer-math/web";
import type { TrainerWeb } from "@portal/trainer-sdk";

/** Web-side trainer registry: add new subjects here (and in apps/api/src/trainers.ts). */
export const trainers: TrainerWeb[] = [mathTrainerWeb];
