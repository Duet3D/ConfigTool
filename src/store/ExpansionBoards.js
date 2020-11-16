'use strict'

export default {
	'Duex 2': {
		isToolBoard: false,
		numDrives: 2,
		heaterPorts: ['duex.e2heat', 'duex.e3heat'],
		fanPorts: ['duex.fan3', 'duex.fan4', 'duex.fan5', 'duex.fan6', 'duex.fan7', 'duex.fan8'],
		gpioPorts: ['exp.e2stop', 'exp.e3stop', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4'],
		analogPorts: ['duex.e2temp', 'duex.e3temp'],
		pwmPorts: ['duex.e2heat', 'duex.e3heat', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4', 'duex.pwm1', 'duex.pwm2'],
		spiCsPorts: ['duex.cs5'],
		maxRtdBoards: 2
	},
	'Duex 5': {
		isToolBoard: false,
		numDrives: 5,
		heaterPorts: ['duex.e2heat', 'duex.e3heat', 'duex.e4heat', 'duex.e5heat', 'duex.e6heat'],
		fanPorts: ['duex.fan3', 'duex.fan4', 'duex.fan5', 'duex.fan6', 'duex.fan7', 'duex.fan8'],
		gpioPorts: ['exp.e2stop', 'exp.e3stop', 'exp.e4stop', 'exp.e5stop', 'exp.e6stop', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4', 'duex.pwm1', 'duex.pwm2', 'duex.pwm3', 'duex.pwm4', 'duex.pwm5'],
		analogPorts: ['duex.e2temp', 'duex.e3temp', 'duex.e4temp', 'duex.e5temp', 'duex.e6temp'],
		pwmPorts: ['duex.e2heat', 'duex.e3heat', 'duex.e4heat', 'duex.e5heat', 'duex.e6heat', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4', 'duex.pwm1', 'duex.pwm2', 'duex.pwm3', 'duex.pwm4', 'duex.pwm5'],
		spiCsPorts: ['duex.cs5'],
		maxRtdBoards: 2
	},
	'Dual Stepper Driver Expansion Module': {
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
		isToolBoard: false,
		numDrives: 3,
		heaterPorts: ['out0', 'out1', 'out2'],
		fanPorts: ['out3', 'out4', 'out5', 'out6', 'out7', 'out8'],
		gpioPorts: [/*'io0.out', 'io0.in',*/ 'io1.out', 'io1.in', 'io2.out', 'io2.in', 'io3.out', 'io3.in', 'io4.out', 'io4.in', 'io5.out', 'io5.in', 'out3.tach', 'out4.tach', 'out5.tach'],
		analogPorts: ['temp0', 'temp1', 'temp2', /*'io0.in',*/ 'io1.in', 'io2.in', 'io5.in'],
		pwmPorts: ['io1.out', 'io4.out'],
		spiCsPorts: [],
		maxRtdBoards: 2
	},
	'TOOL1LC': {
		isToolBoard: true,
		numDrives: 1,
		heaterPorts: ['out0'],
		fanPorts: ['out1', 'out2'],
		gpioPorts: ['io0.out', 'io0.in', 'io1.out', 'io1.in', 'io2.in', 'out1.tach', 'out2.tach'],
		analogPorts: ['temp0', 'temp1', 'io0.in'],
		pwmPorts: ['io0.out'],
		spiCsPorts: [],
		maxRtdBoards: 0
	}
}
