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
			<table v-if="store.data.sensors.probes.length > 0" class="table table-striped table-probes mb-0">
				<thead>
					<tr>
						<th>
							Z-Probe
						</th>
						<th>
							Type
						</th>
						<th>
							Input Port
						</th>
						<th>
							Modulation Port
						</th>
						<th>
							Servo Port
						</th>
						<th>
							Dive Height (mm)
						</th>
						<th>
							Probe Speeds
						</th>
						<th>
							Travel Speed
						</th>
						<th>
							Recovery Time
						</th>
						<th>
							Heaters
						</th>
						<th>
							Max Taps
						</th>
						<th>
							Tolerance
						</th>
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(probe, index) in store.data.sensors.probes">
						<td>
							{{ index }}
						</td>
						<td>
							<select-input title="Probe type"
							              :model-value="getProbeType(probe)" @update:model-value="setProbeType(index, $event)"
							              :options="(index === 0) ? ProbeOptions : ExtraProbeOptions" :preset="getPresetProbeType(index)" />
						</td>
						<td>
							<port-input title="Input port for this Z-probe" :type="ConfigPortType.probeIn" :index="index" />
						</td>
						<td>
							<port-input title="Modulation port for this Z-probe" :type="ConfigPortType.probeMod" :index="index" />
						</td>
						<td>
							<port-input title="Servo port for this Z-probe" :type="ConfigPortType.servo" :index="index" />
						</td>
						<td>
							<button class="btn btn-sm btn-danger mt-1" @click="store.data.sensors.probes.splice(index, 1)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
			</table>
			<div v-else class="alert alert-info mb-0">
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
import { initObject, Probe, ProbeType } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import PortInput from "@/components/inputs/PortInput.vue";
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
