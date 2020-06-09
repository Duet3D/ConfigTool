<style>
textarea {
	font-family: monospace;
	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;
}
</style>

<template>
	<b-container>
		<b-card v-show="standalone" header="Extra Files" class="mt-3">
			<b-checkbox v-model="addDWC">Get the latest stable Duet Web Control version</b-checkbox>
			<b-checkbox v-model="addRRF">Get the latest stable RepRapFirmware version</b-checkbox>
		</b-card>

		<b-card header="Miscellaneous" class="mt-3">
			<b-checkbox v-model="panelDue" class="mb-3">Enable support for PanelDue</b-checkbox>
			<label for="custom_settings">Custom Settings for config.g:</label>
			<label class="float-right"><a href="https://duet3d.com/wiki/G-code" target="_blank">Full list of all available G-codes</a></label>
			<b-form-textarea id="custom_settings" v-model="customSettings" rows="4" max-rows="8" @keydown.tab.exact.prevent="onTextareaTab"></b-form-textarea>
		</b-card>
	</b-container>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

export default {
	computed: mapFields({
		addDWC: 'addDWC',
		addRRF: 'addRRF',
		panelDue: 'template.panelDue',
		customSettings: 'template.custom_settings',
		standalone: 'template.standalone'
	}),
	methods: {
		onTextareaTab(e) {
			const originalSelectionStart = e.target.selectionStart;
			const textStart = e.target.value.slice(0, originalSelectionStart), textEnd = e.target.value.slice(originalSelectionStart);
			this.custom_settings = `${textStart}\t${textEnd}`;
			e.target.value = this.custom_settings;
			e.target.selectionEnd = e.target.selectionStart = originalSelectionStart + 1;
		}
	}
}
</script>

