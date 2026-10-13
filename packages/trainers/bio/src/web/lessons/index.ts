// Interactive explanations, one per textbook paragraph. They sit beside the trainer and never touch
// the task pool: a lesson only reads the curriculum and, at its end, starts an ordinary session on
// its own paragraph. Each lesson loads lazily, so the start page pays nothing for them.
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { P6 } from "../../curriculum/index.ts";
import type { LessonProps } from "./kit.tsx";

type Lesson = LazyExoticComponent<ComponentType<LessonProps>>;

const LESSONS: Record<string, Lesson> = {
  [P6.arthropods.insects]: lazy(() => import("./insects/InsectsLesson.tsx")),
};

export const hasLesson = (paragraphId: string): boolean => paragraphId in LESSONS;
export const lessonFor = (paragraphId: string): Lesson | undefined => LESSONS[paragraphId];
export const lessonIds = (): string[] => Object.keys(LESSONS);
