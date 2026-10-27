// Interactive explanations, one per textbook paragraph. They sit beside the trainer and never touch
// the task pool: a lesson only reads the curriculum and, at its end, starts an ordinary session on
// its own paragraph. Each lesson loads lazily, so the start page pays nothing for them. One file per
// paragraph, grouped by chapter: lessons/ch<N>/<Name>Lesson.tsx.
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { LessonProps } from "@portal/lessons";
import { P } from "../../curriculum/index.ts";

type Lesson = LazyExoticComponent<ComponentType<LessonProps>>;

const LESSONS: Record<string, Lesson> = {
  // ch1: modern
  [P.modern.discoveries]: lazy(() => import("./ch1/DiscoveriesLesson.tsx")),
  [P.modern.renaissance]: lazy(() => import("./ch1/RenaissanceLesson.tsx")),
  [P.modern.reformation]: lazy(() => import("./ch1/ReformationLesson.tsx")),
  [P.modern["catholic-reform"]]: lazy(() => import("./ch1/CatholicReformLesson.tsx")),
  // ch2: golden
  [P.golden.sigismund]: lazy(() => import("./ch2/SigismundLesson.tsx")),
  [P.golden.tolerance]: lazy(() => import("./ch2/ToleranceLesson.tsx")),
  [P.golden.economy]: lazy(() => import("./ch2/EconomyLesson.tsx")),
  [P.golden.renaissance]: lazy(() => import("./ch2/RenaissanceLesson.tsx")),
  [P.golden.lublin]: lazy(() => import("./ch2/LublinLesson.tsx")),
  [P.golden.election]: lazy(() => import("./ch2/ElectionLesson.tsx")),
  [P.golden.batory]: lazy(() => import("./ch2/BatoryLesson.tsx")),
  // ch3: wars
  [P.wars.sweden]: lazy(() => import("./ch3/SwedenLesson.tsx")),
  [P.wars.turkey]: lazy(() => import("./ch3/TurkeyLesson.tsx")),
  [P.wars.khmelnytsky]: lazy(() => import("./ch3/KhmelnytskyLesson.tsx")),
  [P.wars.deluge]: lazy(() => import("./ch3/DelugeLesson.tsx")),
  [P.wars.crisis]: lazy(() => import("./ch3/CrisisLesson.tsx")),
  [P.wars.vienna]: lazy(() => import("./ch3/ViennaLesson.tsx")),
  [P.wars.baroque]: lazy(() => import("./ch3/BaroqueLesson.tsx")),
  // ch4: europe
  [P.europe.absolutism]: lazy(() => import("./ch4/AbsolutismLesson.tsx")),
  [P.europe.england]: lazy(() => import("./ch4/EnglandLesson.tsx")),
  [P.europe.enlightenment]: lazy(() => import("./ch4/EnlightenmentLesson.tsx")),
  [P.europe.powers]: lazy(() => import("./ch4/PowersLesson.tsx")),
  [P.europe.usa]: lazy(() => import("./ch4/UsaLesson.tsx")),
  [P.europe.revolution]: lazy(() => import("./ch4/RevolutionLesson.tsx")),
  [P.europe.republic]: lazy(() => import("./ch4/RepublicLesson.tsx")),
  // ch5: fall
  [P.fall.saxon]: lazy(() => import("./ch5/SaxonLesson.tsx")),
  [P.fall["last-king"]]: lazy(() => import("./ch5/LastKingLesson.tsx")),
  [P.fall.stanislaus]: lazy(() => import("./ch5/StanislausLesson.tsx")),
  [P.fall.constitution]: lazy(() => import("./ch5/ConstitutionLesson.tsx")),
  [P.fall["second-partition"]]: lazy(() => import("./ch5/SecondPartitionLesson.tsx")),
  [P.fall.collapse]: lazy(() => import("./ch5/CollapseLesson.tsx")),
  // ch6: napoleon
  [P.napoleon.conquests]: lazy(() => import("./ch6/ConquestsLesson.tsx")),
  [P.napoleon.legions]: lazy(() => import("./ch6/LegionsLesson.tsx")),
  [P.napoleon.duchy]: lazy(() => import("./ch6/DuchyLesson.tsx")),
};

export const hasLesson = (paragraphId: string): boolean => paragraphId in LESSONS;
export const lessonFor = (paragraphId: string): Lesson | undefined => LESSONS[paragraphId];
