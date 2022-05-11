import { ModelObject } from "@duet3d/objectmodel";

export enum ConfigTempSensorType {
	thermistor
}

export class ConfigTempSensor extends ModelObject {                     // TODO add all of this to object model -> sensors -> analog[]
	beta: number = 4725;
	r25: number = 100000;
	sensorIndex: number = -1;
	shC: number = 7.060e-8;
	type: ConfigTempSensorType = ConfigTempSensorType.thermistor;
}
