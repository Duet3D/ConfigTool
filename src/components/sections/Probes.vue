<template>
	<config-section :type="ConfigSectionType.Probes" url-title="Connecting a Z probe"
					url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Z_probe_connecting">
		<template #title>
			{{ store.data.configTool.capabilities.cnc ? "Probes" : "Z-Probes" }}
		</template>
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddProbe" @click.prevent="addProbe">
				<i class="bi-plus-circle"></i>
				Add Probe
			</button>
		</template>
		<template #body>
			<div class="card m-2" v-for="(probe, index) in store.data.sensors.probes">
				<div class="card-header d-flex justify-content-between align-items-center">
					Probe #{{ index }}

					<button class="btn btn-sm btn-danger" @click.prevent="store.data.sensors.probes.splice(index, 1)">
						<i class="bi-trash"></i>
					</button>
				</div>
				<div class="card-body">
					<div class="row g-3">
						<div class="col-3">
							<probe-type-input :probe="probe" :index="index" :preset="getPresetProbeValue(index, 'type')" />
						</div>
						<template v-if="probe !== null">
							<div class="col-3">
								<port-input label="Input Port" title="Input port for this probe"
											:function="ConfigPortFunction.probeIn" :index="index" />
							</div>
							<div class="col-3">
								<port-input label="Modulation Port" title="Modulation port for this probe"
											:function="ConfigPortFunction.probeMod" :index="index" />
							</div>
							<div class="col-3">
								<port-input label="Servo Port" title="Servo port for this probe (BLTouch only)"
											:function="ConfigPortFunction.probeServo" :index="index" />
							</div>
							<div class="col-2">
								<number-input label="Dive Height" title="Dive height of the probe" unit="mm" :min="-10000"
											  :max="10000" :step="0.01" v-model="probe.diveHeight"
											  :preset="getPresetProbeValue(index, 'diveHeight')" />
							</div>
							<div class="col-2">
								<number-input label="Trigger Height" title="Z trigger height of the probe" unit="mm"
											  :min="-10000" :max="10000" :step="0.01" v-model="probe.triggerHeight"
											  :preset="getPresetProbeValue(index, 'triggerHeight')" />
							</div>
							<div class="col-2">
								<number-input label="Travel Speed" title="Defines how quickly to move between probe points"
											  unit="mm/s" :min="0.1" :step="1" :factor="1 / 60" v-model="probe.travelSpeed"
											  :preset="getPresetProbeValue(index, 'travelSpeed')" />
							</div>
							<div class="col-4">
								<homing-speeds-input :probe-speeds="true" :speeds="probe.speeds"
													 :preset="getPresetProbeValue(index, 'speeds')" />
							</div>
							<div class="col-2">
								<number-input label="Recovery Time"
											  title="Optional probe recovery time before the probing move is started"
											  unit="s" :min="0" :step="0.1" v-model="probe.recoveryTime" />
							</div>
							<div class="col-2">
								<number-input label="X Offset" title="Offset of this probe in X direction" unit="mm"
											  :preset="getPresetProbeValue(index, 'offsets', 0)"
											  :model-value="probe.offsets[0]"
											  @update:model-value="probe.offsets[0] = $event" />
							</div>
							<div class="col-2">
								<number-input label="Y Offset" title="Offset of this probe in Y direction" unit="mm"
											  :preset="getPresetProbeValue(index, 'offsets', 1)"
											  :model-value="probe.offsets[1]"
											  @update:model-value="probe.offsets[1] = $event" />
							</div>
							<div class="col-2">
								<number-input label="Max Taps"
											  title="Maximum number of probe attempts to attempt to reach the specified tolerance. A value of 1 disables this feature"
											  :min="1" :step="1" v-model="probe.maxProbeCount" />
							</div>
							<div class="col-2">
								<number-input label="Tap Tolerance" title="Maximum allowed tolerance between probe attempts"
											  :disabled="probe.maxProbeCount <= 1" unit="mm" :min="0" :step="0.001"
											  v-model="probe.tolerance" />
							</div>
							<div class="col-4 d-flex flex-column justify-content-end">
								<check-input label="Turn off all heaters when probing"
											 title="Turn off all heaters when probing to avoid potential interference"
											 v-model="probe.disablesHeaters" />
								<check-input label="Deploy/retract probe"
											 title="Run deployprobe/retractprobe macros when using this probe"
											 :disabled="probe.type === ProbeType.blTouch"
											 :model-value="probeUsesDeployRetract(index)"
											 @update:model-value="setProbeDeployRetract(index, $event)" />
							</div>
						</template>
					</div>
				</div>
			</div>

			<div v-if="store.data.sensors.probes.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Probes
			</div>
		</template>
	</config-section>
</template>

<script setup lang="ts">
import { Probe, ProbeType } from "@duet3d/objectmodel";
import { computed } from "vue";

import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import HomingSpeedsInput from "@/components/inputs/HomingSpeedsInput.vue";
import ProbeTypeInput from "@/components/inputs/ProbeTypeInput.vue";
import ConfigSection from "@/components/ConfigSection.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigSectionType } from "@/store/sections";

const store = useStore();

const canAddProbe = computed(() => (store.data.limits.zProbes === null) || (store.data.sensors.probes.length < store.data.limits.zProbes));

function addProbe() {
	const probe = new Probe();
	if (store.data.sensors.probes.length < store.preset.sensors.probes.length) {
		probe.update(store.preset.sensors.probes[store.data.sensors.probes.length]);
	}
	store.data.sensors.probes.push(probe);
}

function getPresetProbeValue<K extends keyof Probe>(index: number, key: K, subIndex?: number) {
	if (index < store.preset.sensors.probes.length && store.preset.sensors.probes[index] !== null) {
		if (subIndex !== undefined) {
			return (store.preset.sensors.probes[index]![key] as Array<any>)[subIndex];
		}
		return store.preset.sensors.probes[index]![key];
	}
	return undefined;
}

function probeUsesDeployRetract(index: number) {
	return store.data.sensors.probes[index]!.type === ProbeType.blTouch || store.data.configTool.deployRetractProbes.has(index);
}

function setProbeDeployRetract(index: number, value: boolean) {
	if (value) {
		store.data.configTool.deployRetractProbes.add(index);
	} else {
		store.data.configTool.deployRetractProbes.delete(index);
	}
}
</script>
