<template>
	<b-form-row>
		<b-col>
			<b-form-group label="X minimum:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.geometry.mins[0]" v-preset title="Distance between the low X axis end and the bed corner" :max="template.geometry.maxes[0]" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
			<b-form-group label="X maximum:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.geometry.maxes[0]" v-preset title="Maximum length of the X axis plus X minimum" :min="template.geometry.mins[0]" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col>
			<b-form-group label="Y minimum:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.geometry.mins[1]" v-preset title="Distance between the low Y axis end and the bed corner" :max="template.geometry.maxes[1]" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
			<b-form-group label="Y maximum:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.geometry.maxes[1]" v-preset title="Maximum length of the Y axis plus Y minimum" :min="template.geometry.mins[1]" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
		</b-col>
		<b-col>
			<b-form-group label="Z minimum:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.geometry.mins[2]" v-preset title="Minimum allowed Z position" :max="template.geometry.maxes[2]" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
			<b-form-group label="Z maximum:">
				<b-input-group append="mm">
					<b-form-input v-model.number="template.geometry.maxes[2]" v-preset title="Maximum allowed Z position" :min="template.geometry.mins[2]" type="number" step="any" required />
				</b-input-group>
			</b-form-group>
		</b-col>
	</b-form-row>
</template>
