import { AxisLetter, DriverId, ModelObject } from "@duet3d/objectmodel";

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

export enum ConfigDriverEndstopType {
	switch = "switch",
	probe = "probe",
	stallDetection = "stallDetection"
}

export class ConfigDriverExternal extends ModelObject {
	enablePolarity: boolean = false;
	minStepPulse: number = 5;
	minStepInterval: number = 5;
	dirSetupTime: number = 10;
	holdTime: number = 0;
}

export class ConfigDriverEndstop extends ModelObject {
	lowEnd: boolean = true;
	port: string | null = null;
	type: ConfigDriverEndstopType = ConfigDriverEndstopType.switch;
}

export enum ConfigDriverMode {
	constantOffTime = 0,
	randomOffTime = 1,
	spreadCycle = 2,
	stealthChop = 3,
	closedLoop = 4
}

export class ConfigDriver extends ModelObject {
	readonly closedLoop: ConfigDriverClosedLoop = new ConfigDriverClosedLoop();
	endstop: ConfigDriverEndstop | null = null;
	readonly external: ConfigDriverExternal = new ConfigDriverExternal();
	forwards: boolean = true;
	id: DriverId = new DriverId();
	microstepping: number = 16;
	microsteppingInterpolated: boolean = true;
	mode: ConfigDriverMode = ConfigDriverMode.spreadCycle;
	tpwmThreshold: number = 2000;
	sgThreshold: number = 0;
}
