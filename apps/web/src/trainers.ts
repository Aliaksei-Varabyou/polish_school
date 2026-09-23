import { bioTrainerWeb } from "@portal/trainer-bio/web";
import { lectureTrainerWeb } from "@portal/trainer-lectures/web";
import { mathTrainerWeb } from "@portal/trainer-math/web";
import type { TrainerWeb } from "@portal/trainer-sdk";

/** Web-side trainer registry: add new subjects here (and in apps/api/src/trainers.ts, for trainers that use it). */
export const trainers: TrainerWeb[] = [mathTrainerWeb, lectureTrainerWeb, bioTrainerWeb];

export const getTrainer = (id: string): TrainerWeb | undefined => trainers.find((tr) => tr.id === id);
