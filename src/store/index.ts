import { defineStore } from 'pinia';
import { Axis, AxisLetter, Board, DriverId, initCollection, initObject, Move } from "@duet3d/objectmodel";

import ConfigModel from "@/store/model";
import { type BoardDescriptor, Boards, BoardType } from "@/store/Boards";
import { ConfigDriver } from "@/store/model/ConfigDriver";
import { ConfigToolModel } from "@/store/model/ConfigToolModel";

const defaultTemplate = initObject(ConfigModel, {
	boards: initCollection(Board, [
		Boards[BoardType.Duet3Mini5PlusWiFi].objectModelBoard
	]),
	configTool: initObject(ConfigToolModel, {
		drivers: initCollection(ConfigDriver, [
			{
				axis: AxisLetter.X,
				id: initObject(DriverId, {
					board: 0,
					driver: 0
				})
			},
			{
				axis: AxisLetter.Y,
				id: initObject(DriverId, {
					board: 0,
					driver: 1
				})
			},
			{
				axis: AxisLetter.Z,
				id: initObject(DriverId, {
					board: 0,
					driver: 2
				})
			}
		])
	}),
	move: initObject(Move, {
		axes: initCollection(Axis, [
			{
				letter: AxisLetter.X
			},
			{
				letter: AxisLetter.Y
			},
			{
				letter: AxisLetter.Z
			}
		])
	})
});

export const useStore = defineStore({
    id: "model",
    state: () => {
		return {
			data: initObject(ConfigModel, defaultTemplate),
			dataModified: false,
			preset: initObject(ConfigModel, defaultTemplate)
		};
    },
    getters: {
		boardType: (state): BoardType | null => state.data.boardType,
	    boardDefinition: (state): BoardDescriptor | null => state.data.boardDefinition,
	    minVoltage: (state): number | undefined => state.data.boardDefinition?.minVoltage,
	    maxVoltage: (state): number | undefined => state.data.boardDefinition?.maxVoltage,
		supportsAutoSave: (state): boolean => (state.data.boardDefinition?.objectModelBoard.vIn !== null) || false,
	    supportsSbc: (state): boolean => (state.data.boardDefinition?.objectModelBoard.iapFileNameSBC !== null) || false
    },
    actions: {
		setModel(newModel: ConfigModel) {
			this.data = newModel;
			this.dataModified = false;
		}
    }
});
