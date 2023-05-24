<template>
	<config-section :type="ConfigSectionType.Lasers" title="Lasers" url-title="Configuring Laser Cutters"
					url="https://docs.duet3d.com/en/User_manual/Machine_configuration/Configuration_laser">
		<div class="row">
			<div class="col">
				<port-input label="Laser Output Port" :function="ConfigPortFunction.laser" :index="0" />
			</div>
			<div class="col">
				<number-input label="Maximum Intensity"
							  title="The value of the S parameter in G1 commands that corresponds to full laser power"
							  v-model="store.data.configTool.laser.maxIntensity"
							  :preset="store.preset.configTool.laser.maxIntensity" :min="0.001" step="any" />
			</div>
			<div class="col d-flex align-items-end">
				<check-input label="Sticky Laser power across G1 commands"
							 title="Laser power is sticky across G1 commands. If this option is disabled (default), laser is off when executing G1 commands that have no S parameter"
							 v-model="store.data.configTool.laser.sParamSticky"
							 :preset="store.preset.configTool.laser.sParamSticky" />
			</div>
		</div>
	</config-section>
</template>

<script setup lang="ts">
import ConfigSection from "@/components/ConfigSection.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigSectionType } from "@/store/sections";

const store = useStore();
</script>
