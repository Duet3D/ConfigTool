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
	<div class="card" :class="previewVisible ? 'preview-visible' : ''" v-bind="$attrs">
		<!-- Card Title-->
		<div class="card-header d-flex justify-content-between align-items-center">
			<slot name="title">
				{{ props.title }}
			</slot>

			<a v-if="previewTemplates" href="javascript:void(0)" @click="previewVisible = !previewVisible">
				<i class="bi" :class="previewVisible ? 'bi-code-slash' : 'bi-code'"></i>
				{{ previewVisible? "Hide G-code preview": "Show G-code preview" }}
			</a>

			<slot name="append-title">
				<a v-if="props.url && props.urlTitle" :href="props.url" target="_blank">
					<i class="bi-info-circle"></i>
					{{ props.urlTitle }}
				</a>
				<span v-else class="invisible">
					{{ props.title }}
				</span>
			</slot>
		</div>

		<!-- Card Content-->
		<template v-if="previewVisible">
			<ul class="nav nav-tabs">
				<li v-for="template in props.previewTemplates" class="nav-item">
					<a class="nav-link" :class="(template === selectedTemplate) ? 'active' : ''"
					   href="javascript:void(0)" @click="selectedTemplate = template">
						{{ getTemplateFile(template) }}
					</a>
				</li>
				<a v-if="fileRendered" class="align-self-center ms-auto me-3 text-decoration-none" href="javascript:void(0)" @click.prevent="showFile">
					<i :class="rendering ? 'bi-hourglass' : 'bi-box-arrow-in-up-right'"></i>
					{{ rendering ? "rendering..." : "view full file" }}
				</a>
			</ul>
			<g-code-output v-show="previewVisible" class="output" :value="generatedCode" readonly />
		</template>
		<template v-else>
			<slot name="body" />
			<div v-if="hasSlotContent($slots.default)" class="card-body">
				<slot />
			</div>
			<slot name="append" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { Comment, defineAsyncComponent, ref, watch, type Slot, type VNode } from "vue";

import { indent, render } from "@/store/render";

const GCodeOutput = defineAsyncComponent(() => import("./monaco/GCodeOutput.vue"));

const props = defineProps<{
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
function getBaseFile(filename: string) {
	let title = filename.split('/')[0].split('.')[0];
	return title;
}
function getTemplateFile(filename: string) {
	return getBaseFile(filename) + ".g";
}

const generatedCode = ref("");

const fileRendered = ref(false);
watch(() => previewVisible.value && selectedTemplate.value, async () => {
	if (previewVisible.value) {
		fileRendered.value = false;
		generatedCode.value = "rendering...";
		try {
			const content = await render(selectedTemplate.value, { ...(props.previewOptions ?? {}), preview: true });
			generatedCode.value = indent(content);
			fileRendered.value = true;
		} catch (e) {
			console.warn(e);
			generatedCode.value = "failed to render G-code:\n" + e;
		}
	}
});

const rendering = ref(false);
async function showFile() {
	if (rendering.value) {
		return;
	}
	rendering.value = true;

	const filename = getTemplateFile(selectedTemplate.value);
	try {
		const ejsFilename = getBaseFile(selectedTemplate.value) + ".ejs";
		const output = await render(ejsFilename);

		let tab = window.open("about:blank", "_blank");
		if (tab == null) {
			alert("Could not open a new tab!\n\nPlease allow pop-ups for this page and try again.");
		} else {
			tab.document.write(indent(output).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;"));
			(tab.document.body as HTMLBodyElement).style.fontFamily = "monospace";
			(tab.document as Document).title = filename;
			tab.document.close();
		}
	} catch (e) {
		alert(`Failed to generate file ${filename}:\n\n${e}`);
	}
	rendering.value = false;
}
</script>
