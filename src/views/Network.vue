<template>
	<b-container>
		<b-card v-if="template.standalone && board.hasEthernet" header="Network Settings">
			<b-form-checkbox v-model="networkEnabled" v-preset.left="preset.network.enabled" title="Check this to enable networking features (M552 S1)">Enable Network</b-form-checkbox>
			<div v-show="networkEnabled" class="pl-4">
				<b-form-row class="mt-3">
					<b-col>
						<b-form-group label="Password for the web interface (HTTP), FTP, and Telnet:">
							<b-form-input v-model.trim="password" v-b-tooltip.hover title="Optional password to protect your printer from others on your local network (M551)" maxlength="64" placeholder="reprap" type="text"></b-form-input>
						</b-form-group>
					</b-col>

					<template v-if="board.hasWiFi && template.firmware >= 3">
						<b-col cols="auto">
							<b-form-group label="WiFi Access Point Name:">
								<b-form-input v-model.trim="ssid" v-b-tooltip.hover title="Name of the SSID to connect to. Alternatively, you can connect manually via M587" maxlength="32" placeholder="configure manually" type="text"></b-form-input>
							</b-form-group>
						</b-col>
						<b-col cols="auto">
							<b-form-group label="WiFi Password:">
								<b-form-input v-model.trim="ssidPassword" v-b-tooltip.hover title="Corresponding password of your SSID" maxlength="64" placeholder="none" type="text"></b-form-input>
							</b-form-group>
						</b-col>
					</template>

					<b-col v-if="board.hasEthernet">
						<b-form-group label="MAC Address:">
							<b-form-input v-model.trim="macAddress" v-preset="preset.network.mac_address" title="MAC address of your machine. This is normally auto-generated" :formatter="formatMAC" :state="isValidMAC(template.network.mac_address)" maxlength="17" placeholder="automatically generated" type="text"></b-form-input>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="dhcp" v-preset.left="preset.network.dhcp" title="Use DHCP to acquire a dynamic IP configuration from your router (M552)">Acquire Dynamic IP Address via DHCP</b-checkbox>
				<b-form-row v-show="!dhcp" class="pl-4 mt-3">
					<b-col>
						<b-form-group label="IP Address:">
							<b-form-input v-model.trim="ipAddress" v-preset="preset.network.ip" title="Static IP address of your printer (M552). This value should be unique on your local network" :state="isValidIP(this.template.network.ip)" maxlength="15" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Subnet Mask:">
							<b-form-input v-model.trim="netmask" v-preset="preset.network.netmask" title="Netmask of your local network (M553)" :state="isValidNetmask(this.template.network.netmask)" maxlength="15" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Gateway:">
							<b-form-input v-model.trim="gateway" v-preset="preset.network.ip" title="This should be the router's IP address on your local network (M554)" :state="isValidIP(this.template.network.gateway)" maxlength="15" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="http" v-preset.left="preset.network.protocols.http" title="Enable HyperText Transmission Protocol to provide access to the web interface" class="mt-3">Enable HTTP (required for the web interface)</b-checkbox>
				<!--b-checkbox v-model="ftp" v-preset.left="preset.network.protocols.ftp" title="Enable File Transmission Protocol. Be aware that RepRapFirmware only supports one concurrent connection!">Enable FTP</b-checkbox>
				<b-checkbox v-model="telnet" v-preset.left="preset.network.protocols.telnet" title="Enable Telnet. Be aware that RepRapFirmware only supports one concurrent connection!">Enable Telnet</b-checkbox-->
			</div>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
	computed: {
		...mapState(['board', 'preset', 'template']),
		...mapFields({
			networkEnabled: 'template.network.enabled',
			password: 'template.network.password',
			ssid: 'template.network.ssid',
			ssidPassword: 'template.network.ssid_password',
			macAddress: 'template.network.mac_address',
			dhcp: 'template.network.dhcp',
			ipAddress: 'template.network.ip',
			netmask: 'template.network.netmask',
			gateway: 'template.network.gateway',
			http: 'template.network.protocols.http',
			ftp: 'template.network.protocols.ftp',
			telnet: 'template.network.protocols.telnet'
		})
	},
	methods: {
		formatMAC(value, event) {
			return value.toUpperCase()
		},
		isValidIP(ipAddress) {
			let matches = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ipAddress);
			if (!matches) {
				return false;
			}
			return (matches[1] < 255) && (matches[2] < 255) && (matches[3] < 255) && (matches[4] < 255);
		},
		isValidNetmask(netmask) {
			let matches = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(netmask);
			if (!matches) {
				return false;
			}
			return (matches[1] < 256) && (matches[2] < 256) && (matches[3] < 256) && (matches[4] < 256);
		},
		isValidMAC(macAddress) {
			return (macAddress === '') || (/^[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]$/.test(macAddress));
		}
	}
}
</script>
