// Regenerates src/curriculum/coverage.generated.ts from the templates.
// Usage: npm run gen:coverage -w @portal/trainer-bio — after any change to the content.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderContent } from "../src/server/content.ts";
import { computeCoverage, coverageModule } from "../src/server/coverage.ts";

const file = resolve(import.meta.dirname, "../src/curriculum/coverage.generated.ts");
const coverage = computeCoverage(renderContent());
writeFileSync(file, coverageModule(coverage));

const covered = Object.keys(coverage.paragraphTasks).length;
console.log(`Wrote ${file}: ${covered} paragraphs with tasks.`);
