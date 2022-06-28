<style>
body {
	min-height: 100vh;
	min-height: -webkit-fill-available;
}

html {
	height: -webkit-fill-available;
}

main {
	display: flex;
	flex-wrap: nowrap;
	height: 100vh;
	height: -webkit-fill-available;
	max-height: 100vh;
	overflow-x: auto;
	overflow-y: hidden;
	padding-top: 64px;
}

main > :not(:first-child) {
	overflow-y: auto;
}
</style>

<template>
	<!-- Navbar -->
	<nav class="navbar navbar-light bg-light fixed-top">
		<!-- for sm and down -->
		<div class="d-md-none container-fluid flex-nowrap">
			<button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
				<span class="navbar-toggler-icon"></span>
			</button>
			<a href="#" class="navbar-brand ms-2 d-inline-block text-truncate float-end">
				<img src="./assets/logo.svg" alt="" width="24" height="24" class="mb-1">
				RepRapFirmware Configuration Tool
			</a>

			<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
				<div class="offcanvas-header pb-0">
					<h5 class="offcanvas-title" id="offcanvasNavbarLabel">Navigation Menu</h5>
					<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
				</div>
				<div class="ps-2">
					<sidebar />
				</div>
			</div>
		</div>

		<!-- for md and up -->
		<div class="d-none d-md-block container-xxl flex-nowrap">
			<a href="#" class="navbar-brand ms-2 d-inline-block text-truncate">
				<img src="./assets/logo.svg" alt="" width="24" height="24" class="mb-1">
				RepRapFirmware Configuration Tool
			</a>
		</div>
	</nav>

	<!-- Content -->
	<main class="container-xxl">
		<sidebar class="d-none d-md-block" />
		<RouterView />
	</main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

import Sidebar from "./components/Sidebar.vue";
</script>