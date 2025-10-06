import { ModelObject } from "@duet3d/objectmodel";

export class ConfigTempSensor extends ModelObject {                     // TODO add all of this to object model -> sensors -> analog[]
	adcHighOffset: number | null = null;
	adcLowOffset: number | null = null;
	beta: number = 4725;
	r25: number = 100000;
	shC: number = 7.060e-8;
	seriesR: number | null = null;

	filtered: boolean = true;											// only used by LinearAnalog
	bipolar: boolean = false;											// only used by ADS131
	minTemp: number = 0;												// temp at ADC == min
	maxTemp: number = 200;												// temp at ADC == max

	thermocoupleType: string = "K";										// only used by MAX31856
	mainsFrequency: number = 50;										// used by MAX31856 and MAX31865
	numWires: 2 | 3 | 4 = 2;											// only used by MAX31865
	rref: number | null = null;											// only used by MAX31865

	baseSensor: number | null = null;									// referenced sensor, e.g. by DHT humidity
}
