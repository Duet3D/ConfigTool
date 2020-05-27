'use strict'

export default {
	'Duex 2': {
		numDrives: 2,
		heaterPorts: ['duex.e2heat', 'duex.e3heat'],
		fanPorts: ['duex.fan3', 'duex.fan4', 'duex.fan5', 'duex.fan6', 'duex.fan7', 'duex.fan8'],
		gpioPorts: ['exp.e2stop', 'exp.e3stop', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4'],
		analogPorts: ['duex.e2temp', 'duex.e3temp'],
		pwmPorts: ['duex.e2heat', 'duex.e3heat', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4'],
		spiCsPorts: ['duex.cs5'],
		maxRtdBoards: 2
	},
	'Duex 5': {
		numDrives: 5,
		heaterPorts: ['duex.e2heat', 'duex.e3heat', 'duex.e4heat', 'duex.e5heat', 'duex.e6heat'],
		fanPorts: ['duex.fan3', 'duex.fan4', 'duex.fan5', 'duex.fan6', 'duex.fan7', 'duex.fan8'],
		gpioPorts: ['exp.e2stop', 'exp.e3stop', 'exp.e4stop', 'exp.e5stop', 'exp.e6stop', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4'],
		analogPorts: ['duex.e2temp', 'duex.e3temp', 'duex.e4temp', 'duex.e5temp', 'duex.e6temp'],
		pwmPorts: ['duex.e2heat', 'duex.e3heat', 'duex.e4heat', 'duex.e5heat', 'duex.e6heat', 'duex.gp1', 'duex.gp2', 'duex.gp3', 'duex.gp4'],
		spiCsPorts: ['duex.cs5'],
		maxRtdBoards: 2
	},
	'Dual Stepper Driver Expansion Module': {
		numDrives: 2,
		heaterPorts: [],
		fanPorts: [],
		gpioPorts: [],
		analogPorts: [],
		pwmPorts: [],
		spiCsPorts: [],
		maxRtdBoards: 2
	},
	'EXP3HC': {
		numDrives: 3,
		heaterPorts: ['out0', 'out1', 'out2'],
		fanPorts: ['out4', 'out5', 'out6'],
		gpioPorts: ['io0.out', 'io0.in', 'io1.out', 'io1.in', 'io2.out', 'io2.in', 'io3.out', 'io3.in', 'io4.out', 'io4.in', 'io5.out', 'io5.in'],
		analogPorts: ['temp0', 'temp1', 'temp2'],
		pwmPorts: ['out0', 'out1', 'out2', 'out3', 'out4', 'out5', 'out6'],
		spiCsPorts: [],
		maxRtdBoards: 2
	},
	'TOOL1LC': {
		numDrives: 1,
		heaterPorts: ['out0'],
		fanPorts: ['out1', 'out2'],
		gpioPorts: ['io0.out', 'io0.in', 'io1.out', 'io1.in'],
		analogPorts: ['temp0', 'temp1'],
		pwmPorts: ['out0'],
		spiCsPorts: [],
		maxRtdBoards: 0
	}
}
