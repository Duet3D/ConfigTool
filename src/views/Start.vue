<template>
	<b-container>
		<div class="text-center">
			<h2 class="mb-4">Welcome to the RepRapFirmware Configuration Tool</h2>
			<h4 class="text-muted mb-5">Please follow this wizard to obtain an individual configuration bundle for your printer</h4>
		</div>

		<b-card bg-variant="light" class="mb-3">
			<p>If you are using a printer that was originally shipped with RepRapFirmware, you can select a predefined template here:</p>

			<b-form-group>
				<b-form-radio-group v-model="selectedMachine" name="machine" stacked class="mb-2">
					<b-form-radio value="minikossel">T3P3 Mini Kossel</b-form-radio>
				</b-form-radio-group>

				<b-form-radio-group v-model="selectedMachine" name="machine" stacked class="mb-3">
					<b-form-radio value="ormerod1">RepRapPro Ormerod 1</b-form-radio>
					<b-form-radio value="ormerod2">RepRapPro Ormerod 2</b-form-radio>
					<b-form-radio value="fisher">RepRapPro Fisher</b-form-radio>
				</b-form-radio-group>

				<b-form-radio-group v-model="selectedMachine" name="machine" stacked class="mb-3">
					<b-form-radio value="ender3pro">Creality Ender 3 Pro</b-form-radio>
				</b-form-radio-group>

				<p>The following machine templates were contributed by users and have not been throughly tested:</p>

				<b-form-radio-group v-model="selectedMachine" name="machine" stacked class="mb-3">
					<b-form-radio value="anet-a8">Anet A8</b-form-radio>
					<b-form-radio value="distech-prometheus-system">Distech Prometheus System</b-form-radio>
					<b-form-radio value="reach3d">Reach3D Printer</b-form-radio>
					<b-form-radio value="wanhao-di3">Wanhao Duplicator i3</b-form-radio>
				</b-form-radio-group>

				<p>Alternatively, you can create your own individual configuration by creating a new one from scratch or by loading an existing JSON template:</p>

				<b-form-radio-group v-model="selectedMachine" name="machine" stacked>
					<b-form-radio value="custom">Custom configuration</b-form-radio>
					<b-form-radio value="existing">Use existing configuration</b-form-radio>
				</b-form-radio-group>
			</b-form-group>
		</b-card>

		<div class="text-center mt-4">
			<span class="text-muted">Note: If you encounter problems, please report your problems on <a href="https://github.com/chrishamm/configtool" target="_blank">GitHub</a>.
				<br>
				Some configuration options may not be available yet. In this case please refer to the <a href="https://duet3d.dozuki.com" target="_blank">Duet3D wiki</a>.</span>
			<br><br>
			<span class="text-muted">This web app is fully open-source and licensed under the terms of the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank">GPLv3</a>. Version {{ version }}</span>
		</div>

		<input ref="inputJsonFile" type="file" accept="application/json" hidden @change="fileSelected"></input>
	</b-container>
</template>

<script>
'use strict';

import axios from 'axios'
import { mapState, mapMutations } from 'vuex'

import { version } from '../../package.json'

import Template from '../store/Template.js'

export default {
	created() {
		this.machineSelection = this.machine;
	},
	data() {
		return {
			machineSelection: 'custom',
			version
		}
	},
	computed: {
		...mapState(['machine']),
		selectedMachine: {
			get() { return this.machineSelection; },
			set(value) {
				if (this.machineSelection == value) {
					return;
				}
				this.machineSelection = value;

				if (value === 'custom') {
					// Apply custom template
					this.setTemplate({ name: 'custom' });
				} else if (value === 'existing') {
					// Load the machine template from the user's device
					this.$refs.inputJsonFile.click();
					this.$nextTick(function() {
						this.machineSelection = this.machine;
					});
				} else {
					// Load the machine template from the server
					axios
						.get(`machines/${value}.json`)
						.then(response => {
							this.setTemplate({ name: value, data: response.data });
						})
						.catch(e => {
							this.setTemplate({ name: 'custom' });
							console.log(e);
							alert('Failed to load template from server:\n\n' + e)
						});
				}
			}
		}
	},
	methods: {
		...mapMutations(['setTemplate']),
		fileSelected(e) {
			if (e.target.files.length > 0) {
				const fileReader = new FileReader();
				const that = this;
				fileReader.onload = function(e) {
					try {
						that.setTemplate({ name: 'existing', data: JSON.parse(e.target.result) });
					} catch (e) {
						console.log(e);
						alert('Error: The specified file could not be read!\n\n' + e);
					}
				};
				fileReader.readAsText(e.target.files[0]);
			}
		},
	},
	watch: {
		machine(to) {
			this.machineSelection = to;
		}
	}
}
</script>
