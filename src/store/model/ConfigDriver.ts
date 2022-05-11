import { AxisLetter, DriverId, ModelObject } from "@duet3d/objectmodel";

export enum ConfigDriverEndstopType {
	switch = "switch",
	probe = "probe",
	stallDetection = "stallDetection"
}

export class ConfigDriverEndstop extends ModelObject {
	lowEnd: boolean = true;
	port: string | null = null;
	type: ConfigDriverEndstopType = ConfigDriverEndstopType.switch;
}

export class ConfigDriver extends ModelObject {
	axis: AxisLetter | null = null;
	extruder: number | null = null;

	endstop: ConfigDriverEndstop | null = null;
	forwards: boolean = true;
	id: DriverId = new DriverId();
	microstepping: number = 16;
	microsteppingInterpolated: boolean = true;
}
