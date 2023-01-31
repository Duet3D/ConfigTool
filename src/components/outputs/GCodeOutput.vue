<template>
    <div ref="editorRef" class="editor"></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

import "./monaco-gcode";
import "./monaco-worker";

// Properties
const props = defineProps<{
    value: string
}>();

// Component lifecycle
const editorRef = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
    editor = monaco.editor.create(editorRef.value!, {
        language: "gcode",
        minimap: {
            enabled: false
        },
        readOnly: true,
        scrollBeyondLastLine: false,
        value: props.value
    });
    updateEditorHeight();
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
        updateEditorHeight();
    }
});

let prevHeight = 0;
function updateEditorHeight() {
    if (editor === null || editorRef.value === null) {
        return;
    }

    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight)
    const lineCount = editor.getModel()?.getLineCount() || 1
    const height = editor.getTopForLineNumber(lineCount + 1) + lineHeight

    if (prevHeight !== height) {
        prevHeight = height
        editorRef.value.style.height = `${height}px`
        editor.layout();
    }
}
</script>