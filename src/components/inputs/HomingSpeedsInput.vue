<template>
	<label v-if="probeSpeeds" :for="id" class="form-label">
		{{ homeTwice ? "Probe Speeds" : "Probe Speed" }}:
	</label>
	<div class="input-group">
		<button type="button" class="btn" :class="homeTwice ? 'btn-primary' : 'btn-outline-secondary'"
				v-title="probeSpeeds ? 'Probe twice per point at different speeds' : 'Home twice per axis at different speeds'"
				@click="homeTwice = !homeTwice">
			x2
		</button>
		<input :id="id" class="form-control" :class="firstValidationClass" type="number" required :min="0.00001"
			   step="any" :value="speeds.length > 0 ? speeds[0] : NaN"
			   v-title="probeSpeeds ? 'First speed when probing' : 'First speed when homing'" @input="onFirstInput">
		<template v-if="homeTwice">
			<span class="input-group-text">
				/
			</span>
			<input class="form-control" :class="secondValidationClass" type="number" required :min="0.00001" step="any"
				   :value="speeds.length > 1 ? speeds[1] : NaN"
				   v-title="probeSpeeds ? 'Second speed when probing' : 'Second speed when homing'"
				   @input="onSecondInput">
		</template>
		<span class="input-group-text">
			mm/s
		</span>
	</div>
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

// External interface
interface HomingSpeedsInput {
	/**
	 * Whether this control is meant to set probe speeds
	 */
	probeSpeeds?: boolean;

	/**
	 * Probe speed values
	 */
	speeds: Array<number>,
}
const props = withDefaults(defineProps<HomingSpeedsInput>(), {
	probeSpeeds: false
});

// Display converters
const id = `homing-speeds-${++numInstances}`;

// x2 functionality
let homeTwiceValue = ref(props.speeds.length > 1 && props.speeds[0] !== props.speeds[1]);
const homeTwice = computed<boolean>({
	get: () => homeTwiceValue.value,
	set(value) {
		if (!value && props.speeds.length > 1) {
			props.speeds[1] = props.speeds[0];
		}
		homeTwiceValue.value = value;
	}
});

// Validation
const firstValidationClass = computed<string | null>(() => {
	return (props.speeds.length > 0 && !isNaN(props.speeds[0]) && isFinite(props.speeds[0]) && props.speeds[0] > 0) ? "is-valid" : "is-invalid";
});
const secondValidationClass = computed<string | null>(() => {
	return (props.speeds.length > 1 && !isNaN(props.speeds[1]) && isFinite(props.speeds[1]) && props.speeds[1] > 0) ? "is-valid" : "is-invalid";
})

// Update event
function onFirstInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);

		// Update first speed
		if (props.speeds.length > 0) {
			props.speeds[0] = value;
		} else {
			props.speeds.push(value);
		}

		// Update second speed unless x2 is turned on
		if (!homeTwice.value) {
			if (props.speeds.length > 1) {
				props.speeds[1] = value;
			} else {
				props.speeds.push(value);
			}
		}
	}
}
function onSecondInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);

		// Make sure there is a first speed
		if (props.speeds.length === 0) {
			props.speeds.push(value);
		}

		// Update second speed
		if (props.speeds.length === 1) {
			props.speeds.push(value);
		} else {
			props.speeds[1] = value;
		}
	}
}
</script>
