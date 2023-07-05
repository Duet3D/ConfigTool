<style scoped>
#json-data {
	height: 90vh;
}
</style>

<template>
	<main class="container mt-4">
		<div class="text-center mb-4">
			<h2 class="mb-4">
				Configuration ready
			</h2>
			<h4 class="mb-3">
				The config tool can now generate the following files:
			</h4>

		</div>
	</main>
</template>

<script setup lang="ts">
import { useStore } from "@/store";

const store = useStore();
</script>
