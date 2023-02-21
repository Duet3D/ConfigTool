<template>
	<scroll-item id="probes" :preview-templates="previewTemplates" :preview-options="previewOptions"
				 url-title="Connecting a Z probe" url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Z_probe_connecting">
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
							<probe-type-input :probe="probe" :index="index"
											  :preset="getPresetProbeValue(index, 'type')" />
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
								<number-input label="Dive Height" title="Dive height of the probe" unit="mm"
											  :min="-10000" :max="10000" :step="0.01" v-model="probe.diveHeight"
											  :preset="getPresetProbeValue(index, 'diveHeight')" />
							</div>
							<div class="col-2">
								<number-input label="Travel Speed"
											  title="Defines how quickly to move between probe points" unit="mm/s"
											  :min="0.1" :step="1" v-model="probe.travelSpeed"
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
								<number-input label="Max Taps"
											  title="Maximum number of probe attempts to attempt to reach the specified tolerance. A value of -1 disables this feature"
											  :min="-1" :step="1" v-model="probe.maxProbeCount" />
							</div>
							<div v-if="probe.maxProbeCount > -1" class="col-2">
								<number-input label="Tap Tolerance"
											  title="Maximum allowed tolerance between probe attempts" unit="mm"
											  :min="0" :step="0.001" v-model="probe.tolerance" />
							</div>
							<div class="col-4 d-flex align-items-end">
								<check-input label="Turn off all heaters when probing"
											 title="Turn off all heaters when probing to avoid potential interference"
											 v-model="probe.disablesHeaters" />
							</div>
							<div class="col-4 d-flex align-items-end">
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
				No Probes defined
			</div>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { Probe, ProbeType } from "@duet3d/objectmodel";
import { computed } from "vue";

import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import HomingSpeedsInput from "@/components/inputs/HomingSpeedsInput.vue";
import ProbeTypeInput from "@/components/inputs/ProbeTypeInput.vue";
import ScrollItem from "@/components/ScrollItem.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

const store = useStore();

const canAddProbe = computed(() => (store.data.limits.zProbes === null) || (store.data.sensors.probes.length < store.data.limits.zProbes));

function addProbe() {
	const probe = new Probe();
	if (store.data.sensors.probes.length < store.preset.sensors.probes.length) {
		probe.update(store.preset.sensors.probes[store.data.sensors.probes.length]);
	}
	store.data.sensors.probes.push(probe);
}

function getPresetProbeValue<K extends keyof Probe>(index: number, key: K) {
	return (index < store.preset.sensors.probes.length && store.preset.sensors.probes[index] !== null) ? store.preset.sensors.probes[index]![key] : undefined;
}

const previewTemplates = computed(() => {
	const templates = ["config/probes"]
	for (let i = 0; i < store.data.sensors.probes.length; i++) {
		const probe = store.data.sensors.probes[i];
		if ((probe !== null) && (store.data.configTool.deployRetractProbes.has(i) || probe.type === ProbeType.blTouch)) {
			if (store.data.sensors.probes.length === 1) {
				templates.push("deployprobe");
				templates.push("retractprobe");
			} else {
				templates.push(`deployprobe${i}`);
				templates.push(`retractprobe${i}`);
			}
		}
	}
	return templates;
});

const previewOptions = computed(() => {
	const options: Array<Record<string, any> | null> = [null];
	for (let i = 0; i < store.data.sensors.probes.length; i++) {
		const probe = store.data.sensors.probes[i];
		if ((probe !== null) && (store.data.configTool.deployRetractProbes.has(i) || probe.type === ProbeType.blTouch)) {
			for (let k = 0; k < 2; k++) {
				// add it twice, once for deployprobe.g and once again for retractprobe.g
				options.push({
					probe,
					probeIndex: store.data.sensors.probes.findIndex(item => item !== null)
				});
			}
		}
	}
	return options;
});

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
