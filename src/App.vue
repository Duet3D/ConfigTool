<style>
body {
	min-height: 100vh;
	min-height: -webkit-fill-available;
	overflow: hidden;
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
			<button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
				<span class="navbar-toggler-icon"></span>
			</button>
			<a href="#" class="navbar-brand ms-2 d-inline-block text-truncate float-end">
				<img src="./assets/logo.svg" alt="" width="24" height="24" class="mb-1">
				RepRapFirmware Configuration Tool
			</a>

			<div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar">
				<div class="offcanvas-header pb-0">
					<h5 class="offcanvas-title" id="offcanvasNavbarLabel">Navigation Menu</h5>
					<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
				</div>
				<div class="ps-2">
					<sidebar />
				</div>
			</div>
		</div>

		<!-- for md and up -->
		<div class="d-none d-md-flex container-xxl flex-nowrap">
			<a href="#" class="navbar-brand ms-2 d-inline-block text-truncate">
				<img src="./assets/logo.svg" alt="" width="24" height="24" class="mb-1">
				RepRapFirmware Configuration Tool
			</a>

			<!-- TODO enable after upgrade to Bootstrap 5.3
			<div class="dropdown">
				<a ref="themeDropdownElement" class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown"
				   @click.prevent="themeDropdown?.toggle()">
					Theme
				</a>
				<ul class="dropdown-menu">
					<li>
						<a class="dropdown-item" :class="actualTheme === 'light' ? 'active' : ''" href="#"
						   @click="setTheme('light')">
							Light Theme
						</a>
					</li>
					<li>
						<a class="dropdown-item" :class="actualTheme === 'dark' ? 'active' : ''" href="#"
						   @click="setTheme('dark')">
							Dark Theme
						</a>
					</li>
				</ul>
			</div>
			-->
		</div>
	</nav>

	<!-- Content -->
	<main class="container-xxl">
		<Sidebar class="d-none d-md-block" />
		<RouterView />
	</main>
</template>

<script setup lang="ts">
import { Dropdown } from "bootstrap";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterView } from "vue-router";

import Sidebar from "./components/Sidebar.vue";

// Theme
const theme = ref(localStorage.getItem("theme") || "auto");
const actualTheme = computed(() => {
	if (theme.value === "auto") {
		return (window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
	}
	return theme.value;
});

function setTheme(value: string) {
	theme.value = value;
	localStorage.setItem("theme", value);
}

function updateTheme() {
	if (theme.value === "auto") {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			document.documentElement.setAttribute("data-bs-theme", "dark");
		} else {
			document.documentElement.setAttribute("data-bs-theme", "light");
		}
	} else {
		document.documentElement.setAttribute("data-bs-theme", theme.value);
		localStorage.setItem("theme", theme.value);;
	}
}

watch(() => theme.value, () => {
	updateTheme();
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
	updateTheme();
});

updateTheme();

// Theme dropdown
const themeDropdownElement = ref<Element | null>(null), themeDropdown = ref<Dropdown | null>(null);
onMounted(() => {
	if (themeDropdownElement.value) {
		themeDropdown.value = new Dropdown(themeDropdownElement.value);
	}
});
onBeforeUnmount(() => {
	if (themeDropdown.value) {
		themeDropdown.value.dispose();
		themeDropdown.value = null;
	}
});
</script>