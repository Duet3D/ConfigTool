<template>
    <div ref="editorRef" class="editor"></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

import { useStore } from "@/store";

import "./monaco-gcode";
import "./monaco-worker";

const store = useStore();

// Properties
const props = defineProps<{
    value: string
}>();

// Component lifecycle
const editorRef = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
    editor = monaco.editor.create(editorRef.value!, {
        automaticLayout: true,
        language: "gcode",
        matchBrackets: "never",
        minimap: {
            enabled: false
        },
        occurrencesHighlight: false,
        overviewRulerLanes: 0,
        readOnly: true,
        renderLineHighlight: "none",
        rulers: [255],
        scrollBeyondLastLine: false,
        theme: store.darkTheme ? "vs-dark" : "vs",
        value: props.value
    });

    editor.onDidContentSizeChange(() => {
        if (editor === null || editorRef.value === null) {
            return;
        }

        const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
        const lineCount = editor.getModel()?.getLineCount() || 1;
        let height = editor.getTopForLineNumber(lineCount + 1) + lineHeight;
        if (editor.getScrollWidth() > editorRef.value.clientWidth) {
            height += editor.getOptions().get(monaco.editor.EditorOption.layoutInfo).horizontalScrollbarHeight;
        }
        editorRef.value.style.height = `${height}px`;
        editor.layout();
    });
});

watch(() => store.darkTheme, () => {
    monaco.editor.setTheme(store.darkTheme ? "vs-dark" : "vs");
});

onBeforeUnmount(() => {
    if (editor !== null) {
        editor.dispose();
        editor = null;
    }
});

// Update value automatically
watch(() => props.value, () => {
    if (editor !== null) {
        editor.setValue(props.value);
    }
});
</script>