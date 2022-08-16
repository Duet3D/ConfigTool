import { Board, initObject, Limits, MinMaxCurrent, NetworkInterface, NetworkInterfaceType } from "@duet3d/objectmodel";

import { PortType, type BaseBoardDescriptor } from "@/store/BaseBoard";
import { ExpansionBoardType } from "@/store/ExpansionBoards";

import type ConfigModel from "@/store/model";

/**
 * Boards supported by the config tool
 */
export enum BoardType {
	// Officially supported boards
	Duet3Mini5PlusEthernet = "Duet 3 Mini 5+ Ethernet",
	Duet3Mini5PlusWiFi = "Duet 3 Mini 5+ WiFi",
	Duet3MB6HC = "Duet 3 Main Board 6HC",
	Duet3MB6XD = "Duet 3 Main Board 6XD",

	Duet2Ethernet = "Duet 2 Ethernet",
	Duet2WiFi = "Duet 2 WiFi",

	// Unofficially supported or discontinued boards
	Duet2SBC = "Duet 2 SBC (customised)",
	Duet2Maestro = "Duet 2 Maestro (discontinued)"
}

/**
 * Boards no longer supported by the config tool
 */
export enum UnsupportedBoardType {
	Duet06 = "Duet 0.6",
	Duet085 = "Duet 0.8.5"
}

/**
 * Descriptor interface for supported main boards
 */
export interface BoardDescriptor extends BaseBoardDescriptor {
	objectModelLimits: Limits;
	objectModelNetworkInterfaces: Array<NetworkInterface>;

	expansionBoards: Set<ExpansionBoardType>;
}

/**
 * Check if the given value is a board descriptor
 * @param value Value to check
 * @returns True if the value is a board descriptor
 */
export function isBoardDescriptor(value: any): value is BoardDescriptor {
	return (value instanceof Object) && (value.objectModelNetworkInterfaces instanceof Array);
}

/**
 * Descriptors for supported main boards
 */
export const Boards: Record<BoardType, BoardDescriptor> = {
	[BoardType.Duet3Mini5PlusEthernet]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "Duet3Firmware_Mini5plus.uf2",
			iapFileNameSBC: "Duet3_SBCiap32_Mini5plus.bin",
			iapFileNameSD: "Duet3_SDiap32_Mini5plus.bin",
			maxHeaters: 32,
			maxMotors: 7,
			name: "Duet 3 Mini 5+",
			shortName: "Mini5plus",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 10,
			axesPlusExtruders: 12,
			bedHeaters: 4,
			boards: 5,
			chamberHeaters: 4,
			drivers: 14,
			driversPerAxis: 4,
			extruders: 8,
			extrudersPerTool: 8,
			fans: 20,
			gpInPorts: 32,
			gpOutPorts: 32,
			heaters: 32,
			heatersPerTool: 2,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 56,
			spindles: 4,
			tools: 50,
			trackedObjects: 40,
			triggers: 16,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.lan
			})
		],

		ports: {
			[PortType.analogIn]: ["io2.in"],
			[PortType.fan]: ["out2", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out2.tach", "out4.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out1", "out2"],
			[PortType.pwm]: ["io0.out", "io2.out", "io3.out"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp1", "temp2"],
			[PortType.uart]: ["usb", "io1.in+io1.out"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.Duet3Mini2Plus
		])
	},
	[BoardType.Duet3Mini5PlusWiFi]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "Duet3Firmware_Mini5plus.uf2",
			iapFileNameSBC: "Duet3_SBCiap32_Mini5plus.bin",
			iapFileNameSD: "Duet3_SDiap32_Mini5plus.bin",
			maxHeaters: 32,
			maxMotors: 7,
			name: "Duet 3 Mini 5+",
			shortName: "Mini5plus",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 10,
			axesPlusExtruders: 12,
			bedHeaters: 4,
			boards: 5,
			chamberHeaters: 4,
			drivers: 14,
			driversPerAxis: 4,
			extruders: 8,
			extrudersPerTool: 8,
			fans: 20,
			gpInPorts: 32,
			gpOutPorts: 32,
			heaters: 32,
			heatersPerTool: 2,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 56,
			spindles: 4,
			tools: 50,
			trackedObjects: 40,
			triggers: 16,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.wifi
			})
		],

		ports: {
			[PortType.analogIn]: ["io2.in"],
			[PortType.fan]: ["out2", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out2.tach", "out4.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpOut]: ["io0.in", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out1", "out2"],
			[PortType.pwm]: ["io0.out", "io2.out", "io3.out"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp1", "temp2"],
			[PortType.uart]: ["usb", "io1.in+io1.out"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.Duet3Mini2Plus
		])
	},
	[BoardType.Duet3MB6HC]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		motorWarnCurrent: 4000,
		motorMaxCurrent: 6000,
		minVoltage: 11,
		maxVoltage: 32,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "Duet3Firmware_MB6HC.bin",
			iapFileNameSBC: "Duet3_SBCiap32_MB6HC.bin",
			iapFileNameSD: "Duet3_SDiap32_MB6HC.bin",
			maxHeaters: 10,
			maxMotors: 6,
			name: "Duet 3 MB6HC",
			shortName: "MB6HC"
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 25,
			bedHeaters: 12,
			boards: 21,
			chamberHeaters: 4,
			drivers: 26,
			driversPerAxis: 8,
			extruders: 16,
			extrudersPerTool: 10,
			fans: 20,
			gpInPorts: 32,
			gpOutPorts: 32,
			heaters: 32,
			heatersPerTool: 20,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 56,
			spindles: 4,
			tools: 50,
			trackedObjects: 40,
			triggers: 32,
			volumes: 1,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.lan
			})
		],

		ports: {
			[PortType.analogIn]: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.uart]: ["usb", "io0.in+io0.out", "io1.in+io1.out"]
		},

		expansionBoards: new Set()
	},
	[BoardType.Duet3MB6XD]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: false,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 11,
		maxVoltage: 30,
		numDrivers: 6,
		microstepInterpolations: [],

		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "Duet3Firmware_MB6XD.bin",
			iapFileNameSBC: "Duet3_SBCiap32_MB6XD.bin",
			iapFileNameSD: "Duet3_SDiap32_MB6XD.bin",
			maxHeaters: 10,
			maxMotors: 12,
			shortName: "MB6XD",
			name: "Duet 3 MB6XD",
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 25,
			bedHeaters: 12,
			boards: 21,
			chamberHeaters: 4,
			drivers: 26,
			driversPerAxis: 8,
			extruders: 16,
			extrudersPerTool: 8,
			fans: 20,
			gpInPorts: 32,
			gpOutPorts: 32,
			heaters: 32,
			heatersPerTool: 8,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 56,
			spindles: 4,
			tools: 50,
			trackedObjects: 40,
			triggers: 32,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.lan
			})
		],

		ports: {
			[PortType.analogIn]: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.uart]: ["usb", "io0.in+io0.out", "io1.in+io1.out"]
		},

		expansionBoards: new Set()
	},
	[BoardType.Duet2Ethernet]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],

		objectModelBoard: initObject(Board, {
			firmwareFileName: "Duet2CombinedFirmware.bin",
			iapFileNameSD: "Duet2_SDiap32_WiFiEth.bin",
			maxHeaters: 10,
			maxMotors: 12,
			name: "Duet 2 Ethernet",
			shortName: "2Ethernet",
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 10,
			axesPlusExtruders: 12,
			bedHeaters: 4,
			boards: 1,
			chamberHeaters: 4,
			drivers: 12,
			driversPerAxis: 6,
			extruders: 7,
			extrudersPerTool: 8,
			fans: 12,
			gpInPorts: 20,
			gpOutPorts: 20,
			heaters: 10,
			heatersPerTool: 8,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 32,
			spindles: 4,
			tools: 50,
			trackedObjects: 20,
			triggers: 16,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.lan
			})
		],

		ports: {
			[PortType.analogIn]: ["zprobe.in", "exp.thermistor3+exp.35", "exp.thermistor4+exp.36", "exp.thermistor5+exp.37", "exp.thermistor6+exp.38", "exp.thermistor7+exp.39"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: ["exp.pb6"],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.e2stop+exp.4", "exp.e3stop+exp.9", "exp.e4stop+exp.14", "exp.e5stop+exp.19", "exp.e6stop+exp.24"],
			[PortType.gpOut]: ["zprobe.mod", "pson"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod", "exp.heater3+exp.8", "exp.heater4+exp.13", "exp.heater5+exp.18", "exp.heater6+exp.23", "exp.heater7+exp.31"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp"],
			[PortType.uart]: ["usb", "urxd0+utxd0"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.DueX5,
			ExpansionBoardType.Duet2ExpansionBreakout,
			ExpansionBoardType.DueX2
		])
	},
	[BoardType.Duet2WiFi]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],

		objectModelBoard: initObject(Board, {
			firmwareFileName: "Duet2CombinedFirmware.bin",
			iapFileNameSD: "Duet2_SDiap32_WiFiEth.bin",
			maxHeaters: 10,
			maxMotors: 12,
			name: "Duet 2 WiFi",
			shortName: "2WiFi",
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 10,
			axesPlusExtruders: 12,
			bedHeaters: 4,
			boards: 1,
			chamberHeaters: 4,
			drivers: 12,
			driversPerAxis: 6,
			extruders: 7,
			extrudersPerTool: 8,
			fans: 12,
			gpInPorts: 20,
			gpOutPorts: 20,
			heaters: 10,
			heatersPerTool: 8,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 32,
			spindles: 4,
			tools: 50,
			trackedObjects: 20,
			triggers: 16,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.wifi
			})
		],

		ports: {
			[PortType.analogIn]: ["zprobe.in", "exp.thermistor3+exp.35", "exp.thermistor4+exp.36", "exp.thermistor5+exp.37", "exp.thermistor6+exp.38", "exp.thermistor7+exp.39"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: ["exp.pb6"],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.e2stop+exp.4", "exp.e3stop+exp.9", "exp.e4stop+exp.14", "exp.e5stop+exp.19", "exp.e6stop+exp.24"],
			[PortType.gpOut]: ["pson"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod", "exp.heater3+exp.8", "exp.heater4+exp.13", "exp.heater5+exp.18", "exp.heater6+exp.23", "exp.heater7+exp.31"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp"],
			[PortType.uart]: ["usb", "urxd0+utxd0"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.DueX5,
			ExpansionBoardType.Duet2ExpansionBreakout,
			ExpansionBoardType.DueX2
		])
	},
	[BoardType.Duet2SBC]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],

		objectModelBoard: initObject(Board, {
			firmwareFileName: "Duet2Firmware_SBC.bin",
			iapFileNameSBC: "Duet2_SBCiap32_SBC.bin",
			maxHeaters: 10,
			maxMotors: 12,
			name: "Duet 2 + SBC",
			shortName: "2SBC",
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 10,
			axesPlusExtruders: 12,
			bedHeaters: 4,
			boards: 1,
			chamberHeaters: 4,
			drivers: 12,
			driversPerAxis: 6,
			extruders: 7,
			extrudersPerTool: 8,
			fans: 12,
			gpInPorts: 20,
			gpOutPorts: 20,
			heaters: 10,
			heatersPerTool: 8,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 32,
			spindles: 4,
			tools: 50,
			trackedObjects: 20,
			triggers: 16,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 4
		}),
		objectModelNetworkInterfaces: [],

		ports: {
			[PortType.analogIn]: ["zprobe.in", "exp.thermistor3+exp.35", "exp.thermistor4+exp.36", "exp.thermistor5+exp.37", "exp.thermistor6+exp.38", "exp.thermistor7+exp.39"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: ["exp.pb6"],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.e2stop+exp.4", "exp.e3stop+exp.9", "exp.e4stop+exp.14", "exp.e5stop+exp.19", "exp.e6stop+exp.24"],
			[PortType.gpOut]: ["pson"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod", "exp.heater3+exp.8", "exp.heater4+exp.13", "exp.heater5+exp.18", "exp.heater6+exp.23", "exp.heater7+exp.31"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp"],
			[PortType.uart]: ["usb", "urxd0+utxd0"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.DueX5,
			ExpansionBoardType.Duet2ExpansionBreakout,
			ExpansionBoardType.DueX2
		])
	},
	[BoardType.Duet2Maestro]: {
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 1200,
		motorMaxCurrent: 1600,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			firmwareFileName: "DuetMaestroFirmware.bin",
			iapFileNameSD: "Duet2_SDiap32_Maestro.bin",
			maxHeaters: 4,
			maxMotors: 7,
			name: "Duet 2 Maestro",
			shortName: "2Maestro",
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 6,
			axesPlusExtruders: 7,
			bedHeaters: 2,
			boards: 1,
			chamberHeaters: 2,
			drivers: 7,
			driversPerAxis: 4,
			extruders: 4,
			extrudersPerTool: 4,
			fans: 6,
			gpInPorts: 10,
			gpOutPorts: 10,
			heaters: 4,
			heatersPerTool: 2,
			monitorsPerHeater: 3,
			restorePoints: 6,
			sensors: 32,
			spindles: 2,
			tools: 50,
			trackedObjects: 20,
			triggers: 16,
			volumes: 2,
			workplaces: 9,
			zProbeProgramBytes: 8,
			zProbes: 2
		}),
		objectModelNetworkInterfaces: [
			initObject(NetworkInterface, {
				type: NetworkInterfaceType.lan
			})
		],

		ports: {
			[PortType.analogIn]: ["zprobe.in"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.pa21", "exp.pa22", "exp.pa3+twd0", "exp.pa4+twck0"],
			[PortType.gpOut]: ["pson", "exp.pa21", "exp.pa22", "exp.pa3", "exp.pa4"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod+servo"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp", "ctemp"],
			[PortType.uart]: ["usb", "urxd+utxf"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.Duet2Maestro2Plus
		])
	}
}

/**
 * Get the supported board from a config model object
 * @param model Config model object
 * @returns Board type or null if not found
 */
export function getBoardDefinition(model: ConfigModel): BoardDescriptor | null {
	if (model.boards.length > 0) {
		const shortName = model.boards[0].shortName;
		for (let boardType of Object.values(BoardType)) {
			const board = Boards[boardType];
			if (shortName === board.objectModelBoard.shortName) {
				return board;
			}
		}
	}
	return null;
}

/**
 * Get the supported board type from a config model object
 * @param model Config model object
 * @returns Board type or null if not found
 */
export function getBoardType(model: ConfigModel): BoardType | null {
	if (model.boards.length > 0) {
		// Get boards that match the short name
		const matches = [];
		const shortName = model.boards[0].shortName;
		for (let [key, value] of Object.entries(Boards)) {
			if (shortName === value.objectModelBoard.shortName) {
				matches.push({ key, value });
			}
		}

		// It is obvious which board it is in case there is only one matching board
		if (matches.length === 1) {
			return matches[0].key as BoardType;
		}

		// If we have more than one match, check the SBC and network connectivity as well
		if (matches.length > 0) {
			// Try to find the SBC variant if running in SBC mode
			if (model.state.dsfVersion !== null) {
				const sbcMatch = matches.find(({ value }) => value.objectModelBoard.shortName.includes("SBC"));
				if (sbcMatch) {
					return sbcMatch.key as BoardType;
				}
			}

			// If there is at least one active network interface, check which candidate matches it
			// FIXME For Duet 3 Mini we cannot determine if it is a WiFi or Ethernet board in SBC mode...
			if (model.network.interfaces.length > 0) {
				const netType = model.network.interfaces[0].type;
				const netMatch = matches.find(({ value }) => value.objectModelNetworkInterfaces.length > 0 && value.objectModelNetworkInterfaces[0].type === netType);
				if (netMatch) {
					return netMatch.key as BoardType;
				}
			}

			// Default to the first item if no definite match could be found
			return matches[0].key as BoardType;
		}
	}
	return null;
}
