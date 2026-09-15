// Bundles the API into a single self-contained api/index.js before Vercel's own build runs.
// See apps/api/src/vercelHandler.ts for why: Vercel's Node function builder doesn't reliably
// resolve/inline this monorepo's explicit ".ts" import specifiers across relative imports that
// reach outside the api/ directory, so we remove that variable entirely by bundling ourselves.
import { build } from "esbuild";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = resolve(root, "api/index.js");

// third-party npm packages used (directly or transitively through @portal/*) — kept external so
// esbuild only bundles our own workspace source; Vercel installs node_modules normally alongside.
const external = [
  "fastify",
  "@fastify/cors",
  "@fastify/rate-limit",
  "@fastify/static",
  "@supabase/supabase-js",
  "@google/genai",
  "mathjs",
  "zod",
  "jose",
  "nodemailer",
];

rmSync(outfile, { force: true });
mkdirSync(dirname(outfile), { recursive: true });

await build({
  entryPoints: [resolve(root, "apps/api/src/vercelHandler.ts")],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external,
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});

console.log(`Bundled ${outfile}`);
