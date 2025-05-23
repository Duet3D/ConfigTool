<style scoped>
div {
    height: 300px;
}
</style>

<template>
    <div ref="editorRef" class="editor"></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

import { useStore } from "@/store";

import "./monaco-gcode";
import "./monaco-worker";

const store = useStore();

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
        language: "gcode-fdm",
        minimap: {
            enabled: false
        },
        overviewRulerLanes: 0,
        renderLineHighlightOnlyWhenFocus: true,
        rulers: [255],
        scrollBeyondLastLine: false,
        theme: store.darkTheme ? "vs-dark" : "vs",
        value: props.modelValue,
        wordBasedSuggestions: "off"
    });
    editor.onDidBlurEditorText(() => emit("update:modelValue", editor!.getValue()));
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
watch(() => props.modelValue, () => {
    editor?.setValue(props.modelValue);
});
</script>