// Curated monaco-editor-core entry: API surface + a minimal set of contributions for our use case
// (core editor + syntax highlighting + hover info). The default `monaco-editor-core` entry pulls
// every contribution (find widget, folding, format, multicursor, suggest controller, ...);
// going through `editor.api` and hand-picking contribs keeps the chunk small.

import * as monaco from "monaco-editor-core/esm/vs/editor/editor.api";

// Hover widget - renders providers registered via `monaco.languages.registerHoverProvider`.
// (coreCommands + codeEditorWidget are pulled in transitively by editor.api so no need to
// import them explicitly.)
import "monaco-editor-core/esm/vs/editor/contrib/hover/browser/hoverContribution";

// Web worker bootstrap
import "./monaco-worker";

// Register Duet languages (gcode-fdm, gcode-cnc, stm32, menu) and the hover/completion providers
// shipped by @duet3d/monacotokens. The completion provider is registered too but has no UI
// without the suggest controller contribution, so only hover renders.
import { registerDuetLanguages } from "@duet3d/monacotokens";
registerDuetLanguages(monaco);

export * from "monaco-editor-core/esm/vs/editor/editor.api";
export default monaco;
