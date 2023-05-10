import ObjectModel, { Board, DriverId, type IModelObject, NetworkInterface, Endstop, KinematicsName, AxisLetter } from "@duet3d/objectmodel";

import { PortType, type BaseBoardDescriptor } from "@/store/BaseBoard";
import { type BoardDescriptor, Boards, BoardType, getBoardDefinition, getBoardType } from "@/store/Boards";
import { ExpansionBoards, ExpansionBoardType, getExpansionBoardDefinition } from "@/store/ExpansionBoards";

import { preconfigureNetworkInterface } from "../defaults";

import { ConfigPort, ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigDriver } from "@/store/model/ConfigDriver";
import { ConfigToolModel } from "@/store/model/ConfigToolModel";

import { ConfigTempSensor } from "./ConfigTempSensor";

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
	 * Get the board definition exclusively for the mainboard
	 */
	get boardDefinition(): BoardDescriptor | null {
		return getBoardDefinition(this);
	}

	/** 
	 * Check if the given axis can be homed individually
	 * @param letter Axis to check
	 * @returns Whether the axis can be homed individually
	 */
	canHomeIndividualAxis(letter: AxisLetter) {
		let reservedAxes: Array<AxisLetter> = [];
		switch (this.move.kinematics.name) {
			case KinematicsName.cartesian:
			case KinematicsName.scara:
			case KinematicsName.fiveBarScara:
			case KinematicsName.polar:
			case KinematicsName.unknown:
				// Cartesian and SCARA setups can home each axis individually
				break;
			case KinematicsName.coreXY:
			case KinematicsName.markForged:
				// CoreXY requires XY to be homed at once
				reservedAxes = [AxisLetter.X, AxisLetter.Y];
				break;
			case KinematicsName.coreXYU:
				// CoreXYU requires XYU to be homed at once
				reservedAxes = [AxisLetter.X, AxisLetter.Y, AxisLetter.U];
				break;
			case KinematicsName.coreXYUV:
				// CoreXYUV requires XYUV to be homed at once
				reservedAxes = [AxisLetter.X, AxisLetter.Y, AxisLetter.U, AxisLetter.V];
				break;
			case KinematicsName.coreXZ:
				// CoreXZ requires XZ to be homed at once
				reservedAxes = [AxisLetter.X, AxisLetter.Z];
				break;
			case KinematicsName.delta:
			case KinematicsName.rotaryDelta:
			case KinematicsName.hangprinter:
				// Delta setups require XYZ to be homed at once. Hangprinters do not have homing files for XYZ
				// FIXME This should also check if a parallel delta axis is configured
				reservedAxes = [AxisLetter.X, AxisLetter.Y, AxisLetter.Z];
				break;
			default:
				const _exhausiveCheck: never = this.move.kinematics.name;
				break;
		}
		return !reservedAxes.includes(letter);
	}

	/**
	 * Get the board definition for the mainboard or a given CAN board
	 */
	getBoardDefinition(canAddress: number | null = null): BaseBoardDescriptor | null {
		if (!canAddress) {
			return getBoardDefinition(this);
		}

		const expansionBoard = this.boards.find(board => board.canAddress === canAddress);
		return (expansionBoard) ? getExpansionBoardDefinition(expansionBoard) : null;
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
			} else if (boardDefinition.objectModelLimits.boards !== null) {
				// Remove expansion boards that are not supported
				this.boards.splice(boardDefinition.objectModelLimits.boards);
			}
			this.boards[0].update(boardDefinition.objectModelBoard);
		} else {
			const newBoard = new Board();
			newBoard.update(boardDefinition.objectModelBoard);
			this.boards.push(newBoard);
		}

		if (this.sbc === null) {
			for (const networkInterfacePreset of boardDefinition.objectModelNetworkInterfaces) {
				const newNetworkInterface = new NetworkInterface();
				newNetworkInterface.update(networkInterfacePreset);
				preconfigureNetworkInterface(networkInterfacePreset);
				this.network.interfaces.push(newNetworkInterface);
			}
		}

		this.validate();
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
			newExpansionBoard.update(expansionBoardDefinition.objectModelBoard);
			while (this.boards.some(board => board.canAddress === newExpansionBoard.canAddress)) {
				newExpansionBoard.canAddress!++;
			}
			this.boards.push(newExpansionBoard);
		}

		this.refreshDrivers();
		this.refreshPorts();
		this.refreshSensors();
	}

	/**
	 * Remove an expansion board (CAN)
	 * @param index Index of the board to remove
	 */
	removeExpansionBoard(index: number) {
		if (index === 0) {
			throw new Error("Cannot remove mainboard as expansion board");
		}
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
		this.refreshSensors();
		this.enforceLimits();
	}

	/**
	 * Refresh the driver list and either add new drivers or remove obsolete ones
	 */
	refreshDrivers(): void {
		// Get mainboard drivers (including from directly-connected expansion)
		const driverList: Array<DriverId> = [];
		const mainboardDefinition = this.getBoardDefinition();
		if (mainboardDefinition !== null) {
			// Modify mainboard prefix of existing drivers
			const newBoard = mainboardDefinition.objectModelBoard.canAddress;
			for (const axis of this.move.axes) {
				for (const driver of axis.drivers) {
					if (!driver.board) {
						driver.board = newBoard;
					}
				}
			}
			for (const extruder of this.move.extruders) {
				if (extruder.driver && !extruder.driver.board) {
					extruder.driver.board = newBoard;
				}
			}

			// Add mainboard drivers
			for (let i = 0; i < mainboardDefinition.numDrivers; i++) {
				const driver = new DriverId();
				driver.board = mainboardDefinition.objectModelBoard.canAddress;
				driver.driver = i;
				driverList.push(driver);
			}

			// Add extra drivers from potential expansion board
			if (this.configTool.expansionBoard !== null) {
				const expansionBoard = ExpansionBoards[this.configTool.expansionBoard];
				for (let i = 0; i < expansionBoard.numDrivers; i++) {
					const driver = new DriverId();
					driver.board = mainboardDefinition.objectModelBoard.canAddress;
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

		for (const driver of driverList) {
			// Add missing drivers
			if (!this.configTool.drivers.some(configDriver => configDriver.id.equals(driver))) {
				const configDriver = new ConfigDriver();
				configDriver.id = driver;
				this.configTool.drivers.push(configDriver);
			}

			// Update microstepping interpolations
            const axis = this.move.axes.find(axis => axis.drivers.some(axisDriver => axisDriver.equals(driver)));
            if (axis) {
                const boardDefinition = this.getBoardDefinition(driver.board);
                axis.microstepping.interpolated = !!boardDefinition && boardDefinition.microstepInterpolations.includes(axis.microstepping.value);
            }

            const extruder = this.move.extruders.find(extruder => extruder.driver?.equals(driver));
            if (extruder) {
                const boardDefinition = this.getBoardDefinition(driver.board);
                extruder.microstepping.interpolated = !!boardDefinition && boardDefinition.microstepInterpolations.includes(extruder.microstepping.value);
            }
		}

		// Delete unsupported drivers
		for (let i = this.configTool.drivers.length - 1; i >= 0; i--) {
			const existingDriver = this.configTool.drivers[i];
			if (!driverList.some(driver => driver.board === existingDriver.id.board && driver.driver === existingDriver.id.driver)) {
				// Remove it from axes and extruders
				for (const axis of this.move.axes) {
					for (let i = axis.drivers.length - 1; i >= 0; i--) {
						if (axis.drivers[i].equals(existingDriver.id)) {
							axis.drivers.splice(i, 1);
						}
					}
				}
				for (const extruder of this.move.extruders) {
					if (extruder.driver && extruder.driver.equals(existingDriver.id)) {
						extruder.driver = null;
					}
				}

				// Remove the driver
				this.configTool.drivers.splice(i, 1);
			}
		}

		// Sort the driver list again
		this.configTool.drivers.sort((a, b) => (a.id.board === b.id.board) ? a.id.driver - b.id.driver : (a.id.board || 0) - (b.id.board || 0));

		// Make sure the number of endstops matches the number of total axes
		if (this.sensors.endstops.length > this.move.axes.length) {
			this.sensors.endstops.splice(this.move.axes.length);
		} else if (this.sensors.endstops.length < this.move.axes.length) {
			for (let i = this.sensors.endstops.length; i < this.move.axes.length; i++) {
				this.sensors.endstops.push(new Endstop());
			}
		}
	}

	/**
	 * Add the given port list to a port list
	 * @param boardDefinition Board definition containing the ports
	 * @param canAddress CAN address of the board or null if not applicable
	 * @param to List to add the ports to
	 */
	private addPortsFromBoard(boardDefinition: BaseBoardDescriptor, canAddress: number | null, to: Array<ConfigPort>): void {
		const addPorts = (portList: Array<string>, capability: PortType) => {
			for (const port of portList) {
				const newPort = new ConfigPort(port, canAddress, capability), existingPort = to.find(item => item.equals(newPort));
				if (existingPort) {
					existingPort.merge(newPort);
				} else {
					to.push(newPort);
				}
			}
		}
		for (const portType in PortType) {
			addPorts(boardDefinition.ports[portType as PortType], portType as PortType);
		}
	}

	/**
	 * Refresh the driver list and either add new drivers or remove obsolete ones
	 */
	refreshPorts(): void {
		const portList: Array<ConfigPort> = [];

		// Add ports from the mainboard
		const mainboardDefinition = this.getBoardDefinition();
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
			const existingPort = this.configTool.ports[i], updatedPort = portList.find(port => port.equals(existingPort));
			if (!updatedPort) {
				this.configTool.ports.splice(i, 1);
			} else {
				existingPort.assign(updatedPort);
			}
		}

		// Add missing ports
		for (const port of portList) {
			if (!this.configTool.ports.some(existingPort => existingPort.equals(port))) {
				this.configTool.ports.push(port);
			}
		}

		// Sort the port list again
		this.configTool.ports.sort((a, b) => a.toString().localeCompare(b.toString()));
	}

	/**
	 * Refresh the temperature sensor list and either add new sensors or remove obsolete ones
	 */
	refreshSensors(): void {
		while (this.sensors.analog.length > this.configTool.sensors.length) {
			this.configTool.sensors.push((this.sensors.analog[this.sensors.analog.length - 1] !== null) ? new ConfigTempSensor() : null);
		}

		while (this.configTool.sensors.length > this.sensors.analog.length) {
			this.configTool.sensors.pop();
		}

		for (let i = 0; i < this.configTool.sensors.length; i++) {
			if (this.sensors.analog[i] === null) {
				this.configTool.sensors[i] = null;
			} else if (this.configTool.sensors[i] === null) {
				this.configTool.sensors[i] = new ConfigTempSensor();
			}
		}
	}

	/**
	 * Fix the virtual expansion boards of a given config model object
	 */
	private fixExpansionBoards(): void {
		switch (this.boardType) {
			case BoardType.Duet3Mini5PlusEthernet:
			case BoardType.Duet3Mini5PlusWiFi:
				if (this.move.axes.some(axis => axis.drivers.some(driver => driver?.board === 0 && driver?.driver >= 5)) ||
					this.move.extruders.some(extruder => extruder.driver?.board === 0 && extruder.driver?.driver >= 5)
				) {
					// Drives 0.5 + 0.6 require a Duet 3 Mini +2 expansion board
					this.configTool.expansionBoard = ExpansionBoardType.Duet3Mini2Plus;
				} else {
					// Reset expansion board
					this.configTool.expansionBoard = null;
				}
				break;

			case BoardType.Duet3MB6HC:
			case BoardType.Duet3MB6XD:
				// These boards do not support any direct-connect expansion boards
				this.configTool.expansionBoard = null;
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
					} else {
						// Reset expansion board
						this.configTool.expansionBoard = null;
					}
				}
				break;

			case BoardType.Duet2Maestro:
				if (this.move.axes.some(axis => axis.drivers.some(driver => driver?.board === null && driver?.driver >= 5)) ||
					this.move.extruders.some(extruder => extruder.driver?.board === null && extruder.driver?.driver >= 5)
				) {
					// Drives 0.5 + 0.6 require a Duet Maestro 2+ expansion board
					this.configTool.expansionBoard = ExpansionBoardType.Duet2Maestro2Plus;
				} else {
					// Reset expansion board
					this.configTool.expansionBoard = null;
				}
				break;

			case null:
				// Should never get here...
				break;

			default:
				const _exhaustiveCheck: never = this.boardType;
				break;
		}
	}

	/**
	 * Enforce the limits as defined by the limits key
	 */
	private enforceLimits(): void {
		// TODO
	}

	/**
	 * Set FFF capability
	 * @param value True if FFF is supposed to be configured
	 */
	setFFF(value: boolean): void {
		this.configTool.capabilities.fff = value;
		if (!value) {
			this.move.extruders.splice(0);
			this.sensors.filamentMonitors.splice(0);
		}
	}

	/**
	 * Set CNC capability
	 * @param value True if CNC is supposed to be configured
	 */
	setCNC(value: boolean): void {
		this.configTool.capabilities.cnc = value;
		if (!value) {
			this.spindles.splice(0);
		}
	}

	/**
	 * Set Laser capability
	 * @param value True if Laser is supposed to be configured
	 */
	setLaser(value: boolean): void {
		this.configTool.capabilities.laser = value;
		if (!value) {
			this.state.laserPwm = null;
			for (const port of this.configTool.ports) {
				if (port.function === ConfigPortFunction.laser) {
					port.function = null;
				}
			}
		}
	}

	/**
	 * Check if the machine is using delta kinematics
	 */
	get isDelta(): boolean {
		return [KinematicsName.delta, KinematicsName.rotaryDelta].includes(this.move.kinematics.name);
	}
}
