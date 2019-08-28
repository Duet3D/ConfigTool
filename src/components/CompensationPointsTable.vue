<template>
	<table class="table table-sm mb-0">
		<thead>
			<th class="text-center">Probe&nbsp;Point</th>
			<th>X Coordinate</th>
			<th>Y Coordinate</th>
			<th>Height Correction</th>
		</thead>
		<tbody>
			<tr v-for="(point, index) in value" :key="index">
				<td class="text-center pt-2">{{ index + 1 }}</td>
				<td>
					<b-input-group append="mm" size="sm">
						<b-form-input v-model.number="point.x" :min="minX" :max="maxX" type="number" step="any" required></b-form-input>
					</b-input-group>
				</td>
				<td>
					<b-input-group append="mm" size="sm">
						<b-form-input v-model.number="point.y" :min="minY" :max="maxY" type="number" step="any" required></b-form-input>
					</b-input-group>
				</td>
				<td>
					<b-input-group append="mm" size="sm">
						<b-form-input v-model.number="point.z" :disabled="disableLastZ && index == value.length - 1" type="number" step="any" required></b-form-input>
					</b-input-group>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	props: {
		value: {
			type: Array,
			required: true
		},
		minX: Number,
		minY: Number,
		maxX: Number,
		maxY: Number,
		disableLastZ: Boolean
	}
}
</script>
