// Interactive explanations, one per textbook paragraph. They sit beside the trainer and never touch
// the task pool: a lesson only reads the curriculum and, at its end, starts an ordinary session on
// its own paragraph. Each lesson loads lazily, so the start page pays nothing for them.
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { P, P6 } from "../../curriculum/index.ts";
import type { LessonProps } from "./kit.tsx";

type Lesson = LazyExoticComponent<ComponentType<LessonProps>>;

// one lesson covers both tissue paragraphs: the four groups are best seen side by side
const tissues = lazy(() => import("./tissues/TissuesLesson.tsx"));
// LO3: the heart lesson covers the build and the working of the circulatory system, the breathing
// lesson the airways and ventilation
const heart = lazy(() => import("./lo3/heart/HeartLesson.tsx"));
const breathing = lazy(() => import("./lo3/breathing/BreathingLesson.tsx"));

const LESSONS: Record<string, Lesson> = {
  [P6.animals.kingdom]: lazy(() => import("./kingdom/KingdomLesson.tsx")),
  [P6.animals.tissues]: tissues,
  [P6.animals.connective]: tissues,
  [P6.worms.cnidarians]: lazy(() => import("./cnidarians/CnidariansLesson.tsx")),
  [P6.worms.flatworms]: lazy(() => import("./flatworms/FlatwormsLesson.tsx")),
  [P6.worms.roundworms]: lazy(() => import("./roundworms/RoundwormsLesson.tsx")),
  [P6.worms.annelids]: lazy(() => import("./annelids/AnnelidsLesson.tsx")),
  [P6.arthropods.features]: lazy(() => import("./arthropods/ArthropodsLesson.tsx")),
  [P6.arthropods.crustaceans]: lazy(() => import("./crustaceans/CrustaceansLesson.tsx")),
  [P6.arthropods.insects]: lazy(() => import("./insects/InsectsLesson.tsx")),
  [P6.arthropods.arachnids]: lazy(() => import("./arachnids/ArachnidsLesson.tsx")),
  [P6.arthropods.molluscs]: lazy(() => import("./molluscs/MolluscsLesson.tsx")),
  [P6.ectotherms.amphibians]: lazy(() => import("./amphibians/AmphibiansLesson.tsx")),
  [P6.ectotherms.fish]: lazy(() => import("./fish/FishLesson.tsx")),
  [P6.ectotherms["fish-diversity"]]: lazy(() => import("./diversity/FishDiversity.tsx")),
  [P6.ectotherms["amphibian-diversity"]]: lazy(() => import("./diversity/AmphibianDiversity.tsx")),
  [P6.ectotherms["reptile-diversity"]]: lazy(() => import("./diversity/ReptileDiversity.tsx")),
  [P6.ectotherms.reptiles]: lazy(() => import("./reptiles/ReptilesLesson.tsx")),
  [P6.endotherms.birds]: lazy(() => import("./birds/BirdsLesson.tsx")),
  [P6.endotherms["bird-diversity"]]: lazy(() => import("./diversity/BirdDiversity.tsx")),
  [P6.endotherms.mammals]: lazy(() => import("./mammals/MammalsLesson.tsx")),
  [P6.endotherms["mammal-diversity"]]: lazy(() => import("./diversity/MammalDiversity.tsx")),
  // liceum, klasa 3
  [P.respiration.structure]: breathing,
  [P.respiration.ventilation]: breathing,
  [P.circulation.structure]: heart,
  [P.circulation.function]: heart,
  [P.urinary.structure]: lazy(() => import("./lo3/nephron/NephronLesson.tsx")),
  [P.senses.vision]: lazy(() => import("./lo3/eye/EyeLesson.tsx")),
};

export const hasLesson = (paragraphId: string): boolean => paragraphId in LESSONS;
export const lessonFor = (paragraphId: string): Lesson | undefined => LESSONS[paragraphId];
export const lessonIds = (): string[] => Object.keys(LESSONS);
