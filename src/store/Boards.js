'use strict'

import Template from './Template.js'

export default {
	getBoards: () => [
		{
			name: 'duet06',
			caption: 'Duet 0.6',
			motorWarningCurrent: 1200,
			motorLimitCurrent: 2000,
			seriesResistor: 4700,
			microstepping: false,
			microsteppingInterpolation: false,
			numDrives: 4,
			heaterPorts: ['bedheat', 'e0heat'],
			fanPorts: ['fan0'],
			pwmPorts: ['bedheat', 'e0heat', 'fan0'],
			gpioPorts: ['xstop', 'ystop', 'zstop', 'e0stop'],
			analogPorts: ['bedtemp', 'e0temp'],
			spiCsPorts: ['spi.cs1', 'spi.cs2', 'spi.cs3', 'spi.cs4'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: false,
			hasMotorLoadDetection: false,
			supportsDisplay: false,
			supports12864: false,
			firmwareFile: 'RepRapFirmware.bin',
			iapFile: 'iap.bin',
			expansionBoards: [],
			maxExpansionBoards: 0
		},
		{
			name: 'duet085',
			caption: 'Duet 0.8.5',
			motorWarningCurrent: 1200,
			motorLimitCurrent: 2000,
			seriesResistor: 4700,
			microstepping: false,
			microsteppingInterpolation: false,
			numDrives: 5,
			heaterPorts: ['bedheat', 'e0heat', 'e1heat'],
			fanPorts: ['fan0', 'fan1'],
			pwmPorts: ['bedheat', 'e0heat', 'e1heat'],
			gpioPorts: ['xstop', 'ystop', 'zstop', 'e0stop', 'e1stop'],
			analogPorts: ['bedtemp', 'e0temp', 'e1temp', 'zprobe.in'],
			spiCsPorts: ['spi.cs0', 'spi.cs1', 'spi.cs2', 'spi.cs3', 'spi.cs4'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: false,
			hasMotorLoadDetection: false,
			supportsDisplay: false,
			supports12864: false,
			firmwareFile: 'RepRapFirmware.bin',
			iapFile: 'iap.bin',
			expansionBoards: [],
			maxExpansionBoards: 0
		},
		{
			name: 'duetwifi10',
			caption: 'Duet WiFi',
			motorWarningCurrent: 2000,
			motorLimitCurrent: 2400,
			seriesResistor: 4700,
			microstepping: true,
			microsteppingInterpolation: false,
			numDrives: 5,
			heaterPorts: ['bedheat', 'e0heat', 'e1heat'],
			fanPorts: ['fan0', 'fan1', 'fan2'],
			pwmPorts: ['exp.heater3', 'exp.heater4', 'exp.heater5', 'exp.heater6', 'exp.heater7'],
			gpioPorts: ['xstop', 'ystop', 'zstop', 'e0stop', 'e1stop', 'zprobe.mod', 'pson'],
			analogPorts: ['bedtemp', 'e0temp', 'e1temp', 'zprobe.in'],
			spiCsPorts: ['spi.cs1', 'spi.cs2', 'spi.cs3', 'spi.cs4'],
			hasEthernet: false,
			hasWiFi: true,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: false,
			supports12864: false,
			firmwareFile: 'Duet2CombinedFirmware.bin',
			iapFile: 'Duet2_SDiap32_WiFiEth.bin',
			expansionBoards: ['Duex 2', 'Duex 5'],
			maxExpansionBoards: 1
		},
		{
			name: 'duetethernet10',
			caption: 'Duet WiFi',
			motorWarningCurrent: 2000,
			motorLimitCurrent: 2400,
			seriesResistor: 4700,
			microstepping: true,
			microsteppingInterpolation: false,
			numDrives: 5,
			heaterPorts: ['bedheat', 'e0heat', 'e1heat'],
			fanPorts: ['fan0', 'fan1', 'fan2'],
			pwmPorts: ['exp.heater3', 'exp.heater4', 'exp.heater5', 'exp.heater6', 'exp.heater7'],
			gpioPorts: ['xstop', 'ystop', 'zstop', 'e0stop', 'e1stop', 'zprobe.mod', 'pson'],
			analogPorts: ['bedtemp', 'e0temp', 'e1temp', 'zprobe.in'],
			spiCsPorts: ['spi.cs1', 'spi.cs2', 'spi.cs3', 'spi.cs4'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: false,
			supports12864: false,
			firmwareFile: 'Duet2CombinedFirmware.bin',
			iapFile: 'Duet2_SDiap32_WiFiEth.bin',
			expansionBoards: ['Duex 2', 'Duex 5'],
			maxExpansionBoards: 1
		},
		{
			name: 'duetm10',
			caption: 'Duet Maestro',
			motorWarningCurrent: 1200,
			motorLimitCurrent: 1600,
			seriesResistor: 2200,
			microstepping: true,
			microsteppingInterpolation: true,
			numDrives: 5,
			heaterPorts: ['bedheat', 'e0heat', 'e1heat'],
			fanPorts: ['fan0', 'fan1', 'fan2'],
			pwmPorts: ['zprobe.mod'],
			gpioPorts: ['xstop', 'ystop', 'zstop', 'e0stop', 'e1stop', 'zprobe.mod', 'pson'],
			analogPorts: ['bedtemp', 'e0temp', 'e1temp', 'ctemp', 'zprobe.in'],
			spiCsPorts: ['spi.cs1', 'spi.cs2'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: true,
			supports12864: true,
			firmwareFile: 'DuetMaestroFirmware.bin',
			iapFile: 'DuetMaestroIAP.bin',
			expansionBoards: ['Dual Stepper Driver Expansion Module'],
			maxExpansionBoards: 1
		},
		{
			name: 'duet3',
			caption: 'Duet 3 MB 6HC',
			motorWarningCurrent: 4000,
			motorLimitCurrent: 6300,
			seriesResistor: 2200,
			microstepping: true,
			microsteppingInterpolation: true,
			numDrives: 6,
			heaterPorts: ['out0', 'out1', 'out2', 'out3'],
			fanPorts: ['out4', 'out5', 'out6', 'out7', 'out8', 'out9'],
			pwmPorts: ['io4.out', 'io5.out', 'io7.out'],
			gpioPorts: ['io0.in', 'io1.in', 'io2.in', 'io3.in', 'io4.in', 'io5.in', 'io6.in', 'io7.in', 'io8.in', 'io0.out', 'io1.out', 'io2.out', 'io3.out', 'io4.out', 'io5.out', 'io6.out', 'io7.out', 'io8.out', 'io4.tacho', 'io5.tacho', 'io6.tacho', 'pson'],
			analogPorts: ['temp0', 'temp1', 'temp2', 'temp3', 'io3.in', 'io4.in', 'io5.in', 'io6.in', 'io7.in'],
			spiCsPorts: ['spi.cs0', 'spi.cs1', 'spi.cs2', 'spi.cs3'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: true,
			supports12864: false,
			firmwareFile: 'Duet3Firmware_MB6HC.bin',
			iapFile: 'Duet3_SDiap_MB6HC.bin',
			expansionBoards: ['EXP3HC', 'TOOL1LC', 'EXP1XD', 'EXP1HCL'],
			maxExpansionBoards: 6
		},
		{
			name: 'duet3_mini5plus_ethernet',
			caption: 'Duet 3 Mini 5+',
			motorWarningCurrent: 1500,
			motorLimitCurrent: 2000,
			seriesResistor: 2200,
			microstepping: true,
			microsteppingInterpolation: true,
			numDrives: 5,
			heaterPorts: ['out0', 'out1', 'out2'],
			fanPorts: ['out3', 'out4', 'out5', 'out6', 'vfd'],
			pwmPorts: ['io1.out', 'io2.out', 'io3.out'],
			gpioPorts: ['io0.in', 'io1.in', 'io2.in', 'io3.in', 'io4.in', 'io5.in', 'io6.in', 'io0.out', 'io1.out', 'io2.out', 'io3.out', 'io4.out', 'out3.tach', 'out4.tach', 'out5.tach', 'pson'],
			analogPorts: ['temp0', 'temp1', 'temp2', 'io3.in'],
			spiCsPorts: ['spi.cs1', 'spi.cs2', 'spi.cs3'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: true,
			supports12864: true,
			firmwareFile: 'Duet3Firmware_Mini5plus.uf2',
			iapFile: 'Duet3_SDiap_Mini5plus.bin',
			expansionBoards: ['EXP3HC', 'TOOL1LC', 'EXP1XD', 'EXP1HCL', 'Dual Stepper Driver Expansion Module'],
			maxExpansionBoards: 4
		},
		{
			name: 'duet3_mini5plus_wifi',
			caption: 'Duet 3 Mini 5+',
			motorWarningCurrent: 1500,
			motorLimitCurrent: 2000,
			seriesResistor: 2200,
			microstepping: true,
			microsteppingInterpolation: true,
			numDrives: 5,
			heaterPorts: ['out0', 'out1', 'out2'],
			fanPorts: ['out3', 'out4', 'out5', 'out6', 'vfd'],
			pwmPorts: ['io1.out', 'io2.out', 'io3.out'],
			gpioPorts: ['io0.in', 'io1.in', 'io2.in', 'io3.in', 'io4.in', 'io5.in', 'io6.in', 'io0.out', 'io1.out', 'io2.out', 'io3.out', 'io4.out', 'out3.tach', 'out4.tach', 'out5.tach', 'pson'],
			analogPorts: ['temp0', 'temp1', 'temp2', 'io3.in'],
			spiCsPorts: ['spi.cs1', 'spi.cs2', 'spi.cs3'],
			hasEthernet: false,
			hasWiFi: true,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: true,
			supports12864: true,
			firmwareFile: 'Duet3Firmware_Mini5plus.uf2',
			iapFile: 'Duet3_SDiap_Mini5plus.bin',
			expansionBoards: ['EXP3HC', 'TOOL1LC', 'EXP1XD', 'EXP1HCL', 'Dual Stepper Driver Expansion Module'],
			maxExpansionBoards: 4
		},
		{
			name: 'duet3_xd',
			caption: 'Duet 3 MB 6XD',
			motorWarningCurrent: 4000,
			motorLimitCurrent: 6300,
			seriesResistor: 2200,
			microstepping: false,
			microsteppingInterpolation: false,
			numDrives: 6,
			heaterPorts: ['out0', 'out1', 'out2', 'out3'],
			fanPorts: ['out4', 'out5', 'out6', 'out7', 'out8', 'out9'],
			pwmPorts: ['io4.out', 'io5.out', 'io7.out'],
			gpioPorts: ['io0.in', 'io1.in', 'io2.in', 'io3.in', 'io4.in', 'io5.in', 'io6.in', 'io7.in', 'io8.in', 'io0.out', 'io1.out', 'io2.out', 'io3.out', 'io4.out', 'io5.out', 'io6.out', 'io7.out', 'io8.out', 'io4.tacho', 'io5.tacho', 'io6.tacho', 'pson'],
			analogPorts: ['temp0', 'temp1', 'temp2', 'temp3', 'io3.in', 'io4.in', 'io5.in', 'io6.in', 'io7.in'],
			spiCsPorts: ['spi.cs0', 'spi.cs1', 'spi.cs2', 'spi.cs3'],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: false,
			supportsDisplay: true,
			supports12864: false,
			firmwareFile: 'Duet3Firmware_MB6XD.bin',
			iapFile: 'Duet3_SDiap_MB6XD.bin',
			expansionBoards: ['EXP3HC', 'TOOL1LC', 'EXP1XD', 'EXP1HCL'],
			maxExpansionBoards: 6
		},
	],

	getBoard(boardType) {
		const boardDefinitions = this.getBoards();
		for (let i in boardDefinitions) {
			if (boardDefinitions[i].name == boardType) {
				return boardDefinitions[i];
			}
		}
		throw 'Invalid board';
	},

	isValidPin(board, pin, canAddress) {
		const pinTypes = ['heaterPorts', 'fanPorts', 'pwmPorts', 'gpioPorts', 'analogPorts', 'spiCsPorts'];
		return pinTypes.some(function(pinType) {
			return board[pinType].some(function(boardPort) {
				return ((!canAddress && Template.isSamePin(pin, boardPort)) ||
						(canAddress !== undefined && Template.isSamePin(pin, `${canAddress}.${boardPort}`)));
			});
		});
	}
}
