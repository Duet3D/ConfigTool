import type { BoardDescriptor } from "@/store/Boards";

export enum STM32F4BoardType {
	// STM32F4
	FlyCDYv2 = "Fly-CDYv2"
}

export enum STM32H7BoardType {
	// STM32H7
	Super8Pro = "Fly-Super8Pro"
}

/**
 * Descriptor interface for STM boards
 */
export interface STMBoardDescriptor extends BoardDescriptor {
    stm: STMBoard;
}

export interface STMBoard {
    board: string;
    statusPin: string;
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
    onboard: boolean;
    module: boolean;
    espDataReadyPin: string | null;
    TfrReadyPin: string | null;
    espResetPin: string | null;
    CSPin: string | null;
    serialRxPin: string | null;
    serialTxPin: string | null;
    firmware: string | null;
    requiresRXTX: boolean;
}

export interface STM_SBC_config {
    support: boolean;
    onboard: boolean;
    firmware: string | null;
}

export interface STM_driver_config {
    driver: string | null;
    smart: boolean;
    TMC5160: boolean;
    TMC5160SPI: string | null;
    TMC5160Pins: string | null;
    TMC5160CS: Array<string> | null;
    diag: Array<string> | null;
}

export interface STM_screen_config {
    auxRX: string;
    auxTX: string;
}
