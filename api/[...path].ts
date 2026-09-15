// Vercel Function entry: catches every /api/* request and hands it to the Fastify app.
// Fastify isn't started with `.listen()` here — Vercel calls this function per request (Fluid
// Compute keeps the process warm and reuses it, see apps/api/src/serverless.ts for the memoization).
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServerlessApp } from "../apps/api/src/serverless.ts";

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getServerlessApp();
  app.server.emit("request", req, res);
}
