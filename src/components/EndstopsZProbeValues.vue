<template>
	<b-form-row>
		<b-col v-if="!hideHeight">
			<b-form-group :label="$t('endstops.triggerHeight')">
				<b-input-group append="mm">
					<b-form-input v-model.number="probeTriggerHeight" v-preset="preset.probe.trigger_height" :title="$t('endstops.triggerHeightDescription')" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col v-if="!hideValue">
			<b-form-group :label="$t('endstops.triggerValue')">
				<b-form-input v-model.number="probeTriggerValue" v-preset="preset.probe.trigger_value" :title="$t('endstops.triggerValueDescription')" type="number" min="0" max="1023" step="any" required></b-form-input>
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
