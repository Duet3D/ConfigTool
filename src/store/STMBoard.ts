import type { BoardDescriptor } from "@/store/Boards";

/**
 * Descriptor interface for STM boards
 */
export interface STMBoardDescriptor extends BoardDescriptor {
    stm: STMBoard;
}

export interface STMBoard {
    board: string;
    statusPin: string,
    type: string;
    blPorts: Array<string> | null;
    esp8266: {
        onboard: boolean;
        module: boolean;
        espDataReadyPin: string | null,
        TfrReadyPin: string | null,
        espResetPin: string | null,
        CSPin: string | null,
        serialRxPin: string | null;
        serialTxPin: string | null;
        firmware: string | null;
        requiresRXTX: boolean | null;
    },
    esp32: {
        onboard: boolean;
        module: boolean;
        espDataReadyPin: string | null,
        TfrReadyPin: string | null,
        espResetPin: string | null,
        CSPin: string | null,
        serialRxPin: string | null;
        serialTxPin: string | null;
        firmware: string | null;
        requiresRXTX: boolean | null;
    },
    sbc: {
        support: boolean;
        onboard: boolean | null;
        firmware: string | null;
    }
    firmwareStandaloneFile: string;
    stepper:{
        Driver: string;
        Smart: boolean;
        TMC5160: boolean;
        TMC5160SPI: string;
        TMC5160Pins: string;
        TMC5160CS: Array<string> | null;
        diag: Array<string> | null;
    },
    screen: {
        auxRX: string,
        auxTX: string,
    },    
    serialAmount: string,
    neopixel: string,
}
