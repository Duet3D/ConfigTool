import EditorWorker from "./editor.worker?worker";

self.MonacoEnvironment = {
	getWorker() {
		return new EditorWorker();
	}
};
