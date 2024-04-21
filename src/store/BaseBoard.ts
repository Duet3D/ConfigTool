import type { Board } from "@duet3d/objectmodel";

/**
 * Basic descriptor interface for supported main or expansion boards
 */
export interface BaseBoardDescriptor {
	hasADCAutoCalibration: boolean;
	hasClosedLoopDrivers: boolean;              // TODO add this to object model -> boards
	hasInputPullUps: boolean;
	hasSmartDrivers: boolean;                   // TODO add this to object model -> boards
	hasStealthChop: boolean;
	hasVrefMonitor: boolean;
	motorWarnCurrent: number;
	motorMaxCurrent: number;
	minVoltage: number,
	maxVoltage: number,
	numDrivers: number;                         // TODO add this to object model -> boards
	microstepInterpolations: Array<number>;     // TODO add this to object model -> boards
	objectModelBoard: Board;
	ports: Record<PortType, Array<string>>;
	supportsAccelerometer: boolean;
}

/**
 * Enumeration of possible port types
 */
export enum PortType {
	analogIn = "analogIn",
	fan = "fan",
	fanTacho = "fanTacho",
	gpIn = "gpIn",
	gpInInterrupt = "gpInInterrupt",
	gpOut = "gpOut",
	heater = "heater",
	pwm = "pwm",
	scanning = "scanning",
	spiCs = "spiCs",
	thermistor = "thermistor",
	uart = "uart"
}
