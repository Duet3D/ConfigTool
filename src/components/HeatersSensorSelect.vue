<style scoped>
select {
	width: 12rem;
}
</style>

<template>
	<b-select v-model="value" @input="changeHeater">
		<optgroup v-for="(group, name) in options" :label="name">
			<option v-for="option in group" :value="option.value" v-text="option.text" />
		</optgroup>
	</b-select>
</template>

<script>
'use strict';

export default {
	props: {
		options: {
			type: Object,
			required: true
		},
		value: {
			type: Number,
			required: true
		}
	},
	methods: {
		changeHeater(value) {
			this.$emit("input", value);
		}
	}
}
</script>
