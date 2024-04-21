import { Board, initObject, Limits, MinMaxCurrent, Network, NetworkInterface, NetworkInterfaceType } from "@duet3d/objectmodel";

import { PortType, type BaseBoardDescriptor } from "@/store/BaseBoard";
import { ExpansionBoardType } from "@/store/ExpansionBoards";
import { type STMBoard, type STMBoardDescriptor, STMBoardTypes, STM32F4BoardType, STM32H723BoardType, STM32H743BoardType } from "@/store/STMBoard";

import type ConfigModel from "@/store/model";
import type { StoreState } from "pinia";

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
	Duet2SBC = "Duet 2 SBC (unofficial mod)",
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
	displayDotstarPort: string | null;
	expansionBoards: Set<ExpansionBoardType>;
	objectModelLimits: Limits;
	objectModelNetworkInterfaces: Array<NetworkInterface>;
	supportsBME280: boolean;
}

export type BoardTypes = BoardType | STMBoardTypes
export const BoardTypes = {...BoardType, ...STMBoardTypes};
export type BoardDescriptors = BoardDescriptor | STMBoardDescriptor

/**
 * Descriptors for supported main boards
 */
export const Boards: Record<BoardTypes, BoardDescriptors> = {
	[BoardType.Duet3Mini5PlusEthernet]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasStealthChop: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["io2.in"],
			[PortType.fan]: ["out2", "out3", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out2.tach", "out3.tach", "out4.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.pwm]: ["io0.out", "io2.out", "io3.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2"],
			[PortType.uart]: ["usb", "io0.in+io0.out"]
		},

		displayDotstarPort: "io3.out",
		expansionBoards: new Set([
			ExpansionBoardType.Duet3Mini2Plus
		]),
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
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true
	},
	[BoardType.Duet3Mini5PlusWiFi]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasStealthChop: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["io2.in"],
			[PortType.fan]: ["out2", "out3", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out2.tach", "out3.tach", "out4.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.gpOut]: ["io0.in", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.pwm]: ["io0.out", "io2.out", "io3.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2"],
			[PortType.uart]: ["usb", "io0.in+io0.out"]
		},

		displayDotstarPort: "io3.out",
		expansionBoards: new Set([
			ExpansionBoardType.Duet3Mini2Plus
		]),
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
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true
	},
	[BoardType.Duet3MB6HC]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasStealthChop: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 4000,
		motorMaxCurrent: 6000,
		minVoltage: 11,
		maxVoltage: 32,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in", "spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "led", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.uart]: ["usb", "io0.in+io0.out", "io1.in+io1.out"]
		},

		displayDotstarPort: null,
		expansionBoards: new Set(),
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
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 3,
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
		supportsAccelerometer: true,
		supportsBME280: true
	},
	[BoardType.Duet3MB6XD]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: false,
		hasStealthChop: true,
		hasVrefMonitor: true,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 11,
		maxVoltage: 30,
		numDrivers: 6,
		microstepInterpolations: [],
		ports: {
			[PortType.analogIn]: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in", "spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "led", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.uart]: ["usb", "io0.in+io0.out", "io1.in+io1.out"]
		},

		displayDotstarPort: null,
		expansionBoards: new Set(),
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
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 3,
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
		supportsAccelerometer: true,
		supportsBME280: true
	},
	[BoardType.Duet2Ethernet]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasStealthChop: false,
		hasVrefMonitor: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],
		ports: {
			[PortType.analogIn]: ["zprobe.in", "exp.thermistor3+exp.35", "exp.thermistor4+exp.36", "exp.thermistor5+exp.37", "exp.thermistor6+exp.38", "exp.thermistor7+exp.39"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: ["exp.pb6"],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.e2stop+exp.4", "exp.e3stop+exp.9", "exp.e4stop+exp.14", "exp.e5stop+exp.19", "exp.e6stop+exp.24"],
			[PortType.gpInInterrupt]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.gpOut]: ["zprobe.mod", "pson"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod", "exp.heater3+exp.8", "exp.heater4+exp.13", "exp.heater5+exp.18", "exp.heater6+exp.23", "exp.heater7+exp.31"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp"],
			[PortType.uart]: ["usb", "urxd0+utxd0"]
		},

		displayDotstarPort: null,
		expansionBoards: new Set([
			ExpansionBoardType.DueX5,
			ExpansionBoardType.Duet2ExpansionBreakout,
			ExpansionBoardType.DueX2
		]),
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
			ledStrips: 2,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: false
	},
	[BoardType.Duet2WiFi]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasStealthChop: false,
		hasVrefMonitor: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],
		ports: {
			[PortType.analogIn]: ["zprobe.in", "exp.thermistor3+exp.35", "exp.thermistor4+exp.36", "exp.thermistor5+exp.37", "exp.thermistor6+exp.38", "exp.thermistor7+exp.39"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: ["exp.pb6"],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.e2stop+exp.4", "exp.e3stop+exp.9", "exp.e4stop+exp.14", "exp.e5stop+exp.19", "exp.e6stop+exp.24"],
			[PortType.gpInInterrupt]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.gpOut]: ["pson"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod", "exp.heater3+exp.8", "exp.heater4+exp.13", "exp.heater5+exp.18", "exp.heater6+exp.23", "exp.heater7+exp.31"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp"],
			[PortType.uart]: ["usb", "urxd0+utxd0"]
		},

		displayDotstarPort: null,
		expansionBoards: new Set([
			ExpansionBoardType.DueX5,
			ExpansionBoardType.Duet2ExpansionBreakout,
			ExpansionBoardType.DueX2
		]),
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
			ledStrips: 2,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: false
	},
	[BoardType.Duet2SBC]: {
		displayDotstarPort: null,
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasStealthChop: false,
		hasVrefMonitor: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],
		ports: {
			[PortType.analogIn]: ["zprobe.in", "exp.thermistor3+exp.35", "exp.thermistor4+exp.36", "exp.thermistor5+exp.37", "exp.thermistor6+exp.38", "exp.thermistor7+exp.39"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: ["exp.pb6"],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.e2stop+exp.4", "exp.e3stop+exp.9", "exp.e4stop+exp.14", "exp.e5stop+exp.19", "exp.e6stop+exp.24"],
			[PortType.gpInInterrupt]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.gpOut]: ["pson"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod", "exp.heater3+exp.8", "exp.heater4+exp.13", "exp.heater5+exp.18", "exp.heater6+exp.23", "exp.heater7+exp.31"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4", "spi.cs5+exp.50", "spi.cs6+exp.9", "spi.cs7+exp.14", "spi.cs8+exp.19"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp"],
			[PortType.uart]: ["usb", "urxd0+utxd0"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.DueX5,
			ExpansionBoardType.Duet2ExpansionBreakout,
			ExpansionBoardType.DueX2
		]),
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
			ledStrips: 2,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: false
	},
	[BoardType.Duet2Maestro]: {
		displayDotstarPort: null,
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasStealthChop: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1200,
		motorMaxCurrent: 1600,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["zprobe.in"],
			[PortType.fan]: ["fan0", "fan1", "fan2"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "e0stop", "e1stop", "exp.pa21", "exp.pa22", "exp.pa3+twd0", "exp.pa4+twck0"],
			[PortType.gpInInterrupt]: ["spi.cs1", "spi.cs2"],
			[PortType.gpOut]: ["pson", "exp.pa21", "exp.pa22", "exp.pa3", "exp.pa4"],
			[PortType.heater]: ["bedheat", "e0heat", "e1heat"],
			[PortType.pwm]: ["zprobe.mod+servo"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2"],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp", "ctemp"],
			[PortType.uart]: ["usb", "urxd+utxd"]
		},

		expansionBoards: new Set([
			ExpansionBoardType.Duet2Maestro2Plus
		]),
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
			ledStrips: 2,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: false
	},
	[STM32F4BoardType.BTT_GTR_V1]: {  // FIXME: Set the correct definition values
		displayDotstarPort: null,
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["probe"],
			[PortType.fan]: ["fan0", "fan1", "fan2", "laser"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax"],
			[PortType.gpInInterrupt]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax", "probe"],
			[PortType.gpOut]: [],
			[PortType.heater]: ["bed", "e0heat", "e1heat", "e2heat"],
			[PortType.pwm]: ["servo", "laser"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp", "e2temp"],
			[PortType.uart]: []
		},

		expansionBoards: new Set(),
		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "firmware-stm32f4-wifi",
			iapFileNameSBC: "",
			iapFileNameSD: "",
			maxHeaters: 32,
			maxMotors: 7,
			name: "biqugtr_1.0",
			shortName: "stm32f4-biqugtr_1.0",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 15,
			bedHeaters: 4,
			boards: 21,
			chamberHeaters: 4,
			drivers: 34,
			driversPerAxis: 4,
			extruders: 14,
			extrudersPerTool: 8,
			fans: 32,
			gpInPorts: 56,
			gpOutPorts: 62,
			heaters: 32,
			heatersPerTool: 4,
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true,
		stm: <STMBoard> {
			board: 'biqugtr_1.0',
			statusPin: null,
			type: 'STM32F4',
			blPorts: ['servo0'],
			esp8266: {
				onboard: false,
				module: true,
				dataReadyPin: 'PE_10',
				tfrReadyPin: 'PE_12',
				resetPin: 'PE_11',
				csPin: null,
				rxPin: 'PD_9',
				txPin: 'PD_8',
				firmware: 'DuetWiFiServer-esp8266-stm32',
			},
			esp32: {
				onboard: false,
				module: true,
				dataReadyPin: null,
				tfrReadyPin: null,
				resetPin: null,
				csPin: null,
				rxPin: null,
				txPin: null,
				firmware: null,
			},
			sbc: {
				support: true,
				onboard: false,
				firmware: null,
				tfrReadyPin: 'PB_10',
			},
			firmwareStandaloneFile: 'firmware-stm32f4-wifi',
			stepper: {
				driverType: null,
				spiChannel: null,
				spiPins: null,
				tmcDiagPins: ['PC_7', 'PC_6', 'PD_11', 'PD_10', 'PB_10', 'PB_11'],
			},
			screen: {
				auxRX: 'PA_10',
				auxTX: 'PA_9',
			},
			serialAmount: 2,
			neopixel: 'PD_15',
		}
	},
	[STM32F4BoardType.Fly_CDYv2]: {
		displayDotstarPort: null,
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["probe"],
			[PortType.fan]: ["fan0", "fan1", "fan2", "laser"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax"],
			[PortType.gpInInterrupt]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax", "probe"],
			[PortType.gpOut]: [],
			[PortType.heater]: ["bed", "e0heat", "e1heat", "e2heat"],
			[PortType.pwm]: ["servo", "laser"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp", "e2temp"],
			[PortType.uart]: []
		},

		expansionBoards: new Set(),
		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "firmware-stm32f4-wifi",
			iapFileNameSBC: "",
			iapFileNameSD: "",
			maxHeaters: 32,
			maxMotors: 7,
			name: "Fly-CDYv2",
			shortName: "stm32f4-fly-cdyv2",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 15,
			bedHeaters: 4,
			boards: 21,
			chamberHeaters: 4,
			drivers: 34,
			driversPerAxis: 4,
			extruders: 14,
			extrudersPerTool: 8,
			fans: 32,
			gpInPorts: 56,
			gpOutPorts: 62,
			heaters: 32,
			heatersPerTool: 4,
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true,
		stm: <STMBoard> {
			board: 'fly_cdyv2',
			statusPin: null,
			type: 'STM32F4',
			esp8266: {
				onboard: true,
				module: false,
				dataReadyPin: 'PE_10',
				tfrReadyPin: 'PE_12',
				resetPin: 'PE_11',
				csPin: null,
				rxPin: 'PD_9',
				txPin: 'PD_8',
				firmware: 'DuetWiFiServer-esp8266-stm32',
			},
			esp32: {
				onboard: false,
				module: false,
				dataReadyPin: null,
				tfrReadyPin: null,
				resetPin: null,
				csPin: null,
				rxPin: null,
				txPin: null,
				firmware: null,
			},
			sbc: {
				support: false,
				onboard: false,
				firmware: null,
			},
			firmwareStandaloneFile: 'firmware-stm32f4-wifi',
			stepper: {
				driverType: null,
				spiChannel: 2,
				spiPins: null,
				tmcDiagPins: ['PC_7', 'PC_6', 'PD_11', 'PD_10', 'PB_10', 'PB_11'],
			},
			screen: {
				auxRX: 'PA_10',
				auxTX: 'PA_9',
			},
			serialAmount: 2,
			neopixel: 'PD_15',
		}
	},
	[STM32F4BoardType.Fly_CDYv3]: {
		displayDotstarPort: null,
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["probe"],
			[PortType.fan]: ["fan0", "fan1", "fan2", "laser"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax"],
			[PortType.gpInInterrupt]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax", "probe"],
			[PortType.gpOut]: [],
			[PortType.heater]: ["bed", "e0heat", "e1heat", "e2heat"],
			[PortType.pwm]: ["servo", "laser"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["bedtemp", "e0temp", "e1temp", "e2temp"],
			[PortType.uart]: []
		},

		expansionBoards: new Set(),
		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "firmware-stm32f4-wifi",
			iapFileNameSBC: "",
			iapFileNameSD: "",
			maxHeaters: 32,
			maxMotors: 7,
			name: "Fly-CDYv3",
			shortName: "stm32f4-fly-cdyv3",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 15,
			bedHeaters: 4,
			boards: 21,
			chamberHeaters: 4,
			drivers: 34,
			driversPerAxis: 4,
			extruders: 14,
			extrudersPerTool: 8,
			fans: 32,
			gpInPorts: 56,
			gpOutPorts: 62,
			heaters: 32,
			heatersPerTool: 4,
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true,
		stm: <STMBoard> {
			board: 'fly_cdyv3',
			statusPin: null,
			type: 'STM32F4',
			esp8266: {
				onboard: false,
				module: false,
				dataReadyPin: null,
				tfrReadyPin: null,
				resetPin: null,
				csPin: null,
				rxPin: null,
				txPin: null,
				firmware: null,
			},
			esp32: {
				onboard: true,
				module: false,
				dataReadyPin: 'PE_10',
				tfrReadyPin: 'PE_12',
				resetPin: 'PE_11',
				csPin: null,
				rxPin: 'PD_9',
				txPin: 'PD_8',
				firmware: 'DuetWiFiServer-esp32-stm32',
			},
			sbc: {
				support: false,
				onboard: false,
				firmware: null,
			},
			firmwareStandaloneFile: 'firmware-stm32f4-wifi',
			stepper: {
				driverType: null,
				spiChannel: 2,
				spiPins: null,
				tmcDiagPins: ['PC_7', 'PC_6', 'PD_11', 'PD_10', 'PB_10', 'PB_11'],
			},
			screen: {
				auxRX: 'PA_10',
				auxTX: 'PA_9',
			},
			serialAmount: 2,
			neopixel: 'PD_15',
		}
	},
	[STM32F4BoardType.Fly_E3]: {
		displayDotstarPort: null,
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["probe"],
			[PortType.fan]: ["fan0", "fan1"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["xstop", "ystop", "zstop", "probe"],
			[PortType.gpInInterrupt]: ["xstop", "ystop", "zstop", "probe"],
			[PortType.gpOut]: [],
			[PortType.heater]: ["bed", "e0heat"],
			[PortType.pwm]: ["servo"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["bedtemp", "e0temp"],
			[PortType.uart]: []
		},

		expansionBoards: new Set(),
		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "firmware-stm32f4-wifi",
			iapFileNameSBC: "",
			iapFileNameSD: "",
			maxHeaters: 32,
			maxMotors: 7,
			name: "Fly-E3",
			shortName: "stm32f4-fly-e3",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 15,
			bedHeaters: 4,
			boards: 21,
			chamberHeaters: 4,
			drivers: 34,
			driversPerAxis: 4,
			extruders: 14,
			extrudersPerTool: 8,
			fans: 32,
			gpInPorts: 56,
			gpOutPorts: 62,
			heaters: 32,
			heatersPerTool: 4,
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true,
		stm: <STMBoard> {
			board: 'fly_e3',
			statusPin: null,
			type: 'STM32F4',
			esp8266: {
				onboard: true,
				module: false,
				dataReadyPin: 'PE_13',
				tfrReadyPin: 'PE_14',
				resetPin: 'PE_15',
				csPin: null,
				rxPin: 'PD_9',
				txPin: 'PD_8',
				firmware: 'DuetWiFiServer-esp8266-stm32',
			},
			esp32: {
				onboard: false,
				module: false,
				dataReadyPin: null,
				tfrReadyPin: null,
				resetPin: null,
				csPin: null,
				rxPin: null,
				txPin: null,
				firmware: null,
			},
			sbc: {
				support: false,
				onboard: false,
				firmware: null,
			},
			firmwareStandaloneFile: 'firmware-stm32f4-wifi',
			stepper: {
				driverType: null,
				spiChannel: 2,
				spiPins: null,
				tmcDiagPins: ['PA_2', 'PA_1', 'PC_5'],
			},
			screen: {
				auxRX: 'PA_10',
				auxTX: 'PA_9',
			},
			serialAmount: 2,
			neopixel: null,
		}
	},
	[STM32H723BoardType.Fly_Super8Pro_H723]: {  // FIXME: Set the correct definition values
		displayDotstarPort: null,
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 8,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["probe"],
			[PortType.fan]: ["fan0", "fan1", "fan2", "fan3", "fan4", "fan5", "fan6", "fan7", "fan8", "fan9"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["io0", "io1", "io2", "io3", "io4", "io5", "io6", "in7", "probe"],
			[PortType.gpInInterrupt]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax", "probe"],
			[PortType.gpOut]: ["out0", "out1", "out2", "out3", "out4"],
			[PortType.heater]: ["bed", "heat0", "heat1", "heat2", "heat3", "heat4"],
			[PortType.pwm]: ["servo", "pwm1", "pwm2"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["ADC0", "ADC1", "ADC2", "ADC3", "ADC4", "ADC5"],
			[PortType.uart]: []
		},

		expansionBoards: new Set(),
		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "firmware-stm32h7-wifi",
			iapFileNameSBC: "",
			iapFileNameSD: "",
			maxHeaters: 32,
			maxMotors: 7,
			name: "fly_super8h7",
			shortName: "stm32h723-fly-super8pro",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 15,
			bedHeaters: 4,
			boards: 21,
			chamberHeaters: 4,
			drivers: 34,
			driversPerAxis: 4,
			extruders: 14,
			extrudersPerTool: 8,
			fans: 32,
			gpInPorts: 56,
			gpOutPorts: 62,
			heaters: 32,
			heatersPerTool: 4,
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true,
		stm: <STMBoard> {
			board: 'fly_super8h7',
			statusPin: null,
			type: 'STM32H7',
			esp8266: {
				onboard: false,
				module: false,
				dataReadyPin: null,
				tfrReadyPin: null,
				resetPin: null,
				csPin: null,
				rxPin: null,
				txPin: null,
				firmware: null,
			},
			esp32: {
				onboard: true,
				module: false,
				dataReadyPin: 'PD_13',
				tfrReadyPin: 'PD_11',
				resetPin: 'PD_10',
				csPin: null,
				rxPin: 'PD_9',
				txPin: 'PD_8',
				firmware: 'DuetWiFiServer-esp32-stm32',
			},
			sbc: {
				support: false,
				onboard: false,
				firmware: null,
			},
			firmwareStandaloneFile: 'firmware-stm32h7-wifi',
			stepper: {
				driverType: null,
				spiChannel: 2,
				spiPins: null,
				tmcDiagPins: [`PG_12`, `PG_11`, `PG_10`, `PG_9`, `PD_7`, `PD_6`, `PA_8`, `PF_3`],
			},
			screen: {
				auxRX: 'PA_10',
				auxTX: 'PA_9',
			},
			serialAmount: 2,
			neopixel: 'PF_8',
		}
	},
	[STM32H743BoardType.Fly_Super8Pro_H743]: {  // FIXME: Set the correct definition values
		displayDotstarPort: null,
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 8,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		ports: {
			[PortType.analogIn]: ["probe"],
			[PortType.fan]: ["fan0", "fan1", "fan2", "fan3", "fan4", "fan5", "fan6", "fan7", "fan8", "fan9"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["io0", "io1", "io2", "io3", "io4", "io5", "io6", "in7", "probe"],
			[PortType.gpInInterrupt]: ["xmin", "xmax", "ymin", "ymax", "zmin", "zmax", "probe"],
			[PortType.gpOut]: ["out0", "out1", "out2", "out3", "out4"],
			[PortType.heater]: ["bed", "heat0", "heat1", "heat2", "heat3", "heat4"],
			[PortType.pwm]: ["servo", "pwm1", "pwm2"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["ADC0", "ADC1", "ADC2", "ADC3", "ADC4", "ADC5"],
			[PortType.uart]: []
		},

		expansionBoards: new Set(),
		objectModelBoard: initObject(Board, {
			canAddress: 0,
			firmwareFileName: "firmware-stm32h7-wifi",
			iapFileNameSBC: "",
			iapFileNameSD: "",
			maxHeaters: 32,
			maxMotors: 7,
			name: "fly_super8h7",
			shortName: "stm32h743-fly-super8pro",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent()
		}),
		objectModelLimits: initObject(Limits, {
			axes: 15,
			axesPlusExtruders: 15,
			bedHeaters: 4,
			boards: 21,
			chamberHeaters: 4,
			drivers: 34,
			driversPerAxis: 4,
			extruders: 14,
			extrudersPerTool: 8,
			fans: 32,
			gpInPorts: 56,
			gpOutPorts: 62,
			heaters: 32,
			heatersPerTool: 4,
			ledStrips: 5,
			monitorsPerHeater: 3,
			portsPerHeater: 2,
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
		supportsAccelerometer: true,
		supportsBME280: true,
		stm: <STMBoard> {
			board: 'fly_super8h7',
			statusPin: null,
			type: 'STM32H7',
			esp8266: {
				onboard: false,
				module: false,
				dataReadyPin: null,
				tfrReadyPin: null,
				resetPin: null,
				csPin: null,
				rxPin: null,
				txPin: null,
				firmware: null,
			},
			esp32: {
				onboard: true,
				module: false,
				dataReadyPin: 'PD_13',
				tfrReadyPin: 'PD_11',
				resetPin: 'PD_10',
				csPin: null,
				rxPin: 'PD_9',
				txPin: 'PD_8',
				firmware: 'DuetWiFiServer-esp32-stm32',
			},
			sbc: {
				support: false,
				onboard: false,
				firmware: null,
			},
			firmwareStandaloneFile: 'firmware-stm32h7-wifi',
			stepper: {
				driverType: null,
				spiChannel: 2,
				spiPins: null,
				tmcDiagPins: [`PG_12`, `PG_11`, `PG_10`, `PG_9`, `PD_7`, `PD_6`, `PA_8`, `PF_3`],
			},
			screen: {
				auxRX: 'PA_10',
				auxTX: 'PA_9',
			},
			serialAmount: 2,
			neopixel: 'PF_8',
		}
	}
}

/**
 * Get the supported board from a config model object
 * @param model Config model object
 * @returns Board type or null if not found
 */
export function getBoardDefinition(model: StoreState<ConfigModel>): BoardDescriptors | null {
	if (model.boards.length > 0) {
		const shortName = model.boards[0].shortName;
		for (let boardType of Object.values(BoardTypes)) {
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
export function getBoardType(model: StoreState<ConfigModel>): BoardTypes | null {
	if (model.boards.length > 0) {
		// Get boards that match the short name
		const matches = [];
		const shortName = model.boards[0].shortName;
		for (let [key, value] of Object.entries(Boards)) {
			if (shortName === value.objectModelBoard.shortName) {
				matches.push({ key, value });
			}
		}

		// It is obvious which board it is in case there is only one match
		if (matches.length === 1) {
			return matches[0].key as BoardTypes;
		}

		// If we have more than one match, check the SBC and network connectivity as well
		if (matches.length > 0) {
			// Try to find the SBC variant if running in SBC mode
			if (model.sbc !== null) {
				const sbcMatch = matches.find(({ value }) => value.objectModelBoard.shortName.includes("SBC"));
				if (sbcMatch) {
					return sbcMatch.key as BoardTypes;
				}

				// WiFi boards expose the WiFi firmware filename even in SBC mode.
				// That way, we can check if the board is a WiFi or LAN variant
				const netType = (model.boards.find(board => !!board.canAddress)?.wifiFirmwareFileName !== null) ? NetworkInterfaceType.wifi : NetworkInterfaceType.lan;
				const netMatch = matches.find(({ value }) => value.objectModelNetworkInterfaces.length > 0 && value.objectModelNetworkInterfaces[0].type === netType);
				if (netMatch) {
					return netMatch.key as BoardTypes;
				}
			} else if (model.network.interfaces.length > 0) {
				// If there is at least one active network interface, check which candidate matches it
				const netType = model.network.interfaces[0].type;
				const netMatch = matches.find(({ value }) => value.objectModelNetworkInterfaces.length > 0 && value.objectModelNetworkInterfaces[0].type === netType);
				if (netMatch) {
					return netMatch.key as BoardTypes;
				}
			}

			// Default to the first item if no definite match could be found
			return matches[0].key as BoardTypes;
		}
	}
	return null;
}
