'use strict'

import Template from './Template.js'

export default {
	getBoards: () => [
		{
			name: 'smoothieboard',
			caption: 'Smoothieboard',
			motorWarningCurrent: 1200,
			motorLimitCurrent: 2000,
			seriesResistor: 4700,
			microstepping: false,
			microsteppingInterpolation: false,
			numDrives: 5,
			heaterPorts: ['Q6', 'Q5', 'Q7'],
			fanPorts: ['Q4'],
			pwmPorts: ['Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9'],
			gpioPorts: ['XMin', 'YMin', 'ZMin', 'XMax', 'YMax', 'ZMax'],
			analogPorts: ['T1', 'T2', 'T3', 'T4'],
			spiCsPorts: [],
			hasEthernet: true,
			hasWiFi: false,
			hasPowerFailureDetection: false,
			hasMotorLoadDetection: false,
			supportsDisplay: true,
			supports12864: true,
			firmwareFile: 'firmware.bin',
			iapFile: '',
			expansionBoards: [],
			maxExpansionBoards: 0,
            stepperDriver: "A5984",
            stepperDriverTimings: "1.0:1.0:0.4:0.4",
            lpc: {
                  externalSDCard:{
                      csPin: "0.28",
                      cardDetectPin: "0.27",
                      spiFrequencyHz: 4000000,
                      spiChannel: 0,
                  },
                  internalSDCardSPIFrequencyHz: 25000000,
                  lcd:{
                      lcdCSPin:       "0.16",
                      lcdBeepPin:     "1.31",
                      encoderPinA:    "3.25",
                      encoderPinB:    "3.26",
                      encoderPinSw:   "1.30",
                      lcdDCPin:       "NoPin",
                      panelButtonPin: "2.11",
                      spiChannel: 0,
                  },
                  diagnosticPin: "1.18",
            }
		},
      {
          name: 'biquskr_1.3',
          caption: 'SKR 1.3',
          motorWarningCurrent: 1200,
          motorLimitCurrent: 2000,
          seriesResistor: 4700,
          microstepping: false,
          microsteppingInterpolation: false,
          numDrives: 5,
          heaterPorts: ['HBED', 'HE0', 'HE1'],
          fanPorts: ['FAN'],
          pwmPorts: ['HBED', 'HE0', 'HE1', 'FAN', 'Servo'],
          gpioPorts: ['XMin', 'YMin', 'ZMin', 'XMax', 'YMax', 'ZMax'],
          analogPorts: ['TB', 'TH0', 'TH1'],
          spiCsPorts: [],
          hasEthernet: false,
          hasWiFi: false,
          hasPowerFailureDetection: false,
          hasMotorLoadDetection: false,
          supportsDisplay: true,
          supports12864: true,
          firmwareFile: 'firmware.bin',
          iapFile: '',
          expansionBoards: [],
          maxExpansionBoards: 0,
          stepperDriver: "", // no built in drivers.
          stepperDriverTimings: "",
          lpc: {
                externalSDCard:{
                    csPin: "0.16",
                    cardDetectPin: "1.31",
                    spiFrequencyHz: 4000000,
                    spiChannel: 0,
                },
                internalSDCardSPIFrequencyHz: 25000000,
                softwareSPI:{
                    pins: ["1.20", "NoPin", "1.18"],
                },
                lcd:{
                    lcdCSPin:       "1.19",
                    lcdBeepPin:     "1.30",
                    encoderPinA:    "3.26",
                    encoderPinB:    "3.25",
                    encoderPinSw:   "0.28",
                    lcdDCPin:       "NoPin",
                    panelButtonPin: "NoPin",
                    spiChannel: 2, //Software SPI
                },
                diagnosticPin: "1.18",
          }
      },
      {
          name: 'rearm',
          caption: 'ReARM',
          motorWarningCurrent: 1200,
          motorLimitCurrent: 2000,
          seriesResistor: 4700,
          microstepping: false,
          microsteppingInterpolation: false,
          numDrives: 5,
          heaterPorts: ['D8', 'D9', 'D10'],
          fanPorts: ['D10'],
          pwmPorts: ['D8', 'D9', 'D10', 'Servo0', 'Servo1', 'Servo2'],
          gpioPorts: ['XMin', 'YMin', 'ZMin', 'XMax', 'YMax', 'ZMax'],
          analogPorts: ['T0', 'T1', 'T2'],
          spiCsPorts: [],
          hasEthernet: true,
          hasWiFi: false,
          hasPowerFailureDetection: false,
          hasMotorLoadDetection: false,
          supportsDisplay: true,
          supports12864: true,
          firmwareFile: 'firmware.bin',
          iapFile: '',
          expansionBoards: [],
          maxExpansionBoards: 0,
          stepperDriver: "", // no built in drivers.
          stepperDriverTimings: "",
          lpc: {
                externalSDCard:{
                    csPin: "1.23",
                    cardDetectPin: "1.31",
                    spiFrequencyHz: 4000000,
                    spiChannel: 0,
                },
                internalSDCardSPIFrequencyHz: 25000000,
                lcd:{
                    lcdCSPin:       "0.16",
                    lcdBeepPin:     "1.30",
                    encoderPinA:    "3.25",
                    encoderPinB:    "3.26",
                    encoderPinSw:   "2.11",
                    lcdDCPin:       "2.6",
                    panelButtonPin: "1.22",
                    spiChannel: 0,
                },
                diagnosticPin: "4.28",
          }
      },
      {
          name: 'mkssbase_1.3',
          caption: 'MKS Sbase 1.3',
          motorWarningCurrent: 1200,
          motorLimitCurrent: 2000,
          seriesResistor: 4700,
          microstepping: false,
          microsteppingInterpolation: false,
          numDrives: 5,
          heaterPorts: ['BED', 'E1', 'E2'],
          fanPorts: ['FAN'],
          pwmPorts: ['BED', 'E1', 'E2', 'FAN'],
          gpioPorts: ['XMin', 'YMin', 'ZMin', 'XMax', 'YMax', 'ZMax'],
          analogPorts: ['TH1', 'TH2', 'TH3', 'TH4'],
          spiCsPorts: [],
          hasEthernet: true,
          hasWiFi: false,
          hasPowerFailureDetection: false,
          hasMotorLoadDetection: false,
          supportsDisplay: true,
          supports12864: true,
          firmwareFile: 'firmware.bin',
          iapFile: '',
          expansionBoards: [],
          maxExpansionBoards: 0,
          stepperDriver: "DRV8825",
          stepperDriverTimings: "1.9:1.9:0.65:0.65",
          lpc: {
                externalSDCard:{
                    csPin: "0.28",
                    cardDetectPin: "0.27",
                    spiFrequencyHz: 4000000,
                    spiChannel: 0,
                },
                internalSDCardSPIFrequencyHz: 25000000,
                lcd:{
                    lcdCSPin:       "0.16",
                    lcdBeepPin:     "1.31",
                    encoderPinA:    "3.25",
                    encoderPinB:    "3.26",
                    encoderPinSw:   "1.30",
                    lcdDCPin:       "NoPin",
                    panelButtonPin: "2.11",
                    spiChannel: 0,
                },
                diagnosticPin: "1.18",
          }
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

	isValidPin(board, pin, boardId) {
		const pinTypes = ['heaterPorts', 'fanPorts', 'pwmPorts', 'gpioPorts', 'analogPorts', 'spiCsPorts'];
		return pinTypes.some(function(pinType) {
			return board[pinType].some(function(boardPort) {
				return ((!boardId && Template.isSamePin(pin, boardPort)) ||
						(boardId !== undefined && Template.isSamePin(pin, `${boardId}.${boardPort}`)));
			});
		});
	}
}
