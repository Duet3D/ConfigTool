import type { Board } from "@duet3d/objectmodel";

/**
 * Basic descriptor interface for supported main or expansion boards
 */
export interface BaseBoardDescriptor {
	analogInPorts: Array<string>;
	fanPorts: Array<string>;
	fanTachoPorts: Array<string>;
	gpInPorts: Array<string>;
	gpOutPorts: Array<string>;
	heaterPorts: Array<string>;
	pwmPorts: Array<string>;
	spiCsPorts: Array<string>;
	thermistorPorts: Array<string>;

	hasClosedLoopDrivers: boolean;              // TODO add this to object model -> boards
	hasSmartDrivers: boolean;                   // TODO add this to object model -> boards
	motorWarnCurrent: number;
	motorMaxCurrent: number;
	minVoltage: number,
	maxVoltage: number,
	numDrivers: number;                         // TODO add this to object model -> boards
	microstepInterpolations: Array<number>;     // TODO add this to object model -> boards
	objectModelBoard: Board;
}