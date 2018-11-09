<template>
	<b-container>
		<b-card header="Network Settings">
			<b-form-checkbox v-model="template.network.enabled" v-preset title="Check this to enable networking features (M552 S1)">Enable Network</b-form-checkbox>
			<div v-if="template.network.enabled" class="pl-4">
				<b-form-row class="mt-3">
					<b-col>
						<b-form-group label="Printer Name:">
							<b-form-input v-model.trim="template.network.name" v-preset title="Name of your printer (M550). If you use mDNS, you can access your printer via Myprinter.local" maxlength="40" type="text" required />
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Password:">
							<b-form-input v-model.trim="template.network.password" v-b-tooltip.hover title="Optional password to protect your printer from others on your local network (M551)" maxlength="64" placeholder="reprap" type="text" />
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-form-row v-if="board.hasWiFi">
					<b-col>
						<b-form-group label="WiFi Access Point Name:">
							<b-form-input v-model.trim="template.network.ssid" v-b-tooltip.hover title="Name of the SSID to connect to. Alternatively ou can connect manually via M587" maxlength="32" placeholder="configure manually" type="text" />
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Password:">
							<b-form-input v-model.trim="template.network.ssid_password" v-b-tooltip.hover title="Corresponding password of your SSID" maxlength="64" placeholder="none" type="text" />
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-form-row v-if="board.hasEthernet">
					<b-col>
						<b-form-group label="MAC Address:">
							<b-form-input v-model.trim="template.network.mac_address" v-preset title="MAC address of your machine. This is normally auto-generated" :formatter="formatMAC" :state="isValidMAC(template.network.mac_address)" maxlength="17" placeholder="automatically generated" type="text" />
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="template.network.dhcp" v-preset title="Use DHCP to acquire a dynamic IP configuration from your router (M552)">Acquire Dynamic IP Address via DHCP</b-checkbox>
				<b-form-row v-if="!template.network.dhcp" class="pl-4 mt-3">
					<b-col>
						<b-form-group label="IP Address:">
							<b-form-input v-model.trim="template.network.ip" v-preset title="Static IP address of your printer (M552). This value should be unique on your local network" :state="isValidIP(this.template.network.ip)" maxlength="15" type="text" required />
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Subnet Mask:">
							<b-form-input v-model.trim="template.network.netmask" v-preset title="Netmask of your local network (M553)" :state="isValidNetmask(this.template.network.netmask)" maxlength="15" type="text" required />
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Gateway:">
							<b-form-input v-model.trim="template.network.gateway" v-preset title="This should be the router's IP address on your local network (M554)" :state="isValidIP(this.template.network.gateway)" maxlength="15" type="text" required />
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="template.network.protocols.http" v-preset title="Enable HyperText Transmission Protocol to provide access to the web interface">Enable HTTP (required for Duet Web Control)</b-checkbox>
				<b-checkbox v-model="template.network.protocols.ftp" v-preset title="Enable File Transmission Protocol. Be aware that RepRapFirmware only supports one concurrent connection!">Enable FTP</b-checkbox>
				<b-checkbox v-model="template.network.protocols.telnet" v-preset title="Enable Telnet. Be aware that RepRapFirmware only supports one concurrent connection!">Enable Telnet</b-checkbox>
			</div>
		</b-card>
	</b-container>
</template>

<script>
export default {
	computed: {
	},
	methods: {
		formatMAC(value, event) {
			return value.toUpperCase()
		},
		isValidIP(ipAddress) {
			let matches = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ipAddress);
			if (matches == null) {
				return false;
			}
			return (matches[1] < 255) && (matches[2] < 255) && (matches[3] < 255) && (matches[4] < 255);
		},
		isValidNetmask(netmask) {
			let matches = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(netmask);
			if (matches == null) {
				return false;
			}
			return (matches[1] < 256) && (matches[2] < 256) && (matches[3] < 256) && (matches[4] < 256);
		},
		isValidMAC(macAddress) {
			return (macAddress == "") || (/^[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]$/.test(macAddress));
		}
	}
}
</script>
