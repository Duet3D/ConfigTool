import { initObject, Limits, MainBoard, MinMaxCurrent, NetworkInterface, NetworkInterfaceType } from "@duet3d/objectmodel";

import { PortType, type BaseBoardDescriptor } from "@/store/BaseBoard";
import { ExpansionBoardType } from "@/store/ExpansionBoards";

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
	Duet3MB6XD = "Duet 3 Main Board 6XD"
}

/**
 * Boards no longer supported by the config tool
 */
export enum UnsupportedBoardType {
	Duet2Ethernet = "Duet 2 Ethernet (RRF 3.6 or older)",
	Duet2WiFi = "Duet 2 WiFi (RRF 3.6 or older)",
	Duet2SBC = "Duet 2 SBC (RRF 3.6 or older)",
	Duet2Maestro = "Duet 2 Maestro (RRF 3.6 or older)",
	Duet06 = "Duet 0.6",
	Duet085 = "Duet 0.8.5"
}

/**
 * Descriptor interface for supported main boards
 */
export interface BoardDescriptor extends BaseBoardDescriptor {
	displayDotstarPort: string | null;
	expansionBoards: Set<ExpansionBoardType>;
	objectModelBoard: MainBoard;
	objectModelLimits: Limits;
	objectModelNetworkInterfaces: Array<NetworkInterface>;
	supportsBME280: boolean;
	supportsADS131: boolean;
}

/**
 * Descriptors for supported main boards
 */
export const Boards: Record<BoardType, BoardDescriptor> = {
	[BoardType.Duet3Mini5PlusEthernet]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasMcuTempSensor: true,
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
			[PortType.analogIn]: ["io3.in", "io6.in"],
			[PortType.fan]: ["out3", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out3.tach", "out4.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "spi.cs1", "spi.cs2"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.loadCell]: [],
			[PortType.pwm]: ["io1.out", "io2.out", "io3.out"],
			[PortType.scanning]: [],
			[PortType.spi]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2"],
			[PortType.thermopile]: [],
			[PortType.uart]: ["usb", "usb2", "io0.in+io0.out"]
		},

		displayDotstarPort: "io3.out",
		expansionBoards: new Set([
			ExpansionBoardType.Duet3Mini2Plus,
			ExpansionBoardType.Duet3Mini2XD
		]),
		objectModelBoard: initObject(MainBoard, {
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
				type: NetworkInterfaceType.ethernet
			})
		],
		supportsAccelerometer: true,
		supportsBME280: true,
		supportsADS131: true
	},
	[BoardType.Duet3Mini5PlusWiFi]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasMcuTempSensor: true,
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
			[PortType.analogIn]: ["io3.in", "io6.in"],
			[PortType.fan]: ["out3", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out3.tach", "out4.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "spi.cs1", "spi.cs2"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.loadCell]: [],
			[PortType.pwm]: ["io1.out", "io2.out", "io3.out"],
			[PortType.scanning]: [],
			[PortType.spi]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2"],
			[PortType.thermopile]: [],
			[PortType.uart]: ["usb", "usb2", "io0.in+io0.out"]
		},

		displayDotstarPort: "io3.out",
		expansionBoards: new Set([
			ExpansionBoardType.Duet3Mini2Plus,
			ExpansionBoardType.Duet3Mini2XD
		]),
		objectModelBoard: initObject(MainBoard, {
			canAddress: 0,
			firmwareFileName: "Duet3Firmware_Mini5plus.uf2",
			iapFileNameSBC: "Duet3_SBCiap32_Mini5plus.bin",
			iapFileNameSD: "Duet3_SDiap32_Mini5plus.bin",
			maxHeaters: 32,
			maxMotors: 7,
			name: "Duet 3 Mini 5+",
			shortName: "Mini5plus",
			supportsDirectDisplay: true,
			vIn: new MinMaxCurrent(),
			wifiFirmwareFileName: "DuetWiFiModule_32S3.bin"
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
		supportsBME280: true,
		supportsADS131: true
	},
	[BoardType.Duet3MB6HC]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasMcuTempSensor: true,
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
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in", "spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "led", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.loadCell]: [],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.scanning]: [],
			[PortType.spi]: ["led"],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.thermopile]: [],
			[PortType.uart]: ["usb", "usb2", "io0.in+io0.out", "io1.in+io1.out"]
		},

		displayDotstarPort: null,
		expansionBoards: new Set(),
		objectModelBoard: initObject(MainBoard, {
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
				type: NetworkInterfaceType.ethernet
			})
		],
		supportsAccelerometer: true,
		supportsBME280: true,
		supportsADS131: true
	},
	[BoardType.Duet3MB6XD]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasMcuTempSensor: true,
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
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "laser+vfd"],
			[PortType.fanTacho]: ["out3.tach", "out4.tach", "out5.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in", "spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "led", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.loadCell]: [],
			[PortType.pwm]: ["io4.out", "io7.out", "laser+vfd"],
			[PortType.scanning]: [],
			[PortType.spi]: ["led"],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3", "spi.cs4"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.thermopile]: [],
			[PortType.uart]: ["usb", "usb2", "io0.in+io0.out", "io1.in+io1.out"]
		},

		displayDotstarPort: null,
		expansionBoards: new Set(),
		objectModelBoard: initObject(MainBoard, {
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
				type: NetworkInterfaceType.ethernet
			})
		],
		supportsAccelerometer: true,
		supportsBME280: true,
		supportsADS131: true
	}
}

/**
 * Get the supported board from a config model object
 * @param model Config model object
 * @returns Board type or null if not found
 */
export function getBoardDefinition(model: StoreState<ConfigModel>): BoardDescriptor | null {
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

		// It is obvious which board it is in case there is only one match
		if (matches.length === 1) {
			return matches[0].key as BoardType;
		}

		// If we have more than one match, check the SBC and network connectivity as well
		if (matches.length > 0) {
			// WiFi boards expose the WiFi firmware filename even in SBC mode.
			// That way, we can check if the board is a WiFi or LAN variant
			if (model.sbc !== null) {
				const netType = (model.mainBoard!.wifiFirmwareFileName !== null) ? NetworkInterfaceType.wifi : NetworkInterfaceType.ethernet;
				const netMatch = matches.find(({ value }) => value.objectModelNetworkInterfaces.length > 0 && value.objectModelNetworkInterfaces[0].type === netType);
				if (netMatch) {
					return netMatch.key as BoardType;
				}
			} else if (model.network.interfaces.length > 0) {
				// If there is at least one active network interface, check which candidate matches it
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
