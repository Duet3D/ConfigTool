<template>
	<label v-if="props.label" class="form-label" :for="id">
		{{ props.label }}:
	</label>
	<div class="input-group">
		<slot name="prepend" />
		<input ref="input" :id="id" class="form-control" :class="validationClass" type="number" v-bind="$attrs"
			   :required="props.required" :min="props.min" :max="props.max" :step="props.step" :value="props.modelValue"
			   :data-unit="unit" @input="onInput" @change="onChange" @focus="showPopover" @keyup.tab="selectFirstInput">
		<slot name="append" />
	</div>

	<div class="d-none">
		<div ref="popoverContent">
			<slot />
		</div>
	</div>
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { Popover } from "bootstrap";
import { computed, onBeforeUnmount, ref } from "vue";
import { closeAllTooltips } from "@/directives/VPreset";

// External interface
const props = withDefaults(defineProps<{
	label?: string,
	lazy?: boolean,
	min?: number,
	max?: number,
	modelValue: number,
	required?: boolean,
	step?: number | "any",
	title?: string,
	unit?: string,
	valid?: boolean
}>(), {
	lazy: true,
	required: true,
	valid: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: number): void
	(e: 'show', value: Event): void,
	(e: 'shown', value: Event): void,
	(e: 'hide', value: Event): void,
	(e: 'hidden', value: Event): void,
	(e: 'inserted', value: Event): void
}>();

defineExpose({
	hide(selectInput: boolean = false) {
		hidePopover();
		if (selectInput && input.value) {
			(input.value as HTMLElement).focus();
		}
	}
});

// Display converters
const id = `calc-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (props.required) {
		return (props.valid &&
			!isNaN(props.modelValue) && isFinite(props.modelValue) &&
			(props.min === undefined || props.modelValue >= props.min) &&
			(props.max === undefined || props.modelValue <= props.max)) ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
function onInput(e: Event) {
	if (e.target !== null && !props.lazy) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value);
	}
};
function onChange(e: Event) {
	if (e.target !== null && props.lazy) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value);
	}
};

// Popover functionality
const input = ref<Element | null>(null), popoverContent = ref<Element | null>(null);
let popover: Popover | null = null, popoverShown = false

function hidePopover() {
	document.body.removeEventListener("click", hidePopover);
	document.body.removeEventListener("keydown", hidePopover);
	closeAllTooltips();     // in case nested inputs are still showing a tooltip
	popover?.hide();
}

function showPopover(e: Event) {
	if (!e.target || !popoverContent.value || popoverShown) {
		return;
	}

	// Set up own popover
	if (!popover) {
		popover = new Popover(e.target as Element, {
			title: props.title,
			content: popoverContent.value,
			html: true,
			placement: "bottom"
		});

		e.target.addEventListener("show.bs.popover", (e: Event) => emit("show", e));
		e.target.addEventListener("shown.bs.popover", (e: Event) => {
			const popoverId = (e.target as HTMLElement).attributes.getNamedItem("aria-describedby")?.value;
			if (popoverId) {
				const popoverElement = document.getElementById(popoverId);
				if (popoverElement) {
					// Don't close the popover on click/keydown (except for ESC)
					popoverElement.onclick = (e) => e.stopPropagation();
					popoverElement.onkeydown = (e) => {
						if (e.keyCode === 27) {
							hidePopover();
							(input.value as HTMLElement)?.focus();
						}
						e.stopPropagation();
					}
				}
			}
			popoverShown = true;
			document.body.addEventListener("click", hidePopover);
			document.body.addEventListener("keydown", hidePopover);
			emit("shown", e);
		});
		e.target.addEventListener("hide.bs.popover", (e: Event) => emit("hide", e));
		e.target.addEventListener("hidden.bs.popover", () => {
			popoverShown = false;
			document.body.removeEventListener("click", hidePopover);
			document.body.removeEventListener("keydown", hidePopover);
			emit("hidden", e);
		});
		e.target.addEventListener("inserted.bs.popover", (e: Event) => emit("inserted", e));
	}

	// Show it
	popover.show();
}

onBeforeUnmount(() => {
	if (popover) {
		popover.dispose();
		popover = null;
	}
})

function selectFirstInput(e: Event) {
	const popoverId = (e.target as HTMLElement).attributes.getNamedItem("aria-describedby")?.value;
	if (popoverId) {
		const popoverElement = document.getElementById(popoverId);
		const inputs = (popoverElement as HTMLElement).getElementsByTagName("input");
		if (inputs) {
			inputs[0].focus();
		}
	}
}
</script>
