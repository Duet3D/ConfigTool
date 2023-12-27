import { AxisLetter, DriverId, EndstopType, ModelObject } from "@duet3d/objectmodel";

export enum ConfigDriverClosedLoopEncoderType {
	none = 0,
	quadratureOnAxis = 1,
	quadratureOnMotor = 2,
	magnetic = 3
}

export class ConfigDriverClosedLoop extends ModelObject {
	encoderType: ConfigDriverClosedLoopEncoderType = ConfigDriverClosedLoopEncoderType.none;
	countsPerFullStep: number = 5;
}

export class ConfigDriverExternal extends ModelObject {
	enablePolarity: boolean = false;
	minStepPulse: number = 5;
	minStepInterval: number = 5;
	dirSetupTime: number = 10;
	holdTime: number = 0;
}

export enum ConfigDriverMode {
	constantOffTime = 0,
	randomOffTime = 1,
	spreadCycle = 2,
	stealthChop = 3,
	closedLoop = 4
}

export enum ConfigDriverType {
	none = "none",
	stepDir = "stepdir",
	tmc2208 = "tmc2208",
	tmc2209 = "tmc2209",
	tmc2240 = "tmc2240",
	tmc2660 = "tmc2660",
	tmc5160 = "tmc5160"
}

export class ConfigDriver extends ModelObject {
	readonly closedLoop: ConfigDriverClosedLoop = new ConfigDriverClosedLoop();
	readonly external: ConfigDriverExternal = new ConfigDriverExternal();
	type: ConfigDriverType = ConfigDriverType.none;
	forwards: boolean = true;
    homingSpeeds: Array<number> = [10, 5];
	id: DriverId = new DriverId();
	mode: ConfigDriverMode = ConfigDriverMode.spreadCycle;
	tpwmThreshold: number = 2000;
	sgThreshold: number = 0;
}
