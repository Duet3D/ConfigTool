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
	Microstepping,
	ModelSet,
	Move,
	Network,
	NetworkInterface,
	NetworkInterfaceState,
	NetworkInterfaceType,
	NetworkProtocol,
	Probe,
	ProbeType,
	Sensors,
	Tool
} from "@duet3d/objectmodel";
import { defineStore } from "pinia";

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
				lowTemperature: 45,
				highTemperature: 45,
				sensors: [1]
			})
		}
	]),
	heat: initObject(Heat, {
		bedHeaters: [0],
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
						limit: 140,
						sensor: 0
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
						limit: 285,
						sensor: 1
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
				microstepping: initObject(Microstepping, {
					interpolated: true,
					value: 16
				}),
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
				microstepping: initObject(Microstepping, {
					interpolated: true,
					value: 16
				}),
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
				microstepping: initObject(Microstepping, {
					interpolated: true,
					value: 16
				}),
				jerk: 0.2,
				speed: 3,
				stepsPerMm: 400
			}
		]),
		extruders: initCollection(Extruder, [
			{
				acceleration: 250,
				current: 1000,
				driver: initObject(DriverId, {
					board: 0,
					driver: 3
				}),
				jerk: 2,
				microstepping: initObject(Microstepping, {
					interpolated: true,
					value: 16
				}),
				speed: 60,
				stepsPerMm: 420
			}
		]),
		kinematics: new CoreKinematics(KinematicsName.cartesian)
	}),
	limits: initObject(Limits, Boards[BoardType.Duet3Mini5PlusWiFi].objectModelLimits),
	network: initObject(Network, {
		name: "Duet 3",
		interfaces: initCollection(NetworkInterface, [
			{
				activeProtocols: new ModelSet<NetworkProtocol>([NetworkProtocol.HTTP]),
				actualIP: "192.168.1.123",
				subnet: "255.255.255.0",
				gateway: "192.168.1.254",
				dnsServer: "192.168.1.254",
				state: NetworkInterfaceState.active,
				type: NetworkInterfaceType.lan
			}
		])
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
defaultTemplate.configTool.assignPort("io3.in", ConfigPortFunction.probeIn, 0);		// Z probe in
defaultTemplate.configTool.assignPort("temp0", ConfigPortFunction.thermistor, 0);	// Bed temp
defaultTemplate.configTool.assignPort("temp1", ConfigPortFunction.thermistor, 1);	// Nozzle temp
defaultTemplate.configTool.assignPort("out0", ConfigPortFunction.heater, 0);		// Bed heater
defaultTemplate.configTool.assignPort("out1", ConfigPortFunction.heater, 1);		// Nozzle heater
defaultTemplate.configTool.assignPort("out3", ConfigPortFunction.fan, 0);			// Nozzle fan
defaultTemplate.configTool.assignPort("out4", ConfigPortFunction.fan, 1);			// Nozzle thermostatic fan

export const useStore = defineStore("model", {
    state: () => {
		return {
			data: initObject(ConfigModel, defaultTemplate),
			dataModified: false,
			preset: initObject(ConfigModel, defaultTemplate),
			showSavePrompt: false,

			darkTheme: (localStorage.getItem("theme") ?? "auto" === "auto") ? window.matchMedia("(prefers-color-scheme: dark)").matches : (localStorage.getItem("theme") === "dark"),
			theme: "auto" as "dark" | "light" | "auto"
		};
    },
    actions: {
		setModel(newModel: ConfigModel) {
			// Update deprecated port functions
			for (const port of newModel.configTool.ports) {
				if (port.function === ConfigPortFunction.spindleForwards_deprecated) {
					port.function = ConfigPortFunction.spindleFirstPort;
				} else if (port.function === ConfigPortFunction.spindleBackwards_deprecated) {
					port.function = ConfigPortFunction.spindleSecondPort;
				}
			}

			// Load model
			this.data.update(newModel);
			this.data.validate();
			this.dataModified = this.showSavePrompt = false;
		},
		setTheme(theme: "dark" | "light" | "auto") {
			// Apply new theme value
			switch (theme) {
				case "dark":
					this.darkTheme = true;
					break;
				case "light":
					this.darkTheme = false;
					break;
				case "auto":
					this.darkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
					break;
				default:
					const _exhaustiveCheck: never = theme;
					break;
			}

			// Try to save it
			this.theme = theme;
			try {
				localStorage.setItem("theme", theme);
			} catch (e) {
				console.warn("localStorage not supported", e);
			}
		}
	}
});
