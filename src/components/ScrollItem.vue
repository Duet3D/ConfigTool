<template>
	<section :id="id" class="pt-3">
		<card v-bind="$attrs" :title="props.title" :preview-templates="props.previewTemplates"
			  :preview-options="props.previewOptions" :url="props.url" :url-title="props.urlTitle">
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
import Card from "./Card.vue";

const props = defineProps<{
	id: string,
	title?: string,
	previewTemplates?: Array<string>,
	previewOptions?: Record<string, any>,
	url?: string
	urlTitle?: string
}>();
</script>
