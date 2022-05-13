import { Board, initObject } from "@duet3d/objectmodel";

import type { BaseBoardDescriptor } from "@/store/BaseBoard";

/**
 * Expansion boards supported by the config tool.
 * Multiple expansion boards require CAN connectivity
 */
export enum ExpansionBoardType {
	// Officially supported boards
	EXP3HC = "Duet 3 Expansion Board 3HC",
	EXP1XD = "Duet 3 Expansion Board 1XD",
	EXP1HCL = "Duet 3 Expansion Board 1HCL",
	TOOL1LC = "Duet 3 Tool Board",

	Mini5plus = "Duet 3 Mini 5+",
	MB6HC = "Duet 3 Main Board 6HC",
	MB6XD = "Duet 3 Main Board 6XD",

	Duet3Mini2Plus = "Duet 3 Mini 2+",                                              // virtual
	DueX5 = "DueX 5",                                                               // virtual
	Duet2ExpansionBreakout = "Duet 2 Expansion Breakout Board",                     // virtual

	// Discontinued boards
	DueX2 = "DueX 2 (discontinued)",                                                // virtual
	Duet2Maestro2Plus = "Duet 2 Maestro Dual Stepper Expansion (discontinued)",     // virtual
}

/**
 * Descriptor interface for supported expansion boards
 */
export interface ExpansionBoardDescriptor extends BaseBoardDescriptor {
	// still empty
}

/**
 * Descriptors for supported expansion boards
 */
export const ExpansionBoards: { [Property in ExpansionBoardType]: ExpansionBoardDescriptor; } = {
	[ExpansionBoardType.EXP3HC]: {
		analogInPorts: ["io0.in", "io1.in", "io2.in", "io5.in"],
		fanPorts: ["out3", "out4", "out5", "out6", "out7", "out8"],
		fanTachoPorts: ["out3.tach", "out4.tach", "out5.tach"],
		gpInPorts: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in"],
		gpOutPorts: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out"],
		heaterPorts: ["out0", "out1", "out2"],
		pwmPorts: ["io1.out", "io4.out"],
		spiCsPorts: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
		thermistorPorts: ["temp0", "temp1", "temp2"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 4000,
		motorMaxCurrent: 6000,
		minVoltage: 12,
		maxVoltage: 32,
		numDrivers: 3,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 1,
			firmwareFileName: "Duet3Firmware_EXP3HC.bin",
			maxHeaters: 3,
			maxMotors: 3,
			shortName: "EXP3HC"
		})
	},
	[ExpansionBoardType.EXP1XD]: {
		analogInPorts: ["io1.in"],
		fanPorts: ["out0", "out1"],
		fanTachoPorts: [],
		gpInPorts: ["io0.in", "io1.in", "io2.in"],
		gpOutPorts: ["io0.out", "io2.out"],
		heaterPorts: [],
		pwmPorts: ["io0.out", "io2.out"],
		spiCsPorts: [],
		thermistorPorts: ["temp0"],
		microstepInterpolations: [],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: false,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 12,
		maxVoltage: 48,
		numDrivers: 1,
		objectModelBoard: initObject(Board, {
			canAddress: 122,
			firmwareFileName: "Duet3Firmware_EXP1XD.bin",
			maxHeaters: 0,
			maxMotors: 1,
			shortName: "EXP1XD"
		})
	},
	[ExpansionBoardType.EXP1HCL]: {
		analogInPorts: [],
		fanPorts: ["out0", "out1"],
		fanTachoPorts: [],
		gpInPorts: ["io0.in", "io1.in"],
		gpOutPorts: ["io0.out", "io1.out"],
		heaterPorts: [],
		pwmPorts: ["io0.out"],
		spiCsPorts: [],
		thermistorPorts: ["temp0"],

		hasClosedLoopDrivers: true,
		hasSmartDrivers: true,
		motorWarnCurrent: 4000,
		motorMaxCurrent: 6000,
		minVoltage: 12,
		maxVoltage: 48,
		numDrivers: 1,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 123,
			firmwareFileName: "Duet3Firmware_EXP1HCL.bin",
			maxHeaters: 0,
			maxMotors: 1,
			shortName: "EXP1HCL"
		})
	},
	[ExpansionBoardType.TOOL1LC]: {
		analogInPorts: ["io0.in"],
		fanPorts: ["out1", "out2"],
		fanTachoPorts: ["out1.tach", "out2.tach"],
		gpInPorts: ["io0.in", "io1.in", "io2.in"],
		gpOutPorts: ["io0.out", "io1.out"],
		heaterPorts: ["out0"],
		pwmPorts: ["io0.out"],
		spiCsPorts: [],
		thermistorPorts: ["temp0"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 1200,
		motorMaxCurrent: 1600,
		minVoltage: 12,
		maxVoltage: 32,
		numDrivers: 1,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 121,
			firmwareFileName: "Duet3Firmware_TOOL1LC.bin",
			maxHeaters: 0,
			maxMotors: 1,
			shortName: "TOOL1LC"
		})
	},
	[ExpansionBoardType.Mini5plus]: {
		analogInPorts: ["io3.in"],
		fanPorts: ["out3", "out4", "out5", "out6+laser+vfd"],
		fanTachoPorts: ["out3.tach", "out4.tach"],
		gpInPorts: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
		gpOutPorts: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out+pson"],
		heaterPorts: ["out0", "out1", "out2"],
		pwmPorts: ["io1.out", "io2.out", "io3.out"],
		spiCsPorts: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
		thermistorPorts: ["temp0", "temp1", "temp2"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 7,          // This isn't quite right, but we don't support nested expansion boards
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 1,
			maxHeaters: 3,
			maxMotors: 5,
			name: "Duet 3 Mini 5+",
			shortName: "Mini5plus"
		})
	},
	[ExpansionBoardType.MB6HC]: {
		analogInPorts: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
		fanPorts: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
		fanTachoPorts: ["out4.tach", "out5.tach", "out6.tach"],
		gpInPorts: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
		gpOutPorts: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "pson"],
		heaterPorts: ["out0", "out1", "out2", "out3"],
		pwmPorts: ["io4.out", "io5.out", "io7.out"],
		spiCsPorts: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
		thermistorPorts: ["temp0", "temp1", "temp2", "temp3"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 4000,
		motorMaxCurrent: 6000,
		minVoltage: 11,
		maxVoltage: 32,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 1,
			maxHeaters: 3,
			maxMotors: 5,
			name: "Duet 3 MB6HC",
			shortName: "MB6HC"
		})
	},
	[ExpansionBoardType.MB6XD]: {
		analogInPorts: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
		fanPorts: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
		fanTachoPorts: ["out4.tach", "out5.tach", "out6.tach"],
		gpInPorts: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
		gpOutPorts: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "pson"],
		heaterPorts: ["out0", "out1", "out2", "out3"],
		pwmPorts: ["io4.out", "io5.out", "io7.out"],
		spiCsPorts: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
		thermistorPorts: ["temp0", "temp1", "temp2", "temp3"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: false,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 11,
		maxVoltage: 30,
		numDrivers: 6,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			canAddress: 1,
			maxHeaters: 3,
			maxMotors: 5,
			shortName: "MB6XD",
			name: "Duet 3 MB6XD",
		})
	},
	[ExpansionBoardType.Duet3Mini2Plus]: {
		analogInPorts: [],
		fanPorts: [],
		fanTachoPorts: [],
		gpInPorts: [],
		gpOutPorts: [],
		heaterPorts: [],
		pwmPorts: [],
		spiCsPorts: [],
		thermistorPorts: [],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 2,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			maxMotors: 2
		})
	},
	[ExpansionBoardType.DueX5]: {
		analogInPorts: [],
		fanPorts: [],
		fanTachoPorts: ["duex.pb6"],
		gpInPorts: ["duex.e2stop", "duex.e3stop", "duex.e4stop", "duex.e5stop", "duex.e6stop", "duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
		gpOutPorts: ["duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
		heaterPorts: ["duex.e2heat", "duex.e3heat", "duex.e4heat", "duex.e5heat", "duex.e6heat"],
		pwmPorts: ["duex.pwm1", "duex.pwm2", "duex.pwm3", "duex.pwm4", "duex.pwm5"],
		spiCsPorts: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
		thermistorPorts: ["duex.e2temp", "duex.e3temp", "duex.e4temp", "duex.e5temp", "duex.e6temp"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],

		objectModelBoard: initObject(Board, {
			maxHeaters: 5,
			maxMotors: 5
		})
	},
	[ExpansionBoardType.Duet2ExpansionBreakout]: {
		analogInPorts: [],
		fanPorts: [],
		fanTachoPorts: ["duex.pb6"],
		gpInPorts: ["duex.e2stop", "duex.e3stop", "duex.e4stop", "duex.e5stop", "duex.e6stop", "duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
		gpOutPorts: ["duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
		heaterPorts: ["duex.e2heat", "duex.e3heat", "duex.e4heat", "duex.e5heat", "duex.e6heat"],
		pwmPorts: ["duex.pwm1", "duex.pwm2", "duex.pwm3", "duex.pwm4", "duex.pwm5"],
		spiCsPorts: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
		thermistorPorts: ["duex.e2temp", "duex.e3temp", "duex.e4temp", "duex.e5temp", "duex.e6temp"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: false,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [],

		objectModelBoard: initObject(Board, {
			maxHeaters: 5,
			maxMotors: 5
		})
	},
	[ExpansionBoardType.DueX2]: {
		analogInPorts: [],
		fanPorts: [],
		fanTachoPorts: ["duex.pb6"],
		gpInPorts: ["duex.e2stop", "duex.e3stop", "duex.e4stop", "duex.e5stop", "duex.e6stop", "duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
		gpOutPorts: ["duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
		heaterPorts: ["duex.e2heat", "duex.e3heat", "duex.e4heat", "duex.e5heat", "duex.e6heat"],
		pwmPorts: ["duex.pwm1", "duex.pwm2", "duex.pwm3", "duex.pwm4", "duex.pwm5"],
		spiCsPorts: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
		thermistorPorts: ["duex.e2temp", "duex.e3temp", "duex.e4temp", "duex.e5temp", "duex.e6temp"],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 2,
		microstepInterpolations: [],

		objectModelBoard: initObject(Board, {
			maxHeaters: 5,
			maxMotors: 2
		})
	},
	[ExpansionBoardType.Duet2Maestro2Plus]: {
		analogInPorts: [],
		fanPorts: [],
		fanTachoPorts: [],
		gpInPorts: [],
		gpOutPorts: [],
		heaterPorts: [],
		pwmPorts: [],
		spiCsPorts: [],
		thermistorPorts: [],

		hasClosedLoopDrivers: false,
		hasSmartDrivers: true,
		motorWarnCurrent: 1200,
		motorMaxCurrent: 1600,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 2,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],

		objectModelBoard: initObject(Board, {
			maxMotors: 2
		})
	},
}

/**
 * Try to get the expansion board definition from a (CAN-connected) expansion board
 * @param board Expansion board instance
 * @returns Expansion board definition or null if not found
 */
export function getExpansionBoardDefinition(board: Board): ExpansionBoardDescriptor | null {
	for (let expansionBoardType of Object.values(ExpansionBoardType)) {
		const expansionBoard = ExpansionBoards[expansionBoardType];
		if (board.shortName === expansionBoard.objectModelBoard.shortName) {
			return expansionBoard;
		}
	}
	return null;
}
