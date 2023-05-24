<template>
	<section :id="type" class="pt-3">
		<card v-bind="$attrs" :title="props.title" :preview-templates="previewTemplates.map(item => item.template)"
			  :preview-options="previewTemplates.map(item => item.data)" :url="props.url" :url-title="props.urlTitle">
			<template #title>
				<slot name="title" />
			</template>
			<template #append-title>
				<slot name="append-title" />
			</template>
			<template #body>
				<slot name="body" />
			</template>
			<slot />
			<template #append>
				<slot name="append" />
			</template>
		</card>
	</section>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { type ConfigSectionType, getSectionTemplates } from "@/store/sections";

import Card from "./Card.vue";

const props = defineProps<{
	type: ConfigSectionType,
	title?: string,
	url?: string
	urlTitle?: string
}>();

const previewTemplates = computed(() => getSectionTemplates(props.type));
</script>
