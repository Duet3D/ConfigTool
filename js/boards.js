/* RepRapFirmware Configuration Tool
 *
 * created by Christian Hammacher, (c) 2016-2017
 */

var boardDefinitions = [
	{
		name: "duet06",
		caption: "Duet 0.6",
		motorWarningCurrent: 1200,
		motorLimitCurrent: 2000,
		seriesResistor: 4700,
		configurableMicrostepping: false,
		maxExtruders: 5,
		maxNozzles: 6,
		maxRtdBoards: 4,
		numFans: 1,
		hasEthernet: true,
		hasWiFi: false,
		hasMotorLoadDetection: false
	},
	{
		name: "duet085",
		caption: "Duet 0.8.5",
		motorWarningCurrent: 1200,
		motorLimitCurrent: 2000,
		seriesResistor: 4700,
		configurableMicrostepping: false,
		maxExtruders: 5,
		maxNozzles: 6,
		maxRtdBoards: 4,
		numFans: 2,
		hasEthernet: true,
		hasWiFi: false,
		hasMotorLoadDetection: false
	},
	{
		name: "duetwifi10",
		caption: "Duet WiFi",
		motorWarningCurrent: 2000,
		motorLimitCurrent: 2400,
		seriesResistor: 4700,
		configurableMicrostepping: true,
		maxExtruders: 7,
		maxNozzles: 8,
		maxRtdBoards: 8,
		numFans: 3,
		hasEthernet: false,
		hasWiFi: true,
		hasMotorLoadDetection: true
	},
	{
		name: "duetethernet10",
		caption: "Duet WiFi",
		motorWarningCurrent: 2000,
		motorLimitCurrent: 2400,
		seriesResistor: 4700,
		configurableMicrostepping: true,
		maxExtruders: 7,
		maxNozzles: 8,
		maxRtdBoards: 8,
		numFans: 3,
		hasEthernet: true,
		hasWiFi: false,
		hasMotorLoadDetection: true
	},
	{
		name: "duetm10",
		caption: "Duet Maestro",
		motorWarningCurrent: 1200,
		motorLimitCurrent: 1600,
		seriesResistor: 2200,
		configurableMicrostepping: true,
		maxExtruders: 4,
		maxNozzles: 4,
		maxRtdBoards: 4,
		numFans: 3,
		hasEthernet: true,
		hasWiFi: false,
		hasMotorLoadDetection: true
	}
];

function getBoardDefinition(boardType) {
	if (boardType == undefined) { boardType = $("#board").val(); }

	for(var i = 0; i < boardDefinitions.length; i++) {
		if (boardDefinitions[i].name == boardType) {
			return boardDefinitions[i];
		}
	}

	return undefined;
}
