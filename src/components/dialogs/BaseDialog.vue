<template>
	<div ref="dialogElement" class="modal fade">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="exampleModalLabel">
						{{ props.title }}
					</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<slot />
				</div>
				<div class="modal-footer justify-content-center">
					<button type="button" class="btn btn-primary" data-bs-dismiss="modal">
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Modal } from "bootstrap";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{
	modelValue: boolean,
	title: string
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const dialogElement = ref<HTMLElement | null>(null);
let dialog: Modal | null = null;

onMounted(() => {
	if (dialogElement.value) {
		dialog = new Modal(dialogElement.value);
		dialogElement.value.addEventListener("shown.bs.modal", () => {
			emit("update:modelValue", true);
		});
		dialogElement.value.addEventListener("hidden.bs.modal", () => {
			emit("update:modelValue", false);
		});
	}
});

onBeforeUnmount(() => {
	if (dialog !== null) {
		dialog.dispose();
		dialog = null;
	}
});

watch(() => props.modelValue, (to, from) => {
	if (to !== from && dialog !== null) {
		if (to) {
			dialog.show();
		} else {
			dialog.hide();
		}
	}
})
</script>
