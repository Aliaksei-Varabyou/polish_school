// Vercel Function entry point, bundled ahead of time (see scripts/build-vercel-function.mjs at the
// repo root) into a single self-contained api/index.js. We bundle ourselves rather than relying on
// Vercel's own Node function builder: this monorepo uses explicit ".ts" specifiers in every import
// (works great with tsx/Vite/Vitest locally), and Vercel's builder does not reliably rewrite or inline
// those across a relative import that reaches outside the api/ directory — it left one such import
// unbundled in the deployed output, which then failed at runtime with ERR_MODULE_NOT_FOUND. Pre-bundling
// removes every ".ts" specifier from the output, so nothing depends on how Vercel's builder handles them.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServerlessApp } from "./serverless.ts";

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getServerlessApp();
  app.server.emit("request", req, res);
}
