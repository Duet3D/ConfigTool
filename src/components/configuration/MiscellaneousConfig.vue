<style scoped>
.textarea {
	height: 300px;
}
</style>

<template>
	<scroll-item anchor="Miscellaneous" title="Miscellaneous" class="mb-3">
		<div class="form-floating">
			<textarea class="form-control textarea" id="customSettings"
					  v-model="store.data.configTool.customSettings"></textarea>
			<label for="customSettings">Custom settings for config.g</label>
		</div>
	</scroll-item>
</template>

<script setup lang="ts">
import ScrollItem from "@/components/ScrollItem.vue";

import { useStore } from "@/store";

const store = useStore();
</script>
