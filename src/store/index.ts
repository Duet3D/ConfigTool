import {
	Axis,
	AxisLetter,
	Board,
	CoreKinematics,
	DriverId,
	Endstop,
	EndstopType,
	Extruder,
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
	Sensors
} from "@duet3d/objectmodel";
import { defineStore } from 'pinia';

import ConfigModel from "@/store/model";
import { Boards, BoardType } from "@/store/Boards";
import { ConfigPortFunction } from "./model/ConfigPort";

const defaultTemplate = initObject(ConfigModel, {
	boards: initCollection(Board, [
		Boards[BoardType.Duet3Mini5PlusWiFi].objectModelBoard
	]),
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
	})
});
defaultTemplate.validate();
defaultTemplate.configTool.delta.calculateProbePoints(0, 0);
defaultTemplate.configTool.assignPort("io0.in", ConfigPortFunction.endstop, 0);		// X endstop
defaultTemplate.configTool.assignPort("io1.in", ConfigPortFunction.endstop, 1);		// Y endstop
defaultTemplate.configTool.assignPort("io2.in", ConfigPortFunction.probeIn, 0);		// Z probe in

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
