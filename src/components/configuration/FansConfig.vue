<template>
	<scroll-item anchor="Fans">
		<template #title>
			Fans
			<button class="btn btn-sm btn-primary" :disabled="!canAddFan" @click="addFan">
				<i class="bi-plus-circle"></i>
				Add Fan
			</button>
		</template>
		<template #body>
			<div class="card m-2" v-for="(fan, index) in store.data.fans">
				<template v-if="fan !== null">
					<div class="card-header d-flex justify-content-between align-items-center">
						Fan #{{ index }}
						<button class="btn btn-sm btn-danger" @click="store.data.fans.splice(index, 1)">
							<i class="bi-trash"></i>
						</button>
					</div>
					<div class="card-body">
						<div class="row g-3">
							<div class="col-2">
								<text-input label="Name" title="Optional name of this fan" v-model="fan.name"
											:max-length="20" :required="false"
											:preset="getPresetFanValue(index, 'name')" :placeholder="`Fan ${index}`" />
							</div>
							<div class="col-2">
								<port-input label="PWM Port" title="PWM output port for this fan"
											:function="ConfigPortFunction.fan" :index="index" />
							</div>
							<div class="col-2">
								<port-input label="Tacho Port"
											title="Optional fan tach port for this fan (e.g. from 4-pin PWM fans)"
											:function="ConfigPortFunction.fanTacho" :index="index" />
							</div>
							<div class="col-2">
								<number-input label="Minimum Speed" title="Minimum fan speed" unit="%" :factor="100"
											  :min="0" :max="fan.max * 100" :step="0.1" v-model="fan.min"
											  :preset="getPresetFanValue(index, 'min')" />
							</div>
							<div class="col-2">
								<number-input label="Maximum Speed" title="Maximum fan speed" unit="%" :factor="100"
											  :min="fan.min * 100" :max="100" :step="0.1" v-model="fan.max"
											  :preset="getPresetFanValue(index, 'max')" />
							</div>
							<div class="col-2">
								<number-input label="Default Speed" title="Initial fan speed on start-up" :factor="100"
											  unit="%" :min="0" :max="100" :step="0.1" v-model="fan.requestedValue"
											  :preset="getPresetFanValue(index, 'requestedValue')" />
							</div>
							<div class="col-2">
								<number-input label="Blip Time"
											  title="Fan will be run at full PWM for this number of seconds when started from standstill"
											  unit="s" :min="0" :step="0.1" v-model="fan.blip"
											  :preset="getPresetFanValue(index, 'blip')" />
							</div>
							<div class="col-2">
								TODO sensor selection
							</div>
							<div class="col-3">
								TODO Trigger Temeprature (control range)
							</div>
						</div>
					</div>
				</template>
			</div>

			<div v-if="store.data.fans.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Fans defined
			</div>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { Fan } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

const store = useStore();

// Fan management
const canAddFan = computed(() => store.data.fans.length < store.data.limits.fans!);
function addFan() {
	const fan = new Fan();
	if (store.preset.fans.length > store.data.fans.length) {
		fan.update(store.preset.fans[store.data.fans.length])
	} else if (store.preset.fans.length > 0) {
		fan.update(store.preset.fans[0]);
	}
	store.data.fans.push(fan);
}

// Fans
function getPresetFanValue<K extends keyof Fan>(index: number, key: K) {
	if (index < store.preset.fans.length) {
		const presetFan = store.preset.fans[index];
		if (presetFan !== null) {
			return presetFan[key];
		}
	}
	return null;
}
</script>
