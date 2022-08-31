<template>
	<div class="pt-3">
		<a :id="anchor" data-anchor="true"></a>
		<div class="card" v-bind="$attrs">
			<div class="card-header d-flex justify-content-between">
				<slot name="title">
					{{ props.title }}
					<a v-if="props.url && props.urlTitle" :href="props.url" target="_blank">
						<i class="bi-info-circle"></i>
						{{ props.urlTitle }}
					</a>
				</slot>
			</div>
			<slot name="body" />
			<div v-if="hasSlotContent($slots.default)" class="card-body">
				<slot />
			</div>
			<slot name="append" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Comment } from "vue";
import type { Slot, VNode } from "vue";

const props = defineProps<{
	anchor: string,
	title?: string,
	url?: string
	urlTitle?: string
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
