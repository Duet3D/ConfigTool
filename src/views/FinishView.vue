<style scoped>

</style>

<template>
	<button class="btn btn-success" @click="showOutput">
		Show output
	</button>
</template>

<script setup lang="ts">
import { indent, render, writeToTab } from "@/store/render";

async function showOutput() {
	try {
		const config = indent(await render("config/index.ejs"));
		writeToTab("config.g", config);
	} catch (e) {
		alert(e);
	}
}
</script>
