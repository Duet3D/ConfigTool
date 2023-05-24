<style scoped>
aside {
	position: -webkit-sticky;
	position: sticky;
	top: 5rem;
	display: block !important;
	height: calc(100vh - 6rem);
	padding-left: .25rem;
	padding-right: 1rem;
	margin-left: -.25rem;
	overflow-y: auto;
}

.bi {
	vertical-align: -.125em;
	pointer-events: none;
	fill: currentColor;
}

.nav-flush {
	border-radius: 0;
}

.btn-toggle {
	display: inline-flex;
	align-items: center;
	padding: .25rem .5rem;
	font-weight: 600;
	color: rgba(0, 0, 0, .65);
	background-color: transparent;
	border: 0;
}

.btn-toggle:hover {
	color: rgba(0, 0, 0, .85);
	background-color: #dae1f5;
}

.btn-toggle:focus {
	box-shadow: none;
}

.btn-toggle::before {
	width: 1.25em;
	line-height: 0;
	content: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba%280,0,0,.5%29' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 14l6-6-6-6'/%3e%3c/svg%3e");
	transition: transform .35s ease;
	transform-origin: .5em 50%;
}

.btn-toggle[aria-expanded="true"] {
	color: rgba(0, 0, 0, .85);
}

.btn-toggle[aria-expanded="true"]::before {
	transform: rotate(90deg);
}

.btn-toggle-nav a {
	display: inline-flex;
	padding: .1875rem .5rem;
	margin-top: .125rem;
	margin-left: 1.25rem;
	text-decoration: none;
}

.btn-toggle-nav a:hover {
	background-color: #dae1f5;
}

.btn-no-toggle {
	margin-left: 1.25rem;
}

.active,
.fw-semibold {
	font-weight: 600;
}
</style>

<template>
	<aside class="bg-white">
		<ul class="list-unstyled ps-0">
			<li class="mb-1">
				<button class="btn btn-toggle align-items-center rounded" data-bs-toggle="collapse"
						data-bs-target="#start-collapse" aria-expanded="true">
					Start
				</button>
				<div class="collapse show" id="start-collapse">
					<ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
						<li>
							<RouterLink to="/" active-class="active" class="link-dark rounded">Introduction</RouterLink>
						</li>
						<!--<li><RouterLink to="/Presets" active-class="active" class="link-dark rounded">Presets</RouterLink></li>-->
					</ul>
				</div>
			</li>
			<li class="mb-1">
				<button class="btn btn-toggle align-items-center rounded" data-bs-toggle="collapse"
						data-bs-target="#home-collapse" aria-expanded="true">
					Configuration
				</button>
				<div class="collapse show" id="home-collapse">
					<ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
						<li v-for="section in sections">
							<RouterLink :to="{ name: 'configuration', hash: (section !== ConfigSectionType.General) ? '#' + section : undefined }"
										class="link-dark rounded">
								{{ section[0].toUpperCase() + section.substring(1) }}
							</RouterLink>
						</li>
					</ul>
				</div>
			</li>
			<li class="mb-1">
				<button class="btn btn-toggle align-items-center rounded" data-bs-toggle="collapse"
						data-bs-target="#finish-collapse" aria-expanded="true">
					Finish
				</button>
				<div class="collapse show" id="finish-collapse">
					<ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
						<li>
							<RouterLink to="/Summary" class="link-dark rounded" active-class="active">Summary</RouterLink>
						</li>
					</ul>
				</div>
			</li>
		</ul>
	</aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router"

import { useStore } from "@/store";
import { ConfigSectionType, getSections } from "@/store/sections";

const store = useStore();

const sections = computed(() => getSections());
</script>
