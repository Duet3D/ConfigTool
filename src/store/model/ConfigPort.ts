import { ModelObject } from "@duet3d/objectmodel";
import { stripPort } from "@/store/Ports";

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
        this.canBoard = canBoard;
		if (canBoard !== null && canBoard > 0) {
			this.ports = value.split('+').map(port => `${canBoard}.${port}`);
		} else {
			this.ports = value.split('+');
		}
		this.rawPorts = this.ports.map(port => stripPort(port));
	}

    /**
     * CAN address of these ports
     */
    canBoard: number | null = null;

	/**
	 * Ports with default modifiers (e.g. inversion [!] or pull-up [^])
	 */
	ports: Array<string>;

	/**
	 * Raw port names without address prefix or modifiers for faster comparisons
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
