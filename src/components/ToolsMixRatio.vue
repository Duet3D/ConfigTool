<template>
	<div>
		<b-button :id="id" size="sm" variant="primary">{{ tool.mix_ratio.join(":") }}</b-button>
		<b-popover :target="id" placement="topleft" :show.sync="popoverShown" title="Set Mix Ratio" triggers="click">
			<b-row align-v="center">
				<b-col cols="8">
					<b-row v-for="(mix, idx) in tool.mix_ratio" :key="idx" class="mb-2">
						<b-col cols="auto" class="pt-2 pr-1">
							{{ `E${idx}:` }}
						</b-col>
						<b-col>
							<b-input v-model.number="mixRatio[idx]" type="number" step="any"></b-input>
						</b-col>
					</b-row>
				</b-col>
				<b-col cols="4">
					<h4>Sum:</h4>
					<h4 :class="{ 'text-success' : mixValid, 'text-danger' : !mixValid }">{{ mixSum.toFixed(2) }}</h4>
				</b-col>
			</b-row>
			<b-row class="mt-2">
				<b-col class="text-center">
					<b-button variant="primary" :disabled="!mixValid" @click="setMix">
						<font-awesome-icon icon="check"></font-awesome-icon> Set Mix
					</b-button>
				</b-col>
			</b-row>
		</b-popover>
	</div>
</template>

<script>
'use strict'

let idCounter = 0;

export default {
	computed: {
		mixSum() {
			let sum = 0;
			this.mixRatio.forEach(function(mix) {
				sum += mix;
			});
			return parseFloat(sum.toFixed(2));
		},
		mixValid() { return this.mixSum == 1; }
	},
	data() {
		return {
			id: `mixRatioInput${idCounter++}`,
			popoverShown: false,
			mixRatio: []
		}
	},
	methods: {
		setMix() {
			this.tool.mix_ratio = this.mixRatio.slice();
			this.popoverShown = false;
		}
	},
	beforeMount() {
		this.mixRatio = this.tool.mix_ratio.slice();
	},
	props: {
		index: {
			type: Number,
			required: true
		},
		tool: {
			type: Object,
			required: true
		}
	},
	watch: {
		"tool.mix_ratio": function(to, from) {
			this.mixRatio = to.slice();
		}
	}
}
</script>
