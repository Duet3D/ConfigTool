<template>
	<select-input :disabled="disabled" v-model="port" :options="ports" :preset="presetPort"
				  :required="required && port === null" class="select-input">
		<template #prepend v-if="port !== null">
			<button v-if="allowInversion" type="button" class="btn"
					:class="isInverted ? 'btn-primary' : 'btn-outline-secondary'" v-title="getInversionTitle"
					@click.prevent="toggleInversion">
				<i class="bi bi-exclamation-lg"></i>
			</button>
			<button v-if="allowPullUp" type="button" class="btn" :class="pullUpClass" v-title="getPullUpTitle"
					@click.prevent="togglePullUp">
				<i class="bi bi-arrow-bar-up"></i>
			</button>
			<template v-if="isPwm">
				<button ref="pwmButton" type="button" class="btn" :class="pwmClass"
						:disabled="props.secondaryIndex !== null" data-bs-toggle="dropdown"
						@click.prevent="togglePwmDropdown">
					<i class="bi bi-activity"></i>
				</button>
				<div class="dropdown-menu p-3" style="max-width: 320px;" @click.stop="">
					<form ref="pwmForm" @submit.prevent="applyPwm">
						<number-input label="Output PWM Frequency" title="Output frequency of this port" unit="Hz"
									  :min="0" :max="65535" :step="1" v-model="pwmFrequency" :preset="defaultPwm" />

						<div class="d-inline-block text-nowrap mt-3">
							<button type="submit" class="btn btn-success me-1">
								<i class="bi bi-check-circle"></i>
								Apply
							</button>
							<button type="button" class="btn btn-secondary" :disabled="pwmFrequency === defaultPwm"
									@click.prevent="resetPwm">
								<i class="bi bi-arrow-counterclockwise"></i>
								Reset
							</button>
						</div>
					</form>
				</div>
			</template>
		</template>
		<template #append>
			<slot name="append" />
		</template>
	</select-input>
</template>

<script setup lang="ts">
import { AnalogSensorType, EndstopType, ProbeType } from "@duet3d/objectmodel";
import { computed, ref, watch } from "vue";

import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { PortType } from "@/store/BaseBoard";
import { ConfigPort, ConfigPortFunction, stripPort } from "@/store/model/ConfigPort";
import { Dropdown } from "bootstrap";
import { closeAllTooltips } from "@/directives/VPreset";

interface PortInputProps {
	/**
	 * Optional board number for board filtering
	 */
	board?: number | null,

	/**
	 * Port function to set
	 */
	function: ConfigPortFunction,

	/**
	 * Corresponding index value of the port (e.g. probe index)
	 */
	index: number,

	/**
	 * Secondary index of the port (e.g. second port of the corresponding heater)
	 */
	secondaryIndex?: number | null,

	/**
	 * Disable this control (defaults to false)
	 */
	disabled?: boolean,

	/**
	 * Enable value checking (enabled by default)
	 */
	required?: boolean | null,
}

const props = withDefaults(defineProps<PortInputProps>(), {
	disabled: false,
	secondaryIndex: null,
	required: null
});

const emit = defineEmits<{
	(e: "portSet", value: string | null): void
}>();

const store = useStore();

// Invert button
const allowInversion = computed(() => !disabled.value && (![ConfigPortFunction.accelerometerInt, ConfigPortFunction.accelerometerSpiCs, ConfigPortFunction.ledStrip, ConfigPortFunction.thermistor, ConfigPortFunction.sensorSpiCs].includes(props.function)));
const isInverted = computed(() => realPort.value?.inverted ?? false);
function getInversionTitle() {
	return `Change pin signal to ${isInverted.value ? "active high" : "active low"}.` + "<br><br>" + `The current setting is ${isInverted.value ? "active low" : "active high"}`;
}
function toggleInversion() {
	const port = realPort.value;
	if (port !== null) {
		port.inverted = !port.inverted;
	}
	closeAllTooltips();
}

// Pull-up button
const allowPullUp = computed(() => {
	if (disabled.value) {
		return false;
	}

	switch (props.function) {
		case ConfigPortFunction.accelerometerInt:
		case ConfigPortFunction.accelerometerSpiCs:
		case ConfigPortFunction.fan:
		case ConfigPortFunction.gpOut:
		case ConfigPortFunction.heater:
		case ConfigPortFunction.laser:
		case ConfigPortFunction.ledStrip:
		case ConfigPortFunction.probeMod:
		case ConfigPortFunction.probeServo:
		case ConfigPortFunction.sensorSpiCs:
		case ConfigPortFunction.servo:
		case ConfigPortFunction.spindleBackwards:
		case ConfigPortFunction.spindleForwards:
		case ConfigPortFunction.spindlePwm:
		case ConfigPortFunction.thermistor:
		case ConfigPortFunction.uart:
			return false;

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
		const boardDefinition = store.data.getBoardDefinition(realPort.value.canBoard);
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
function getPullUpTitle() {
	let title = "Configure pull-up resistor" + "<br><br>";
	if (hasInputPullUps.value) {
		title += "This port has permanent pull-up resistors for input protection, so this setting is not available";
	} else {
		title += `Currently the configurable pull-up resistor is turned ${isPulledUp.value ? "on" : "off"}`;
	}
	return title;
}
function togglePullUp() {
	const port = realPort.value;
	if (port !== null) {
		// Don't allow pull-ups to be enabled if there are persistent pull-ups on this board
		port.pullUp = !port.pullUp && !hasInputPullUps.value;
	}
	closeAllTooltips();
}

// PWM Frequency
const isPwm = computed(() => {
	if (disabled.value) {
		return false;
	}

	switch (props.function) {
		case ConfigPortFunction.fan:
		case ConfigPortFunction.gpOut:
		case ConfigPortFunction.heater:
		case ConfigPortFunction.laser:
		case ConfigPortFunction.probeServo:
		case ConfigPortFunction.servo:
		case ConfigPortFunction.spindlePwm:
			return true;
	}
	return false;
});

const defaultPwm = computed(() => {
	if (presetRealPort.value !== null) {
		return presetRealPort.value.frequency;
	}
	return (props.function === ConfigPortFunction.fan || props.function === ConfigPortFunction.heater) ? 250 : 500;
});
const pwmClass = computed(() => (realPort.value?.frequency === defaultPwm.value) ? "btn-outline-secondary" : "btn-primary");

const pwmButton = ref<Element | null>(null), pwmForm = ref<Element | null>(null), pwmFrequency = ref(0);
let pwmDropdown: Dropdown | null = null;
watch(pwmButton, (to) => {
	if (to) {
		pwmDropdown = new Dropdown(to);
		to.addEventListener("shown.bs.dropdown", (e: Event) => {
			const inputs = (pwmForm.value as HTMLElement).getElementsByTagName("input");
			if (inputs) {
				inputs[0].focus();
			}
		});
	} else if (pwmDropdown !== null) {
		pwmDropdown.dispose();
		pwmDropdown = null;
	}
});
function togglePwmDropdown() {
	pwmFrequency.value = realPort.value!.frequency;
	pwmDropdown?.toggle();
}

function resetPwm() {
	pwmFrequency.value = defaultPwm.value;
	realPort.value!.frequency = defaultPwm.value;
}
function applyPwm() {
	realPort.value!.frequency = pwmFrequency.value;
	pwmDropdown!.hide();
	closeAllTooltips();
}

// Port list
const ports = computed(() => {
	const result: Record<string, Array<SelectOption>> = {};

	// Define what capabilities the ports to show must have
	const requiredCapabilities = new Set<PortType>();
	switch (props.function) {
		case ConfigPortFunction.accelerometerInt:
			requiredCapabilities.add(PortType.gpInInterrupt);
			break;
		case ConfigPortFunction.accelerometerSpiCs:
		case ConfigPortFunction.sensorSpiCs:
			requiredCapabilities.add(PortType.spiCs);
			break;
		case ConfigPortFunction.endstop:
			requiredCapabilities.add(PortType.gpIn);
			break;
		case ConfigPortFunction.fan:
			requiredCapabilities.add(PortType.fan);
			requiredCapabilities.add(PortType.heater);
			break;
		case ConfigPortFunction.fanTacho:
			requiredCapabilities.add(PortType.fanTacho);
			break;
		case ConfigPortFunction.gpIn:
			requiredCapabilities.add(PortType.gpIn);
			break;
		case ConfigPortFunction.gpOut:
			requiredCapabilities.add(PortType.gpOut);
			break;
		case ConfigPortFunction.heater:
			requiredCapabilities.add(PortType.heater);
			requiredCapabilities.add(PortType.fan);
			break;
		case ConfigPortFunction.laser:
			requiredCapabilities.add(PortType.pwm);
			break;
		case ConfigPortFunction.ledStrip:
			requiredCapabilities.add(PortType.gpOut);
			break;
		case ConfigPortFunction.probeIn:
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				if (probe !== null) {
					if ([ProbeType.digital, ProbeType.unfilteredDigital, ProbeType.blTouch].includes(probe.type)) {
						// Digital probes can have general-purpose inputs
						requiredCapabilities.add(PortType.gpIn);
					} else if (probe.type === ProbeType.scanningAnalog) {
						// Scanning probes have their own dedicate port type
						requiredCapabilities.add(PortType.scanning);
						break;
					}
				}
			}
			requiredCapabilities.add(PortType.analogIn);
			break;
		case ConfigPortFunction.probeMod:
			requiredCapabilities.add(PortType.gpOut);
			break;
		case ConfigPortFunction.probeServo:
			requiredCapabilities.add(PortType.pwm);
			break;
		case ConfigPortFunction.servo:
			requiredCapabilities.add(PortType.pwm);
			break;
		case ConfigPortFunction.spindlePwm:
			requiredCapabilities.add(PortType.pwm);
			break;
		case ConfigPortFunction.spindleForwards:
		case ConfigPortFunction.spindleBackwards:
			requiredCapabilities.add(PortType.gpOut);
			break;
		case ConfigPortFunction.thermistor:
			requiredCapabilities.add(PortType.thermistor);
			break;
		case ConfigPortFunction.uart:
			// none
			break;
		default:
			const _exhaustiveCheck: never = props.function;
			break;
	}

	// Probe input ports have limits depending on their type
	let mustBeOnMainboard = false;
	if (props.function === ConfigPortFunction.probeIn) {
		if (props.index < store.data.sensors.probes.length) {
			const probe = store.data.sensors.probes[props.index];
			if (probe !== null) {
				mustBeOnMainboard = ![ProbeType.unfilteredDigital, ProbeType.blTouch, ProbeType.scanningAnalog].includes(probe.type);
			}
		}
	}

	// Filter ports according to their capabilities
	for (const port of store.data.configTool.ports) {
		if ((props.board !== undefined && !port.equalsBoard(props.board)) || (mustBeOnMainboard && !port.equalsBoard(0))) {
			continue;
		}

		for (const requiredCapability of requiredCapabilities) {
			if (port.capabilities.has(requiredCapability)) {
				const groupLabel = !port.canBoard ? "Main Board" : `CAN Board ${port.canBoard}`, portName = stripPort(port.toString());
				const portLabel = (port.function === null || (port.function === props.function && port.index === props.index)) ? portName : `${portName} (used by ${port.function})`;
				if (!result[groupLabel]) {
					result[groupLabel] = [
						{
							text: portLabel,
							value: portName
						}
					];
				} else {
					result[groupLabel].push(
						{
							text: portLabel,
							value: portName
						}
					);
				}
				break;
			}
		}
	}

	if (!required.value) {
		result["Other"] = [
			{
				text: "None",
				value: null
			}
		]
	}

	return result;
});

// Port configuration
const realPort = computed<ConfigPort | null>(() => {
	let secondaryIndex = 0;
	for (const port of store.data.configTool.ports) {
		if (port.function === props.function && port.index === props.index) {
			if (props.secondaryIndex !== null) {
				if (props.secondaryIndex !== secondaryIndex) {
					secondaryIndex++;
					continue;
				}
			}
			return port;
		}
	}
	return null;
});

const presetRealPort = computed<ConfigPort | null>(() => {
	let secondaryIndex = 0;
	for (const port of store.preset.configTool.ports) {
		if (port.function === props.function && port.index === props.index) {
			if (props.secondaryIndex !== null) {
				if (props.secondaryIndex !== secondaryIndex) {
					secondaryIndex++;
					continue;
				}
			}
			return port;
		}
	}
	return null;
});

const port = computed<string | null>({
	get() {
		let secondaryIndex = 0;
		for (const port of store.data.configTool.ports) {
			if (port.function === props.function && (props.board === undefined || port.equalsBoard(props.board)) && port.index === props.index) {
				if (props.secondaryIndex !== null) {
					if (props.secondaryIndex !== secondaryIndex) {
						secondaryIndex++;
						continue;
					}
				}
				return stripPort(port.toString());
			}
		}
		return null;
	},
	set(value) {
		// Free previous selection
		let secondaryIndex = 0;
		for (const port of store.data.configTool.ports) {
			if (port.function === props.function && (props.board === undefined || port.equalsBoard(props.board)) && port.index === props.index) {
				if (props.secondaryIndex !== null) {
					if (props.secondaryIndex !== secondaryIndex) {
						secondaryIndex++;
						continue;
					}
				}
				port.function = null;
			}
		}

		// Assign new selection (if applicable)
		if (value !== null) {
			const configuredPort = store.data.configTool.assignPort(value, props.function, props.index, defaultPwm.value);
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

		// Done
		emit("portSet", value);
	}
});

const presetPort = computed<string | null>(() => {
	let secondaryIndex = 0;
	for (const port of store.preset.configTool.ports) {
		if (port.function === props.function && (props.board === undefined || port.equalsBoard(props.board)) && port.index === props.index) {
			if (props.secondaryIndex !== null) {
				if (props.secondaryIndex !== secondaryIndex) {
					secondaryIndex++;
					continue;
				}
			}
			return port.toString();
		}
	}
	return null;
});

const disabled = computed(() => {
	if (props.disabled) {
		// Inherited disabled value overrides this logic
		return true;
	}

	switch (props.function) {
		case ConfigPortFunction.endstop:
			// Endstop selection is only possible if the corresponding endstop type is set to EndstopType.InputPin
			if (props.index >= 0 && props.index < store.data.sensors.endstops.length && store.data.sensors.endstops[props.index] !== null) {
				return store.data.sensors.endstops[props.index]!.type !== EndstopType.InputPin;
			}
			return true;
		case ConfigPortFunction.probeIn:
			// Only enabled if a valid probe type is set
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				return (probe === null) || (probe.type === ProbeType.none);
			}
			break;
		case ConfigPortFunction.probeMod:
			// Only enabled for modulated probes and smart effectors
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				return (probe === null) || ![ProbeType.dumbModulated, ProbeType.alternateAnalog, ProbeType.digital, ProbeType.unfilteredDigital].includes(probe.type);
			}
			break;
		case ConfigPortFunction.probeServo:
			// Only enabled for BLTouch
			if (props.index < store.data.sensors.probes.length) {
				const probe = store.data.sensors.probes[props.index];
				return (probe === null) || (probe.type !== ProbeType.blTouch);
			}
			break;

		case ConfigPortFunction.thermistor:
			// Input port selection is only available for thermistors
			if (props.index < store.data.sensors.analog.length && store.data.sensors.analog[props.index] !== null) {
				return ![AnalogSensorType.linearAnalog, AnalogSensorType.pt1000, AnalogSensorType.thermistor].includes(store.data.sensors.analog[props.index]!.type);
			}
			break;
	}
	return false;
});

const required = computed(() => {
	if (props.required !== null) {
		return props.required;
	}

	if (props.function === ConfigPortFunction.endstop && !props.disabled && props.secondaryIndex != null && props.secondaryIndex > 0) {
		// An axis can be used with only a single endstop but if there is more than one assigned port, all ports are required. Yet allow it to be unmapped again
		return (port.value === null) && (store.data.configTool.ports.filter(port => port.function === ConfigPortFunction.endstop && port.index === props.index).length > 1);
	} else if (props.function === ConfigPortFunction.probeMod) {
		return (props.index < store.data.sensors.analog.length) && ![ProbeType.digital, ProbeType.unfilteredDigital].includes(store.data.sensors.probes[props.index]!.type);
	}
	return ![ConfigPortFunction.fanTacho, ConfigPortFunction.spindleForwards, ConfigPortFunction.spindleBackwards].includes(props.function);
});
</script>
