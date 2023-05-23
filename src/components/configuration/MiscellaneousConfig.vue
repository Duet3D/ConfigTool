<style scoped>
.editor {
	border: 1px solid var(--bs-card-border-color);
}
</style>

<template>
	<scroll-item id="miscellaneous" title="Miscellaneous" class="mb-3">
		<check-input label="Configure custom settings in config.g"
					 title="Add custom configuration commands to config.g. This is typically only needed by advanced users"
					 v-model="showCustomSettings" :preset="store.preset.configTool.customSettings !== ''" />
		<g-code-input v-if="showCustomSettings || store.data.configTool.customSettings.trim() !== ''" class="editor ms-4 mt-1"
					  v-model="store.data.configTool.customSettings" />
	</scroll-item>
</template>

<script setup lang="ts">
import ScrollItem from "@/components/ScrollItem.vue";
import CheckInput from "../inputs/CheckInput.vue";

import { useStore } from "@/store";
import { defineAsyncComponent, ref } from "vue";

const GCodeInput = defineAsyncComponent(() => import("../monaco/GCodeInput.vue"));
const store = useStore();

const showCustomSettings = ref(false);
</script>
