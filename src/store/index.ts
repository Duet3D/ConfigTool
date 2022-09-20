import {
	AnalogSensor,
	AnalogSensorType,
	Axis,
	AxisLetter,
	Board,
	CoreKinematics,
	DriverId,
	Endstop,
	EndstopType,
	Extruder,
	Fan,
	FanThermostaticControl,
	Heat,
	Heater,
	HeaterModel,
	HeaterModelPID,
	HeaterMonitor,
	HeaterMonitorAction,
	HeaterMonitorCondition,
	initCollection,
	initObject,
	KinematicsName,
	Limits,
	Move,
	MoveCompensation,
	Network,
	Probe,
	ProbeGrid,
	ProbeType,
	Sensors,
	Tool
} from "@duet3d/objectmodel";
import { defineStore } from 'pinia';

import ConfigModel from "@/store/model";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { Boards, BoardType } from "@/store/Boards";

const defaultTemplate = initObject(ConfigModel, {
	boards: initCollection(Board, [
		Boards[BoardType.Duet3Mini5PlusWiFi].objectModelBoard
	]),
	fans: initCollection(Fan, [
		{
			// default
		},
		{
			thermostatic: initObject(FanThermostaticControl, {
				heaters: [1],				// sensors, actually
				lowTemperature: 45,
				highTemperature: 45
			})
		}
	]),
	heat: initObject(Heat, {
		heaters: initCollection(Heater, [
			{
				max: 140,
				model: initObject(HeaterModel, {
					pid: initObject(HeaterModelPID, {
						used: false
					})
				}),
				monitors: initCollection(HeaterMonitor, [
					{
						action: HeaterMonitorAction.generateFault,
						condition: HeaterMonitorCondition.tooHigh,
						limit: 140
					}
				]),
				sensor: 0
			},
			{
				max: 285,
				monitors: initCollection(HeaterMonitor, [
					{
						action: HeaterMonitorAction.generateFault,
						condition: HeaterMonitorCondition.tooHigh,
						limit: 285
					}
				]),
				sensor: 1
			}
		])
	}),
	move: initObject(Move, {
		axes: initCollection(Axis, [
			{
				acceleration: 500,
				current: 800,
				drivers: initCollection(DriverId, [
					{
						board: 0,
						driver: 0
					}
				]),
				letter: AxisLetter.X,
				jerk: 15,
				speed: 100,
				stepsPerMm: 80
			},
			{
				acceleration: 500,
				current: 800,
				drivers: initCollection(DriverId, [
					{
						board: 0,
						driver: 1
					}
				]),
				letter: AxisLetter.Y,
				jerk: 15,
				speed: 100,
				stepsPerMm: 80
			},
			{
				acceleration: 20,
				current: 800,
				drivers: initCollection(DriverId, [
					{
						board: 0,
						driver: 2
					}
				]),
				letter: AxisLetter.Z,
				jerk: 0.2,
				speed: 3,
				stepsPerMm: 400
			}
		]),
		compensation: initObject(MoveCompensation, {
			probeGrid: initObject(ProbeGrid, {
				mins: [20, 20],
				maxs: [180, 180],
				spacings: [80, 80]
			})
		}),
		extruders: initCollection(Extruder, [
			{
				acceleration: 250,
				current: 1000,
				driver: initObject(DriverId, {
					board: 0,
					driver: 3
				}),
				jerk: 2,
				speed: 60,
				stepsPerMm: 420
			}
		]),
		kinematics: new CoreKinematics(KinematicsName.cartesian)
	}),
	limits: initObject(Limits, Boards[BoardType.Duet3Mini5PlusWiFi].objectModelLimits),
	network: initObject(Network, {
		name: "Duet 3"
	}),
	sensors: initObject(Sensors, {
		analog: initCollection(AnalogSensor, [
			{
				name: "Heated Bed",
				type: AnalogSensorType.thermistor
			},
			{
				name: "Nozzle",
				type: AnalogSensorType.thermistor
			}
		]),
		endstops: initCollection(Endstop, [
			{
				type: EndstopType.InputPin
			},
			{
				type: EndstopType.InputPin
			},
			{
				type: EndstopType.ZProbeAsEndstop
			}
		]),
		probes: initCollection(Probe, [
			{
				type: ProbeType.analog
			}
		])
	}),
	tools: initCollection(Tool, [
		{
			extruders: [0],
			filamentExtruder: 0,
			heaters: [1],
			fans: [0]
		}
	])
});
defaultTemplate.validate();
defaultTemplate.configTool.delta.calculateProbePoints(0, 0);
defaultTemplate.configTool.assignPort("io0.in", ConfigPortFunction.endstop, 0);		// X endstop
defaultTemplate.configTool.assignPort("io1.in", ConfigPortFunction.endstop, 1);		// Y endstop
defaultTemplate.configTool.assignPort("io2.in", ConfigPortFunction.probeIn, 0);		// Z probe in
defaultTemplate.configTool.assignPort("temp0", ConfigPortFunction.thermistor, 0);	// Bed temp
defaultTemplate.configTool.assignPort("temp1", ConfigPortFunction.thermistor, 1);	// Nozzle temp
defaultTemplate.configTool.assignPort("out0", ConfigPortFunction.heater, 0);		// Bed heater
defaultTemplate.configTool.assignPort("out1", ConfigPortFunction.heater, 1);		// Nozzle heater
defaultTemplate.configTool.assignPort("out3", ConfigPortFunction.fan, 0);			// Nozzle fan
defaultTemplate.configTool.assignPort("out4", ConfigPortFunction.fan, 1);			// Nozzle thermostatic fan

export const useStore = defineStore({
    id: "model",
    state: () => {
		return {
			data: initObject(ConfigModel, defaultTemplate),
			dataModified: false,
			preset: initObject(ConfigModel, defaultTemplate)
		};
    },
    actions: {
		setModel(newModel: ConfigModel) {
			this.data = newModel;
			this.dataModified = false;
		}
    }
});
