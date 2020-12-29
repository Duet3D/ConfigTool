<template>
	<b-container>
		<div class="text-center">
			<h2 class="mb-4">{{$t('start.welcome')}}</h2>
			<h4 class="text-muted mb-5">{{$t('start.instructions')}}</h4>
		</div>

		<b-card bg-variant="light" class="mb-3">
			<p>{{$t('start.instructions')}}</p>

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

				<p>{{$t('start.contributed')}}</p>

				<b-form-radio-group v-model="selectedMachine" name="machine" stacked class="mb-3">
					<b-form-radio value="anet-a8">Anet A8</b-form-radio>
					<b-form-radio value="distech-prometheus-system">Distech Prometheus System</b-form-radio>
					<b-form-radio value="reach3d">Reach3D Printer</b-form-radio>
					<b-form-radio value="wanhao-di3">Wanhao Duplicator i3</b-form-radio>
				</b-form-radio-group>

				<p>{{$t('start.alternative')}}</p>

				<b-form-radio-group v-model="selectedMachine" name="machine" stacked>
					<b-form-radio value="custom">{{$t('start.custom')}}</b-form-radio>
					<b-form-radio value="existing">{{$t('start.existing')}}</b-form-radio>
				</b-form-radio-group>
			</b-form-group>
		</b-card>

		<div class="text-center mt-4">
			<span class="text-muted">{{$t('start.note')}}<a href="https://github.com/chrishamm/configtool" target="_blank">GitHub</a>.
				<br>
				{{$t('start.options')}}<a href="https://duet3d.dozuki.com" target="_blank">Duet3D wiki</a>.</span>
			<br><br>
			<span class="text-muted">{{$t('start.webapp')}}<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank">GPLv3</a>. Version {{ version }}</span>
		</div>
		<input ref="inputJsonFile" type="file" accept="application/json" hidden @change="fileSelected"></input>
	</b-container>
	  
</template>

<script>
'use strict';

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
					const xhr = new XMLHttpRequest(), that = this;
					xhr.open('GET', `machines/${value}.json`, true);
					xhr.responseType = 'json';
					xhr.onload = function() {
						if (xhr.status >= 200 && xhr.status < 300) {
							that.setTemplate({ name: value, data: xhr.response });
						} else {
							this.setTemplate({ name: 'custom' });
							alert(`Failed to load template from server:\n\n${xhr.status} ${xhr.statusText}`);
						}
					}
					xhr.onerror = function() {
						this.setTemplate({ name: 'custom' });
						alert('Failed to load template from server:\n\nNetwork error');
					};
					xhr.send(null);
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
