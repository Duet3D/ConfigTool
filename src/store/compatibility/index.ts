import {
	AnalogSensor,
	AnalogSensorType,
	Axis,
	AxisLetter,
	CoreKinematics,
	DeltaKinematics,
	DriverId,
	Extruder,
	Heater,
	initObject,
	KinematicsName,
	Probe,
	ProbeType
} from "@duet3d/objectmodel";

import ConfigModel from "@/store/model";

import { BoardType } from "@/store/Boards";
import { ExpansionBoardType } from "@/store/ExpansionBoards";

import type { LegacyTemplate } from "@/store/compatibility/LegacyTemplate";
import {
	LegacyEndstopLocation,
	LegacyEndstopType,
	LegacyGeometry,
	LegacyProbeType
} from "@/store/compatibility/LegacyTemplate";
import { LegacyBoardType } from "@/store/compatibility/LegacyBoards";
import { LegacyExpansionBoardType } from "@/store/compatibility/LegacyExpansionBoards";
import {
	ConfigDriverEndstop,
	ConfigDriverEndstopType,
	ConfigPortType,
	ConfigTempSensor,
	ConfigTempSensorType
} from "@/store/model/ConfigToolModel";

/**
 * Convert a legacy template (configtool < 3.4) to a config model object
 * @param input Input object
 * @returns Output object
 */
export function convertLegacyTemplate(input: LegacyTemplate): ConfigModel {
	const model = new ConfigModel();

	// Only templates for RRF 3 are supported...
	if (input.firmware < 3) {
		throw new Error("RepRapFirmware version is too old. Upgrade to v3 first using the old config tool");
	}

	// General Preferences
	const boardType = input.board as LegacyBoardType;
	switch (boardType) {
		case LegacyBoardType.Duet06:
		case LegacyBoardType.Duet085:
			throw new Error("Duet 0.6/0.8.5 is no longer supported. Please use configtool < 3.4 instead");
		case LegacyBoardType.Duet2WiFi:
			model.boardType = BoardType.Duet2WiFi;
			break;
		case LegacyBoardType.Duet2Ethernet:
			model.boardType = BoardType.Duet2Ethernet;
			break;
		case LegacyBoardType.Duet2Maestro:
			model.boardType = BoardType.Duet2Maestro;
			break;
		case LegacyBoardType.Duet3MB6HC:
			model.boardType = BoardType.Duet3MB6HC;
			break;
		case LegacyBoardType.Duet3Mini5PlusWiFi:
			model.boardType = BoardType.Duet3Mini5PlusWiFi;
			break;
		case LegacyBoardType.Duet3Mini5PlusEthernet:
			model.boardType = BoardType.Duet3Mini5PlusEthernet;
			break;
		default:
			const _exhaustiveCheck: never = boardType;
			throw new Error(`Unsupported board "${boardType}`);
	}

	model.configTool.autoSave.enabled = input.auto_save.enabled;
	model.configTool.autoSave.codesToRun = input.auto_save.gcodes_to_run;
	model.configTool.autoSave.resumeThreshold = input.auto_save.resume_threshold;
	model.configTool.autoSave.saveThreshold = input.auto_save.save_threshold;
	model.network.name = input.network.name;
	model.configTool.configOverride = input.nvram;

	// Printer Geometry
	switch (input.geometry.type) {
		case LegacyGeometry.Cartesian:
			model.move.kinematics = new CoreKinematics(KinematicsName.cartesian);
			break;
		case LegacyGeometry.CoreXY:
			model.move.kinematics = new CoreKinematics(KinematicsName.coreXY);
			break;
		case LegacyGeometry.CoreXZ:
			model.move.kinematics = new CoreKinematics(KinematicsName.coreXZ);
			break;
		case LegacyGeometry.Delta:
			model.move.kinematics = new DeltaKinematics(KinematicsName.coreXZ);
			break;
		default:
			const _exhaustiveCheck: never = input.geometry.type;
			throw new Error(`Invalid legacy geometry type ${input.geometry.type}`);
	}

	model.move.axes.push(initObject(Axis, { letter: AxisLetter.X }));
	model.move.axes.push(initObject(Axis, { letter: AxisLetter.Y }));
	model.move.axes.push(initObject(Axis, { letter: AxisLetter.Z }));

	if (input.geometry.type === LegacyGeometry.Delta) {
		const deltaKinematics = model.move.kinematics as DeltaKinematics;
		deltaKinematics.deltaRadius = input.geometry.delta_radius;
		deltaKinematics.printRadius = input.geometry.print_radius;
		model.move.axes[2].min = input.geometry.z_min;
		// model.move.axes[2].max = input.geometry.max_carriage_travel; // seems to be unused
		deltaKinematics.towers.forEach(tower => tower.diagonal = input.geometry.rod_length);
		deltaKinematics.homedHeight = input.geometry.homed_height;
	} else {
		model.move.axes[0].min = input.geometry.mins[0];
		model.move.axes[0].max = input.geometry.maxes[0];
		model.move.axes[1].min = input.geometry.mins[1];
		model.move.axes[1].max = input.geometry.maxes[1];
		model.move.axes[2].min = input.geometry.mins[2];
		model.move.axes[2].max = input.geometry.maxes[2];
	}

	// Homing preferences
	model.sensors.probes.push(initObject(Probe, {
		diveHeight: input.z_dive_height,
		travelSpeed: input.travel_speed
	}));

	// Expansion Boards
	for (const expansionBoardType of input.expansion_boards as LegacyExpansionBoardType[]) {
		switch (expansionBoardType) {
			case LegacyExpansionBoardType.DueX2:
				model.addExpansionBoard(ExpansionBoardType.DueX2);
				break;
			case LegacyExpansionBoardType.DueX5:
				model.addExpansionBoard(ExpansionBoardType.DueX5);
				break;
			case LegacyExpansionBoardType.Duet3Mini2Plus:
				model.addExpansionBoard(ExpansionBoardType.Duet3Mini2Plus);
				break;
			case LegacyExpansionBoardType.EXP3HC:
				model.addExpansionBoard(ExpansionBoardType.EXP3HC);
				break;
			case LegacyExpansionBoardType.TOOL1LC:
				model.addExpansionBoard(ExpansionBoardType.TOOL1LC);
				break;
			case LegacyExpansionBoardType.EXP1XD:
				model.addExpansionBoard(ExpansionBoardType.EXP1XD);
				break;
			case LegacyExpansionBoardType.EXP1HCL:
				model.addExpansionBoard(ExpansionBoardType.EXP1HCL);
				break;
			default:
				const _exhaustiveCheck: never = expansionBoardType;
				throw new Error(`Invalid legacy expansion board type ${expansionBoardType}`);
		}
	}

	// Drivers and Endstop Configuration
	for (let i = 0; i < input.drives.length; i++) {
		const legacyDrive = input.drives[i], driverId = new DriverId();
		driverId.update(legacyDrive.driver_v3);

		const driver = model.configTool.drivers.find(driverItem => driverItem.id.board === driverId.board && driverItem.id.driver === driverId.driver);
		if (driver === undefined) {
			throw new Error(`Cannot find driver ${driverId.toString()}`);
		}

		if (i < 3) {
			const axis = model.move.axes[i];
			axis.acceleration = legacyDrive.acceleration;
			axis.current = legacyDrive.current;
			if (legacyDrive.endstop_type !== LegacyEndstopType.None) {
				const configEndstop = new ConfigDriverEndstop();
				configEndstop.lowEnd = legacyDrive.endstop_location === LegacyEndstopLocation.LowEnd;
				switch (legacyDrive.endstop_type) {
					case LegacyEndstopType.Switch:
					case LegacyEndstopType.Switch_deprecated:
						configEndstop.type = ConfigDriverEndstopType.switch;
						break;
					case LegacyEndstopType.ZProbe:
						configEndstop.type = ConfigDriverEndstopType.probe;
						break;
					case LegacyEndstopType.StallDetection:
						configEndstop.type = ConfigDriverEndstopType.stallDetection;
						break;
					default:
						const _exhaustiveCheck: never = legacyDrive.endstop_type;
						throw new Error(`Invalid legacy endstop type ${legacyDrive.endstop_type} in driver #${i}`);
				}
				if (legacyDrive.endstop_pin !== null) {
					configEndstop.port = legacyDrive.endstop_pin;
					model.configTool.assignPort(legacyDrive.endstop_pin, ConfigPortType.endstop, i);
				} else if (legacyDrive.endstop_type === LegacyEndstopType.Switch || legacyDrive.endstop_type === LegacyEndstopType.Switch_deprecated) {
					throw new Error(`Invalid endstop configuration in driver ${i}`);
				}
				driver.endstop = configEndstop;
			}
			driver.forwards = legacyDrive.direction;
			axis.jerk = legacyDrive.instant_dv;
			driver.microstepping = legacyDrive.microstepping;
			driver.microsteppingInterpolated = legacyDrive.microstepping_interpolation;
			axis.speed = legacyDrive.max_speed;
			axis.stepsPerMm = legacyDrive.steps_per_mm;
		} else {
			const extruder = new Extruder();
			extruder.acceleration = legacyDrive.acceleration;
			extruder.current = legacyDrive.current;
			driver.forwards = legacyDrive.direction;
			extruder.jerk = legacyDrive.instant_dv;
			driver.microstepping = legacyDrive.microstepping;
			driver.microsteppingInterpolated = legacyDrive.microstepping_interpolation;
			extruder.speed = legacyDrive.max_speed;
			extruder.stepsPerMm = legacyDrive.steps_per_mm;
			model.move.extruders.push(extruder);
		}
	}

	// Motor Current Reduction
	model.move.idle.timeout = input.idle.used ? input.idle.timeout : 0;
	model.move.idle.factor = input.idle.factor / 100;

	// Z-Probe
	const probe = new Probe();
	switch (input.probe.type) {
		case LegacyProbeType.None:
			probe.type = ProbeType.none;
			break;
		case LegacyProbeType.Switch:
			probe.type = ProbeType.digital;
			break;
		case LegacyProbeType.Unmodulated:
			probe.type = ProbeType.analog;
			break;
		case LegacyProbeType.Modulated:
			probe.type = ProbeType.dumbModulated;
			break;
		case LegacyProbeType.SmartEffector:
			probe.type = ProbeType.digital;
			probe.recoveryTime = input.probe.recovery_time;
			break;
		case LegacyProbeType.BLTouch:
			probe.type = ProbeType.blTouch;
			break;
		default:
			const _exhaustiveCheck: never = input.probe.type;
			throw new Error(`Invalid probe type ${input.probe.type}`);
	}
	probe.offsets[0] = input.probe.x_offset;
	probe.offsets[1] = input.probe.y_offset;
	probe.speeds[0] = probe.speeds[1] = input.probe.speed;
	probe.triggerHeight = input.probe.trigger_height;
	probe.threshold = input.probe.trigger_value;
	model.sensors.probes.push(new Probe());

	if (input.probe.input_pin !== null) {
		model.configTool.assignPort(input.probe.input_pin, ConfigPortType.probeIn, 0);
	}
	if (input.probe.modulation_pin !== null) {
		model.configTool.assignPort(input.probe.modulation_pin, ConfigPortType.probeMod, 0);
	}
	if (input.probe.pwm_pin !== null) {
		model.configTool.assignPort(input.probe.pwm_pin, ConfigPortType.servo, 0);
	}
	model.configTool.deployRetractProbe = input.probe.deploy || input.probe.type === LegacyProbeType.BLTouch;

	// General Heater Settings
	for (let i = 0; i < input.heaters.length; i++) {
		const legacyHeater = input.heaters[i];
		if (legacyHeater === null) {
			model.heat.heaters.push(null);
			model.sensors.analog.push(null);
			model.configTool.tempSensors.push(null);
		} else {
			const heater = new Heater();
			heater.max = legacyHeater.temp_limit;
			if (input.bed.present && input.bed.heater === i) {
				heater.model.pid.used = input.bed.use_pid;
			} else if (input.chamber.present && input.chamber.heater === i) {
				heater.model.pid.used = input.chamber.use_pid;
			}
			heater.model.maxPwm = legacyHeater.scale_factor;
			model.heat.heaters.push(heater);

			const sensor = new AnalogSensor();
			sensor.type = AnalogSensorType.thermistor;
			model.sensors.analog.push(sensor);

			const tempSensor = new ConfigTempSensor();
			tempSensor.sensorIndex = i;
			tempSensor.type = ConfigTempSensorType.thermistor;
			tempSensor.r25 = legacyHeater.thermistor;
			tempSensor.beta = legacyHeater.beta;
			tempSensor.shC = legacyHeater.c;
			model.configTool.tempSensors.push(tempSensor);
		}
	}

	// Cooling Fans

	// Tool Preferences

	// Tools

	// Delta Calibration

	// Bed Probing for Mesh Bed Compensation

	// Orthogonal Axis Compensation

	// Direct-Connect Display

	// Network Settings

	// Miscellaneous

	return model;
}
