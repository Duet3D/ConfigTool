<template>
	<b-container>
		<div class="text-center">
			<h2 class="mb-4">Welcome to the new RepRapFirmware Configuration Tool</h2>
			<h4 class="text-muted mb-5">Please follow this wizard to obtain an individual configuration bundle for your printer</h4>
		</div>

		<b-card bg-variant="light" class="mb-3">
			<p>If you are using a printer that was originally shipped with RepRapFirmware, you can select a predefined template here:</p>

			<b-form-group>
				<b-form-radio-group v-model="machine" @change="setMachine" name="machine" stacked class="mb-2">
					<b-form-radio value="minikossel">T3P3 Mini Kossel</b-form-radio>
				</b-form-radio-group>

				<b-form-radio-group v-model="machine" @change="setMachine" name="machine" stacked class="mb-3">
					<b-form-radio value="ormerod1">RepRapPro Ormerod 1</b-form-radio>
					<b-form-radio value="ormerod2">RepRapPro Ormerod 2</b-form-radio>
					<b-form-radio value="fisher">RepRapPro Fisher</b-form-radio>
				</b-form-radio-group>

				<p>The following machine templates were contributed by users and have not been throughly tested:</p>

				<b-form-radio-group v-model="machine" @change="setMachine" name="machine" stacked class="mb-3">
					<b-form-radio value="distech-prometheus-system">Distech Prometheus System</b-form-radio>
					<b-form-radio value="reach3d">Reach3D Printer</b-form-radio>
					<b-form-radio value="wanhao-di3">Wanhao Duplicator i3</b-form-radio>
				</b-form-radio-group>

				<p>Alternatively you can create your own individual configuration by creating a new one from scratch or by loading an existing JSON template:</p>

				<b-form-radio-group v-model="machine" @change="setMachine" name="machine" stacked>
					<b-form-radio value="custom">Custom configuration</b-form-radio>
					<b-form-radio value="existing">Use existing configuration</b-form-radio>
				</b-form-radio-group>
			</b-form-group>
		</b-card>

		<input ref="inputJsonFile" type="file" accept="application/json" hidden @change="fileSelected" />

		<span class="text-muted">Note: This version is still experimental. If you encounter problems, please use the <a href="https://configurator.reprapfirmware.org/v1">old config tool</a> and report back on the <a href="https://forum.duet3d.com" target="_blank">Duet3D forums</a>.</span>
		<br/><br/>
		<span class="text-muted">This web app is fully open-source and licensed under the terms of the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank">GPLv3</a>. Check out <a href="https://github.com/chrishamm/configtool" target="_blank">GitHub</a> for the source files.</span>
	</b-container>
</template>

<script>
'use strict';

import axios from 'axios'
import Template from '../defaults/Template.js'

let data = { customTemplate: Template.getDefaultTemplate() };

export default {
	data: () => data,
	methods: {
		fileSelected(e) {
			if (e.target.files.length > 0) {
				let fileReader = new FileReader();
				let thisArg = this;
				fileReader.onload = function(e) {
					try {
						thisArg.$refs.inputJsonFile.value = null;
						thisArg.machine = "existing";
 						thisArg.template = JSON.parse(e.target.result);
					} catch (e) {
						alert("Error: The specified file could not be read!" + e);
					}
				};
				fileReader.readAsText(e.target.files[0]);
			}
		},
		setMachine(machine) {
			if (machine == "custom") {
				// Restore custom template properties. Perhaps even ask users to start over?
				this.template = this.customTemplate;
			} else {
				if (this.machine == "custom") {
					// No need to perform validation here, it's already been checked
					this.customTemplate = Object.assign({}, this.template);
				}

				if (machine == "existing") {
					this.$refs.inputJsonFile.click();
					this.$nextTick(function() {
						this.machine = "custom";
						this.template = this.customTemplate;
					});
				} else {
					axios
						.get(`machines/${machine}.json`)
						.then(response => {
							this.machine = machine;
							this.template = response.data;
						})
						.catch(e => {
							alert("Failed to load template from server:\n\n" + e)
						});
				}
			}
		}
	}
}
</script>
