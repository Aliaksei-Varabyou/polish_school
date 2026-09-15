import { buildApp } from "./app.ts";
import { createProvider } from "./llm/index.ts";

const provider = createProvider();
const app = await buildApp(provider);
const port = Number(process.env.PORT ?? 8787);

try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`LLM provider: ${provider.name}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
