import { ModelObject, ModelSet } from "@duet3d/objectmodel";
import { PortType } from "../BaseBoard";

/**
 * Enumeration of possible configurations for individual ports
 */
export enum ConfigPortFunction {
	accelerometerInt = "accelerometerInt",
	accelerometerSpiCs = "accelerometerSpiCs",
	endstop = "endstop",
	fan = "fan",
	fanTacho = "fanTacho",
	gpIn = "gpIn",
	gpOut = "gpOut",
	heater = "heater",
	laser = "laser",
	ledStrip = "ledStrip",
	probeIn = "probeIn",
	probeMod = "probeMod",
	probeServo = "probeServo",
	sensorSpiCs = "sensorSpiCs",
	servo = "servo",
	spindlePwm = "spindlePwm",
	spindleFirstPort = "spindleFirstPort",
	spindleSecondPort = "spindleSecondPort",
	thermistor = "thermistor",
	uart = "uart",

	spindleForwards_deprecated = "spindleForwards",
	spindleBackwards_deprecated = "spindleBackwards"
}

/**
 * Representation of an available or mapped port
 */
export class ConfigPort extends ModelObject {
	/**
	 * Constructor of this class to initialize from port aliases
	 * @param value Port aliases divided by plus chars
	 * @param canBoard Optional CAN board address
	 * @param capability Optional port capability
	 */
	constructor(value: string = "", canBoard: number | null = null, capability: PortType | null = null) {
		super();
		this.canBoard = canBoard;
		if (canBoard !== null && canBoard > 0) {
			this.ports = value.split('+').map(port => `${canBoard}.${port}`);
		} else {
			this.ports = value.split('+');
		}
		this.rawPorts = this.ports.map(port => stripPort(port));
		if (capability !== null) {
			this.capabilities.add(capability);
			this.frequency = (capability === PortType.fan || capability === PortType.heater) ? 250 : 500;
		}
	}

	/**
	 * Capabilities of this port
	 */
	capabilities: ModelSet<PortType> = new ModelSet<PortType>();

	/**
	 * CAN address of this port
	 */
	canBoard: number | null = null;

	/**
	 * Update the CAN board of this port
	 * @param value New CAN address
	 */
	setCanBoard(value: number) {
		const regex = new RegExp(`(^[!^]*)(${this.canBoard})\.`), replaceWith = `$1${value.toString()}.`;
		this.ports = this.ports.map(port => port.replace(regex, replaceWith));
		this.rawPorts = this.rawPorts.map(rawPort => rawPort.replace(regex, replaceWith));
		this.canBoard = value;
	}

	/**
	 * Ports with default modifiers (e.g. inversion [!] or pull-up [^])
	 */
	ports: Array<string> = [];

	/**
	 * Raw port names without address prefix or modifiers for faster comparisons
	 */
	rawPorts: Array<string> = [];

	/**
	 * Check if any port is set for DueX
	 */
	get coversDueX(): boolean {
		return this.rawPorts.some(rawPort => rawPort.startsWith("duex."));
	}

	/**
	 * Assign the ports from the given value
	 * @param value Port to assign from
	 * @param updateProperties Whether to update the properties of this port
	 */
	assign(value: ConfigPort, updateProperties: boolean ) {
		this.canBoard = value.canBoard;
		this.capabilities = new ModelSet<PortType>(value.capabilities);
		this.ports = value.ports.slice();
		this.rawPorts = value.rawPorts.slice();

		if (updateProperties) {
			this.frequency = value.frequency;
			this.inverted = value.inverted;
			this.pullUp = value.pullUp;
		}
	}

	/**
	 * Check if any of the ports match at least one of the value
	 * @param value Value to check
	 * @returns True if this port contains at least one value
	 */
	equals(value: string | ConfigPort) {
		if (typeof value === "string") {
			const valuePorts = value.split('+').map(port => stripPort(port));
			for (const valuePort of valuePorts) {
				if (this.rawPorts.includes(valuePort)) {
					return true;
				}

				if (!this.canBoard) {
					const matches = /^(\d+)\.(.+)/.exec(valuePort);
					if (matches !== null && matches[1] === "0" && this.rawPorts.includes(matches[2])) {
						return true;
					}
				}
			}
			return false;
		}
		return value.rawPorts.some(valuePort => this.rawPorts.includes(valuePort));
	}

	/**
	 * Check if the port matches the given expansion/main board
	 * @param value Board number
	 * @returns True if both boards are equal
	 */
	equalsBoard(value: number | null) {
		if (!this.canBoard) {
			return !value;
		}
		return this.canBoard === value;
	}

	/**
	 * Merge another port and add missing ports to this instance
	 * @param value Port to merge
	 */
	merge(value: ConfigPort): void {
		for (const capability of value.capabilities) {
			this.capabilities.add(capability);
		}
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
	 * Current function of this port
	 */
	function: ConfigPortFunction | null = null;

	/**
	 * Item index (e.g. heater number)
	 */
	index: number = 0;

	/**
	 * Frequency to drive the port at
	 */
	frequency: number = 0;

	/**
	 * Whether the port is inverted
	 */
	inverted: boolean = false;

	/**
	 * Whether the port has the internal pull-up resistor enabled
	 */
	pullUp: boolean = false;

	/**
	 * Get a user-friendly label for the port based on its function
	 * @param fn Function to get the label for
	 * @returns User-friendly label (or first port if no special label is available)
	 */
	getLabel(fn: ConfigPortFunction): string {
		switch (fn) {
			case ConfigPortFunction.spindlePwm:
			case ConfigPortFunction.spindleFirstPort:
			case ConfigPortFunction.spindleSecondPort:
				if (this.ports.includes("vfd")) {
					return "vfd";
				}
				break;
			case ConfigPortFunction.laser:
				if (this.ports.includes("laser")) {
					return "laser";
				}
				break;
		}
		return this.ports[0];
	}

	/**
	 * Convert this instance to a usable port string
	 */
	override toString() {
		if (this.ports.length > 0) {
			// Use primary port designator where applicable
			let primaryPort = this.ports[0];
			switch (this.function) {
				case ConfigPortFunction.spindlePwm:
				case ConfigPortFunction.spindleFirstPort:
				case ConfigPortFunction.spindleSecondPort:
					if (this.ports.includes("vfd")) {
						primaryPort = "vfd";
					}
					break;
				case ConfigPortFunction.laser:
					if (this.ports.includes("laser")) {
						primaryPort = "laser";
					}
					break;
			}

			// Add modifiers
			if (this.pullUp) {
				if (primaryPort.includes("^")) {
					// If the port already has a pull-up enabled, just strip the pull-up
					primaryPort = primaryPort.replace("^", "");
				} else {
					// Enable pull-up resistor
					primaryPort = "^" + primaryPort;
				}
			}
			if (this.inverted) {
				if (primaryPort.includes("!")) {
					// If the port is already inverted, just strip the inversion again
					primaryPort = primaryPort.replace("!", "");
				} else {
					// Invert the port
					primaryPort = "!" + primaryPort;
				}
			}
			return primaryPort;
		}
		return "";
	}
}

/**
 * Strip default modifiers from a given port (aka '!', '^')
 * @param value Port to strip
 * @returns Stripped port
 */
export function stripPort(value: string) {
	return value.replace(/^[!^]+/, "");
}

/**
 * Strip the optional board number from a given port (e.g. "0." from "0.io3.in")
 * @param value Port to strip
 * @returns Stripped port
 */
export function stripBoard(value: string) {
	return value.replace(/^(\d+\.)/, "");
}
