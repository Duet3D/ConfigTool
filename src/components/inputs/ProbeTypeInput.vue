<template>
    <select-input label="Type" title="Type of this probe" :options="probeOptions" v-model="probeType"
                  :preset="props.probe" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { initObject, ProbeType, Probe } from '@duet3d/objectmodel';
import { ref, computed, watch } from 'vue';

import SelectInput, { type SelectOption } from './SelectInput.vue';
import { useStore } from '@/store';
import { ConfigPortFunction } from '@/store/model/ConfigPort';

enum ProbePresetType {
	Switch = "switch",
	SmartProbe = "smartProbe",
	SmartEffector = "smartEffector",
	InductiveNO = "inductiveNO",
	InductiveNC = "inductiveNC"
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

function applyInductivePresetToPort(preset: ProbePresetType.InductiveNO | ProbePresetType.InductiveNC): boolean {
    const port = store.data.configTool.ports.find(p =>
        p.function === ConfigPortFunction.probeIn && p.index === props.index
    );
    if (!port) {
        return false;
    }
    port.inverted = (preset === ProbePresetType.InductiveNO);
    const boardDef = store.data.getBoardDefinition(port.canBoard);
    if (boardDef && !boardDef.hasInputPullUps) {
        // Duet 2 inputs need ^ explicitly; Duet 3 IO_x.in pins have permanent pull-ups
        port.pullUp = true;
    }
    return true;
}

function scheduleInductivePortApply(preset: ProbePresetType.InductiveNO | ProbePresetType.InductiveNC): void {
    if (applyInductivePresetToPort(preset)) {
        return;
    }
    watch(
        () => store.data.configTool.ports.find(p => p.function === ConfigPortFunction.probeIn && p.index === props.index),
        (port) => {
            if (port && probePreset.value === preset) {
                applyInductivePresetToPort(preset);
            }
        },
        { once: true }
    );
}

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
			{
				text: "Inductive probe (NPN, NO)",
				value: ProbePresetType.InductiveNO
			},
			{
				text: "Inductive probe (NPN, NC)",
				value: ProbePresetType.InductiveNC
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
            },
            // TODO StallGuard
            {
                text: "Scanning probe",
                value: ProbeType.scanningAnalog
            }
		]
	}
    if (props.index < store.data.sensors.probes.length - 1 || store.data.sensors.probes[props.index] === null) {
        result["Generic"] = [{
			text: "Not Present",
			value: null
		}];
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
        // Apply preset if applicable. Duet 2 needs probe type digital, Duet 3 + expansion only supports unfilteredDigital
        if (typeof value === "string") {
            probePreset.value = value as ProbePresetType;
            switch (probePreset.value) {
                case ProbePresetType.Switch:
                    value = store.data.boards.some(board => board.canAddress === null) ? ProbeType.digital : ProbeType.unfilteredDigital;
                    break;
                case ProbePresetType.SmartProbe:
                    value = ProbeType.analog;
                    break;
                case ProbePresetType.SmartEffector:
                    value = store.data.boards.some(board => board.canAddress === null) ? ProbeType.digital : ProbeType.unfilteredDigital;
                    break;
                case ProbePresetType.InductiveNO:
                case ProbePresetType.InductiveNC:
                    value = store.data.boards.some(board => board.canAddress === null) ? ProbeType.digital : ProbeType.unfilteredDigital;
                    break;
                default:
                    const _exhaustiveCheck: never = probePreset.value;
                    value = store.data.boards.some(board => board.canAddress === null) ? ProbeType.digital : ProbeType.unfilteredDigital;
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
                store.data.sensors.probes[props.index] = initObject(Probe, {
                    type: value,
                    speeds: (value === ProbeType.scanningAnalog) ? [0, 0, 0] : [0, 0]
                });
            } else {
                if ((
                        ![ProbeType.analog, ProbeType.dumbModulated, ProbeType.alternateAnalog].includes(probe.type) &&
                         [ProbeType.analog, ProbeType.dumbModulated, ProbeType.alternateAnalog].includes(value)
                    ) || [ProbeType.none, ProbeType.scanningAnalog].includes(value)) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeIn && port.index === props.index) {
                            // Reset input port for manual/scanning config and when switching from digital to analog probes
                            port.function = null;
                        }
                    }
                }
                if ( [ProbeType.unfilteredDigital, ProbeType.blTouch].includes(probe.type) &&
                    ![ProbeType.unfilteredDigital, ProbeType.blTouch].includes(value)) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeIn && port.index === props.index && !port.equalsBoard(0)) {
                            // Reset remote input port unless the new selection includes types 8 and 9
                            port.function = null;
                        }
                    }
                }
                if ( [ProbeType.dumbModulated, ProbeType.digital, ProbeType.unfilteredDigital].includes(probe.type) &&
                    ![ProbeType.dumbModulated, ProbeType.digital, ProbeType.unfilteredDigital].includes(value)) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeMod && port.index === props.index) {
                            // Reset modulation port for unmodulated probes
                            port.function = null;
                        }
                    }
                }
                if (probe.type === ProbeType.blTouch && value !== ProbeType.blTouch) {
                    for (const port of store.data.configTool.ports) {
                        if (port.function === ConfigPortFunction.probeServo && port.index === props.index) {
                            // Reset servo pin for BLTouch
                            port.function = null;
                        }
                    }
                }

                if (value === ProbeType.scanningAnalog) {
                    if (probe.speeds.length === 2) {
                        // Add a speed value first
                        probe.speeds.push(2);
                    }
                } else if (probe.type === ProbeType.scanningAnalog && probe.speeds.length === 3) {
                    // Remove last speed value
                    probe.speeds.splice(2, 1);
                }
                probe.type = value;
            }

            if (probePreset.value === ProbePresetType.InductiveNO || probePreset.value === ProbePresetType.InductiveNC) {
                scheduleInductivePortApply(probePreset.value);
            }
        }
    }
});
</script>
