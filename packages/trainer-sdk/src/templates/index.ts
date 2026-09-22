// Offline task-template engine, shared by every trainer. Node-only (it hashes with `node:crypto`),
// so it is exported through the "./templates" subpath rather than the package root — the web app
// imports the root and must never pull a node builtin into the browser bundle.
export * from "./types.ts";
export * from "./text.ts";
export * from "./combinations.ts";
export * from "./render.ts";
