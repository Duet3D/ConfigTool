<template>
	<select-input :disabled="disabled" v-model="port" :options="ports" :preset="presetPort"
				  :required="props.required && port === null" class="select-input" v-bind="$attrs">
		<template #prepend v-if="port !== null">
			<button v-if="allowInversion" type="button" class="btn"
					:class="isInverted ? 'btn-primary' : 'btn-outline-secondary'" v-title="inversionTitle"
					@click="toggleInversion">
				<i class="bi bi-exclamation-lg"></i>
			</button>
			<button v-if="allowPullUp" type="button" class="btn" :class="pullUpClass" v-title="pullUpTitle"
					@click="togglePullUp">
				<i class="bi bi-arrow-bar-up"></i>
			</button>
		</template>
	</select-input>
</template>

<script setup lang="ts">
import { AnalogSensorType, DriverId, EndstopType, initObject, ProbeType } from "@duet3d/objectmodel";
import { computed } from "vue";

import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { PortType } from "@/store/BaseBoard";
import { ConfigPort, ConfigPortFunction, stripPort } from "@/store/model/ConfigPort";

interface PortInputProps {
	/**
	 * Optional board number for board filtering
	 */
	board?: number | null;

	/**
	 * Port function to set
	 */
	function: ConfigPortFunction,

	/**
	 * Corresponding index value of the port (e.g. Z-probe index)
	 */
	index: number,

	/**
	 * Disable this control (defaults to false)
	 */
	disabled?: boolean,

	/**
	 * Enable value checking (enabled by default)
	 */
	required?: boolean,
}

const props = withDefaults(defineProps<PortInputProps>(), {
	disabled: false,
	required: true
});

const store = useStore();

const realPort = computed<ConfigPort | null>(() => {
	for (const port of store.data.configTool.ports) {
		if (port.function === props.function && port.index === props.index) {
			return port;
		}
	}
	return null;
});

const port = computed<string | null>({
	get() {
		for (const port of store.data.configTool.ports) {
			if (port.function === props.function && (props.board === undefined || port.equalsBoard(props.board)) && port.index === props.index) {
				return stripPort(port.toString());
			}
		}
		return null;
	},
	set(value) {
		// Free previous selection
		for (const port of store.data.configTool.ports) {
			if (port.function === props.function && (props.board === undefined || port.equalsBoard(props.board)) && port.index === props.index) {
				port.function = null;
			}
		}
		
		// Assign new selection (if applicable)
		if (value !== null) {
			const configuredPort = store.data.configTool.assignPort(value, props.function, props.index);
			if (props.function === ConfigPortFunction.probeIn || props.function === ConfigPortFunction.probeMod) {
				for (const port of store.data.configTool.ports) {
					if ((port.function === ConfigPortFunction.probeIn || port.function === ConfigPortFunction.probeMod) &&
						(port.function !== props.function && port.index === port.index && port.canBoard !== configuredPort.canBoard)) {
						// Free up related ports if the CAN board is about to change. Don't worry about probe servos
						port.function = null;
					}
				}
			}
		}
	}
});

const allowInversion = computed(() => !disabled.value && (props.function !== ConfigPortFunction.thermistor));
const isInverted = computed(() => realPort.value?.inverted ?? false);
const inversionTitle = computed(() => `Change pin signal to ${isInverted.value ? "active high" : "active low"}.` + "<br><br>" + `The current setting is ${isInverted.value ? "active low" : "active high"}`);
function toggleInversion() {
	const port = realPort.value;
	if (port !== null) {
		port.inverted = !port.inverted;
	}
}

const allowPullUp = computed(() => {
	if (disabled.value) {
		return false;
	}

	switch (props.function) {
		case ConfigPortFunction.probeIn:
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				if (probe !== null && (probe.type === ProbeType.analog || probe.type === ProbeType.dumbModulated || probe.type === ProbeType.alternateAnalog)) {
					// Anlog inputs do not support pull-up configurations
					return false;
				}
			}
			break;
	}
	return true;
});

const hasInputPullUps = computed(() => {
	if (realPort.value !== null) {
		const boardDefinition = store.data.getBoardDefinition();
		return (boardDefinition !== null) && boardDefinition.hasInputPullUps;
	}
	return false;
});
const isPulledUp = computed(() => hasInputPullUps.value || (realPort.value?.pullUp ?? false));
const pullUpClass = computed(() => {
	if (hasInputPullUps.value) {
		return "btn-secondary";
	}
	return isPulledUp.value ? "btn-primary" : "btn-outline-secondary";
});
const pullUpTitle = computed(() => {
	let title = "Configure pull-up resistor" + "<br><br>";
	if (hasInputPullUps.value) {
		title += "This port has permanent pull-up resistors for input protection, so this setting is not available";
	} else {
		title += `Currently the configurable pull-up resistor is turned ${isPulledUp.value ? "on" : "off"}`;
	}
	return title;
});
function togglePullUp() {
	const port = realPort.value;
	if (port !== null) {
		// Don't allow pull-ups to be enabled if there are persistent pull-ups on this board
		port.pullUp = !port.pullUp && !hasInputPullUps.value;
	}
}

const presetPort = computed<string | null>(() => {
	for (const port of store.preset.configTool.ports) {
		if (port.function === props.function && (props.board === undefined || port.equalsBoard(props.board)) && port.index === props.index) {
			return port.toString();
		}
	}
	return null;
});

const ports = computed(() => {
	const result: Record<string, Array<SelectOption>> = {};
	
	// Define what capabilities the ports to show must have
	const requiredCapabilities = new Set<PortType>();
	switch (props.function) {
		case ConfigPortFunction.probeIn:
			requiredCapabilities.add(PortType.analogIn);
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				if (probe !== null && (probe.type === ProbeType.digital || probe.type === ProbeType.unfilteredDigital || probe.type === ProbeType.blTouch)) {
					requiredCapabilities.add(PortType.gpIn);
				}
			}
			break;
		case ConfigPortFunction.probeMod:
			requiredCapabilities.add(PortType.gpOut);
			break;
		case ConfigPortFunction.probeServo:
			requiredCapabilities.add(PortType.pwm);
			break;
		case ConfigPortFunction.endstop:
			requiredCapabilities.add(PortType.gpIn);
			break;
		case ConfigPortFunction.spindlePwm:
			requiredCapabilities.add(PortType.pwm);
			break;
		case ConfigPortFunction.spindleForwards:
		case ConfigPortFunction.spindleBackwards:
			requiredCapabilities.add(PortType.gpOut);
			break;

/*
		default:
			const _exhaustiveCheck: never = props.type;
			break;
			*/
	}

	// Filter ports according to their capabilities
	for (const port of store.data.configTool.ports) {
		if (props.board !== undefined && !port.equalsBoard(props.board)) {
			continue;
		}

		for (const requiredCapability of requiredCapabilities) {
			if (port.capabilities.has(requiredCapability)) {
				const groupLabel = !port.canBoard ? "Main Board" : `CAN Board ${port.canBoard}`, portLabel = stripPort(port.toString());
				if (!result[groupLabel]) {
					result[groupLabel] = [
						{
							text: portLabel,
							value: portLabel
						}
					];
				} else {
					result[groupLabel].push(
						{
							text: portLabel,
							value: portLabel
						}
					);
				}
				break;
			}
		}
	}

	if (!props.required) {
		result["Other"] = [
			{
				text: "None",
				value: null
			}
		]
	}

	return result;
});

const disabled = computed(() => {
	if (props.disabled) {
		// Inherited disabled value overrides this logic
		return true;
	}

	switch (props.function) {
		case ConfigPortFunction.probeIn:
			// Only enabled if a valid probe type is set
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				return (probe === null || probe.type === ProbeType.none);
			}
			break;
		case ConfigPortFunction.probeMod:
			// Only enabled for modulated probes and smart effectors
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				return (probe === null || ![ProbeType.dumbModulated, ProbeType.alternateAnalog, ProbeType.digital, ProbeType.unfilteredDigital].includes(probe.type));
			}
			break;
		case ConfigPortFunction.probeServo:
			// Only enabled for BLTouch
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				return (probe === null || probe.type !== ProbeType.blTouch);
			}
			break;
		case ConfigPortFunction.endstop:
			// Endstop selection is only possible if the corresponding driver is set to EndstopType.InputPin
			if (props.board !== undefined) {
				const expectedDriver = initObject(DriverId, { board: props.board, driver: props.index });
				const axisIndex = store.data.move.axes.findIndex(axis => axis.drivers.some(axisDriver => axisDriver.equals(expectedDriver)));
				if (axisIndex >= 0 && axisIndex < store.data.sensors.endstops.length && store.data.sensors.endstops[axisIndex] !== null) {
					return store.data.sensors.endstops[axisIndex]!.type !== EndstopType.InputPin;
				}
			}
			return true;
		case ConfigPortFunction.thermistor:
			// Input port selection is only available for thermistors
			if (props.index < store.data.sensors.analog.length && store.data.sensors.analog[props.index] !== null) {
				return [AnalogSensorType.linearAnalog, AnalogSensorType.pt1000, AnalogSensorType.thermistor].includes(store.data.sensors.analog[props.index]!.type);
			}
			break;

/*
		default:
			const _exhaustiveCheck: never = props.type;
			break;

			*/
	}
	return false;
});
</script>
