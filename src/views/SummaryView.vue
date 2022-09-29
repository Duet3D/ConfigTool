<style scoped>
#json-data {
	height: 90vh;
}
</style>

<template>
	<div class="form-floating mt-3 w-100">
		<textarea class="form-control textarea" id="json-data" v-model="jsonData"></textarea>
		<label for="jsonData">Final object model / JSON data</label>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { useStore } from "@/store";

const store = useStore();

const jsonData = ref("");

onMounted(() => jsonData.value = JSON.stringify(store.data, null, 2));
</script>
