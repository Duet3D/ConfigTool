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
						<div class="col-4">
							<select-input label="Type" title="Type of this Z-Probe"
							              :options="ProbeOptions"
							              :model-value="getProbeType(probe)" :preset="getPresetProbeType(index)" />
						</div>
						<template v-if="probe !== null">
							<div class="col-3">
								<port-input label="Input Port" title="Input port for this Z-probe" :type="ConfigPortType.probeIn" :index="index" />
							</div>
							<div class="col-3">
								<port-input label="Modulation Port" title="Modulation port for this Z-probe" :type="ConfigPortType.probeMod" :index="index" />
							</div>
							<div class="col-2">
								<port-input label="Servo Port" title="Servo port for this Z-probe" :type="ConfigPortType.servo" :index="index" />
							</div>
							<div class="col-2">
								<number-input label="Dive Height" title="Dive height of the probe"
								              unit="mm"
								              v-model="probe.diveHeight" />
							</div>
							Probe Speeds
							Travel Speed
							Recovery Time
							Heaters
							Max Taps
							Tolerance
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

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import { ProbeType } from "@duet3d/objectmodel";

const ProbeOptions: Record<string, Array<SelectOption>> = {
	"Generic": [
		{
			text: "Not Present",
			value: null
		},
		{
			text: "None / Manual",
			value: ProbeType.none
		}
	],
	"Analogue probes": [
		{
			text: "Analogue probe",
			value: ProbeType.analog
		},
		{
			text: "Analogue probe with modulation",
			value: ProbeType.dumbModulated
		},
		{
			text: "Alternate analogue probe",
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

const ExtraProbeOptions: Array<SelectOption> = [
	{
		text: "Not Present",
		value: null
	},
	{
		text: "None / Manual",
		value: ProbeType.none
	},
	{
		text: "BLTouch",
		value: ProbeType.blTouch
	}
]
</script>

<script setup lang="ts">
import { initObject, Probe } from "@duet3d/objectmodel";
import { computed } from "vue";

import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import ScrollItem from "@/components/ScrollItem.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { ConfigPortType } from "@/store/model/ConfigPort";

const store = useStore();

const canAddProbe = computed(() => (store.data.limits.zProbes === null) || (store.data.sensors.probes.length < store.data.limits.zProbes));

function addProbe() {
	const probe = new Probe();
	if (store.data.sensors.probes.length < store.preset.sensors.probes.length) {
		probe.update(store.preset.sensors.probes[store.data.sensors.probes.length]);
	}
	store.data.sensors.probes.push(probe);
}

function getProbeType(probe: Probe | null): ProbeType {
	return (probe !== null) ? probe.type : ProbeType.none;
}

function setProbeType(index: number, type: ProbeType): void {
	if (type === ProbeType.none && index > 0 && index < store.data.sensors.probes.length - 1) {
		// Gaps may be set to null (e.g. when users configure probes #0 and #2 but not #1)
		store.data.sensors.probes[index] = null;
	} else {
		const probe = store.data.sensors.probes[index];
		if (probe === null) {
			store.data.sensors.probes[index] = initObject(Probe, { type });
		} else {
			probe.type = type;
		}
	}
}

function getPresetProbeType(index: number): ProbeType | null {
	return (index < store.preset.sensors.probes.length && store.preset.sensors.probes[index] !== null) ? store.preset.sensors.probes[index]!.type : null;
}
</script>
