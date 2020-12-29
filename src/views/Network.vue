<template>
	<b-container>
		<b-card v-if="template.standalone" :header="$t('network.settings')">
			<b-form-checkbox v-model="networkEnabled" v-preset.left="preset.network.enabled" :title="$t('network.enableDescription')">{{$t('network.enable')}}</b-form-checkbox>
			<div v-show="networkEnabled" class="pl-4">
				<b-form-row class="mt-3">
					<b-col>
						<b-form-group :label="$t('network.password')">
							<b-form-input v-model.trim="password" v-b-tooltip.hover :title="$t('network.passwordDescription')" maxlength="64" placeholder="reprap" type="text"></b-form-input>
						</b-form-group>
					</b-col>

					<template v-if="board.hasWiFi && template.firmware >= 3">
						<b-col cols="auto">
							<b-form-group :label="$t('network.wifiName')">
								<b-form-input v-model.trim="ssid" v-b-tooltip.hover :title="$t('network.wifiNameDescription')" maxlength="32" placeholder="configure manually" type="text"></b-form-input>
							</b-form-group>
						</b-col>
						<b-col cols="auto">
							<b-form-group :label="$t('network.wifiPassword')">
								<b-form-input v-model.trim="ssidPassword" v-b-tooltip.hover :title="$t('network.wifiPasswordDescription')" maxlength="64" placeholder="none" type="text"></b-form-input>
							</b-form-group>
						</b-col>
					</template>

					<b-col v-if="board.hasEthernet">
						<b-form-group :label="$t('network.mac')">
							<b-form-input v-model.trim="macAddress" v-preset="preset.network.mac_address" :title="$t('network.macDescription')" :formatter="formatMAC" :state="isValidMAC(template.network.mac_address)" maxlength="17" placeholder="automatically generated" type="text"></b-form-input>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="dhcp" v-preset.left="preset.network.dhcp" :title="$t('network.dhcpDescription')">{{$t('network.dhcp')}}</b-checkbox>
				<b-form-row v-show="!dhcp" class="pl-4 mt-3">
					<b-col>
						<b-form-group :label="$t('network.ip')">
							<b-form-input v-model.trim="ipAddress" v-preset="preset.network.ip" :title="$t('network.ipDescription')" :state="isValidIP(this.template.network.ip)" maxlength="15" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group :label="$t('network.subnet')">
							<b-form-input v-model.trim="netmask" v-preset="preset.network.netmask" :title="$t('network.subnetDescription')" :state="isValidNetmask(this.template.network.netmask)" maxlength="15" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group :label="$t('network.gateway')">
							<b-form-input v-model.trim="gateway" v-preset="preset.network.ip" :title="$t('network.gatewayDescription')" :state="isValidIP(this.template.network.gateway)" maxlength="15" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="http" v-preset.left="preset.network.protocols.http" :title="$t('network.httpDescription')" class="mt-3">{{$t('network.http')}}</b-checkbox>
				<b-checkbox v-model="ftp" v-preset.left="preset.network.protocols.ftp" :title="$t('network.ftpDescription')">{{$t('network.ftp')}}</b-checkbox>
				<b-checkbox v-model="telnet" v-preset.left="preset.network.protocols.telnet" :title="$t('network.telnetDescription')">{{$t('network.telnet')}}</b-checkbox>
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
