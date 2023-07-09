import type { BoardDescriptor } from "@/store/Boards";

/**
 * Descriptor interface for STM boards
 */
export interface STMBoardDescriptor extends BoardDescriptor {
    stm: STMBoard;
}

export interface STMBoard {
    board: string;
    type: string;
    blPorts: Array<string> | null;
    hasESP: boolean;
    hasESPUpdate: boolean;
    hasESPOnboard: boolean;
    hasESP32Onboard: boolean;
    hasSBC: boolean;
    hasSBCOnboard: boolean;
    firmwareStandaloneFile: string;
    firmwareSBCFile: string;
    firmwareWifiFile: string;
    firmwareWifi32File: string | null;
    requiresBeta: boolean;
    stepperDriver: string;
    stepperDriverTimings: string;
    stepperDriverSmart: boolean;
    stepperDriver5160: boolean;
    stepperDriver5160SPI: string;
    stepperDriver5160Pins: string;
    stepperDriver5160CS: Set<string>;
    serialRxPin: string;
    serialTxPin: string;
    espDataReadyPin: string,
    lpcTfrReadyPin: string,
    espResetPin: string,
    lpc: {
        externalSDCard:{
            csPin: string,
            cardDetectPin: string,
            spiFrequencyHz: number,
            spiChannel: number,
        },
        internalSDCardSPIFrequencyHz: number,
        softwareSPI:{
            pins: Array<string>,
        },
        lcd:{
            lcdCSPin: string,
            lcdBeepPin: string,
            encoderPinA: string,
            encoderPinB: string,
            encoderPinSw: string,
            lcdDCPin: string,
            panelButtonPin: string,
            spiChannel: number,
        },
        diagnosticPin: string,
    },/*
    drives: [
        {
            diag: "E.7",
        },
        {
            diag: "E.8",
        },
        {
            diag: "E.9",
        },
        {
            diag: "",
        },
        {
            diag: "",
        }
    ],*/
    auxRX: string,
    auxTX: string,
    serialAmount: string,
    wifi8266CSPin: string,
    esp32: {
        esp32Supported: boolean,
        espDataReadyPin: string,
        lpcTfrReadyPin: string,
        espResetPin: string,
        wifi8266CSPin: string
    },
    neopixel: string,
    requiresRXTX: boolean
}
