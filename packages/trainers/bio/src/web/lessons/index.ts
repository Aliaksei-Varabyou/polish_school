// Interactive explanations, one per textbook paragraph. They sit beside the trainer and never touch
// the task pool: a lesson only reads the curriculum and, at its end, starts an ordinary session on
// its own paragraph. Each lesson loads lazily, so the start page pays nothing for them.
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { P, P6 } from "../../curriculum/index.ts";
import type { LessonProps } from "./kit.tsx";

type Lesson = LazyExoticComponent<ComponentType<LessonProps>>;

// one lesson covers both tissue paragraphs: the four groups are best seen side by side
const tissues = lazy(() => import("./tissues/TissuesLesson.tsx"));
// LO3 lessons that cover two or three paragraphs at once
const heart = lazy(() => import("./lo3/heart/HeartLesson.tsx"));
const breathing = lazy(() => import("./lo3/breathing/BreathingLesson.tsx"));
const skeleton = lazy(() => import("./lo3/skeleton/SkeletonLesson.tsx"));
const nutrients = lazy(() => import("./lo3/nutrients/NutrientsLesson.tsx"));
const digestion = lazy(() => import("./lo3/digestion/DigestionLesson.tsx"));
const diet = lazy(() => import("./lo3/diet/DietLesson.tsx"));
const immunity = lazy(() => import("./lo3/immunity/ImmunityLesson.tsx"));
const circulationDisorders = lazy(() => import("./lo3/circulation/CirculationDisordersLesson.tsx"));
const brain = lazy(() => import("./lo3/brain/BrainLesson.tsx"));
const autonomic = lazy(() => import("./lo3/autonomic/AutonomicLesson.tsx"));
const regulation = lazy(() => import("./lo3/hormones/RegulationLesson.tsx"));
const reproductiveSystem = lazy(() => import("./lo3/reproduction/ReproductiveSystemLesson.tsx"));

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
  [P.organism.classification]: lazy(() => import("./lo3/classification/ClassificationLesson.tsx")),
  [P.organism.hierarchy]: lazy(() => import("./lo3/hierarchy/HierarchyLesson.tsx")),
  [P.organism.homeostasis]: lazy(() => import("./lo3/homeostasis/HomeostasisLesson.tsx")),
  [P.skin.animals]: lazy(() => import("./lo3/skin/SkinAnimalsLesson.tsx")),
  [P.skin.structure]: lazy(() => import("./lo3/skin/SkinLesson.tsx")),
  [P.skin.disorders]: lazy(() => import("./lo3/skin/SkinDisordersLesson.tsx")),
  [P.motion.animals]: lazy(() => import("./lo3/motion/MotionAnimalsLesson.tsx")),
  [P.motion.skeleton]: skeleton,
  [P.motion.joints]: lazy(() => import("./lo3/joints/JointsLesson.tsx")),
  [P.motion.bones]: skeleton,
  [P.motion.muscles]: lazy(() => import("./lo3/muscles/MusclesLesson.tsx")),
  [P.motion.disorders]: lazy(() => import("./lo3/motion/MotionDisordersLesson.tsx")),
  [P.digestion.animals]: lazy(() => import("./lo3/digestion/FeedingAnimalsLesson.tsx")),
  [P.digestion.organic]: nutrients,
  [P.digestion.vitamins]: nutrients,
  [P.digestion.structure]: digestion,
  [P.digestion.processes]: digestion,
  [P.digestion.diet]: diet,
  [P.digestion.disorders]: diet,
  [P.respiration.animals]: lazy(() => import("./lo3/respiration/BreathingAnimalsLesson.tsx")),
  [P.respiration.structure]: breathing,
  [P.respiration.ventilation]: breathing,
  [P.respiration.disorders]: lazy(() => import("./lo3/respiration/BreathingDisordersLesson.tsx")),
  [P.circulation.animals]: lazy(() => import("./lo3/circulation/CirculationAnimalsLesson.tsx")),
  [P.circulation.blood]: lazy(() => import("./lo3/blood/BloodLesson.tsx")),
  [P.circulation.structure]: heart,
  [P.circulation.function]: heart,
  [P.circulation.lymph]: immunity,
  [P.circulation.disorders]: circulationDisorders,
  [P.circulation.immune]: immunity,
  [P.circulation.immunity]: immunity,
  [P.circulation["immune-disorders"]]: circulationDisorders,
  [P.urinary.animals]: lazy(() => import("./lo3/excretion/ExcretionAnimalsLesson.tsx")),
  [P.urinary.structure]: lazy(() => import("./lo3/nephron/NephronLesson.tsx")),
  [P.urinary.disorders]: lazy(() => import("./lo3/urinary-disorders/UrinaryDisordersLesson.tsx")),
  [P.nervous.animals]: lazy(() => import("./lo3/nerves-animals/NervesAnimalsLesson.tsx")),
  [P.nervous.structure]: lazy(() => import("./lo3/neuron/NeuronLesson.tsx")),
  [P.nervous.central]: brain,
  [P.nervous.peripheral]: brain,
  [P.nervous.autonomic]: autonomic,
  [P.nervous.disorders]: autonomic,
  [P.senses.animals]: lazy(() => import("./lo3/senses/SensesAnimalsLesson.tsx")),
  [P.senses.vision]: lazy(() => import("./lo3/eye/EyeLesson.tsx")),
  [P.senses.ear]: lazy(() => import("./lo3/ear/EarLesson.tsx")),
  [P.senses["taste-smell"]]: lazy(() => import("./lo3/senses/TasteSmellLesson.tsx")),
  [P.hormones.animals]: lazy(() => import("./lo3/hormones/HormonesAnimalsLesson.tsx")),
  [P.hormones.structure]: lazy(() => import("./lo3/hormones/GlandsLesson.tsx")),
  [P.hormones.regulation]: regulation,
  [P.hormones.disorders]: regulation,
  [P.reproduction.animals]: lazy(() => import("./lo3/reproduction/ReproductionAnimalsLesson.tsx")),
  [P.reproduction.male]: reproductiveSystem,
  [P.reproduction.female]: reproductiveSystem,
  [P.reproduction.development]: lazy(() => import("./lo3/development/DevelopmentLesson.tsx")),
  [P.reproduction.disorders]: lazy(() => import("./lo3/reproduction/ReproductiveDisordersLesson.tsx")),
};

export const hasLesson = (paragraphId: string): boolean => paragraphId in LESSONS;
export const lessonFor = (paragraphId: string): Lesson | undefined => LESSONS[paragraphId];
export const lessonIds = (): string[] => Object.keys(LESSONS);
