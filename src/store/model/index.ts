import ObjectModel, { Board, DriverId, type IModelObject, initObject } from "@duet3d/objectmodel";

import {
	Boards,
	BoardType,
	getBoardDefinition,
	getBoardType,
	type BoardDescriptor
} from "@/store/Boards";
import { ExpansionBoards, ExpansionBoardType, getExpansionBoardDefinition } from "@/store/ExpansionBoards";
import { ConfigDriver, ConfigPort, ConfigToolModel } from "@/store/model/ConfigToolModel";
import type { BaseBoard } from "@/store/BaseBoard";

/**
 * Object model tailored for the config tool
 */
export default class ConfigModel extends ObjectModel {
	/**
	 * Values specific to the config tool
	 */
    configTool: ConfigToolModel = new ConfigToolModel();

	/**
	 * Update this instance from the given data
	 * @param jsonElement JSON data to upgrade this instance from
	 * @returns Updated instance (may not equal the original instance)
	 */
	update(jsonElement: any): IModelObject | null {
		super.update(jsonElement);
		if (jsonElement.configTool) {
			this.configTool.update(jsonElement.configTool);
		}
		return this;
	}

	/**
	 * Getter for the current main board definition
	 */
	get boardDefinition(): BoardDescriptor | null {
		return getBoardDefinition(this);
	}

	/**
	 * Getter for the current main board type
	 */
	get boardType(): BoardType | null {
		return getBoardType(this);
	}

	/**
	 * Setter for the current main board type
	 * @param value New board type
	 */
	set boardType(value: BoardType | null) {
		if (value === null) {
			throw new Error("Board type cannot be null");
		}

		const boardDefinition = Boards[value];
		if (!boardDefinition) {
			throw new Error(`Invalid board type ${value}`);
		}

		if (this.boards.length > 0) {
			if (this.boards.length > 1 && boardDefinition.objectModelBoard.canAddress === null) {
				// New mainboard doesn't support CAN, remove expansion boards
				this.boards.splice(1);
			}
			this.boards[0].update(boardDefinition.objectModelBoard);
		} else {
			const newBoard = new Board();
			newBoard.update(boardDefinition.objectModelBoard);
			this.boards.push(newBoard);
		}

		this.refreshDrivers();
		this.refreshPorts();
	}

	/**
	 * Add a new expansion board (CAN)
	 * @param boardType Expansion board type to add
	 */
	addExpansionBoard(boardType: ExpansionBoardType): void {
		if (this.boards.length === 0) {
			throw new Error("Cannot add expansion board before a main board is set");
		}

		const expansionBoardDefinition = ExpansionBoards[boardType];
		if (expansionBoardDefinition.objectModelBoard.canAddress !== null) {
			const mainBoard = this.boards[0];
			if (mainBoard.canAddress === null) {
				throw new Error("Cannot add CAN expansion board to mainboard which does not support CAN");
			}

			const newExpansionBoard = new Board();
			newExpansionBoard.update(expansionBoardDefinition);
			while (this.boards.some(board => board.canAddress === newExpansionBoard.canAddress)) {
				newExpansionBoard.canAddress!++;
				this.boards.push(newExpansionBoard);
			}
		}

		this.refreshDrivers();
		this.refreshPorts();
	}

	/**
	 * Remove an expansion board (CAN)
	 * @param index Index of the board to remove
	 */
	removeExpansionBoard(index: number) {
		if (this.boards.length === 0) {
			throw new Error("Cannot remove expansion board before a main board is set");
		}

		this.boards.splice(index, 1);

		this.refreshDrivers();
		this.refreshPorts();
	}

	/**
	 * Set the expansion board (non-CAN)
	 * @param boardType Expansion board type to set
	 */
	setExpansionBoard(boardType: ExpansionBoardType | null) {
		if (this.boards.length === 0) {
			throw new Error("Cannot set expansion board before a main board is set");
		}

		if (boardType !== null) {
			const expansionBoardDefinition = ExpansionBoards[boardType];
			if (expansionBoardDefinition.objectModelBoard.canAddress !== null) {
				throw new Error("Cannot set CAN expansion board");
			}
		}
		this.configTool.expansionBoard = boardType;

		this.refreshDrivers();
		this.refreshPorts();
	}

	/**
	 * Validate this instance and fix potential incompatibilities
	 */
	validate(): void {
		this.fixExpansionBoards();
		this.refreshDrivers();
		this.refreshPorts();
	}

	/**
	 * Refresh the driver list and either add new drivers or remove obsolete ones
	 */
	private refreshDrivers(): void {
		// Get mainboard drivers (including from directly-connected expansion)
		const driverList: Array<DriverId> = [];
		const mainboardDefinition = getBoardDefinition(this);
		if (mainboardDefinition !== null) {
			// Add mainboard drivers
			for (let i = 0; i < mainboardDefinition.numDrivers; i++) {
				const driver = new DriverId();
				driver.board = 0;
				driver.driver = i;
				driverList.push(driver);
			}

			// Add extra drivers from potential expansion board
			if (this.configTool.expansionBoard !== null) {
				const expansionBoard = ExpansionBoards[this.configTool.expansionBoard];
				for (let i = 0; i < expansionBoard.numDrivers; i++) {
					const driver = new DriverId();
					driver.board = 0;
					driver.driver = i + mainboardDefinition.numDrivers;
					driverList.push(driver);
				}
			}
		}

		// Get expansion board drivers
		for (const board of this.boards) {
			if (board.canAddress !== null && board.canAddress > 0) {
				const expansionBoardDefinition = getExpansionBoardDefinition(board);
				if (expansionBoardDefinition !== null) {
					for (let i = 0; i < expansionBoardDefinition.numDrivers; i++) {
						const driver = new DriverId();
						driver.board = board.canAddress;
						driver.driver = i;
						driverList.push(driver);
					}
				} else {
					throw new Error(`Failed to find board definition for expansion board #${board.canAddress}`);
				}
			}
		}

		// Add missing drivers
		for (const driver of driverList) {
			if (!this.configTool.drivers.some(configDriver => configDriver.id.board === driver.board && configDriver.id.driver === driver.driver)) {
				const configDriver = new ConfigDriver();
				configDriver.id = driver;
				this.configTool.drivers.push(configDriver);
			}
		}

		// Delete unsupported drivers
		for (let i = this.configTool.drivers.length - 1; i >= 0; i--) {
			const existingDriver = this.configTool.drivers[i];
			if (!driverList.some(driver => driver.board === existingDriver.id.board && driver.driver === existingDriver.id.driver)) {
				this.configTool.drivers.splice(i, 1);
			}
		}

		// Sort the driver list again
		this.configTool.drivers.sort((a, b) => (a.id.board === b.id.board) ? a.id.driver - b.id.driver : (a.id.board || 0) - (b.id.board || 0));
	}

	/**
	 * Add the given port list to a port list
	 * @param boardDefinition Board definition containing the ports
	 * @param canAddress CAN address of the board or null if not applicable
	 * @param to List to add the ports to
	 */
	private addPortsFromBoard(boardDefinition: BaseBoard, canAddress: number | null, to: Array<ConfigPort>): void {
		const addPorts = (portList: Array<string>) => {
			for (const port of portList) {
				const newPort = new ConfigPort(port, canAddress), existingPort = to.find(item => item.matches(newPort));
				if (existingPort) {
					existingPort.merge(newPort);
				} else {
					to.push(newPort);
				}
			}
		}
		addPorts(boardDefinition.analogInPorts);
		addPorts(boardDefinition.fanPorts);
		addPorts(boardDefinition.fanTachoPorts);
		addPorts(boardDefinition.gpInPorts);
		addPorts(boardDefinition.gpOutPorts);
		addPorts(boardDefinition.heaterPorts);
		addPorts(boardDefinition.pwmPorts);
		addPorts(boardDefinition.spiCsPorts);
		addPorts(boardDefinition.thermistorPorts);
	}

	/**
	 * Refresh the driver list and either add new drivers or remove obsolete ones
	 */
	private refreshPorts(): void {
		const portList: Array<ConfigPort> = [];

		// Add ports from the mainboard
		const mainboardDefinition = getBoardDefinition(this);
		if (mainboardDefinition !== null) {
			this.addPortsFromBoard(mainboardDefinition, mainboardDefinition.objectModelBoard.canAddress, portList);

			// Add extra drivers from potential expansion board
			if (this.configTool.expansionBoard !== null) {
				const expansionBoard = ExpansionBoards[this.configTool.expansionBoard];
				this.addPortsFromBoard(expansionBoard, mainboardDefinition.objectModelBoard.canAddress, portList);
			}
		}

		// Add ports from expansion boards
		for (const board of this.boards) {
			if (board.canAddress !== null && board.canAddress > 0) {
				const expansionBoardDefinition = getExpansionBoardDefinition(board);
				if (expansionBoardDefinition !== null) {
					this.addPortsFromBoard(expansionBoardDefinition, board.canAddress, portList);
				} else {
					throw new Error(`Failed to find board definition for expansion board #${board.canAddress}`);
				}
			}
		}

		// Update existing port aliases and delete obsolete ones
		for (let i = this.configTool.ports.length - 1; i >= 0; i--) {
			const existingPort = this.configTool.ports[i], updatedPort = portList.find(port => port.matches(existingPort));
			if (!updatedPort) {
				this.configTool.ports.splice(i, 1);
			} else {
				existingPort.assign(updatedPort);
			}
		}

		// Add missing ports
		for (const port of portList) {
			if (!this.configTool.ports.some(existingPort => existingPort.matches(port))) {
				this.configTool.ports.push(port);
			}
		}

		// Sort the port list again
		this.configTool.ports.sort((a, b) => a.toString().localeCompare(b.toString()));
	}

	/**
	 * Fix the virtual expansion boards of a given config model object
	 */
	private fixExpansionBoards(): void {
		switch (getBoardType(this)) {
			case BoardType.Duet3Mini5PlusEthernet:
			case BoardType.Duet3Mini5PlusWiFi:
				if (this.move.axes.some(axis => axis.drivers.some(driver => driver?.board === 0 && driver?.driver >= 5)) ||
					this.move.extruders.some(extruder => extruder.driver?.board === 0 && extruder.driver?.driver >= 5)
				) {
					// Drives 0.5 + 0.6 require a Duet 3 Mini +2 expansion board
					this.configTool.expansionBoard = ExpansionBoardType.Duet3Mini2Plus;
				}
				break;

			case BoardType.Duet2Ethernet:
			case BoardType.Duet2WiFi:
			case BoardType.Duet2SBC:
				if (this.configTool.ports.some(port => port.coversDueX) ||
					this.move.axes.some(axis => axis.drivers.some(driver => driver?.board === 0 && driver?.driver >= 5)) ||
					this.move.extruders.some(extruder => extruder.driver?.board === 0 && extruder.driver?.driver >= 5)
				) {
					// Drives >= 0.5 require a DueX 2, DueX 5, or Duet 2 Expansion Breakout Board
					if (this.configTool.expansionBoard !== ExpansionBoardType.DueX2 &&
						this.configTool.expansionBoard !== ExpansionBoardType.DueX5 &&
						this.configTool.expansionBoard !== ExpansionBoardType.Duet2ExpansionBreakout
					) {
						if (this.move.axes.some(axis => axis.current > 0 && axis.drivers.some(driver => driver?.board === 0 && driver?.driver >= 5)) ||
							this.move.extruders.some(extruder => extruder.current > 0 && extruder.driver?.board === 0 && extruder.driver?.driver >= 5)
						) {
							// DueX 2 is no longer officially supported, so assume a DueX 5 is present
							this.configTool.expansionBoard = ExpansionBoardType.DueX5;
						} else {
							// Drivers >= 0.5 don't have any motor current set. Assume this is a breakout expansion board
							this.configTool.expansionBoard = ExpansionBoardType.Duet2ExpansionBreakout;
						}
					}
				}
				break;
		}
	}
};
