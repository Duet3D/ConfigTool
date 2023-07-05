<style>
section {
	scroll-margin-top: 56px;
}
</style>

<template>
	<!-- Navbar -->
	<header class="navbar navbar-light bg-body-tertiary sticky-top">
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

			<div class="dropdown">
				<a ref="themeDropdownElement" class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown"
				   @click.prevent="themeDropdown?.toggle()">
					Theme
				</a>
				<ul class="dropdown-menu">
					<li>
						<a class="dropdown-item" :class="store.theme === 'auto' ? 'active' : ''" href="#"
						   @click="store.setTheme('auto')">
							Automatic
						</a>
					</li>
					<li>
						<a class="dropdown-item" :class="store.theme === 'light' ? 'active' : ''" href="#"
						   @click="store.setTheme('light')">
							Light
						</a>
					</li>
					<li>
						<a class="dropdown-item" :class="store.theme === 'dark' ? 'active' : ''" href="#"
						   @click="store.setTheme('dark')">
							Dark
						</a>
					</li>
				</ul>
			</div>
		</div>
	</header>

	<!-- Content -->
	<div class="container-xxl d-flex">
		<Sidebar class="d-none d-md-flex col-auto" />
		<RouterView />
	</div>
</template>

<script setup lang="ts">
import { Dropdown } from "bootstrap";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterView } from "vue-router";

import Sidebar from "./components/Sidebar.vue";

import { useStore } from "./store";
import { MutationType } from "pinia";

const store = useStore();

// Theme
function updateTheme() {
	if (store.darkTheme) {
		document.documentElement.setAttribute("data-bs-theme", "dark");
	} else {
		document.documentElement.setAttribute("data-bs-theme", "light");
	}
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
	if (store.theme === "auto") {
		store.darkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	updateTheme();
});

watch(() => store.darkTheme, () => {
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

// Store observer
store.$subscribe((mutation) => {
	if (mutation.type === MutationType.direct) {
		if (mutation.events.key === "darkTheme") {
			// Update theme
			updateTheme();
		} else {
			// When the state is reset, the mutation type is different
			store.dataModified = true;
		}
	}
});
</script>