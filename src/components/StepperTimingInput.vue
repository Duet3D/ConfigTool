<style scoped>
.tlabel{
	width: 38rem;
}

.tinput{
	width: 8rem;
}

</style>

<template>
	<div>
		<b-form-input :id="id" ref="inputUnitless" v-model="drive.stepperDriverTimings" title="Stepper Timings"/> 

		<b-popover :target="id" :show.sync="popoverShown" placement="right" title="Custom Stepper Timings" triggers="focus" @show="onShow">
			<b-form-group horizontal label="Step Pulse Width:" label-class="text-left" class="tlabel">
				<b-input-group append="μs" class="tinput">
					<b-input v-model.number="parameters.pWidth" min="0" type="number" step="any" />
				</b-input-group>
			</b-form-group>		
			<b-form-group horizontal label="Step Pulse Interval:" label-class="text-left" class="tlabel">
				<b-input-group append="μs" class="tinput">
					<b-input v-model.number="parameters.pInterval" min="0" type="number" step="any" />
				</b-input-group>
			</b-form-group>		
			<b-form-group horizontal label="Direction Setup Time:" label-class="text-left" class="tlabel">
				<b-input-group append="μs" class="tinput">
					<b-input v-model.number="parameters.dirSetup" min="0" type="number" step="any" />
				</b-input-group>
			</b-form-group>		
			<b-form-group horizontal label="Direction Hold Time:" label-class="text-left" class="tlabel">
				<b-input-group append="μs" class="tinput">
					<b-input v-model.number="parameters.dirHold" min="0" type="number" step="any" />
				</b-input-group>
			</b-form-group>		
			<b-button size="sm" variant="primary" :disabled="!isValid" @click="apply">
				<font-awesome-icon icon="check"></font-awesome-icon> Set
			</b-button>
		</b-popover>
	</div>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'

const parameters = {
	pWidth: 1.0,
	pInterval: 1.0,
	dirSetup: 0.5,
	dirHold: 0.5,
}
let hadInput = false

let idCounter = 0;

export default {
	computed: {
		...mapState(['board', 'template']),
		isValid() {
			return isNumber(this.parameters.pWidth) && isNumber(this.parameters.pInterval) && isNumber(this.parameters.dirSetup) && isNumber(this.parameters.dirHold);
		},
	},
	data() {
		return {
			id: `driverTimings${idCounter++}`,
			parameters,
			popoverShown: false
		}
	},
	methods: {
		...mapMutations(['updateDrive']),

		apply() {
			var timings = this.parameters.pWidth+":"+this.parameters.pInterval+":"+this.parameters.dirSetup+":"+this.parameters.dirHold;
				this.updateDrive({
					drive: this.index,
					stepperDriverTimings: timings
				});

			this.popoverShown = false;
		},
		onShow(e) {
			if (!hadInput) {
				var vals = this.drive.stepperDriverTimings.split(":", 4);
				if(vals.length == 4){
					parameters.pWidth = Number(vals[0]);
					parameters.pInterval = Number(vals[1]);
					parameters.dirSetup = Number(vals[2]);
					parameters.dirHold = Number(vals[3]);
				}
			}
		}
	},
	props: {
		index: {
			type: Number,
			required: true
		},
		drive: {
			type: Object,
			required: true
		},		
	},
}
</script>
