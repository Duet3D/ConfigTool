<template>
	<b-form-row>
		<b-col v-if="!hideHeight">
			<b-form-group label="Trigger Height:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.probe.trigger_height" v-preset title="Height of the nozzle(s) when the probe is triggered" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col v-if="!hideValue">
			<b-form-group label="Trigger Value:">
				<b-form-input v-model.number="template.probe.trigger_value" v-preset title="Trigger threshold for the probe" type="number" step="any" required />
			</b-form-group>
		</b-col>
		<slot />
	</b-form-row>
</template>

<script>
export default {
	props: {
		hideHeight: {
			type: Boolean,
			default: false
		},
		hideValue: {
			type: Boolean,
			default: false
		}
	}
}
</script>
