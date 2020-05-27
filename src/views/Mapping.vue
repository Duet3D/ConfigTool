<template>
	<b-container>
		<b-card no-body>
			<template #header>
				<span class="mt-2">Expansion Boards</span>
				<b-button-group class="float-right">
					<b-button v-for="board in board.expansionBoards" :key="board" size="sm" variant="success" :disabled="!canAddExpansionBoard" @click="addExpansionBoard(board)">
						<font-awesome-icon icon="plus"></font-awesome-icon> Add {{ board }}
					</b-button>
				</b-button-group>
			</template>

			<b-table-simple v-show="template.expansion_boards.length > 0" striped hover class="mb-0">
				<b-thead>
					<b-th v-if="template.board === 'duet3'" width="9%">ID</b-th>
					<b-th width="18%">Board Name</b-th>
					<b-th width="18%">Drives</b-th>
					<b-th width="18%">Heaters</b-th>
					<b-th width="18%">Fans</b-th>
					<b-th width="18%">GPIO Pins</b-th>
					<b-th width="1%"></b-th>
				</b-thead>
				<b-tbody>
					<b-tr v-for="(expBoard, index) in template.expansion_boards" :key="index">
						<b-td v-if="template.board === 'duet3'" width="9%">
							{{ index + 1 }}
						</b-td>
						<b-td width="18%">
							{{ expBoard }}
						</b-td>
						<b-td width="18%">
							{{ getBoardProp(expBoard, 'numDrives') }}
						</b-td>
						<b-td width="18%">
							{{ getBoardProp(expBoard, 'heaterPorts') }}
						</b-td>
						<b-td width="18%">
							{{ getBoardProp(expBoard, 'fanPorts') }}
						</b-td>
						<b-td width="18%">
							{{ getBoardProp(expBoard, 'gpioPorts') }}
						</b-td>
						<b-td width="1%">
							<b-button variant="danger" size="sm" @click="removeExpansionBoard(index)">
								<font-awesome-icon icon="minus"></font-awesome-icon>
							</b-button>
						</b-td>
					</b-tr>
				</b-tbody>
			</b-table-simple>
			<h3 v-show="template.expansion_boards.length === 0" class="m-4 text-center text-muted">
				No Expansion Boards configured
			</h3>
		</b-card>

		<b-row v-if="template.firmware >= 3">
			<b-col cols="5">
				<b-card no-body class="mt-3">
					<template #header>
						<span class="mt-2">Drives</span>
						<b-button-group class="float-right">
							<b-button size="sm" variant="success" :disabled="!canAddExtruder" @click="addExtruder">
								<font-awesome-icon icon="plus"></font-awesome-icon>
							</b-button>
							<b-button size="sm" variant="danger" :disabled="!canRemoveExtruder" @click="removeExtruder">
								<font-awesome-icon icon="minus"></font-awesome-icon>
							</b-button>
						</b-button-group>
					</template>

					<b-table-simple striped hover class="mb-0">
						<b-thead>
							<b-th>
								Drive
							</b-th>
							<b-th>
								Driver
							</b-th>
							<b-th>
								Endstop Pin
							</b-th>
						</b-thead>
						<b-tbody>
							<b-tr v-for="(drive, index) in drives" :key="index">
								<b-td>
									{{ getDriveCaption(index) }}
								</b-td>
								<b-td>
									<b-select v-model="drive.driver_v3" :state="validateDriver(drive.driver_v3)" size="sm" :options="getDrivers(drive.driver_v3)"></b-select>
								</b-td>
								<b-td>
									<b-select v-if="index < 3" :value="drive.endstop_pin" @change="updateDrive({ drive: index, ep: $event })" size="sm" :options="getPins('gpioPorts', drive.endstop_pin, false, true)"></b-select>
								</b-td>
							</b-tr>
						</b-tbody>
					</b-table-simple>
				</b-card>

				<b-card no-body class="mt-3">
					<template #header>
						<span class="mt-2">Fan Mapping</span>
						<b-button-group class="float-right">
							<b-button size="sm" variant="success" :disabled="!canAddFan" @click="addFan()">
								<font-awesome-icon icon="plus"></font-awesome-icon>
							</b-button>
							<b-button size="sm" variant="danger" :disabled="!canRemoveFan" @click="removeFan()">
								<font-awesome-icon icon="minus"></font-awesome-icon>
							</b-button>
						</b-button-group>
					</template>

					<b-table-simple striped hover class="mb-0">
						<b-thead>
							<b-th>
								Fan
							</b-th>
							<b-th>
								Output
							</b-th>
						</b-thead>
						<b-tbody>
							<b-tr v-for="(fan, index) in fans" :key="index">
								<b-td>
									Fan {{ index }}
								</b-td>
								<b-td>
									<b-select :value="fan.output_pin" @change="updateFan({ fan: index, output_pin: $event })" :state="(fan.output_pin === null) ? false : undefined" size="sm" :options="getPins('fanPorts', fan.output_pin, true)"></b-select>
								</b-td>
							</b-tr>
						</b-tbody>
					</b-table-simple>
				</b-card>
			</b-col>

			<b-col cols="7">
				<b-card no-body class="mt-3">
					<template #header>
						<span class="mt-2">Heaters</span>
						<b-button-group class="float-right">
							<b-button size="sm" variant="success" :disabled="!canAddNozzle" @click="addNozzle()">
								<font-awesome-icon icon="plus"></font-awesome-icon>
							</b-button>
							<b-button size="sm" variant="danger" :disabled="!canRemoveNozzle" @click="removeNozzle()">
								<font-awesome-icon icon="minus"></font-awesome-icon>
							</b-button>
						</b-button-group>
					</template>

					<b-table-simple striped hover class="mb-0">
						<b-thead>
							<b-th>
								Index
							</b-th>
							<b-th>
								Type
							</b-th>
							<b-th>
								Output
							</b-th>
							<b-th>
								Sensor
							</b-th>
						</b-thead>
						<b-tbody>
							<b-tr v-for="(heater, index) in heaters" :key="index">
								<b-td>
									{{ index }}
								</b-td>
								<b-td>
									<b-select :value="getHeaterType(index)" @change="setHeaterType(index, $event)" size="sm" :options="heaterTypes"></b-select>
								</b-td>
								<b-td>
									<b-select :value="heater.output_pin" @change="updateHeater({ heater: index, output_pin: $event })" :state="(heater.output_pin === null) ? false : undefined" size="sm" :options="getPins('heaterPorts', heater.output_pin, true)"></b-select>
								</b-td>
								<b-td>
									<sensor-input :index="index" size="sm"></sensor-input>
								</b-td>
							</b-tr>
						</b-tbody>
					</b-table-simple>
				</b-card>

				<b-card header="Z-Probe" no-body class="mt-3">
					<b-table-simple striped hover class="mb-0">
						<b-thead>
							<b-th>
								Pin
							</b-th>
							<b-th>
								Assignment
							</b-th>
						</b-thead>
						<b-tbody>
							<b-tr>
								<b-td>
									Input Pin
								</b-td>
								<b-td>
									<b-select :value="template.probe.input_pin" @change="setProbePin({ inputPin: $event })" size="sm" :options="getPins('analogPorts', template.probe.input_pin, false)"></b-select>
								</b-td>
							</b-tr>
							<b-tr>
								<b-td>
									Modulation Pin
								</b-td>
								<b-td>
									<b-select :value="template.probe.modulation_pin" @change="setProbePin({ modulationPin: $event })" size="sm" :options="getPins('gpioPorts', template.probe.modulation_pin, false, false)"></b-select>
								</b-td>
							</b-tr>
							<b-tr>
								<b-td>
									PWM Control Channel (BLTouch only)
								</b-td>
								<b-td>
									<b-select :value="template.probe.pwm_pin" @change="setProbePin({ pwmPin: $event })" size="sm" :options="getPins('pwmPorts', template.probe.pwm_pin, false)"></b-select>
								</b-td>
							</b-tr>
						</b-tbody>
					</b-table-simple>
				</b-card>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapMultiRowFields } from 'vuex-map-fields'

import SensorInput from '../components/HeatersSensorInput.vue'
import ExpansionBoards from '../store/ExpansionBoards.js'
import Template from '../store/Template.js'

export default {
	components: {
		'sensor-input': SensorInput
	},
	computed: {
		...mapState({
			board: state => state.board,
			preset: state => state.preset,
			template: state => state.template
		}),
		...mapGetters(['canAddExpansionBoard', 'canAddExtruder', 'canRemoveExtruder', 'canAddNozzle', 'canRemoveNozzle', 'canAddFan', 'canRemoveFan']),
		...mapMultiRowFields(['template.drives', 'template.heaters', 'template.fans']),
		heaterTypes() {
			return [
				{ text: 'Bed', value: 0 },
				{ text: 'Chamber', value: 1 },
				{ text: 'Nozzle', value: 2 }
			];
		}
	},
	methods: {
		...mapMutations([
			'addExpansionBoard', 'removeExpansionBoard',
			'addExtruder', 'removeExtruder', 'updateDrive',
			'addNozzle', 'removeNozzle', 'updateBed', 'updateChamber', 'updateHeater',
			'addFan', 'removeFan', 'updateFan',
			'setProbePin'
		]),
		getBoardProp(boardName, propName) {
			const board = ExpansionBoards[boardName];
			if (board[propName] instanceof Array) {
				return board[propName].length;
			}
			return board[propName];
		},
		getPins(name, selectedPin, mandatory, inputMode) {
			return Template.getPins(this.template, this.board, name, selectedPin, mandatory, inputMode);
		},
		getDriveCaption(drive) {
			switch (drive) {
				case 0: return 'X';
				case 1: return 'Y';
				case 2: return 'Z';
				default: return 'E' + (drive - 3);
			}
		},
		getDriverCaption(drive) {
			if (this.template.board === 'duet3') {
				if (drive < this.board.numDrives) {
					return `Driver ${drive}`;
				}

				let port = drive - this.board.numDrives, boardIndex = 1;
				for (let i = 0; i < this.template.expansion_boards.length; i++) {
					const expansionBoard = ExpansionBoards[this.template.expansion_boards[i]];
					const numExpansionDrives = expansionBoard.numDrives;
					if (port < numExpansionDrives) {
						break;
					}
					boardIndex++;
					port -= numExpansionDrives;
				}

				return `Board ${boardIndex} - Driver ${port}`;
			}
			return this.getDriveCaption(drive);
		},
		getDrivers(drive) {
			const options = [];

			let index = 0;
			for (let i = 0; i < this.board.numDrives; i++) {
				const driver = `0.${index}`;
				options.push({
					text: this.getDriverCaption(index),
					value: driver,
					disabled: index !== drive && this.drives.some(item => item.driver_v3 === driver)
				});
				index++;
			}
			for (let i = 0; i < this.template.expansion_boards.length; i++) {
				const expansionBoard = ExpansionBoards[this.template.expansion_boards[i]];
				for (let k = 0; k < expansionBoard.numDrives; k++) {
					const driver = `${i + 1}.${k}`;
					options.push({
						text: this.getDriverCaption(index),
						value: driver,
						disabled: index !== drive && this.drives.some(item => item.driver_v3 === driver)
					});
					index++;
				}
			}

			return options;
		},
		validateDriver(driver) {
			let seen = false;
			for (let i = 0; i < this.drives.length; i++) {
				if (this.drives[i].driver_v3 === driver) {
					if (seen) {
						return false;
					} else {
						seen = true;
					}
				}
			}
		},

		getHeaterType(index) {
			if (this.template.bed.present && this.template.bed.heater === index) {
				return 0;
			}
			if (this.template.chamber.present && this.template.chamber.heater === index) {
				return 1;
			}
			return 2;
		},
		setHeaterType(index, type) {
			if (type === 0) {
				if (!this.template.bed.present) {
					this.updateBed({ present: true, heater: index, isNozzle: false });
				} else {
					this.updateBed({ heater: index });
				}
			} else if (this.template.bed.present && this.template.bed.heater === index) {
				this.updateBed({ present: false, isNozzle: type === 2 });
			}

			if (type === 1) {
				if (!this.template.chamber.present) {
					this.updateChamber({ present: true, heater: index, isNozzle: false });
				} else {
					this.updateChamber({ heater: index });
				}
			} else if (this.template.chamber.present && this.template.chamber.heater === index) {
				this.updateChamber({ present: false, isNozzle: type === 2 });
			}
		}
	}
}
</script>
