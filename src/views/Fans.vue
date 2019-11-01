<style scoped>
.fan-value {
	min-width: 4rem;
}

td {
	vertical-align: middle;
}
</style>

<template>
	<b-container>
		<b-card no-body class="mt-3">
			<template #header>
				<span class="mt-2">Cooling Fans</span>
				<b-button-group v-if="template.firmware < 3" class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddFan" @click="addFan()">
						<font-awesome-icon icon="plus"></font-awesome-icon> Add Fan
					</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveFan" @click="removeFan()">
						<font-awesome-icon icon="minus"></font-awesome-icon> Remove Fan
					</b-button>
				</b-button-group>
			</template>

			<table class="table mb-0">
				<thead>
					<th>Name</th>
					<th>Speed (%)</th>
					<th v-if="template.firmware < 3">Inverted</th>
					<th>Frequency (Hz)</th>
					<th>Thermostatic Control</th>
					<th>Monitored Heaters</th>
					<th>Thermostatic Mode Trigger Temperature</th>
				</thead>
				<tbody>
					<tr v-for="(fan, index) in fans" :key="index">
						<td>
							<b-form-input v-model="fan.name" v-preset="getFanPreset(index).name" :placeholder="`FAN${index}`" title="Custom label for this fan" type="text" :disabled="template.firmware < 2.01"></b-form-input>
						</td>
						<td>
							<b-form-input v-model.number="fan.value" v-preset="getFanPreset(index).value" title="Initial value of this fan when turned on" min="0" max="100" type="number" step="any" required class="fan-value"></b-form-input>
						</td>
						<td v-if="template.firmware < 3">
							<b-form-radio-group buttons button-variant="outline-primary" v-model="fan.inverted" v-preset="getFanPreset(index).inverted" title="Invert fan PWM signal (required for 4-pin PWM cooling fans)" :name="'fan-inverted-' + index">
								<b-form-radio :value="true">Yes</b-form-radio>
								<b-form-radio :value="false">No</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-form-input v-model.number="fan.frequency" v-preset="getFanPreset(index).frequency" title="PWM frequency of this fan. 500Hz works well for normal fans, use 25kHz for 4-pin PWM cooling fans" type="number" min="0" max="65535" step="any" required></b-form-input>
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" v-model="fan.thermostatic" v-preset="getFanPreset(index).thermostatic" title="Enable thermostatic control for this fan" :name="'fan-thermostatic-' + index">
								<b-form-radio :value="true">Yes</b-form-radio>
								<b-form-radio :value="false">No</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-form-checkbox-group buttons button-variant="outline-primary" v-model="fan.heaters" v-preset="getFanPreset(index).heaters" title="Heaters to monitor for thermostatic control" :disabled="!fan.thermostatic" :name="'fan-heaters-' + index" :options="heaters"></b-form-checkbox-group>
							<span v-if="heaters.length == 0" class="text-muted">n/a</span>
						</td>
						<td>
							<b-input-group append="C">
								<b-form-input v-model.number="fan.trigger_temperature" v-preset="getFanPreset(index).trigger_temperature" title="Temperature at which the thermostatically-controlled fan is activated" :disabled="!fan.thermostatic" type="number" min="-273" max="1999" step="any" required></b-form-input>
							</b-input-group>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapMultiRowFields } from 'vuex-map-fields'

export default {
	computed: {
		...mapState(['preset', 'template']),
		...mapGetters(['canAddFan', 'canRemoveFan']),
		...mapMultiRowFields(['template.fans']),
		heaters() {
			const heaters = [];
			this.template.heaters.forEach(function(heater, index) {
				if (heater != null) {
					heaters.push({ text: (index == 0) ? 'Bed' : `E${index - 1}`, value: index });
				}
			});
			return heaters;
		}
	},
	methods: {
		...mapMutations(['addFan', 'removeFan']),
		getFanPreset(index) {
			return (index < this.preset.fans.length) ? this.preset.fans[index] : this.preset.fans[this.preset.fans.length - 1];
		}
	}
}
</script>
