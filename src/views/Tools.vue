<template>
	<b-container>
		<b-card header="Tool Preferences">
			<b-checkbox v-model="template.toolchange_wait_for_temperatures" v-preset title="Generate an M116 code in the tpost macros">Wait for Temperatures to be Reached on Tool Change</b-checkbox>
			<br/>
			<b-checkbox v-model="template.generate_t_code" v-preset title="A T-code with the first tool number is generated at the end of config.g">Select First Tool on Start-Up</b-checkbox>
		</b-card>

		<b-card no-body class="mt-3">
			<template slot="header">
				<span class="mt-2">Tools</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" @click="addTool"><font-awesome-icon icon="plus" /> Add Tool</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveTool" @click="removeTool"><font-awesome-icon icon="minus" /> Remove Tool</b-button>
				</b-button-group>
			</template>

			<table class="table mb-0">
				<thead>
					<th>Number</th>
					<th>Name</th>
					<th>Extruders</th>
					<th>Heaters</th>
					<th>XYZ Offsets (mm)</th>
					<th>Mixing Ratio</th>
				</thead>
				<tbody>
					<tr v-for="(tool, index) in template.tools" :key="index">
						<td>
							<b-form-input v-model.number="tool.number" type="number" min="0" step="1" required />
						</td>
						<td>
							<b-input v-model="tool.name" placeholder="optional" type="text" />
						</td>
						<td class="pt-3">
							<b-form-checkbox-group buttons button-variant="outline-primary" size="sm" :name="'tool-extruders-' + index" v-model="tool.extruders" :options="extruders" />
								<span v-if="extruders.length == 0" class="text-muted">n/a</span>
						</td>
						<td class="pt-3">
							<b-form-checkbox-group buttons button-variant="outline-primary" size="sm" :name="'tool-heaters-' + index" v-model="tool.heaters" :options="heaters" />
								<span v-if="heaters.length == 0" class="text-muted">n/a</span>
						</td>
						<td>
							<b-form-row>
								<b-col>
									<b-form-input v-model.number="tool.x_offset" type="number" step="any" required />
								</b-col>
								<b-col>
									<b-form-input v-model.number="tool.y_offset" type="number" step="any" required />
								</b-col>
								<b-col>
									<b-form-input v-model.number="tool.z_offset" type="number" step="any" required />
								</b-col>
							</b-form-row>
						</td>
						<td class="pt-3">
							<mix-ratio v-show="tool.mix_ratio.length != 0" :tool="tool" :index="index" />
							<span v-if="tool.mix_ratio.length == 0" class="text-muted">n/a</span>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import MixRatio from '../components/ToolsMixRatio.vue'

export default {
	components: {
		'mix-ratio': MixRatio
	},
	computed: {
		canRemoveTool() { return this.template.tools.length > 0; }
	},
	data() {
		return {
			extruders: [],
			heaters: []
		}
	},
	beforeMount() {
		this.template.heaters.forEach(function(heater, index) {
			if ((index != 0 || this.template.bed_is_nozzle) &&
				(!this.template.bed.present || this.template.bed.heater != index) &&
				(!this.template.chamber.present || this.template.chamber.heater != index) &&
				(this.template.probe.type != "bltouch" || this.template.probe.pwm_channel != index)
			) {
				this.heaters.push({ text: (index == 0) ? "Bed" : `E${index - 1}`, value: index });
			}
		}, this);

		for(let i = 3; i < this.template.drives.length; i++) {
			this.extruders.push({ text: `E${i - 3}`, value: i - 3 });
		}
	}
}
</script>
