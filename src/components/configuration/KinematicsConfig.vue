<template>
	<scroll-item anchor="Kinematics">
		<template #title>
			Kinematics
			<a v-if="store.data.move.kinematics.name === KinematicsName.cartesian" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_cartesian" target="_blank">
				<i class="bi-info-circle"></i>
				Cartesian configuration
			</a>
			<a v-else-if="isCoreKinematics" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_coreXY" target="_blank">
				<i class="bi-info-circle"></i>
				CoreXY configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.delta" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_linear_delta" target="_blank">
				<i class="bi-info-circle"></i>
				Linear Delta configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.rotaryDelta" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_rotary_delta" target="_blank">
				<i class="bi-info-circle"></i>
				Rotary Delta configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.scara" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_SCARA" target="_blank">
				<i class="bi-info-circle"></i>
				Serial SCARA configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.fiveBarScara" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_five_bar_parallel_scara" target="_blank">
				<i class="bi-info-circle"></i>
				Five Bar Parallel SCARA configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.hangprinter" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_Hangprinter" target="_blank">
				<i class="bi-info-circle"></i>
				Hangprinter configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.polar" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_Polar" target="_blank">
				<i class="bi-info-circle"></i>
				Polar configuration
			</a>
		</template>

		<div class="row">
			<div class="col-12">
				<select-input label="Kinematics type" title="Kinematics type to use"
				              :model-value="store.data.move.kinematics.name" @update:model-value="setKinematics($event)"
				              :options="KinematicsOptions" :preset="store.preset.move.kinematics.name" />
			</div>
		</div>
		<div v-if="isCoreKinematics">
			Core Kinematics
		</div>
		<div v-else-if="isDeltaKinematics">
			Delta Kinematics
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.scara">
			Serial SCARA
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.fiveBarScara">
			Five-Bar SCARA
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.hangprinter">
			Hangprinter
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.polar">
			Polar
		</div>
	</scroll-item>
</template>

<script setup lang="ts">
import { CoreKinematics, DeltaKinematics, KinematicsName } from "@duet3d/objectmodel";

import ScrollItem from "@/components/ScrollItem.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { computed } from "vue";

const store = useStore();

const KinematicsOptions: Record<string, Array<SelectOption>> = {
	"Core Kinematics": [
		{
			text: "Cartesian",
			value: KinematicsName.cartesian
		},
		{
			text: "CoreXY",
			value: KinematicsName.coreXY
		},
		{
			text: "CoreXZ",
			value: KinematicsName.coreXZ
		},
		{
			text: "CoreXYU",
			value: KinematicsName.coreXYU
		},
		{
			text: "CoreXYUV",
			value: KinematicsName.coreXYUV
		},
		{
			text: "MarkForged",
			value: KinematicsName.markForged
		}
	],
	"Delta Kinematics": [
		{
			text: "Linear Delta",
			value: KinematicsName.delta
		},
		{
			text: "Rotary Delta",
			value: KinematicsName.rotaryDelta
		}
	],
	"Other Kinematics": [
		{
			text: "Serial SCARA",
			value: KinematicsName.scara
		},
		{
			text: "Five Bar Parallel SCARA",
			value: KinematicsName.fiveBarScara
		},
		{
			text: "Hangprinter",
			value: KinematicsName.hangprinter
		},
		{
			text: "Polar",
			value: KinematicsName.polar,
		}
	]
};

function setKinematics(value: string) {
	store.data.update({ move: { kinematics: { name: value } } });
}

const isCoreKinematics = computed(() => store.data.move.kinematics instanceof CoreKinematics);
const isDeltaKinematics = computed(() => store.data.move.kinematics instanceof DeltaKinematics )
</script>
