<template>
    <select-input label="Type" title="Type of this probe" :options="probeOptions" v-model="probeType"
                  :preset="props.probe" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { initObject, ProbeType, Probe } from '@duet3d/objectmodel';
import { ref, computed } from 'vue';

import SelectInput, { type SelectOption } from './SelectInput.vue';
import { useStore } from '@/store';
import { ConfigPortFunction } from '@/store/model/ConfigPort';

enum ProbePresetType {
	Switch = "switch",
	SmartProbe = "smartProbe",
	SmartEffector = "smartEffector"
}

interface ProbeTypeInputProps {
    /**
     * Probe to configure
     */
    probe: Probe | null;

    /**
     * Index of the probe to configure
     */
    index: number;

    /**
     * Preset type of the probe to configure
     */
    preset?: ProbeType | ProbePresetType;
}

const props = defineProps<ProbeTypeInputProps>();

const store = useStore();

const probePreset = ref<ProbePresetType | null>(null);

const probeOptions = computed(() => {
	const result: Record<string, Array<SelectOption>> = {
		"Presets": [
			{
				text: "Switch",
				value: ProbePresetType.Switch
			},
			{
				text: "Smart IR Probe",
				value: ProbePresetType.SmartProbe
			},
			{
				text: "Smart Effector",
				value: ProbePresetType.SmartEffector
			},
		],
		"Types": [
			{
				text: "None / Manual",
				value: ProbeType.none
			},
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
			},
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
	if (props.index < store.data.sensors.probes.length - 1 || store.data.sensors.probes[props.index] === null) {
		result["Generic"].push({
			text: "Not Present",
			value: null
		});
	}
	return result;
});

const probeType = computed<ProbeType | ProbePresetType | null>({
    get() {
        if (probePreset.value !== null) {
            return probePreset.value;
        }
        return (props.probe !== null) ? props.probe.type : null;
    },
    set(value) {
        // Apply preset if applicable
        if (typeof value === "string") {
            probePreset.value = value as ProbePresetType;
            switch (probePreset.value) {
                case ProbePresetType.Switch:
                    value = ProbeType.digital;
                    break;
                case ProbePresetType.SmartProbe:
                    value = ProbeType.analog;
                    break;
                case ProbePresetType.SmartEffector:
                    value = ProbeType.digital;
                    break;
                default:
                    const _exhaustiveCheck: never = probePreset.value;
                    value = ProbeType.digital;
                    break;
            }
        } else {
            probePreset.value = null;
        }

        // Update probe type
        if (value === null) {
            // Gaps may be set to null (e.g. when users configure probes #0 and #2 but not #1)
            store.data.sensors.probes[props.index] = null;
            for (const port of store.data.configTool.ports) {
                if ([ConfigPortFunction.probeIn, ConfigPortFunction.probeMod, ConfigPortFunction.probeServo].includes(port.function!) && port.index === props.index) {
                    // Reset probe ports
                    port.function = null;
                }
            }
        } else {
            const probe = store.data.sensors.probes[props.index];
            if (probe === null) {
                store.data.sensors.probes[props.index] = initObject(Probe, { type: value });
            } else {
                if ((![ProbeType.analog, ProbeType.dumbModulated, ProbeType.alternateAnalog].includes(probe.type) &&
                    [ProbeType.analog, ProbeType.dumbModulated, ProbeType.alternateAnalog].includes(value)) || (value === ProbeType.none)) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeIn && port.index === props.index) {
                            // Reset input port for manual config and when switching from digital to analog probes
                            port.function = null;
                        }
                    }
                }
                if (![ProbeType.dumbModulated, ProbeType.digital, ProbeType.unfilteredDigital].includes(value)) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeMod && port.index === props.index) {
                            // Reset modulation port for unmodulated probes
                            port.function = null;
                        }
                    }
                }
                if (value !== ProbeType.blTouch) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeServo && port.index === props.index) {
                            // Reset servo pin for BLTouch
                            port.function = null;
                        }
                    }
                }
                probe.type = value;
            }
        }
    }
});
</script>
