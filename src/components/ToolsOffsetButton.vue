<template>
	<div>
		<b-button :id="'offset' + index" size="sm" variant="primary" class="mt-1">
			<font-awesome-icon icon="edit"></font-awesome-icon> Edit
		</b-button>
		<b-popover :target="'offset' + index" ref="popover" placement="topleft" :show.sync="popoverShown" title="Edit Tool Offsets" triggers="click">
			<b-form-group label-cols="3" label="X Offset:">
				<b-input-group append="mm">
					<b-form-input v-model.number="xOffset" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
			<b-form-group label-cols="3" label="Y Offset:">
				<b-input-group append="mm">
					<b-form-input v-model.number="yOffset" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
			<b-form-group label-cols="3" label="Z Offset:">
				<b-input-group append="mm">
					<b-form-input v-model.number="zOffset" type="number" step="any" required></b-form-input>
				</b-input-group>
			</b-form-group>
		
			<b-row class="mt-2">
				<b-col class="text-center">
					<b-button variant="primary" :disabled="!offsetsValid" @click="setOffsets">
						<font-awesome-icon icon="check"></font-awesome-icon> Apply
					</b-button>
				</b-col>
			</b-row>
		</b-popover>
	</div>
</template>

<script>
export default {
	computed: {
		offsetsValid() {
			return isNumber(this.xOffset) && isNumber(this.yOffset) && isNumber(this.zOffset);
		}
	},
	data() {
		return {
			popoverShown: false,
			xOffset: 0,
			yOffset: 0,
			zOffset: 0
		}
	},
	methods: {
		setOffsets() {
			this.tool.x_offsets = this.xOffset;
			this.tool.y_offsets = this.yOffset;
			this.tool.z_offsets = this.zOffset;
			this.popoverShown = false;
		}
	},
	beforeMount() {
		this.xOffset = this.tool.x_offset;
		this.yOffset = this.tool.y_offset;
		this.zOffset = this.tool.z_offset;
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
		'tool.x_offset'(to) { this.x_offset = to; },
		'tool.y_offset'(to) { this.y_offset = to; },
		'tool.z_offset'(to) { this.z_offset = to; }
	}
}
</script>
