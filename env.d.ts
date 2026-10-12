/// <reference types="vite/client" />

declare module "monaco-editor-core/esm/vs/editor/editor.worker.start" {
	export function start(createClient: () => unknown): void;
}

// monaco-editor-core ships JS-only side-effect contribs without matching .d.ts files;
// declare them as opaque modules so TypeScript accepts the deep imports
declare module "monaco-editor-core/esm/vs/editor/contrib/hover/browser/hoverContribution";
