<template>
	<config-section id="network" :type="ConfigSectionType.Network" title="Network" url-title="Network Configuration"
				 url="https://docs.duet3d.com/en/User_manual/Machine_configuration/Networking">
		<div class="row">
			<!-- Ethernet -->
			<div v-if="lanInterface" class="col-12">
				<check-input label="Configure Ethernet"
							 title="Check this option to configure a LAN connection over Ethernet"
							 v-model="configureLan"
							 :preset="presetLanInterface?.state !== NetworkInterfaceState.disabled" />
				<div class="row ms-3 mt-2">
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

			<!-- WiFi -->
			<div v-if="wifiInterface" class="col-12 mt-3">
				<check-input label="Configure WiFi" title="Check this option to configure a WiFi connection"
							 v-model="configureWifi"
							 :preset="presetWifiInterface?.state !== NetworkInterfaceState.disabled" />

				<div class="row ms-3 mt-2">
					<div class="col-12">
						WiFi AP / Pass / Standalone mode?
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
				<text-input password label="Machine Password" title="Required password when connecting over HTTP"
							:max-length="20" placeholder="reprap" v-model="store.data.configTool.password"
							:required="false" />
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
</script>
