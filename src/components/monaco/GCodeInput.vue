<style scoped>
div {
    height: 300px;
}
</style>

<template>
    <div ref="editorRef" class="editor"></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

import "./monaco-gcode";
import "./monaco-worker";

// Properties
const props = defineProps<{
    modelValue: string
}>();
const emit = defineEmits<{
    (event: "update:modelValue", value: string): void
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
        overviewRulerLanes: 0,
        renderLineHighlightOnlyWhenFocus: true,
        scrollBeyondLastLine: false,
        value: props.modelValue
    });
    editor.onDidBlurEditorText(() => emit("update:modelValue", editor!.getValue()));
});

onBeforeUnmount(() => {
    if (editor !== null) {
        editor.dispose();
        editor = null;
    }
});

// Update value automatically
watch(() => props.modelValue, () => {
    editor?.setValue(props.modelValue);
});
</script>