<template>
	<b-container>
		<!--b-card v-show="standalone" header="Extra Files" class="mt-3">
			<b-checkbox v-model="addDWC">Get the latest stable Duet Web Control version</b-checkbox>
			<b-checkbox v-model="addRRF">Get the latest stable RepRapFirmware version</b-checkbox>
		</b-card-->

		<b-card header="Miscellaneous" class="mt-3">
			<label for="custom_settings">Custom Settings for config.g:</label>
			<label class="float-right"><a href="https://duet3d.com/wiki/G-code" target="_blank">Full list of all available G-codes</a></label>
			<b-form-textarea id="custom_settings" v-model="customSettings" rows="4" max-rows="8"></b-form-textarea>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

export default {
	computed: mapFields({
		customSettings: 'template.custom_settings',
		standalone: 'template.standalone',
		addDWC: 'addDWC',
		addRRF: 'addRRF'
	})
}
</script>

