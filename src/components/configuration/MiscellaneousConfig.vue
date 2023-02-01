<style scoped>
.editor {
	border: 1px solid var(--bs-card-border-color);
}
</style>

<template>
	<scroll-item anchor="Miscellaneous" title="Miscellaneous" class="mb-3">
		<label>Custom settings for config.g:</label>
		<g-code-input class="editor mt-1" v-model="store.data.configTool.customSettings" />
	</scroll-item>
</template>

<script setup lang="ts">
import ScrollItem from "@/components/ScrollItem.vue";

import { useStore } from "@/store";
import { defineAsyncComponent } from "vue";

const GCodeInput = defineAsyncComponent(() => import("../monaco/GCodeInput.vue"));
const store = useStore();
</script>
