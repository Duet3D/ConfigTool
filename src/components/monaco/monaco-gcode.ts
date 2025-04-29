import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { gcodeFDMLanguage } from "@duet3d/monacotokens";

const languageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: ";",
  },
};

monaco.languages.register({ id: "gcode-fdm" });
monaco.languages.setMonarchTokensProvider("gcode-fdm", gcodeFDMLanguage);
monaco.languages.setLanguageConfiguration("gcode-fdm", languageConfiguration);
