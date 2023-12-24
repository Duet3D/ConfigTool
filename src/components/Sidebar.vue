<style scoped>
aside {
	position: -webkit-sticky;
	position: sticky;
	top: 4.5rem;
	display: block !important;
	height: calc(100vh - 6rem);
	min-width: 12rem;
	margin-top: 1rem;
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
	font-weight: 700;
	color: var(--bs-body-color);
	background-color: transparent;
	border: 0;
}

.btn-toggle:hover {
	color:  var(--bs-body-color);
	background-color: var(--bs-primary-bg-subtle);
}

.btn-toggle:focus {
	box-shadow: none;
}

.btn-toggle-nav a {
	color:  var(--bs-body-color);
	display: inline-flex;
	padding: .1875rem .5rem;
	margin-top: .125rem;
	margin-left: 1.25rem;
	text-decoration: none;
}

.btn-toggle-nav a:hover {
	background-color: var(--bs-primary-bg-subtle);
}

.btn-no-toggle {
	margin-left: 1.25rem;
}

.active,
.fw-semibold {
	font-weight: 700;
}
</style>

<template>
	<aside>
		<ul class="list-unstyled ps-0">
			<li class="mb-1">
				<button class="btn btn-toggle align-items-center rounded" data-bs-toggle="collapse"
						data-bs-target="#start-collapse" aria-expanded="true">
					Start
				</button>
				<div class="collapse show" id="start-collapse">
					<ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
						<li>
							<RouterLink to="/" active-class="active" class="rounded">Introduction</RouterLink>
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
										class="rounded">
								{{ getSectionTitle(section) }}
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
							<RouterLink to="/Summary" class="rounded" active-class="active">Summary</RouterLink>
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

import { ConfigSectionType, getSections } from "@/store/sections";

const sections = computed(() => getSections());

function getSectionTitle(section: ConfigSectionType) {
	if (section === ConfigSectionType.LedStrips) {
		return "LED Strips";
	}
	return section[0].toUpperCase() + section.substring(1);
}
</script>
