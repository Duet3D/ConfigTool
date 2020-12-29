<template>
	<b-form-row>
		<b-col>
			<b-form-group :label="$t('general.xMin')">
				<b-input-group append="mm">
					<b-form-input v-model.number="xMin" v-preset="preset.geometry.mins[0]" :title="$t('general.xMinDescription')" :max="xMax" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col class="mr-2">
			<b-form-group :label="$t('general.xMax')">
				<b-input-group append="mm">
					<b-form-input v-model.number="xMax" v-preset="preset.geometry.maxes[0]" :title="$t('general.xMaxDescription')" :min="xMin" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col class="ml-1">
			<b-form-group :label="$t('general.yMin')">
				<b-input-group append="mm">
					<b-form-input v-model.number="yMin" v-preset="preset.geometry.mins[1]" :title="$t('general.yMinDescription')" :max="yMax" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col class="mr-1">
			<b-form-group :label="$t('general.yMax')">
				<b-input-group append="mm">
					<b-form-input v-model.number="yMax" v-preset="preset.geometry.maxes[1]" :title="$t('general.yMaxDescription')" :min="yMin" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col class="ml-2">
			<b-form-group :label="$t('general.zMin')">
				<b-input-group append="mm">
					<b-form-input v-model.number="zMin" v-preset="preset.geometry.mins[2]" :title="$t('general.zMinDescription')" :max="zMax" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col>
			<b-form-group :label="$t('general.zMax')">
				<b-input-group append="mm">
					<b-form-input v-model.number="zMax" v-preset="preset.geometry.maxes[2]" :title="$t('general.zMaxDescription')" :min="zMin" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		</b-col>
	</b-form-row>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'
// chrishamm 2019-08-22: mapMultiRowFields does not work for non-object arrays

export default {
	computed: {
		...mapState(['preset', 'template']),
		xMin: {
			get() { return this.template.geometry.mins[0]; },
			set(value) { this.setAxisMinimum({ axis: 0, value }); }
		},
		yMin: {
			get() { return this.template.geometry.mins[1]; },
			set(value) { this.setAxisMinimum({ axis: 1, value }); }
		},
		zMin: {
			get() { return this.template.geometry.mins[2]; },
			set(value) { this.setAxisMinimum({ axis: 2, value }); }
		},
		xMax: {
			get() { return this.template.geometry.maxes[0]; },
			set(value) { this.setAxisMaximum({ axis: 0, value }); }
		},
		yMax: {
			get() { return this.template.geometry.maxes[1]; },
			set(value) { this.setAxisMaximum({ axis: 1, value }); }
		},
		zMax: {
			get() { return this.template.geometry.maxes[2]; },
			set(value) { this.setAxisMaximum({ axis: 2, value }); }
		}
	},
	methods: mapMutations(['setAxisMinimum', 'setAxisMaximum'])
}
</script>
