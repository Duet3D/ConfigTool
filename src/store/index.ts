import { defineStore } from 'pinia';
import {
	Axis,
	AxisLetter,
	Board,
	DriverId,
	Extruder,
	Limits,
	Move,
	Network,
	initCollection,
	initObject
} from "@duet3d/objectmodel";

import ConfigModel from "@/store/model";
import { type BoardDescriptor, Boards, BoardType } from "@/store/Boards";
import { ConfigToolModel } from "@/store/model/ConfigToolModel";

const defaultTemplate = initObject(ConfigModel, {
	boards: initCollection(Board, [
		Boards[BoardType.Duet3Mini5PlusWiFi].objectModelBoard
	]),
	configTool: initObject(ConfigToolModel, {

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
		])
	}),
	limits: initObject(Limits, Boards[BoardType.Duet3Mini5PlusWiFi].objectModelLimits),
	network: initObject(Network, {
		name: "Duet 3"
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
