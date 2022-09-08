import { ModelObject } from "@duet3d/objectmodel";

export class ConfigTempSensor extends ModelObject {                     // TODO add all of this to object model -> sensors -> analog[]
	adchighOffset: number | null = null;
	adcLowOffset: number | null = null;

	beta: number = 4725;
	r25: number = 100000;
	shC: number = 7.060e-8;
	seriesR: number | null = null;

	otherSensor: number | null = null;									// Referenced sensor by DHT Humdity
}
