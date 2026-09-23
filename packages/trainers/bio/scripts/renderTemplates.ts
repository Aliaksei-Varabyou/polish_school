// Offline: renders every biology TaskTemplate into verified tasks and stores them in the task pool.
// Usage: npm run render:templates -w @portal/trainer-bio [-- --target=20 --db=./data/bio.db]
//        With SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY set, writes to Postgres instead of local SQLite.
//
// This is the only way biology tasks come into existence — there is no LLM fallback, so a deploy
// is not complete until this has been run against the production pool.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dbConfigFromEnv, PortalDb, SupabaseTaskPool } from "@portal/db";
import { TaskPool, type TaskPoolStore } from "@portal/task-pool";
import { getTopic } from "../src/curriculum/index.ts";
import { BIO_LANGS, type BioLang } from "../src/lang.ts";
import { ALL_TEMPLATES, renderTemplate } from "../src/server/templates/index.ts";

const LANGS: BioLang[] = [...BIO_LANGS];
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const targetCount = Number(args.target ?? 20);

const dbConfig = dbConfigFromEnv();
const dbPath = args.db ?? resolve(dirname(fileURLToPath(import.meta.url)), "../data/bio.db");
const pool: TaskPoolStore = dbConfig ? new SupabaseTaskPool(new PortalDb(dbConfig).admin) : new TaskPool(dbPath);

console.log(`Rendering ${ALL_TEMPLATES.length} templates, target ${targetCount} substitutions each, langs: ${LANGS.join(",")}`);
console.log(`Pool: ${dbConfig ? `Postgres (${dbConfig.url})` : `SQLite (${dbPath})`}\n`);

let totalAccepted = 0;
let totalRejected = 0;
let totalStored = 0;

for (const template of ALL_TEMPLATES) {
  const topic = getTopic(template.topicId);
  if (!topic) {
    console.error(`✗ ${template.id}: unknown topicId "${template.topicId}" — skipped`);
    continue;
  }

  const { tasks, stats } = renderTemplate(template, { langs: LANGS, targetCount });
  totalAccepted += stats.accepted;
  totalRejected += stats.rejected;

  // group by language: the pool stores tasks per (trainerId, lang, grade, level)
  const byLang = new Map<BioLang, typeof tasks>();
  for (const t of tasks) byLang.set(t.lang, [...(byLang.get(t.lang) ?? []), t]);
  for (const [lang, group] of byLang) {
    await pool.add(
      group.map((g) => g.task),
      { trainerId: "bio", lang, grade: topic.grade, level: topic.level },
    );
    totalStored += group.length;
  }

  // a table smaller than the target is expected, not a warning: it simply has that many rows
  const exhausted = stats.accepted < targetCount && stats.rejected === 0;
  const status = stats.accepted === 0 ? "✗" : stats.accepted < targetCount && !exhausted ? "△" : "✓";
  const note = exhausted ? " (whole table)" : "";
  console.log(`${status} ${template.id}: ${stats.accepted}/${targetCount} substitutions${note}, ${stats.rejected} rejected`);
  if (stats.rejectionReasons.length > 0) {
    for (const reason of stats.rejectionReasons.slice(0, 3)) console.log(`    - ${reason}`);
  }
}

console.log(`\nTotal: ${totalAccepted} substitutions accepted, ${totalRejected} rejected, ${totalStored} tasks stored (all languages).`);
if (pool instanceof TaskPool) {
  console.log(`Pool now has ${await pool.count("bio")} biology tasks total.`);
  pool.close();
}
