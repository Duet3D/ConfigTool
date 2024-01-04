import { Board, initObject } from "@duet3d/objectmodel";

import { PortType, type BaseBoardDescriptor } from "@/store/BaseBoard";

/**
 * Expansion boards supported by the config tool.
 * Multiple expansion boards require CAN connectivity
 */
export enum ExpansionBoardType {
	// Officially supported boards
	EXP3HC = "Duet 3 Expansion Board 3HC",
	EXP1XD = "Duet 3 Expansion Board 1XD",
	EXP1HCL = "Duet 3 Expansion Board 1HCL",

	M23CL = "Duet 3 Motor 23CL",

	TOOL1LC = "Duet 3 Tool Board 1LC",
	TOOL1RR = "Duet 3 Roto Tool Board",
	SZP = "Duet 3 Scanning Z-Probe Board",

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
	hasBuiltInAccelerometer: boolean;
}

/**
 * Descriptors for supported expansion boards
 */
export const ExpansionBoards: Record<ExpansionBoardType, ExpansionBoardDescriptor> = {
	[ExpansionBoardType.EXP3HC]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
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
		}),
		ports: {
			[PortType.analogIn]: ["io1.in", "io1.in", "io2.in", "io5.in"],
			[PortType.fan]: ["out2", "out4", "out5", "out6", "out7", "out8"],
			[PortType.fanTacho]: ["out2.tach", "out4.tach", "out5.tach"],
			[PortType.gpIn]: ["io1.in", "io2.in", "io3.in", "io4.in", "io5.in"],
			[PortType.gpInInterrupt]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.gpOut]: ["io1.out", "io2.out", "io3.out", "io4.out", "io5.out"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.pwm]: ["io0.out", "io4.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2"],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.EXP1XD]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: false,
		hasVrefMonitor: false,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 12,
		maxVoltage: 48,
		numDrivers: 1,
		microstepInterpolations: [],
		objectModelBoard: initObject(Board, {
			canAddress: 122,
			firmwareFileName: "Duet3Firmware_EXP1XD.bin",
			maxHeaters: 0,
			maxMotors: 1,
			shortName: "EXP1XD"
		}),
		ports: {
			[PortType.analogIn]: ["io1.in"],
			[PortType.fan]: ["out0", "out1"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in"],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: ["io0.out", "io2.out"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.pwm]: ["io0.out", "io2.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["temp0"],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.SZP]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: false,
		hasVrefMonitor: false,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 12,
		maxVoltage: 48,
		numDrivers: 1,
		microstepInterpolations: [],
		objectModelBoard: initObject(Board, {
			canAddress: 120,
			firmwareFileName: "Duet3Firmware_SZP.bin",
			maxHeaters: 0,
			maxMotors: 0,
			shortName: "SZP"
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: [],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: [],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: [],
			[PortType.heater]: [],
			[PortType.pwm]: [],
			[PortType.scanning]: ["i2c.ldc1612"],
			[PortType.spiCs]: [],
			[PortType.thermistor]: [],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: true
	},
	[ExpansionBoardType.EXP1HCL]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: true,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
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
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: ["out0", "out1"],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: ["io0.in", "io1.in"],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: ["io0.out", "io2.out"],
			[PortType.heater]: [],
			[PortType.pwm]: ["io0.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["temp0", "temp1"],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.M23CL]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: true,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 2300,
		motorMaxCurrent: 2800,
		minVoltage: 12,
		maxVoltage: 24,
		numDrivers: 1,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		objectModelBoard: initObject(Board, {
			canAddress: 123,
			firmwareFileName: "Duet3Firmware_M23CL.bin",
			maxHeaters: 0,
			maxMotors: 1,
			shortName: "M23CL"
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: [],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: [],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: [],
			[PortType.heater]: [],
			[PortType.pwm]: [],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: [],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.TOOL1LC]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
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
		}),
		ports: {
			[PortType.analogIn]: ["io0.in"],
			[PortType.fan]: ["out1", "out2"],
			[PortType.fanTacho]: ["out1.tach", "out2.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in"],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: ["io0.out", "io1.out"],
			[PortType.heater]: ["out0"],
			[PortType.pwm]: ["io0.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["temp0"],
			[PortType.uart]: []
		},
		supportsAccelerometer: true,
		hasBuiltInAccelerometer: true
	},
	[ExpansionBoardType.TOOL1RR]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1200,
		motorMaxCurrent: 1600,
		minVoltage: 12,
		maxVoltage: 32,
		numDrivers: 1,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		objectModelBoard: initObject(Board, {
			canAddress: 121,
			firmwareFileName: "Duet3Firmware_TOOL1RR.bin",
			maxHeaters: 0,
			maxMotors: 1,
			shortName: "TOOL1RR"
		}),
		ports: {
			[PortType.analogIn]: ["io0.in"],
			[PortType.fan]: ["out1", "out2"],
			[PortType.fanTacho]: ["out1.tach", "out2.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in"],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: ["io0.out", "io1.out"],
			[PortType.heater]: ["out0"],
			[PortType.pwm]: ["io0.out"],
			[PortType.scanning]: ["i2c.ldc1612"],
			[PortType.spiCs]: [],
			[PortType.thermistor]: ["temp0"],
			[PortType.uart]: []
		},
		supportsAccelerometer: true,
		hasBuiltInAccelerometer: true
	},
	[ExpansionBoardType.Mini5plus]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
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
		}),
		ports: {
			[PortType.analogIn]: ["io2.in"],
			[PortType.fan]: ["out2", "out4", "out5", "out6+laser+vfd"],
			[PortType.fanTacho]: ["out2.tach", "out3.tach", "out4.tach"],
			[PortType.gpIn]: ["io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in"],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: ["io1.out", "io2.out", "io3.out", "io4.out+pson"],
			[PortType.heater]: ["out0", "out1", "out2"],
			[PortType.pwm]: ["io0.out", "io2.out", "io3.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2"],
			[PortType.uart]: ["usb", "io1.in+io1.out"]
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: true
	},
	[ExpansionBoardType.MB6HC]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
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
		}),
		ports: {
			[PortType.analogIn]: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.uart]: ["usb", "io0.in+io0.out", "io1.in+io1.out"]
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.MB6XD]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: false,
		hasVrefMonitor: true,
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
		}),
		ports: {
			[PortType.analogIn]: ["io3.in", "io4.in", "io5.in", "io6.in", "io7.in"],
			[PortType.fan]: ["out4", "out5", "out6", "out7", "out8", "out9+laser+vfd", "out10+servo"],
			[PortType.fanTacho]: ["out4.tach", "out5.tach", "out6.tach"],
			[PortType.gpIn]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpInInterrupt]: ["io0.in", "io1.in", "io2.in", "io3.in", "io4.in", "io5.in", "io6.in", "io7.in", "io8.in"],
			[PortType.gpOut]: ["io0.out", "io1.out", "io2.out", "io3.out", "io4.out", "io5.out", "io6.out", "io7.out", "io8.out", "pson"],
			[PortType.heater]: ["out0", "out1", "out2", "out3"],
			[PortType.pwm]: ["io4.out", "io5.out", "io7.out"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["spi.cs0", "spi.cs1", "spi.cs2", "spi.cs3"],
			[PortType.thermistor]: ["temp0", "temp1", "temp2", "temp3"],
			[PortType.uart]: ["usb", "io0.in+io0.out", "io1.in+io1.out"]
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.Duet3Mini2Plus]: {
		hasADCAutoCalibration: true,
		hasClosedLoopDrivers: false,
		hasInputPullUps: true,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1500,
		motorMaxCurrent: 2000,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 2,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		objectModelBoard: initObject(Board, {
			maxMotors: 2
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: [],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: [],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: [],
			[PortType.heater]: [],
			[PortType.pwm]: [],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: [],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.DueX5]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [16],
		objectModelBoard: initObject(Board, {
			maxHeaters: 5,
			maxMotors: 5
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: ["duex.fan3", "duex.fan4", "duex.fan5", "duex.fan6", "duex.fan7", "duex.fan8"],
			[PortType.fanTacho]: ["duex.pb6"],
			[PortType.gpIn]: ["duex.e2stop", "duex.e3stop", "duex.e4stop", "duex.e5stop", "duex.e6stop", "duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
			[PortType.gpInInterrupt]: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
			[PortType.gpOut]: ["duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
			[PortType.heater]: ["duex.e2heat", "duex.e3heat", "duex.e4heat", "duex.e5heat", "duex.e6heat"],
			[PortType.pwm]: ["duex.pwm1", "duex.pwm2", "duex.pwm3", "duex.pwm4", "duex.pwm5"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
			[PortType.thermistor]: ["duex.e2temp", "duex.e3temp", "duex.e4temp", "duex.e5temp", "duex.e6temp"],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.Duet2ExpansionBreakout]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: false,
		hasVrefMonitor: true,
		motorWarnCurrent: -1,
		motorMaxCurrent: -1,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 5,
		microstepInterpolations: [],
		objectModelBoard: initObject(Board, {
			maxHeaters: 5,
			maxMotors: 5
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: [],
			[PortType.fanTacho]: ["duex.pb6"],
			[PortType.gpIn]: ["duex.e2stop", "duex.e3stop", "duex.e4stop", "duex.e5stop", "duex.e6stop", "duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
			[PortType.gpInInterrupt]: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
			[PortType.gpOut]: ["duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
			[PortType.heater]: ["duex.e2heat", "duex.e3heat", "duex.e4heat", "duex.e5heat", "duex.e6heat"],
			[PortType.pwm]: ["duex.pwm1", "duex.pwm2", "duex.pwm3", "duex.pwm4", "duex.pwm5"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
			[PortType.thermistor]: ["duex.e2temp", "duex.e3temp", "duex.e4temp", "duex.e5temp", "duex.e6temp"],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.DueX2]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 2000,
		motorMaxCurrent: 2400,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 2,
		microstepInterpolations: [],
		objectModelBoard: initObject(Board, {
			maxHeaters: 5,
			maxMotors: 2
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: ["duex.fan3", "duex.fan4", "duex.fan5", "duex.fan6", "duex.fan7", "duex.fan8"],
			[PortType.fanTacho]: ["duex.pb6"],
			[PortType.gpIn]: ["duex.e2stop", "duex.e3stop", "duex.e4stop", "duex.e5stop", "duex.e6stop", "duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
			[PortType.gpInInterrupt]: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
			[PortType.gpOut]: ["duex.gp1", "duex.gp2", "duex.gp3", "duex.gp4"],
			[PortType.heater]: ["duex.e2heat", "duex.e3heat", "duex.e4heat", "duex.e5heat", "duex.e6heat"],
			[PortType.pwm]: ["duex.pwm1", "duex.pwm2", "duex.pwm3", "duex.pwm4", "duex.pwm5"],
			[PortType.scanning]: [],
			[PortType.spiCs]: ["duex.cs5", "duex.cs6", "duex.cs7", "duex.cs8"],
			[PortType.thermistor]: ["duex.e2temp", "duex.e3temp", "duex.e4temp", "duex.e5temp", "duex.e6temp"],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	},
	[ExpansionBoardType.Duet2Maestro2Plus]: {
		hasADCAutoCalibration: false,
		hasClosedLoopDrivers: false,
		hasInputPullUps: false,
		hasSmartDrivers: true,
		hasVrefMonitor: true,
		motorWarnCurrent: 1200,
		motorMaxCurrent: 1600,
		minVoltage: 11,
		maxVoltage: 25,
		numDrivers: 2,
		microstepInterpolations: [1, 2, 4, 8, 16, 32, 64, 128],
		objectModelBoard: initObject(Board, {
			maxMotors: 2
		}),
		ports: {
			[PortType.analogIn]: [],
			[PortType.fan]: [],
			[PortType.fanTacho]: [],
			[PortType.gpIn]: [],
			[PortType.gpInInterrupt]: [],
			[PortType.gpOut]: [],
			[PortType.heater]: [],
			[PortType.pwm]: [],
			[PortType.scanning]: [],
			[PortType.spiCs]: [],
			[PortType.thermistor]: [],
			[PortType.uart]: []
		},
		supportsAccelerometer: false,
		hasBuiltInAccelerometer: false
	}
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

/**
 * Get expansion board type from an object model board
 * @param model Board instance
 * @returns Expansion board type or null if not found
 */
export function getExpansionBoardType(board: Board): ExpansionBoardType | null {
	for (let expansionBoardType of Object.values(ExpansionBoardType)) {
		const expansionBoard = ExpansionBoards[expansionBoardType];
		if (board.shortName === expansionBoard.objectModelBoard.shortName) {
			return expansionBoardType;
		}
	}
	return null;
}
