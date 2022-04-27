<template>
	<a :id="anchor" data-anchor="true" class="mb-3"></a>
	<div class="card mt-3" v-bind="$attrs">
		<div class="card-header">
			{{ props.title }}
		</div>
		<slot name="body" />
		<div v-if="hasSlotContent($slots.default)" class="card-body">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Comment } from "vue";
import type { Slot, VNode } from "vue";

const props = defineProps<{
	anchor: string,
	title: string
}>();

// Credits go to https://github.com/vuejs/core/issues/4733#issuecomment-1024816095
function hasSlotContent(slot: Slot|undefined, slotProps = {}): boolean {
	if (!slot) return false;

	return slot(slotProps).some((vnode: VNode) => {
		if (vnode.type === Comment) return false;

		if (Array.isArray(vnode.children) && !vnode.children.length) return false;

		return (
			vnode.type !== Text
			|| (typeof vnode.children === 'string' && vnode.children.trim() !== '')
		);
	});
}
</script>
