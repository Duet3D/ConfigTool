<template>
	<b-container>

		<b-card header="Miscellaneous" class="mt-3">
			<label for="custom_settings">Custom Settings for config.g:</label>
			<label class="float-right"><a href="https://duet3d.com/wiki/G-code" target="_blank">Full list of all available G-codes</a></label>
			<b-form-textarea id="custom_settings" v-model="custom_settings" rows="4" max-rows="8"></b-form-textarea>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

export default {
	computed: mapFields({'custom_settings': 'template.custom_settings'})
}
</script>

