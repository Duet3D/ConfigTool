import type { Board } from "@duet3d/objectmodel";

/**
 * Basic descriptor interface for supported main or expansion boards
 */
export interface BaseBoardDescriptor {
	hasClosedLoopDrivers: boolean;              // TODO add this to object model -> boards
	hasInputPullUps: boolean;
	hasSmartDrivers: boolean;                   // TODO add this to object model -> boards
	hasVrefMonitor: boolean;
	motorWarnCurrent: number;
	motorMaxCurrent: number;
	minVoltage: number,
	maxVoltage: number,
	numDrivers: number;                         // TODO add this to object model -> boards
	microstepInterpolations: Array<number>;     // TODO add this to object model -> boards
	objectModelBoard: Board;
	ports: Record<PortType, Array<string>>;
}

/**
 * Enumeration of possible port types
 */
export enum PortType {
	analogIn = "analogIn",
	fan = "fan",
	fanTacho = "fanTacho",
	gpIn = "gpIn",
	gpOut = "gpOut",
	heater = "heater",
	pwm = "pwm",
	spiCs = "spiCs",
	thermistor = "thermistor",
	uart = "uart"
}
