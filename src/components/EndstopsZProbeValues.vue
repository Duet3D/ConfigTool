<template>
	<b-form-row>
		<b-col v-if="!hideHeight">
			<b-form-group label="Trigger Height:">
				<b-input-group append="mm">
					<b-form-input v-model.number="probeTriggerHeight" v-preset="preset.probe.trigger_height" title="Height of the nozzle(s) when the probe is triggered" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col v-if="!hideValue">
			<b-form-group label="Trigger Value:">
				<b-form-input v-model.number="probeTriggerValue" v-preset="preset.probe.trigger_value" title="Trigger threshold for the probe" type="number" min="0" max="1023" step="any" required></b-form-input>
			</b-form-group>
		</b-col>
		<slot></slot>
	</b-form-row>
</template>

<script>
'use strict';

import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
	computed: {
		...mapState(['preset']),
		...mapFields({
			probeTriggerHeight: 'template.probe.trigger_height',
			probeTriggerValue: 'template.probe.trigger_value',
		})
	},
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
