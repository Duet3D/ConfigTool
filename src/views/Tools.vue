<style scoped>
tr > th:last-child,
tr > td:last-child {
	text-align: center;
}
</style>

<template>
	<b-container>
		<b-card :header="$t('tools.tool')">
			<b-checkbox v-model="toolchangeWaitForTemperatures" v-preset.left="preset.toolchange_wait_for_temperatures" :title="$t('tools.M116Description')">{{$t('tools.M116')}}</b-checkbox>
			<b-checkbox v-model="generateTCode" v-preset.left="preset.generate_t_code" :title="$t('tools.tcodeDescription')">{{$t('tools.tcode')}}</b-checkbox>
		</b-card>

		<b-card no-body class="mt-3">
			<template slot="header">
				<span class="mt-2">Tools</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" @click="addTool()">
						<font-awesome-icon icon="plus"></font-awesome-icon> Add Tool
					</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveTool" @click="removeTool()">
						<font-awesome-icon icon="minus"></font-awesome-icon> Remove Tool
					</b-button>
				</b-button-group>
			</template>

			<table class="table mb-0">
				<thead>
					<tr>
						<th>Number</th>
						<th>Name</th>
						<th>Extruders</th>
						<th v-show="mixingToolsConfigured">Mixing Ratio</th>
						<th>Heaters</th>
						<th>Fans</th>
						<th>XYZ Offsets</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(tool, index) in tools" :key="index">
						<td>
							<b-form-input v-model.number="tool.number" :state="isToolNumberUnique(tool.number)" type="number" min="0" step="1" required></b-form-input>
						</td>
						<td>
							<b-form-input v-model="tool.name" placeholder="optional" type="text"></b-form-input>
						</td>
						<td class="pt-3">
							<b-form-checkbox-group v-if="extruders.length !== 0" buttons button-variant="outline-primary" size="sm" :name="'tool-extruders-' + index" :checked="tool.extruders" @input="setToolExtruders({ index, extruders: $event })" :options="extruders"></b-form-checkbox-group>
							<span v-else class="text-muted">n/a</span>
						</td>
						<td v-show="mixingToolsConfigured" class="pt-3">
							<mix-ratio v-show="tool.mix_ratio.length !== 0" :tool="tool" :index="index"></mix-ratio>
							<span v-show="tool.mix_ratio.length === 0" class="text-muted">n/a</span>
						</td>
						<td class="pt-3">
							<b-form-checkbox-group v-if="heaters.length !== 0" buttons button-variant="outline-primary" size="sm" :name="'tool-heaters-' + index" v-model="tool.heaters" :options="heaters"></b-form-checkbox-group>
							<span v-else class="text-muted">n/a</span>
						</td>
						<td class="pt-3">
							<b-form-checkbox-group v-if="fans.length !== 0" buttons button-variant="outline-primary" size="sm" :name="'tool-fans-' + index" v-model="tool.fans" :options="fans"></b-form-checkbox-group>
							<span v-else class="text-muted">n/a</span>
						</td>
						<td>
							<offset-button :tool="tool" :index="index"></offset-button>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>
		<b-alert :show="hasDuplicateToolNumbers" variant="danger">
			<strong>Error:</strong> Tool numbers must be unique
		</b-alert>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

import MixRatio from '../components/ToolsMixRatio.vue'
import OffsetButton from '../components/ToolsOffsetButton.vue'

export default {
	components: {
		'mix-ratio': MixRatio,
		'offset-button': OffsetButton
	},
	computed: {
		...mapState(['preset', 'template']),
		...mapGetters(['canRemoveTool']),
		...mapFields({
			toolchangeWaitForTemperatures: 'template.toolchange_wait_for_temperatures',
			generateTCode: 'template.generate_t_code'
		}),
		...mapMultiRowFields(['template.tools']),
		extruders() {
			const extruders = [];
			for (let i = 3; i < this.template.drives.length; i++) {
				extruders.push({ text: `E${i - 3}`, value: i - 3 });
			}
			return extruders;
		},
		heaters() {
			const heaters = [];
			this.template.heaters.forEach(function(heater, index) {
				if ((index !== 0 || this.template.bed_is_nozzle) &&
					(!this.template.bed.present || this.template.bed.heater !== index) &&
					(!this.template.chamber.present || this.template.chamber.heater !== index) &&
					(this.template.probe.type !== 'bltouch' || this.template.probe.pwm_channel !== index)
				) {
					heaters.push({
						text: (this.template.firmware >= 3) ? `H${index}` : ((index === 0) ? 'Bed' : `E${index - 1}`),
						value: index
					});
				}
			}, this);
			return heaters;
		},
		fans() {
			const fans = [];
			this.template.fans.forEach(function(fan, index) {
				if (!fan.thermostatic) {
					fans.push({
						text: `FAN${index}`,
						value: index
					});
				}
			});
			return fans;
		},
		mixingToolsConfigured() {
			return this.tools.findIndex(tool => tool.extruders.length > 1) !== -1;
		},
		hasDuplicateToolNumbers() {
			return this.tools.findIndex(function(tool, i) {
				return this.tools.findIndex(function(other, k) {
					if (i !== k && isNumber(tool.number) && isNumber(other.number) && tool.number == other.number) {
						return true;
					}
				}) !== -1;
			}, this) !== -1;
		}
	},
	methods: {
		...mapMutations(['addTool', 'removeTool', 'setToolExtruders']),
		isToolNumberUnique(num) {
			let count = 0;
			for (let i = 0; i < this.tools.length; i++) {
				if (this.tools[i].number === num) {
					count++;
				}
			}
			return count <= 1;
		}
	}

}
</script>
