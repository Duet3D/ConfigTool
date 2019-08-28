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
			maxDrives: 8,
			maxHeaters: 6,
			maxThermistors: 6,
			maxRtdBoards: 4,
			maxFans: 1,
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: false,
			hasMotorLoadDetection: false,
			supportsDisplay: false,
			supports12864: false
		},
		{
			name: 'duet085',
			caption: 'Duet 0.8.5',
			motorWarningCurrent: 1200,
			motorLimitCurrent: 2000,
			seriesResistor: 4700,
			microstepping: false,
			microsteppingInterpolation: false,
			maxDrives: 9,
			maxHeaters: 6,
			maxThermistors: 6,
			maxRtdBoards: 4,
			maxFans: 2,
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: false,
			hasMotorLoadDetection: false,
			supportsDisplay: false,
			supports12864: false
		},
		{
			name: 'duetwifi10',
			caption: 'Duet WiFi',
			motorWarningCurrent: 2000,
			motorLimitCurrent: 2400,
			seriesResistor: 4700,
			microstepping: true,
			microsteppingInterpolation: false,
			maxDrives: 10,
			maxHeaters: 8,
			maxThermistors: 8,
			maxRtdBoards: 8,
			maxFans: 3,
			hasEthernet: false,
			hasWiFi: true,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: false,
			supports12864: false
		},
		{
			name: 'duetethernet10',
			caption: 'Duet WiFi',
			motorWarningCurrent: 2000,
			motorLimitCurrent: 2400,
			seriesResistor: 4700,
			microstepping: true,
			microsteppingInterpolation: false,
			maxDrives: 10,
			maxHeaters: 8,
			maxThermistors: 8,
			maxRtdBoards: 8,
			maxFans: 3,
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: false,
			supports12864: false
		},
		{
			name: 'duetm10',
			caption: 'Duet Maestro',
			motorWarningCurrent: 1200,
			motorLimitCurrent: 1600,
			seriesResistor: 2200,
			microstepping: true,
			microsteppingInterpolation: true,
			maxDrives: 7,
			maxHeaters: 3,
			maxThermistors: 4,
			maxRtdBoards: 4,
			maxFans: 3,
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: true,
			hasMotorLoadDetection: true,
			supportsDisplay: true,
			supports12864: true
		}
	],

	getBoard(boardType) {
		const boardDefinitions = this.getBoards();
		for (let i in boardDefinitions) {
			if (boardDefinitions[i].name == boardType) {
				return boardDefinitions[i];
			}
		}
		throw 'Invalid board';
	}
}
