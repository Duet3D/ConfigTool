export enum LegacyExpansionBoardType {
	DueX2 = "Duex 2",
	DueX5 = "Duex 5",
	Duet3Mini2Plus = "Dual Stepper Driver Expansion Module",
	EXP3HC = "EXP3HCC",
	TOOL1LC = "TOOL1LC",
	EXP1XD = "EXP1XD",
	EXP1HCL = "EXP1HCL"
}

export const LegacyExpansionBoards = {
	[LegacyExpansionBoardType.DueX2]: {
		isCanBoard: false,
		isToolBoard: false,
		numDrives: 2,
		heaterPorts: ['duex.e2heat', 'duex.e3heat'],
		fanPorts: ['duex.fan3', 'duex.fan4', 'duex.fan5', 'duex.fan6', 'duex.fan7', 'duex.fan8'],
		gpioPorts: ['exp.e2stop', 'exp.e3stop', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4'],
		analogPorts: ['duex.e2temp', 'duex.e3temp'],
		pwmPorts: ['duex.e2heat', 'duex.e3heat', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4', 'duex.pwm1', 'duex.pwm2'],
		spiCsPorts: ['duex.cs5', 'duex.cs6', 'duex.cs7', 'duex.cs8'],
		maxRtdBoards: 2
	},
	[LegacyExpansionBoardType.DueX5]: {
		isCanBoard: false,
		isToolBoard: false,
		numDrives: 5,
		heaterPorts: ['duex.e2heat', 'duex.e3heat', 'duex.e4heat', 'duex.e5heat', 'duex.e6heat'],
		fanPorts: ['duex.fan3', 'duex.fan4', 'duex.fan5', 'duex.fan6', 'duex.fan7', 'duex.fan8'],
		gpioPorts: ['exp.e2stop', 'exp.e3stop', 'exp.e4stop', 'exp.e5stop', 'exp.e6stop', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4', 'duex.pwm1', 'duex.pwm2', 'duex.pwm3', 'duex.pwm4', 'duex.pwm5'],
		analogPorts: ['duex.e2temp', 'duex.e3temp', 'duex.e4temp', 'duex.e5temp', 'duex.e6temp'],
		pwmPorts: ['duex.e2heat', 'duex.e3heat', 'duex.e4heat', 'duex.e5heat', 'duex.e6heat', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4', 'duex.pwm1', 'duex.pwm2', 'duex.pwm3', 'duex.pwm4', 'duex.pwm5'],
		spiCsPorts: ['duex.cs5', 'duex.cs6', 'duex.cs7', 'duex.cs8'],
		maxRtdBoards: 2
	},
	[LegacyExpansionBoardType.Duet3Mini2Plus]: {
		isCanBoard: false,
		isToolBoard: false,
		numDrives: 2,
		heaterPorts: [],
		fanPorts: [],
		fanTachoPorts: [],
		gpioPorts: [],
		analogPorts: [],
		pwmPorts: [],
		spiCsPorts: [],
		maxRtdBoards: 2
	},
	'EXP3HC': {
		isCanBoard: true,
		isToolBoard: false,
		numDrives: 3,
		heaterPorts: ['out0', 'out1', 'out2'],
		fanPorts: ['out3', 'out4', 'out5', 'out6', 'out7', 'out8'],
		gpioPorts: [/*'io0.out', 'io0.in',*/ 'io1.out', 'io1.in', 'io2.out', 'io2.in', 'io3.out', 'io3.in', 'io4.out', 'io4.in', 'io5.out', 'io5.in', 'out3.tach', 'out4.tach', 'out5.tach'],
		analogPorts: ['temp0', 'temp1', 'temp2', /*'io0.in',*/ 'io1.in', 'io2.in', 'io5.in'],
		pwmPorts: ['io1.out', 'io4.out'],
		spiCsPorts: ['spi.cs0', 'spi.cs1', 'spi.cs2', 'spi.cs3'],
		maxRtdBoards: 2
	},
	'TOOL1LC': {
		isCanBoard: true,
		isToolBoard: true,
		numDrives: 1,
		heaterPorts: ['out0'],
		fanPorts: ['out1', 'out2'],
		gpioPorts: ['io0.out', 'io0.in', 'io1.out', 'io1.in', 'io2.in', 'out1.tach', 'out2.tach'],
		analogPorts: ['temp0', 'temp1', 'io0.in'],
		pwmPorts: ['io0.out'],
		spiCsPorts: [],
		maxRtdBoards: 0
	},
	'EXP1XD': {
		isCanBoard: true,
		isToolBoard: true,
		numDrives: 1,
		heaterPorts: [],
		fanPorts: ['out0', 'out1'],
		gpioPorts: ['io0.out', 'io0.in', 'io1.in', 'io2.in', 'io2.out'],
		analogPorts: ['temp0'],
		pwmPorts: ['io0.out', 'io2.out'],
		spiCsPorts: [],
		maxRtdBoards: 0
	},
	'EXP1HCL': {
		isCanBoard: true,
		isToolBoard: true,
		numDrives: 1,
		heaterPorts: [],
		fanPorts: ['out0', 'out1'],
		gpioPorts: ['io0.out', 'io0.in', 'io1.out', 'io1.in'],
		analogPorts: ['temp0'],
		pwmPorts: ['io0.out'],
		spiCsPorts: [],
		maxRtdBoards: 0
	}
}
