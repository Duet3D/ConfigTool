import { ModelCollection, ModelDictionary, ModelObject } from "@duet3d/objectmodel";

import { ConfigPort, ConfigPortType } from "@/store/model/ConfigPort";
import { ConfigTempSensor } from "@/store/model/ConfigTempSensor";
import { ConfigDriver } from "@/store/model/ConfigDriver";
import type { ExpansionBoardType } from "@/store/ExpansionBoards";

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

export class ConfigDisplayFiles extends ModelObject {
	menus: ModelDictionary<string> = new ModelDictionary<string>(true);
	images: ModelDictionary<string> = new ModelDictionary<string>(true);
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
	deltaProbePoints: ModelCollection<ConfigDeltaProbePoint> = new ModelCollection(ConfigDeltaProbePoint);
	deployRetractProbe: boolean = false;
	readonly displayFiles: ConfigDisplayFiles = new ConfigDisplayFiles();
	readonly drivers: ModelCollection<ConfigDriver> = new ModelCollection(ConfigDriver);
	expansionBoard: ExpansionBoardType | null = null;
	homeBeforeAutoCalibration: boolean = false;
	homingSpeedFast: number = 30;
	homingSpeedSlow: number = 6;
	panelDue: boolean = false;
	password: string = "";
	readonly ports: ModelCollection<ConfigPort> = new ModelCollection(ConfigPort);
	skewOffset: number = 100;
	readonly tempSensors: ModelCollection<ConfigTempSensor | null> = new ModelCollection(ConfigTempSensor);
	waitForToolTemperatures: boolean = true;
	readonly wiFi: ConfigWiFi = new ConfigWiFi();

	assignPort(port: string, type: ConfigPortType, index: number, frequency: number = 0) {
		for (const portItem of this.ports) {
			if (portItem.matches(port)) {
				portItem.frequency = frequency;
				portItem.index = index;
				portItem.inverted = port.includes("!");
				portItem.pullUp = port.includes("^");
				portItem.type = type;
				return;
			}
		}
		throw new Error(`Could not find port ${port}`);
	}

    getProbesByBoard(board: number | null): Array<number> {
        const probes: Array<number> = [];
        for (const port of this.ports) {
            if ((port.type === ConfigPortType.probeIn || port.type === ConfigPortType.probeMod) &&
                !probes.includes(port.index)) {
                probes.push(port.index);
            }
        }
        return probes;
    }

    getPortsByBoard(board: number | null): Array<ConfigPort> {
        // TODO
        return [];
    }
}
