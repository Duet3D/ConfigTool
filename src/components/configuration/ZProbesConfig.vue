<style scoped>
.table-probes tr > th:first-child {
	text-align: center;
}
.table-probes tr > td:first-child {
	text-align: center;
	vertical-align: middle;
}
</style>

<template>
	<scroll-item anchor="ZProbes">
		<template #title>
			Z-Probes
			<button class="btn btn-sm btn-primary" :disabled="!canAddProbe" @click="addProbe">
				<i class="bi-plus-circle"></i>
				Add Z-Probe
			</button>
		</template>
		<template #body>
			<div class="card m-2" v-for="(probe, index) in store.data.sensors.probes">
				<div class="card-header d-flex justify-content-between">
					Probe #{{ index }}
					<button class="btn btn-sm btn-danger" @click="store.data.sensors.probes.splice(index, 1)">
						<i class="bi-trash"></i>
					</button>
				</div>
				<div class="card-body">
					<form class="row g-3">
						<div class="col-3">
							<select-input label="Type" title="Type of this Z-Probe" :options="getProbeOptions(index)"
										  :model-value="getProbeType(probe)"
										  @update:model-value="setProbeType(index, $event)"
										  :preset="getPresetProbeType(index)" />
						</div>
						<template v-if="probe !== null">
							<div class="col-3">
								<port-input label="Input Port" title="Input port for this Z-probe"
											:function="ConfigPortFunction.probeIn" :index="index" />
							</div>
							<div class="col-3">
								<port-input label="Modulation Port" title="Modulation port for this Z-probe"
											:function="ConfigPortFunction.probeMod" :index="index" />
							</div>
							<div class="col-3">
								<port-input label="Servo Port" title="Servo port for this Z-probe (BLTouch only)"
											:function="ConfigPortFunction.probeServo" :index="index" />
							</div>
							<div class="col-2">
								<number-input label="Dive Height" title="Dive height of the probe" unit="mm"
											  :min="-10000" :max="10000" :step="0.01" v-model="probe.diveHeight" />
							</div>
							<div class="col-2">
								<number-input label="Travel Speed"
											  title="Defines how quickly to move between probe points" unit="mm/s"
											  :min="0.1" :step="1" v-model="probe.travelSpeed" />
							</div>
							<div class="col-4">
								<homing-speeds-input :probe-speeds="true" :speeds="probe.speeds" />
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
						</template>
					</form>
				</div>
			</div>

			<div v-if="store.data.sensors.probes.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Z-Probes defined
			</div>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { initObject, Probe, ProbeType } from "@duet3d/objectmodel";
import { computed } from "vue";

import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import HomingSpeedsInput from "@/components/inputs/HomingSpeedsInput.vue";
import ScrollItem from "@/components/ScrollItem.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

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

function getProbeOptions(index: number) {
	const result: Record<string, Array<SelectOption>> = {
		"Generic": [
			{
				text: "None / Manual",
				value: ProbeType.none
			}
		],
		"Analog probes": [
			{
				text: "Analog probe",
				value: ProbeType.analog
			},
			{
				text: "Analog probe with modulation",
				value: ProbeType.dumbModulated
			},
			{
				text: "Alternate analog probe",
				value: ProbeType.alternateAnalog
			}
		],
		"Digital probes": [
			{
				text: "Digital probe",
				value: ProbeType.digital
			},
			{
				text: "Digital probe, unfiltered",
				value: ProbeType.unfilteredDigital
			},
			{
				text: "BLTouch",
				value: ProbeType.blTouch
			}
		]
	}
	if (index < store.data.sensors.probes.length - 1 || store.data.sensors.probes[index] === null) {
		result["Generic"].push({
			text: "Not Present",
			value: null
		});
	}
	return result;
}

function getProbeType(probe: Probe | null): ProbeType {
	return (probe !== null) ? probe.type : ProbeType.none;
}

function setProbeType(index: number, type: ProbeType | null): void {
	if (type === null) {
		// Gaps may be set to null (e.g. when users configure probes #0 and #2 but not #1)
		store.data.sensors.probes[index] = null;
		for (const port of store.data.configTool.ports) {
			if ([ConfigPortFunction.probeIn, ConfigPortFunction.probeMod, ConfigPortFunction.probeServo].includes(port.function!) && port.index === index) {
				// Reset probe ports
				port.function = null;
			}
		}
	} else {
		const probe = store.data.sensors.probes[index];
		if (probe === null) {
			store.data.sensors.probes[index] = initObject(Probe, { type });
		} else {
			if ((![ProbeType.analog, ProbeType.dumbModulated, ProbeType.alternateAnalog].includes(probe.type) &&
				  [ProbeType.analog, ProbeType.dumbModulated, ProbeType.alternateAnalog].includes(type)) || (type === ProbeType.none)) {
				for (const port of store.data.configTool.ports) {
					if (port.function === ConfigPortFunction.probeIn && port.index === index) {
						// Reset input port for manual config and when switching from digital to analog probes
						port.function = null;
					}
				}
			}
			if (![ProbeType.dumbModulated, ProbeType.digital, ProbeType.unfilteredDigital].includes(type)) {
				for (const port of store.data.configTool.ports) {
					if (port.function === ConfigPortFunction.probeMod && port.index === index) {
						// Reset modulation port for unmodulated probes
						port.function = null;
					}
				}
			}
			if (type !== ProbeType.blTouch) {
				for (const port of store.data.configTool.ports) {
					if (port.function === ConfigPortFunction.probeServo && port.index === index) {
						// Reset servo pin for BLTouch
						port.function = null;
					}
				}
			}
			probe.type = type;
		}
	}
}

function getPresetProbeType(index: number): ProbeType | null {
	return (index < store.preset.sensors.probes.length && store.preset.sensors.probes[index] !== null) ? store.preset.sensors.probes[index]!.type : null;
}
</script>
