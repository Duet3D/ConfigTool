import { AxisLetter, DriverId, ModelCollection, ModelDictionary, ModelObject, Probe } from "@duet3d/objectmodel";
import type { ExpansionBoardType } from "@/store/ExpansionBoards";
import { stripPort } from "@/store/Ports";

export class ConfigAutoSaveModel extends ModelObject {
	enabled: boolean = false;
	codesToRun: string = "M913 X0 Y0 G91 M83 G1 Z3 E-5 F1000";
	resumeThreshold: number = 22;
	saveThreshold: number = 19.8;
}

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

export enum ConfigPortType {
	free,
	analog,
	endstop,
	fan,
	fanTacho,
	gpIn,
	gpOut,
	heater,
	probeIn,
	probeMod,
	servo,
	spiCs,
	thermistor,
	uart
}

export class ConfigPort extends ModelObject {
	/**
	 * Constructor of this class to initialize from port aliases
	 * @param value Port aliases divided by plus chars
	 * @param canBoard Optional CAN board address
	 */
	constructor(value: string = "", canBoard: number | null = null) {
		super();
		if (canBoard !== null && canBoard > 0) {
			this.ports = value.split('+').map(port => `${canBoard}.${port}`);
		} else {
			this.ports = value.split('+');
		}
		this.rawPorts = this.ports.map(port => stripPort(port));
	}

	/**
	 * Ports with default modifiers (e.g. inversion [!] or pull-up [^])
	 */
	ports: Array<string>;

	/**
	 * Raw port names without modifiers for faster comparisons
	 */
	rawPorts: Array<string>;

	/**
	 * Check if any port is set for DueX
	 */
	get coversDueX(): boolean {
		return this.rawPorts.some(rawPort => rawPort.startsWith("duex."));
	}

	/**
	 * Assign the ports from the given value
	 * @param value Port to assign from
	 */
	assign(value: ConfigPort) {
		this.ports = value.ports;
		this.rawPorts = value.rawPorts;
	}

	/**
	 * Check if any of the ports match at least one of the value
	 * @param value Value to check
	 * @returns True if this port contains at least one value
	 */
	matches(value: string | ConfigPort) {
		if (typeof value === "string") {
			const valuePorts = value.split('+').map(port => stripPort(port));
			return valuePorts.some(valPort => this.rawPorts.includes(valPort));
		}
		return value.rawPorts.some(valPort => this.rawPorts.includes(valPort));
	}

	/**
	 * Merge another port and add missing ports to this instance
	 * @param value Port to merge
	 */
	merge(value: ConfigPort): void {
		for (let i = 0; i < value.ports.length; i++) {
			const rawOtherPort = value.rawPorts[i];
			if (!this.rawPorts.includes(rawOtherPort)) {
				const otherPort = value.ports[i];
				this.ports.push(otherPort);
				this.rawPorts.push(rawOtherPort);
			}
		}
	}

	/**
	 * Reference index (e.g. heater number)
	 */
	index: number = 0;

	/**
	 * Whether the port is inverted
	 */
	inverted: boolean = false;

	/**
	 * Whether the port has the internal pull-up resistor enabled
	 */
	pullUp: boolean = false;

	/**
	 * State of this port
	 */
	type: ConfigPortType = ConfigPortType.free;

	/**
	 * Convert this instance to a usable port string
	 */
	override toString() {
		// TODO Prefer certain ports (e.g. duex > exp)
		if (this.ports.length > 0) {
			let firstPort = this.ports[0];
			if (this.pullUp) {
				if (firstPort.includes("^")) {
					// If the port already has a pull-up enabled, just strip the pull-up
					firstPort = firstPort.replace("^", "");
				} else {
					// Enable pull-up resistor
					firstPort = "^" + firstPort;
				}
			}
			if (this.inverted) {
				if (firstPort.includes("!")) {
					// If the port is already inverted, just strip the inversion again
					firstPort = firstPort.replace("!", "");
				} else {
					// Invert the port
					firstPort = "!" + firstPort;
				}
			}
			return firstPort;
		}
		return "";
	}
}

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

export class ConfigToolModel extends ModelObject {
	version: number = 0;

	readonly autoSave: ConfigAutoSaveModel = new ConfigAutoSaveModel();
	configOverride: boolean = false;
	deployRetractProbe: boolean = false;
	readonly drivers: ModelCollection<ConfigDriver> = new ModelCollection(ConfigDriver);
	expansionBoard: ExpansionBoardType | null = null;
	homingSpeedFast: number = 30;
	homingSpeedSlow: number = 6;
	homingTravelSpeed: number = 100;
	readonly ports: ModelCollection<ConfigPort> = new ModelCollection(ConfigPort);
	readonly tempSensors: ModelCollection<ConfigTempSensor | null> = new ModelCollection(ConfigTempSensor);

	assignPort(port: string, type: ConfigPortType, index: number) {
		for (const portItem of this.ports) {
			if (portItem.matches(port)) {
				portItem.index = index;
				portItem.inverted = port.includes("!");
				portItem.pullUp = port.includes("^");
				portItem.type = type;
				return;
			}
		}
		throw new Error(`Could not find port ${port}`);
	}
}
