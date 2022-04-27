<style scoped>
.main-icon {
	color: rgb(3, 24, 209);
}
</style>

<template>
	<div class="container mt-4">
		<div class="text-center">
			<h2 class="mb-4">
				Welcome to the RepRapFirmware Configuration Tool!
			</h2>
			<h4 class="text-muted">
				Please follow this wizard to obtain an individual configuration bundle for your printer.
			</h4>
		</div>

		<div class="alert alert-warning my-5" role="alert">
			<i class="bi bi-exclamation-triangle"></i>
			This version of the Config Tool is still under development. If you encounter problems, please consider using the previous <a href="https://configtool.reprapfirmware.org" target="_blank">Config Tool</a> instead.
		</div>

		<div class="d-flex justify-content-center">
			<button type="button" class="btn btn-lg btn-secondary me-1" @click="startFromScratch">
				<i class="bi bi-plus-square"></i>
				Start from Scratch
			</button>
			<button type="button" class="btn btn-lg btn-primary ms-1" @click="$router.push('/Templates')">
				<i class="bi bi-file-earmark-arrow-up"></i>
				Start with Existing Template
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStore } from "@/store";

import { version } from "../../package.json";

const store = useStore();
const router = useRouter();

const startFromScratch = () => {
	store.$reset();
	router.push('/Configuration');
};
</script>