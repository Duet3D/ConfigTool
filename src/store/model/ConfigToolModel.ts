import { initObject, ModelCollection, ModelDictionary, ModelObject } from "@duet3d/objectmodel";

import { ConfigPort, ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigTempSensor } from "@/store/model/ConfigTempSensor";
import { ConfigDriver } from "@/store/model/ConfigDriver";
import type { ExpansionBoardType } from "@/store/ExpansionBoards";
import { precise } from "@/utils";

export class ConfigAutoSaveModel extends ModelObject {
	enabled: boolean = false;
	codesToRun: string = "M913 X0 Y0 G91 M83 G1 Z3 E-5 F1000";
	resumeThreshold: number = 22;
	saveThreshold: number = 19.8;
}

export class ConfigCapabilities extends ModelObject {
	cnc: boolean = false;
	fff: boolean = true;
	laser: boolean = false;
}

export class ConfigDeltaProbePoint extends ModelObject {
	x: number = 0;
	y: number = 0;
	heightCorrection: number = 0;
}

export class ConfigDeltaProperties extends ModelObject {
	peripheralPoints: number = 3;
	halfwayPoints: number = 3;
	factors: number = 6;
	slowHoming: boolean = false;
	lowDiveHeight: boolean = true;
	probeRadius: number = 85;
	readonly probePoints: ModelCollection<ConfigDeltaProbePoint> = new ModelCollection(ConfigDeltaProbePoint);
	homeFirst: boolean = false;

	/**
	 * Recalculate the Delta probe points
	 * @param probeOffsetX X offset of the probe
	 * @param probeOffsetY Y offset of the probe
	 */
	calculateProbePoints(probeOffsetX: number, probeOffsetY: number) {
		// Recalculate and add all probe points
		// Thanks to dc42 for providing the calculation code (original source from escher3d.com)
		const prevPoints = this.probePoints.splice(0);
		for (let i = 0; i < this.peripheralPoints; i++) {
			let probeX = this.probeRadius * Math.sin((2 * Math.PI * i) / this.peripheralPoints);
			let probeY = this.probeRadius * Math.cos((2 * Math.PI * i) / this.peripheralPoints);
			const rad = Math.sqrt(Math.pow(probeX + probeOffsetX, 2) + Math.pow(probeY + probeOffsetY, 2)) + 0.1;
			if (rad > this.probeRadius) {
				const factor = this.probeRadius / rad;
				probeX *= factor;
				probeY *= factor;
			}
			this.probePoints.push(initObject(ConfigDeltaProbePoint, {
				x: probeX,
				y: probeY,
				heightCorrection: (prevPoints.length > i) ? prevPoints[i].heightCorrection : 0
			}));
		}

		for (let i = 0; i < this.halfwayPoints; i++) {
			let probeX = (this.probeRadius / 2) * Math.sin((2 * Math.PI * i) / this.halfwayPoints);
			let probeY = (this.probeRadius / 2) * Math.cos((2 * Math.PI * i) / this.halfwayPoints);
			const rad = Math.sqrt(Math.pow(probeX + probeOffsetX, 2) + Math.pow(probeY + probeOffsetY, 2)) + 0.1;
			if (rad > this.probeRadius / 2) {
				const factor = (this.probeRadius / 2) / rad;
				probeX *= factor;
				probeY *= factor;
			}
			this.probePoints.push(initObject(ConfigDeltaProbePoint, {
				x: probeX,
				y: probeY,
				heightCorrection: (prevPoints.length > this.peripheralPoints + i) ? prevPoints[this.peripheralPoints + i].heightCorrection : 0
			}));
		}

		this.probePoints.push(initObject(ConfigDeltaProbePoint, {
			x: 0,
			y: 0,
			heightCorrection: 0
		}));

		for (const point of this.probePoints) {
			point.x = precise(point.x, 2);
			point.y = precise(point.y, 2);
		}
	}
}

export class ConfigDisplayFiles extends ModelObject {
	menus: ModelDictionary<string> = new ModelDictionary<string>(true);
	images: ModelDictionary<string> = new ModelDictionary<string>(true);
}

export class ConfigLaserModel extends ModelObject {
	maxIntensity: number = 255;
	sParamSticky: boolean = false;
}

export class ConfigWiFi extends ModelObject {
	ssid: string = "";
	psk: string = "";
}

export class ConfigToolModel extends ModelObject {
	version: number = 1;

	readonly autoSave: ConfigAutoSaveModel = new ConfigAutoSaveModel();
	autoSelectFirstTool: boolean = false;
	readonly capabilities: ConfigCapabilities = new ConfigCapabilities();
	configOverride: boolean = false;
	customSettings: string = "";
	readonly delta: ConfigDeltaProperties = new ConfigDeltaProperties();
	deployRetractProbes: Set<number> = new Set();
	readonly displayFiles: ConfigDisplayFiles = new ConfigDisplayFiles();
	readonly drivers: ModelCollection<ConfigDriver> = new ModelCollection(ConfigDriver);
	expansionBoard: ExpansionBoardType | null = null;
	homeBeforeAutoCalibration: boolean = false;
	homingSpeedFast: number = 30;
	homingSpeedSlow: number = 6;
	readonly laser: ConfigLaserModel = new ConfigLaserModel();
	name: string | null = null;
	orthogonalDistance: number = 85;
	panelDueChecksum: boolean = false;
	panelDueBaudRate: number = 57600;
	password: string = "";
	readonly ports: ModelCollection<ConfigPort> = new ModelCollection(ConfigPort);
	skewOffset: number = 100;
	readonly sensors: ModelCollection<ConfigTempSensor | null> = new ModelCollection(ConfigTempSensor);
	waitForToolTemperatures: boolean = true;
	readonly wiFi: ConfigWiFi = new ConfigWiFi();

	assignPort(port: string, fn: ConfigPortFunction | null, index: number, frequency?: number): ConfigPort {
		for (const item of this.ports) {
			if (item.equals(port)) {
				item.function = fn;
				item.frequency = frequency ?? ((fn === ConfigPortFunction.fan || ConfigPortFunction.heater) ? 250 : 500);
				item.index = index;
				item.inverted = port.includes("!");
				item.pullUp = port.includes("^");
				return item;
			}
		}
		throw new Error(`Could not find port ${port}`);
	}

	getProbesByBoard(board: number | null): Set<number> {
		const probes = new Set<number>();
		for (const port of this.ports) {
			if (port.canBoard === board && [ConfigPortFunction.probeIn, ConfigPortFunction.probeMod, ConfigPortFunction.probeServo].includes(port.function!)) {
				probes.add(port.index);
			}
		}
		return probes;
	}
}
