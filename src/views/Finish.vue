<template>
	<b-container>
		<b-card no-body>
			<template slot="header">
				<span class="mt-2">Cooling Fans</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddFan" @click="addFan"><font-awesome-icon icon="plus" /> Add Fan</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveFan" @click="removeFan"><font-awesome-icon icon="minus" /> Remove Fan</b-button>
				</b-button-group>
			</template>

			<table class="table mb-0">
				<thead>
					<th>Name</th>
					<th>Value</th>
					<th>Inverted</th>
					<th>Frequency</th>
					<th>Thermostatic Control</th>
					<th>Monitored Heaters</th>
					<th>Thermostatic Mode Trigger Temperature</th>
				</thead>
				<tbody>
					<tr v-for="(fan, index) in template.fans" :key="index">
						<td class="pt-3">FAN{{ index }}</td>
						<td>
							<b-input-group append="%">
								<b-form-input v-model.number="fan.value" v-preset="getFanPreset(index).value" title="Initial value of this fan when turned on" min="0" max="100" type="number" step="any" required />
							</b-input-group>
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" v-model="fan.inverted" v-preset="getFanPreset(index).inverted" title="Invert fan PWM signal (required for 4-pin PWM cooling fans)" :name="'fan-inverted-' + index">
								<b-form-radio :value="true">Yes</b-form-radio>
								<b-form-radio :value="false">No</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-input-group append="Hz">
								<b-form-input v-model.number="fan.frequency" v-preset="getFanPreset(index).frequency" title="PWM frequency of this fan. 500Hz works well for normal fans, use 25kHz for 4-pin PWM cooling fans" type="number" min="0" max="65535" step="any" required />
							</b-input-group>
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" v-model="fan.thermostatic" v-preset="getFanPreset(index).thermostatic" title="Enable thermostatic control for this fan" :name="'fan-thermostatic-' + index">
								<b-form-radio :value="true">Yes</b-form-radio>
								<b-form-radio :value="false">No</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-form-checkbox-group buttons button-variant="outline-primary" v-model="fan.heaters" v-preset="getFanPreset(index).heaters" title="Heaters to monitor for thermostatic control" :disabled="!fan.thermostatic" :name="'fan-heaters-' + index" :options="heaters" />
							<span v-if="heaters.length == 0" class="text-muted">n/a</span>
						</td>
						<td>
							<b-input-group append="C">
								<b-form-input v-model.number="fan.trigger_temperature" v-preset="getFanPreset(index).trigger_temperature" title="Temperature at which the thermostatically-controlled fan is activated" :disabled="!fan.thermostatic" type="number" min="-273" max="1999" step="any" required />
							</b-input-group>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>

		<b-card header="Miscellaneous" class="mt-3">
			<label for="custom_settings">Custom Settings for config.g:</label>
			<label class="float-right"><a href="https://duet3d.com/wiki/G-code" target="_blank">Full list of all available G-codes</a></label>
			<b-form-textarea id="custom_settings" v-model="template.custom_settings" rows="4" max-rows="8" />
		</b-card>
	</b-container>
</template>

<script>
export default {
	beforeMount() {
		this.template.heaters.forEach(function(heater, index) {
			if (heater != null) {
				this.heaters.push({ text: (index == 0) ? "Bed" : `E${index - 1}`, value: index });
			}
		}, this);
	},
	computed: {
		canAddFan() {
			return this.template.fans.length < this.board.maxFans;
		},
		canRemoveFan() {
			return this.template.fans.length > 0;
		}
	},
	data() {
		return {
			heaters: []
		}
	},
	methods: {
		getFanPreset(index) {
			return (index < this.preset.fans.length) ? this.preset.fans[index] : this.preset.fans[this.preset.fans.length - 1];
		}
	}
}
</script>

