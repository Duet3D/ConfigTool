import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

self.MonacoEnvironment = {
    getWorker: function (moduleId, label) {
        return new editorWorker();
    }
}
