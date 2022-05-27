<template>
	<select-input v-bind="$attrs" :disabled="disabled"
	              v-model="port" :options="ports" :preset="presetPort" />
</template>

<script setup lang="ts">
import { computed } from "vue";

import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";
import { ConfigPort, ConfigPortType } from "@/store/model/ConfigPort";
import { useStore } from "@/store";

interface PortInputProps {
	/**
	 * Port type to configure
	 */
	type: ConfigPortType,

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

const port = computed<ConfigPort | null>({
	get() {
		for (const port of store.data.configTool.ports) {
			if (port.type === props.type && port.index === props.index) {
				return port;
			}
		}
		return null;
	},
	set(value) {
		for (const port of store.data.configTool.ports) {
			if (port.type === props.type && port.index === props.index) {
				port.type = ConfigPortType.free;
			}
		}

		if (value !== null) {
			value.type = props.type;
			value.index = props.index;

			switch (props.type) {
				case ConfigPortType.probeIn:
				case ConfigPortType.probeMod:
					for (const port of store.data.configTool.ports) {
						if ((port.type === ConfigPortType.probeIn || port.type === ConfigPortType.probeMod) &&
							port.type !== props.type && port.index === port.index && port.canBoard !== value.canBoard) {
							// Free up related ports if the CAN board is about to change
							port.type = ConfigPortType.free;
						}
					}

			}
			// TODO
		}
	}
})

const presetPort = computed<ConfigPort | null>(() => {
	for (const port of store.preset.configTool.ports) {
		if (port.type === props.type && port.index === props.index) {
			return port;
		}
	}
	return null;
});

const ports = computed(() => {
	const result: Record<string, Array<SelectOption>> = {};

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
	switch (props.type) {
		case ConfigPortType.probeIn:
		case ConfigPortType.probeMod:
			break;

		case ConfigPortType.servo:
			// BLTouch
			if (props.index !== null) {

			}
			break;

	}
	return false;
});
</script>
