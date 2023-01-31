<style scoped>
.nav-tabs {
	padding-top: 9px;
	padding-left: 9px;
}

.preview-visible {
	border-bottom-right-radius: 0;
	border-bottom-left-radius: 0;
}
</style>

<template>
	<div class="pt-3">
		<a :id="anchor" data-anchor="true"></a>
		<div class="card" :class="previewVisible ? 'preview-visible' : ''" v-bind="$attrs">
			<div class="card-header d-flex justify-content-between">
				<slot name="title">
					{{ props.title }}
				</slot>

				<a v-if="previewTemplates" href="javascript:void(0)" @click="previewVisible = !previewVisible">
					<i class="bi" :class="previewVisible ? 'bi-code-slash' : 'bi-code'"></i>
					{{ previewVisible ? 'Hide G-code preview' : 'Show G-code preview' }}
				</a>

				<slot name="url">
					<a v-if="props.url && props.urlTitle" :href="props.url" target="_blank">
						<i class="bi-info-circle"></i>
						{{ props.urlTitle }}
					</a>
				</slot>
			</div>

			<template v-if="previewVisible">
				<ul class="nav nav-tabs">
					<li v-for="template in props.previewTemplates" class="nav-item">
						<a class="nav-link" :class="(template === selectedTemplate) ? 'active' : ''"
						   href="javascript:void(0)" @click="selectedTemplate = template">
							{{ getTemplateFile(template) }}
						</a>
					</li>
				</ul>
				<g-code-output class="output" :value="generatedCode" readonly />
			</template>
			<template v-else>
				<slot name="body" />
				<div v-if="hasSlotContent($slots.default)" class="card-body">
					<slot />
				</div>
				<slot name="append" />
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Comment, ref, watch, type Slot, type VNode } from "vue";

import GCodeOutput from "./outputs/GCodeOutput.vue";

import { indent, render } from "@/store/render";

const props = defineProps<{
	anchor: string,
	title?: string,
	previewTemplates?: Array<string>,
	previewOptions?: Record<string, any>,
	url?: string
	urlTitle?: string
}>();

// Credits go to https://github.com/vuejs/core/issues/4733#issuecomment-1024816095
function hasSlotContent(slot: Slot | undefined, slotProps = {}): boolean {
	if (!slot) return false;

	return slot(slotProps).some((vnode: VNode) => {
		if (vnode.type === Comment) return false;

		if (Array.isArray(vnode.children) && !vnode.children.length) return false;

		return (
			vnode.type !== Text
			|| (typeof vnode.children === "string" && vnode.children.trim() !== "")
		);
	});
}

const previewVisible = ref(false)
const selectedTemplate = ref<string>(props.previewTemplates ? props.previewTemplates[0] : "");
function getTemplateFile(template: string) {
	let title = template.split('/')[0].split('.')[0];
	return title + ".g";
}

const generatedCode = ref("");

watch(() => previewVisible.value && selectedTemplate.value, async (value) => {
	if (value) {
		generatedCode.value = "Rendering...";
		try {
			const content = await render(selectedTemplate.value, { ...(props.previewOptions ?? {}), preview: true });
			generatedCode.value = indent(content);
		} catch (e) {
			console.warn(e);
			generatedCode.value = "Failed to render preview G-code! Check your inputs and try again.";
		}
	}
});
</script>
