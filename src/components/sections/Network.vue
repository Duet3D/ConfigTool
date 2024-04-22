<template>
	<config-section id="network" :type="ConfigSectionType.Network" title="Network" url-title="Network Configuration"
					url="https://docs.duet3d.com/en/User_manual/Machine_configuration/Networking">
		<div class="row">
			<!-- Ethernet -->
			<div v-if="lanInterface" class="col-12">
				<check-input label="Configure Ethernet"
							 title="Check this option to configure a LAN connection over Ethernet" v-model="configureLan"
							 :preset="presetLanInterface?.state !== NetworkInterfaceState.disabled" />
				<div v-if="configureLan" class="row ms-3 mt-2">
					<div class="col-12">
						<check-input label="Acquire dynamic IP address via DHCP"
									 title="Check this option to use DHCP for automatic IPv4 configuration"
									 v-model="dhcpLan"
									 :preset="presetLanInterface?.configuredIP === null || presetLanInterface?.configuredIP === '0.0.0.0'" />
					</div>
					<template v-if="!dhcpLan">
						<div class="row ms-3 mt-2">
							<div class="col">
								<ip-input label="Static IP Address" title="Static IPv4 address"
										  :model-value="lanInterface.configuredIP ?? ''"
										  @update:model-value="lanInterface!.configuredIP = $event"
										  :preset="presetLanInterface?.configuredIP" />
							</div>
							<div class="col">
								<ip-input label="Subnet Mask" title="IPv4 subnet mask" net-mask
										  :model-value="lanInterface.subnet ?? ''"
										  @update:model-value="lanInterface!.subnet = $event"
										  :preset="presetLanInterface?.subnet" />
							</div>
							<div class="col">
								<ip-input label="Gateway" title="IPv4 gateway address"
										  :model-value="lanInterface.gateway ?? ''"
										  @update:model-value="lanInterface!.gateway = $event"
										  :preset="presetLanInterface?.gateway" />
							</div>
							<div class="col">
								<ip-input label="DNS Server" title="IPv4 DNS server address"
										  :disabled="store.data.sbc === null"
										  :model-value="store.data.sbc ? (lanInterface.dnsServer ?? '') : ''"
										  @update:model-value="lanInterface!.dnsServer = $event ? $event : null"
										  :preset="presetLanInterface?.dnsServer" :required="false" />
							</div>
						</div>
					</template>
				</div>
			</div>

			<!-- Spacer-->
			<div v-if="lanInterface && wifiInterface" class="mt-3"></div>

			<!-- WiFi -->
			<div v-if="wifiInterface && !sbcModeEnabled" class="col-12">
				<check-input label="Configure WiFi" title="Check this option to configure a WiFi connection"
							 v-model="configureWifi"
							 :preset="presetWifiInterface?.state !== NetworkInterfaceState.disabled" />
				<!-- ESP module -->
				<template v-if="configureWifi && boardHasOnBoardEspSupport()">
				<div class="row ms-3 mt-2">An ESP module is present on-board and will be used. No further pins configuration is needed.</div>
				</template>
				<template v-else-if="configureWifi">
					<div v-if="boardHasEsp32Support()" class="row ms-3 mt-2">
						<check-input label="Enable Network via ESP32" title="Check this to enable network via ESP32 module"
									 :disabled="isESP8266"
									 v-model="isESP32"
									 :preset="store.preset.configTool.networkEspType === ConfigNetworkEspType.esp32" />
					</div>
					<div v-if="boardHasEsp8266Support()" class="row ms-3 mt-2">
						<check-input label="Enable Network via ESP8266" title="Check this to enable network via ESP8266 module"
									 :disabled="isESP32"
									 v-model="isESP8266"
									 :preset="store.preset.configTool.networkEspType === ConfigNetworkEspType.esp8266" />
					</div>
					<!-- ESP module pins settings-->
					<div v-if="isESP32 || isESP8266" class="row ms-5 mt-2">
						<div class="row">
							<div class="col-2">
								<text-input label="espDataReadyPin" title="This is the pin to be used in board.txt for 8266wifi.espDataReadyPin" :max-length="8"
											v-model="espDataReadyPin" :required="false" />
							</div>
							<div class="col-2">
								<text-input label="TfrReadyPin" title="This is the pin to be used in board.txt for 8266wifi.TfrReadyPin" :max-length="8"
											v-model="espTfrReadyPin" :required="false" />
							</div>
							<div class="col-2">
								<text-input label="espResetPin" title="This is the pin to be used in board.txt for 8266wifi.espResetPin" :max-length="8"
											v-model="espResetPin" :required="false" />
							</div>
							<div class="col-2">
								<text-input label="csPin" title="This is the pin to be used in board.txt for 8266wifi.csPin" :max-length="8"
											v-model="espCsPin" :required="false" />
							</div>
							<div class="col-2">
								<text-input label="serialRxPin" title="This is the pin to be used in board.txt for 8266wifi.serialRxPin and is used to update the ESP from DWC" :max-length="8"
											v-model="espRxPin" :required="false" />
							</div>
							<div class="col-2">
								<text-input label="serialTxPin" title="This is the pin to be used in board.txt for 8266wifi.serialTxPin and is used to update the ESP from DWC" :max-length="8"
											v-model="espTxPin" :required="false" />
							</div>
						</div>
					</div>
				</template>
				<!-- Wifi settings-->
				<div v-if="configureWifi" class="row ms-3 mt-2">
					<div class="col-12 mb-3">
						<div class="row">
							<div class="col-4">
								<text-input label="WiFi SSID" placeholder="optional"
											title="WiFi SSID to connect to" :max-length="32"
											v-model="store.data.configTool.wifi.ssid" :required="false" />
							</div>
							<div class="col-8">
								<text-input password label="WiFi Password" title="Optional PSK used for connecting to the specified WiFi"
											:max-length="64" v-model="store.data.configTool.wifi.psk" :required="false" />
							</div>
						</div>
					</div>
					<div class="col-12">
						<check-input label="Acquire dynamic IP address via DHCP"
									 title="Check this option to use DHCP for automatic IPv4 configuration"
									 v-model="dhcpWifi"
									 :preset="presetWifiInterface?.configuredIP === null || presetWifiInterface?.configuredIP === '0.0.0.0'" />
					</div>
					<template v-if="!dhcpWifi">
						<div class="row ms-3 mt-2">
							<div class="col">
								<ip-input label="Static IP Address" title="Static IPv4 address"
										  :model-value="wifiInterface.configuredIP ?? ''"
										  @update:model-value="wifiInterface!.configuredIP = $event"
										  :preset="presetWifiInterface?.configuredIP" />
							</div>
							<div class="col">
								<ip-input label="Subnet Mask" title="IPv4 subnet mask" net-mask
										  :model-value="wifiInterface.subnet ?? ''"
										  @update:model-value="wifiInterface!.subnet = $event"
										  :preset="presetWifiInterface?.subnet" />
							</div>
							<div class="col">
								<ip-input label="Gateway" title="IPv4 gateway address"
										  :model-value="wifiInterface.gateway ?? ''"
										  @update:model-value="wifiInterface!.gateway = $event"
										  :preset="presetWifiInterface?.gateway" />
							</div>
							<div class="col">
								<ip-input label="DNS Server" title="IPv4 DNS server address"
										  :disabled="store.data.sbc === null"
										  :model-value="store.data.sbc ? (wifiInterface.dnsServer ?? '') : ''"
										  @update:model-value="wifiInterface!.dnsServer = $event ? $event : null"
										  :preset="presetWifiInterface?.dnsServer" :required="false" />
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
		<div v-if="configureLan || configureWifi" class="row mt-3">
			<div class="col">
				<text-input password label="Machine Password" title="Required password for network access" :max-length="20"
							placeholder="reprap" v-model="store.data.configTool.password" :required="false" />
			</div>
			<div class="col d-flex flex-column justify-content-end">
				<check-input label="Enable HTTP" title="Enable HTTP access using Duet Web Control"
							 :model-value="isProtocolEnabled(NetworkProtocol.HTTP)"
							 @update:model-value="setProtocolEnabled(NetworkProtocol.HTTP, $event)"
							 :preset="isPresetProtocolEnabled(NetworkProtocol.HTTP)" />
				<check-input v-if="store.data.sbc !== null" label="Enable HTTPS"
							 title="Enable HTTPS access using Duet Web Control via self-signed certificate"
							 :model-value="isProtocolEnabled(NetworkProtocol.HTTPS)"
							 @update:model-value="setProtocolEnabled(NetworkProtocol.HTTPS, $event)"
							 :preset="isPresetProtocolEnabled(NetworkProtocol.HTTP)" />
			</div>
			<div class="col d-flex flex-column justify-content-end">
				<check-input label="Enable FTP" title="Enable FTP access"
							 :model-value="isProtocolEnabled(NetworkProtocol.FTP)"
							 @update:model-value="setProtocolEnabled(NetworkProtocol.FTP, $event)"
							 :preset="isPresetProtocolEnabled(NetworkProtocol.FTP)" />
				<check-input v-if="store.data.sbc !== null" label="Enable SFTP" title="Enable SFTP access"
							 :model-value="isProtocolEnabled(NetworkProtocol.SFTP)"
							 @update:model-value="setProtocolEnabled(NetworkProtocol.SFTP, $event)"
							 :preset="isPresetProtocolEnabled(NetworkProtocol.SFTP)" />
			</div>
			<div class="col d-flex flex-column justify-content-end">
				<check-input label="Enable Telnet" title="Enable Telnet access using Duet Web Control"
							 :model-value="isProtocolEnabled(NetworkProtocol.Telnet)"
							 @update:model-value="setProtocolEnabled(NetworkProtocol.Telnet, $event)"
							 :preset="isPresetProtocolEnabled(NetworkProtocol.Telnet)" />
				<check-input v-if="store.data.sbc !== null" label="Enable SSH" title="Enable SSH access"
							 :model-value="isProtocolEnabled(NetworkProtocol.SSH)"
							 @update:model-value="setProtocolEnabled(NetworkProtocol.SSH, $event)"
							 :preset="isPresetProtocolEnabled(NetworkProtocol.SSH)" />
			</div>
		</div>
	</config-section>
</template>

<script setup lang="ts">
import { NetworkInterfaceState, NetworkInterfaceType, NetworkProtocol } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import IpInput from "@/components/inputs/IpInput.vue";

import { useStore } from "@/store";
import { ConfigSectionType } from "@/store/sections";
import { ConfigNetworkEspType } from "@/store/model/ConfigToolModel";

const store = useStore();

// Ethernet
const lanInterface = computed(() => store.data.network.interfaces.find(iface => iface.type === NetworkInterfaceType.lan));
const presetLanInterface = computed(() => store.preset.network.interfaces.find(iface => iface.type === NetworkInterfaceType.lan));

const configureLan = computed({
	get() { return !!lanInterface.value && (lanInterface.value.state !== NetworkInterfaceState.disabled); },
	set(value) {
		if (lanInterface.value) {
			lanInterface.value.state = value ? NetworkInterfaceState.active : NetworkInterfaceState.disabled;
		}
	}
});

const dhcpLan = computed({
	get() { return !!lanInterface.value && (lanInterface.value.configuredIP === null || lanInterface.value.configuredIP === "0.0.0.0") },
	set(value) {
		if (lanInterface.value) {
			lanInterface.value.configuredIP = value ? "0.0.0.0" : (lanInterface.value.actualIP ?? "");
		}
	}
});

// WiFi
const wifiInterface = computed(() => store.data.network.interfaces.find(iface => iface.type === NetworkInterfaceType.wifi));
const presetWifiInterface = computed(() => store.preset.network.interfaces.find(iface => iface.type === NetworkInterfaceType.wifi));

const configureWifi = computed({
	get() { return !!wifiInterface.value && (wifiInterface.value.state !== NetworkInterfaceState.disabled); },
	set(value) {
		if (wifiInterface.value) {
			wifiInterface.value.state = value ? NetworkInterfaceState.active : NetworkInterfaceState.disabled;
		}
	}
});

const dhcpWifi = computed({
	get() { return !!wifiInterface.value && (wifiInterface.value.configuredIP === null || wifiInterface.value.configuredIP === "0.0.0.0") },
	set(value) {
		if (wifiInterface.value) {
			wifiInterface.value.configuredIP = value ? "0.0.0.0" : (wifiInterface.value.actualIP ?? "");
		}
	}
});

const isESP32 = computed<boolean>({
	get() { 
		return store.data.configTool.networkEspType === ConfigNetworkEspType.esp32
	},
	set(value) {
		if(value) {
			store.data.configTool.networkEspType = ConfigNetworkEspType.esp32;
		} else {
			store.data.configTool.networkEspType = ConfigNetworkEspType.none;
		}
	}
});

const isESP8266 = computed<boolean>({
	get() {
		return store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266
	},
	set(value) {
		if(value) {
			store.data.configTool.networkEspType = ConfigNetworkEspType.esp8266;
		} else {
			store.data.configTool.networkEspType = ConfigNetworkEspType.none;
		}
	}
});

const espDataReadyPin = computed({
	get: () => {
		if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
			return store.data.boardDefinition?.stm?.esp32.dataReadyPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp32.dataReadyPin;
		} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
			return store.data.boardDefinition?.stm?.esp8266.dataReadyPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp8266.dataReadyPin;
		}
	},
	set(value) {
		if (store.data.boardDefinition !== null && store.data.boardDefinition.stm !== null){
			const newValue = value.trim() === "" ? 'NoPin' : value.trim();
			if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
				store.data.boardDefinition.stm.esp32.dataReadyPin = newValue;
			} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
				store.data.boardDefinition.stm.esp8266.dataReadyPin = newValue;
			}
		}
	}
});

const espTfrReadyPin = computed({
	get: () => {
		if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
			return store.data.boardDefinition?.stm?.esp32.tfrReadyPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp32.tfrReadyPin;
		} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
			return store.data.boardDefinition?.stm?.esp8266.tfrReadyPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp8266.tfrReadyPin;
		}
	},
	set(value) {
		if (store.data.boardDefinition !== null && store.data.boardDefinition.stm !== null){
			const newValue = value.trim() === "" ? 'NoPin' : value.trim();
			if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
				store.data.boardDefinition.stm.esp32.tfrReadyPin = newValue;
			} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
				store.data.boardDefinition.stm.esp8266.tfrReadyPin = newValue;
			}
		}
	}
});

const espResetPin = computed({
	get: () => {
		if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
			return store.data.boardDefinition?.stm?.esp32.resetPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp32.resetPin;
		} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
			return store.data.boardDefinition?.stm?.esp8266.resetPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp8266.resetPin;
		}
	},
	set(value) {
		if (store.data.boardDefinition !== null && store.data.boardDefinition.stm !== null){
			const newValue = value.trim() === "" ? 'NoPin' : value.trim();
			if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
				store.data.boardDefinition.stm.esp32.resetPin = newValue;
			} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
				store.data.boardDefinition.stm.esp8266.resetPin = newValue;
			}
		}
	}
});

const espCsPin = computed({
	get: () => {
		if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
			return store.data.boardDefinition?.stm?.esp32.csPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp32.csPin;
		} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
			return store.data.boardDefinition?.stm?.esp8266.csPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp8266.csPin;
		}
	},
	set(value) {
		if (store.data.boardDefinition !== null && store.data.boardDefinition.stm !== null){
			const newValue = value.trim() === "" ? 'NoPin' : value.trim();
			if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
				store.data.boardDefinition.stm.esp32.csPin = newValue;
			} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
				store.data.boardDefinition.stm.esp8266.csPin = newValue;
			}
		}
	}
});

const espRxPin = computed({
	get: () => {
		if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
			return store.data.boardDefinition?.stm?.esp32.rxPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp32.rxPin;
		} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
			return store.data.boardDefinition?.stm?.esp8266.rxPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp8266.rxPin;
		}
	},
	set(value) {
		if (store.data.boardDefinition !== null && store.data.boardDefinition.stm !== null){
			const newValue = value.trim() === "" ? 'NoPin' : value.trim();
			if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
				store.data.boardDefinition.stm.esp32.rxPin = newValue;
			} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
				store.data.boardDefinition.stm.esp8266.rxPin = newValue;
			}
		}
	}
});

const espTxPin = computed({
	get: () => {
		if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
			return store.data.boardDefinition?.stm?.esp32.txPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp32.txPin;
		} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
			return store.data.boardDefinition?.stm?.esp8266.txPin === null ? 'NoPin' : store.data.boardDefinition?.stm?.esp8266.txPin;
		}
	},
	set(value) {
		if (store.data.boardDefinition !== null && store.data.boardDefinition.stm !== null){
			const newValue = value.trim() === "" ? 'NoPin' : value.trim();
			if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp32) {
				store.data.boardDefinition.stm.esp32.txPin = newValue;
			} else if (store.data.configTool.networkEspType === ConfigNetworkEspType.esp8266) {
				store.data.boardDefinition.stm.esp8266.txPin = newValue;
			}
		}
	}
});

// Protocols
function isProtocolEnabled(protocol: NetworkProtocol) {
	for (const iface of store.data.network.interfaces) {
		if (iface.activeProtocols.has(protocol)) {
			return true;
		}
	}
	return false;
}

function isPresetProtocolEnabled(protocol: NetworkProtocol) {
	for (const iface of store.data.network.interfaces) {
		if (iface.activeProtocols.has(protocol)) {
			return true;
		}
	}
	return false;
}

function setProtocolEnabled(protocol: NetworkProtocol, enabled: boolean) {
	for (const iface of store.data.network.interfaces) {
		if (enabled) {
			iface.activeProtocols.add(protocol);
		} else {
			iface.activeProtocols.delete(protocol);
		}
	}
}

const sbcModeEnabled = computed(() => !!store.data.sbc);

function boardHasEspSupport(){
	return boardHasEsp32Support() || boardHasEsp8266Support();
}

function boardHasEsp32Support(){
	return store.data.boardDefinition?.stm?.esp32.onboard || 
		   store.data.boardDefinition?.stm?.esp32.module;
}

function boardHasEsp8266Support(){
	return store.data.boardDefinition?.stm?.esp8266.onboard || 
		   store.data.boardDefinition?.stm?.esp8266.module;
}

function boardHasOnBoardEspSupport(){
	return store.data.boardDefinition?.stm?.esp32.onboard === true || 
		   store.data.boardDefinition?.stm?.esp8266.onboard === true;
}
</script>
