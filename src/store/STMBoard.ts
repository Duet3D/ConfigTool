import type { BoardDescriptor } from "@/store/Boards";

export enum STM32F4BoardType {
	// Boards using a STM32F4 MCU
    // NB: Make sure the member names are unique over all boards types
    BTT_GTR_V1 = "BTT GTR V1.0",
	Fly_CDYv2 = "Fly-CDYv2",
    Fly_CDYv3 = "Fly-CDYv3",
    Fly_E3 = "Fly-E3"
}

export enum STM32H723BoardType {
	// Boards using a STM32H723 MCU
    // NB: Make sure the member names are unique over all boards types
	Fly_Super8Pro_H723 = "Fly-Super8Pro H723"
}

export enum STM32H743BoardType {
	// Boards using a STM32H723 MCU
    // NB: Make sure the member names are unique over all boards types
	Fly_Super8Pro_H743 = "Fly-Super8Pro H743"
}

export type STMBoardTypes = STM32F4BoardType | STM32H723BoardType | STM32H743BoardType
export const STMBoardTypes = {...STM32F4BoardType, ...STM32H723BoardType, ...STM32H743BoardType};

/**
 * Descriptor interface for STM boards
 */
export interface STMBoardDescriptor extends BoardDescriptor {
    stm: STMBoard;
}

export interface STMBoard {
    board: string;
    statusPin: string | null;
    type: string;
    blPorts: Array<string> | null;
    esp8266: STM_ESP_config;
    esp32: STM_ESP_config;
    sbc: STM_SBC_config;
    firmwareStandaloneFile: string;
    stepper: STM_driver_config;
    screen: STM_screen_config;
    serialAmount: string;
    neopixel: string;
}

export interface STM_ESP_config {
    /**
     * onboard: Define if the board has an embedded ESP module
     */
    onboard: boolean;

    /**
     * onboard: Define if the board has support for an ESP module
     */
    module: boolean;

    /**
     * dataReadyPin: This is the pin to be used in board.txt for 8266wifi.espDataReadyPin. Set to null or NoPin if not used.
     */
    dataReadyPin: string | null;

    /**
     * tfrReadyPin: This is the pin to be used in board.txt for 8266wifi.TfrReadyPin. Set to null or NoPin if not used.
     */
    tfrReadyPin: string | null;

    /**
     * resetPin: This is the pin to be used in board.txt for 8266wifi.espResetPin. Set to null or NoPin if not used.
     */
    resetPin: string | null;

    /**
     * csPin: This is the pin to be used in board.txt for 8266wifi.csPin. Set to null or NoPin if not used.
     */
    csPin: string | null;

    /**
     * rxPin: This is the pin to be used in board.txt for 8266wifi.serialRxTxPins to update the ESP Wifi firmware from DWC. Set to null or NoPin if not used.
     */
    rxPin: string | null;

    /**
     * txPin: This is the pin to be used in board.txt for 8266wifi.serialRxTxPins to update the ESP Wifi firmware from DWC. Set to null or NoPin if not used.
     */
    txPin: string | null;

    /**
     * firmware: 
     */
    firmware: string | null;
}

export interface STM_SBC_config {
    support: boolean;
    onboard: boolean;
    firmware: string | null;
}

export interface STM_driver_config {
    /**
     * driverType: Define the on-board drivers. Set it to null if the board doesn't have any.
     * This is used to set stepper.DriverType in board.txt
     */
    driverType : Array<string> | null;

    /**
     * spiChannel: SPI channel used for communication between the MCU and the drivers.
     * This is used to set stepper.spiChannel in board.txt
     */
    spiChannel: number | null;

    /**
     * spiPins: Definition of the pins used for SPI communication between the MCU and the drivers.
     * Pins order should be ['SCK', 'MISO', 'MOSI']
     * This is used to set SPIx.pins in board.txt
     */
    spiPins: Array<string> | null;

    /**
     * tmcDiagPins: Definition of the MCU pins connected to the diag pin of the TMC drivers
     * and that can be used for sensorless homing/stall detection.
     * This is used to set stepper.TmcDiagPins in board.txt
     * The pins in stepper.TmcDiagPins should only be set where sensorless homing is intended to be used.
     * "NoPin" should be used otherwise.
     */
    tmcDiagPins: Array<string> | null;

    /**
     * tmcUartPins: Definition of the MCU pins connected to the CS/UART pin of the TMC drivers
     * and used for communication in UART mode.
     * This is used to set stepper.TmcUartPins in board.txt
     */
    tmcUartPins?: Array<string> | null;

    /**
     * enablePins:
     */
    enablePins?: Array<string> | null;

    /**
     * stepPins:
     */
    stepPins?: Array<string> | null;

    /**
     * directionPins:
     */
    directionPins?: Array<string> | null;
}

export interface STM_screen_config {
    auxRX: string;
    auxTX: string;
}
