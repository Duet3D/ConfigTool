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
	Network,
	Sensors
} from "@duet3d/objectmodel";
import { defineStore } from 'pinia';

import ConfigModel from "@/store/model";
import { Boards, BoardType } from "@/store/Boards";

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
				letter: AxisLetter.X
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
				letter: AxisLetter.Y
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
				letter: AxisLetter.Z
			}
		]),
		extruders: initCollection(Extruder, [
			{
				acceleration: 250,
				current: 800,
				driver: initObject(DriverId, {
					board: 0,
					driver: 3
				})
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
				type: EndstopType.InputPin
			}
		])
	})
});
defaultTemplate.validate();

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
