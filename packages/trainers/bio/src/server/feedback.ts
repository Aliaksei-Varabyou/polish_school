// Rule-based session feedback. The biology trainer never calls an LLM (see docs/ai-providers.md:
// no free-tier provider is usable for a service directed at minors), so the analysis is computed
// from the results themselves — which for a fixed curriculum is most of what a model would say anyway.
import type { FeedbackRequest, FeedbackResponse, Lang, TaskResult } from "@portal/core";
import { getTopic } from "../curriculum/index.ts";

/** Below this share of correct answers a topic is called out as weak. */
const WEAK_THRESHOLD = 0.6;
/** Above this the summary congratulates instead of pointing at gaps. */
const STRONG_THRESHOLD = 0.9;

interface Phrases {
  great: string;
  good: string;
  ok: string;
  low: string;
  weak: (pct: number) => string;
  reviewSubtopics: (topic: string, subtopics: string[]) => string;
  hintsUsed: (n: number) => string;
  repeatWeak: string;
  keepGoing: string;
}

const PHRASES: Record<Lang, Phrases> = {
  pl: {
    great: "Świetny wynik — materiał masz opanowany.",
    good: "Dobry wynik, zostało kilka rzeczy do dopracowania.",
    ok: "Podstawy są, ale warto jeszcze poćwiczyć.",
    low: "Ten materiał wymaga powtórki — spokojnie, to kwestia ćwiczeń.",
    weak: (pct) => `poprawnych odpowiedzi: ${pct}%`,
    reviewSubtopics: (topic, subtopics) => `Powtórz temat „${topic}”, zwłaszcza: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `Skorzystałeś z podpowiedzi ${n} razy — spróbuj następnym razem najpierw odpowiedzieć bez nich.`,
    repeatWeak: "Powtórz sesję z zaznaczonymi słabymi tematami.",
    keepGoing: "Utrzymaj tempo: krótka sesja co kilka dni działa lepiej niż jedna długa przed sprawdzianem.",
  },
  ru: {
    great: "Отличный результат — материал усвоен.",
    good: "Хороший результат, осталось доработать пару мест.",
    ok: "База есть, но стоит ещё потренироваться.",
    low: "Этот материал нужно повторить — спокойно, это вопрос практики.",
    weak: (pct) => `правильных ответов: ${pct}%`,
    reviewSubtopics: (topic, subtopics) => `Повтори тему «${topic}», особенно: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `Подсказками ты воспользовался ${n} раз — в следующий раз попробуй сначала ответить без них.`,
    repeatWeak: "Повтори сессию по отмеченным слабым темам.",
    keepGoing: "Держи темп: короткая сессия раз в несколько дней работает лучше, чем одна длинная перед контрольной.",
  },
  en: {
    great: "Excellent — you know this material.",
    good: "Good result, a couple of things left to polish.",
    ok: "The basics are there, but more practice would help.",
    low: "This material needs a review — nothing a bit of practice won't fix.",
    weak: (pct) => `correct answers: ${pct}%`,
    reviewSubtopics: (topic, subtopics) => `Review "${topic}", especially: ${subtopics.join(", ")}.`,
    hintsUsed: (n) => `You used hints ${n} times — next time try answering without them first.`,
    repeatWeak: "Run another session on the topics marked weak.",
    keepGoing: "Keep the rhythm: a short session every few days beats one long one before the test.",
  },
};

interface TopicScore {
  topicId: string;
  ok: number;
  total: number;
  missedSubtopics: string[];
}

function scoreByTopic(results: TaskResult[]): TopicScore[] {
  const map = new Map<string, TopicScore>();
  for (const r of results) {
    const s = map.get(r.topicId) ?? { topicId: r.topicId, ok: 0, total: 0, missedSubtopics: [] };
    s.total++;
    if (r.correct) s.ok++;
    else if (r.subtopic && !s.missedSubtopics.includes(r.subtopic)) s.missedSubtopics.push(r.subtopic);
    map.set(r.topicId, s);
  }
  return [...map.values()].sort((a, b) => a.ok / a.total - b.ok / b.total);
}

export function buildFeedback(req: FeedbackRequest): FeedbackResponse {
  const p = PHRASES[req.lang] ?? PHRASES.pl;
  const scores = scoreByTopic(req.results);
  const correct = req.results.filter((r) => r.correct).length;
  const ratio = req.results.length ? correct / req.results.length : 0;

  const summary =
    ratio >= STRONG_THRESHOLD ? p.great : ratio >= 0.7 ? p.good : ratio >= 0.5 ? p.ok : p.low;

  const weak = scores.filter((s) => s.ok / s.total < WEAK_THRESHOLD);
  const weakTopics = weak.map((s) => ({
    topicId: s.topicId,
    reason: p.weak(Math.round((s.ok / s.total) * 100)),
  }));

  const recommendations: string[] = [];
  for (const s of weak.slice(0, 3)) {
    const topic = getTopic(s.topicId);
    if (!topic) continue;
    // the student's own missed subtopics are more useful than the curriculum list; fall back to it
    const focus = (s.missedSubtopics.length > 0 ? s.missedSubtopics : topic.subtopics).slice(0, 3);
    recommendations.push(p.reviewSubtopics(topic.name[req.lang] ?? topic.name.pl, focus));
  }

  const hints = req.results.filter((r) => r.usedHint).length;
  if (hints >= 3) recommendations.push(p.hintsUsed(hints));
  if (weak.length > 0) recommendations.push(p.repeatWeak);
  if (recommendations.length === 0) recommendations.push(p.keepGoing);

  return {
    summary,
    weakTopics,
    recommendations: recommendations.slice(0, 4),
    suggestedTopicIds: weak.map((s) => s.topicId).slice(0, 5),
  };
}
