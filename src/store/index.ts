import { defineStore } from 'pinia';
import { initObject, initCollection, Board } from "@duet3d/objectmodel";

import ConfigModel from "@/store/model";
import { Boards, BoardType, type BoardDescriptor } from "@/store/Boards";

const defaultTemplate = initObject(ConfigModel, {
	boards: initCollection(Board, [
		Boards[BoardType.Duet3Mini5PlusWiFi].objectModelBoard
	])
})

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
