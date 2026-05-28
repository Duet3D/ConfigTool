// monaco-editor-core 0.55 ships only editor.worker.start.js (the building block);
// unlike monaco-editor, there is no ready-made editor.worker.js entry. This file
// is that entry, called by Vite's ?worker import in monaco-worker.ts.
import { start } from "monaco-editor-core/esm/vs/editor/editor.worker.start";

start(() => ({}));
