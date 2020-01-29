'use strict';

import Boards from './Boards.js'
import ExpansionBoards from './ExpansionBoards.js'

export default {
	// Returns a copy of the default config template
	getDefaultTemplate() {
		return {
			board: 'smoothieboard',
			expansion_boards: [],
			firmware: 3.00,
			standalone: true,
			nvram: false,
			auto_save: {
				enabled: false,
				save_threshold: 10,
				resume_threshold: 11,
				gcodes_to_run: 'M913 X0 Y0 G91 M83 G1 Z3 E-5 F1000'
			},
			display: {
				type: 0,
				encoder_steps: 4,
				spi_frequency: 2000000,
				menus: [{ name: 'main', value: '' }],
				images: []
			},
            externalSDCard: {
                present: false,
                spi_frequency: 4000000
            },
			geometry: {
				type: 'cartesian',

				// Cartesian, CoreXY, CoreXZ
				mins: [0, 0, 0],
				maxes: [230, 210, 200],

				// Delta
				delta_radius: 105.6,
				homed_height: 250,
				low_dive_height: false,
				max_carriage_travel: 260,
				print_radius: 85,
				rod_length: 215,
				z_min: 0
			},
			drives: [
				{
					direction: 1,
					microstepping: 16,
					microstepping_interpolation: true,
					steps_per_mm: 80,
					instant_dv: 15,
					max_speed: 100,
					acceleration: 500,
					current: 800,
					driver: 0,					// v1-2 only
					driver_v3: '0.0',			// v3+
					endstop_pin: 'xstop',		// v3+
					endstop_type: 1,
					endstop_location: 1,
                    stepperDriver: "",
                    stepperDriverTimings: "",
				},
				{
					direction: 1,
					microstepping: 16,
					microstepping_interpolation: true,
					steps_per_mm: 80,
					instant_dv: 15,
					max_speed: 100,
					acceleration: 500,
					current: 800,
					driver: 1,					// v1-2 only
					driver_v3: '0.1',			// v3+
					endstop_pin: 'ystop',		// v3+
					endstop_type: 1,
					endstop_location: 1,
                     stepperDriver: "",
                    stepperDriverTimings: "",

				},
				{
					direction: 1,
					microstepping: 16,
					microstepping_interpolation: true,
					steps_per_mm: 4000,
					instant_dv: 0.2,
					max_speed: 3,
					acceleration: 20,
					current: 800,
					driver: 2,					// v1-2 only
					driver_v3: '0.2',			// v3+
					endstop_pin: null,			// v3+
					endstop: null,
					endstop_type: 3,
					endstop_location: 1,
                     stepperDriver: "",
                    stepperDriverTimings: "",

				},
				{
					direction: 1,
					microstepping: 16,
					microstepping_interpolation: true,
					steps_per_mm: 420,
					instant_dv: 2,
					max_speed: 20,
					acceleration: 250,
					current: 800,
					driver: 3,					// v1-2 only
					driver_v3: '0.3',			// v3+
                    stepperDriver: "",
                    stepperDriverTimings: "",

				}
			],
			idle: {
				used: true,
				factor: 30,
				timeout: 30
			},
			homing_speed_fast: 30,
			homing_speed_slow: 6,
			travel_speed: 100,
			z_dive_height: 5,
			slow_homing: false,
			probe: {
				type: 'unmodulated',
				recovery_time: 0.4,
				trigger_height: 2.5,
				trigger_value: 500,
				x_offset: 0,
				y_offset: 0,
				speed: 2,
				deploy: false,
				points: [],
				pwm_channel: 3,					// v1-2 only
				pwm_inverted: true,				// v1-2 only
				pwm_pin: null,					// v3+
				input_pin: 'zprobe.in',			// v3+
				modulation_pin: 'zprobe.mod'	// v3+
			},
			bed_is_nozzle: false,
			bed: {
				present: true,
				use_pid: false,
				heater: 0
			},
			chamber: {
				present: false,
				use_pid: false,
				heater: 2
			},
			heaters: [
				{
					temp_limit: 120,
					scale_factor: 100,
					series: 4700,
					thermistor: 100000,
					beta: 4138,
					a: 0.0005717725,
					b: 0.0002416626,
					c: 0,
					channel: 0,					// v1-2 only
					sensor: 0,					// v1-2 only
					output_pin: 'bedheat',		// v3+
					sensor_type: 'thermistor',	// v3+
					sensor_pin: 'bedtemp'		// v3+
				},
				{
					temp_limit: 280,
					scale_factor: 100,
					series: 4700,
					thermistor: 100000,
					beta: 4138,
					a: 0.0005717725,
					b: 0.0002416626,
					c: 0,
					channel: 1,					// v1-2 only
					sensor: 1,					// v1-2 only
					output_pin: 'e0heat',		// v3+
					sensor_type: 'thermistor',	// v3+
					sensor_pin: 'e0temp'		// v3+
				}
			],
			num_nozzles: 1,
			toolchange_wait_for_temperatures: true,
			generate_t_code: false,
			tools: [
				{
					mix_ratio: [],
					number: 0,
					name: '',
					extruders: [0],
					heaters: [1],
					fans: [0],
					x_offset: 0,
					y_offset: 0,
					z_offset: 0
				}
			],
			compensation_x_offset: 15,
			compensation_y_offset: 15,
			peripheral_points: 3,
			halfway_points: 3,
			calibration_factors: 6,
			probe_radius: 85,
			mesh: {
				x_min: 15,
				x_max: 215,
				y_min: 15,
				y_max: 195,
				radius: 85,
				spacing: 20
			},
			home_first: false,
			orthogonal: {
				compensation: false,
				height: 50,
				deviations: [
					0,
					0,
					0
				]
			},
			network: {
				enabled: false,
				mac_address: '00:1F:11:02:04:20',
				name: 'My Printer',
				password: '',
				ssid: '',
				ssid_password: '',
				dhcp: true,
				ip: '192.168.1.20',
				netmask: '255.255.255.0',
				gateway: '192.168.1.254',
				protocols: {
					http: true,
					ftp: false,
					telnet: false
				}
			},
			fans: [
				{
					name: '',
					value: 0,
					inverted: false,			// v1-2 only
					frequency: 500,
					thermostatic: false,
					heaters: [],
					trigger_temperature: 45,
					output_pin: 'fan0'			// v3+
				},
			],
			custom_settings: ''
		}
	},

	isSamePin(a, b) {
		let strippedA = '', strippedB = '';
		if (a) {
			for (let i = 0; i < a.length; i++) {
				if (a[i] !== '!' && a[i] !== '^') {
					strippedA += a[i];
				}
			}
		}
		if (b) {
			for (let i = 0; i < b.length; i++) {
				if (b[i] !== '!' && b[i] !== '^') {
					strippedB += b[i];
				}
			}
		}
		return (strippedA === strippedB) || ('0.' + strippedA === strippedB) || (strippedA === '0.' + strippedB);
	},
	isPinBlocked(template, pin) {
		const isSamePin = this.isSamePin;
		return (template.drives.some(item => item.endstop_pin && isSamePin(item.endstop_pin, pin)) ||
			template.fans.some(fan => isSamePin(fan.output_pin, pin)) ||
			template.heaters.some(heater => isSamePin(heater.output_pin, pin) || isSamePin(heater.sensor_pin, pin)) ||
			isSamePin(template.probe.input_pin, pin) ||
			isSamePin(template.probe.modulation_pin, pin) ||
			isSamePin(template.probe.pwm_pin, pin));
	},
	getPins(template, board, name, selectedPin, mandatory, inputMode) {
		const options = [], items = board[name];
		if (!mandatory) {
			options.push({
				text: '(not assigned)',
				value: null,
				disabled: false
			});
		}

		let index = 0;
		for (let i = 0; i < items.length; i++) {
			if (inputMode == undefined || template.board !== 'duet3' || board.gpioPorts[i].indexOf(inputMode ? 'in' : 'out') !== -1) {
				const disabled = !this.isSamePin(selectedPin, items[i]) && this.isPinBlocked(template, items[i]);
				options.push({
					text: items[i],
					value: items[i],
					disabled
				});
				options.push({
					text: items[i] + ' (inverted)',
					value: '!' + items[i],
					disabled
				});
				if (inputMode) {
					options.push({
						text: items[i] + ' (pull-up)',
						value: '^' + items[i],
						disabled
					});
					options.push({
						text: items[i] + ' (inverted, pull-up)',
						value: '!^' + items[i],
						disabled
					});
				}
			}
		}
		for (let i = 0; i < template.expansion_boards.length; i++) {
			const expansionBoard = ExpansionBoards[template.expansion_boards[i]];
			const expansionItems = expansionBoard[name];
			for (let k = 0; k < expansionItems.length; k++) {
				if (inputMode === undefined || template.board !== 'duet3' || expansionItems[k].indexOf(inputMode ? 'in' : 'out') !== -1) {
					const text = (template.board === 'duet3') ? `Board ${i + 1} - ${expansionItems[k]}` : expansionItems[k];
					const value = (template.board === 'duet3') ? `${i + 1}.${expansionItems[k]}` : expansionItems[k];
					const disabled = !this.isSamePin(selectedPin, value) && this.isPinBlocked(template, value);
					options.push({
						text,
						value,
						disabled
					});
					options.push({
						text: text + ' (inverted)',
						value: '!' + value,
						disabled
					});
					if (inputMode) {
						options.push({
							text: text + ' (pull-up)',
							value: '^' + value,
							disabled
						});
						options.push({
							text: text + ' (inverted, pull-up)',
							value: '!^' + value,
							disabled
						});
					}
				}
			}
		}

		return options;
	},
	isValidPin(template, pin, optional) {
		if (!pin && optional) {
			return true;
		}

		const board = Boards.getBoard(template.board);
		if (Boards.isValidPin(board, pin, (template.board === 'duet3') ? 0 : undefined)) {
			return true;
		}

		return template.expansion_boards.some(function(name, index) {
			const expansionBoard = ExpansionBoards[name];
			return Boards.isValidPin(expansionBoard, pin, (template.board === 'duet3') ? index + 1 : undefined);
		});
	},
	validatePins(template) {
		if (template.firmware < 3) {
			return true;
		}

		let isValid = true;
		const isValidPin = this.isValidPin;
		template.drives.forEach(function(drive) {
			if (drive.hasOwnProperty('endstop_pin') && !isValidPin(template, drive.endstop_pin, true)) {
				drive.endstop_pin = null;
				if (drive.endstop_type === 1 || drive.endstop_type === 2) {
					drive.endstop_type = 0;
				}
				isValid = false;
			}
		});
		template.fans.forEach(function(fan) {
			if (!isValidPin(template, fan.output_pin, false)) {
				fan.output_pin = null;
				isValid = false;
			}
		});
		template.heaters.forEach(function(heater) {
			if (!isValidPin(template, heater.output_pin, false)) {
				heater.output_pin = null;
				isValid = false;
			}
			if (!isValidPin(template, heater.sensor_pin, false)) {
				heater.sensor_pin = null;
				heater.sensor_type = null;
				isValid = false;
			}
		});
		if (!isValidPin(template, template.probe.input_pin, template.probe.type === 'noprobe')) {
			template.probe.input_pin = null;
			isValid = false;
		}
		if (!isValidPin(template, template.probe.modulation_pin, template.probe.type !== 'modulated')) {
			template.probe.modulation_pin = null;
			isValid = false;
		}
		if (!isValidPin(template, template.probe.pwm_pin, template.probe.type !== 'bltouch')) {
			template.probe.pwm_pin = null;
			isValid = false;
		}

		if ((template.probe.input_pin === null) ||
			(template.probe.modulation_pin === null && template.probe.type === 'modulated') ||
			(template.probe.pwm_pin === null && template.probe.type === 'bltouch')) {
			template.probe.type = 'noprobe';
			template.drives.forEach(function(drive) {
				if (drive.endstop_type === 3) {
					drive.endstop_type = 0;
				}
			});
		}

		return isValid;
	},

	getMaxDrives(template) {
		let maxDrives = Boards.getBoard(template.board).numDrives;
		template.expansion_boards.forEach(function(item) {
			const expansionBoard = ExpansionBoards[item];
			maxDrives += expansionBoard.numDrives;
		});
		return maxDrives;
	},
	getMaxHeaters(template) {
		let maxHeaters = Boards.getBoard(template.board).heaterPorts.length;
		template.expansion_boards.forEach(function(item) {
			const expansionBoard = ExpansionBoards[item];
			maxHeaters += expansionBoard.heaterPorts.length;
		});
		return maxHeaters;
	},
	getMaxFans(template) {
		let maxFans = Boards.getBoard(template.board).fanPorts.length;
		template.expansion_boards.forEach(function(item) {
			const expansionBoard = ExpansionBoards[item];
			maxFans += expansionBoard.fanPorts.length;
		});
		return maxFans;
	},

	fixFields(obj, preset) {
		for (let key in preset) {
			if (preset[key] instanceof Array) {
				if (obj.hasOwnProperty(key)) {
					if (preset[key].length > 0) {
						for (let i = 0; i < obj[key].length; i++) {
							if (obj[key][i] !== null) {
								const presetItem = (preset[key].length > i) ? preset[key][i] : preset[key][preset[key].length - 1];
								if (obj[key][i] instanceof Object) {
									this.fixFields(obj[key][i], presetItem);
								} else if (presetItem instanceof Number && obj[key][i] instanceof String) {
									obj[key][i] = parseFloat(obj[key][i]);
								} else if (presetItem instanceof String && obj[key][i] instanceof Number) {
									obj[key][i] = obj[key][i].toString();
								}
							}
						}
					}
				} else {
					obj[key] = preset[key].slice();
				}
			} else if (preset[key] instanceof Object) {
				if (obj.hasOwnProperty(key)) {
					this.fixFields(obj[key], preset[key]);
				} else {
					obj[key] = this.copy({}, preset[key]);
				}
			} else if (obj.hasOwnProperty(key) && preset[key] instanceof Number && obj[key] instanceof String) {
				obj[key] = parseFloat(obj[key]);
			} else if (obj.hasOwnProperty(key) && preset[key] instanceof String && obj[key] instanceof Number) {
				obj[key] = obj[key].toString();
			} else if (!obj.hasOwnProperty(key) || typeof preset[key] !== typeof obj[key]) {
				obj[key] = preset[key];
			}
		}

		for (let key in obj) {
			if (!preset.hasOwnProperty(key)) {
				delete obj[key];
			}
		}
	},

	// Add missing and remove obsolete fields from template
	update(template) {
		// Add RRFv3 fields
		if (template.drives) {
			template.drives.forEach(function(drive, index) {
				if (index < 3 && !drive.hasOwnProperty('endstop')) {
					drive.endstop = index;
				}
			});
		}
		if (template.heaters) {
			template.heaters.forEach(function(heater) {
				if (heater && !heater.hasOwnProperty('sensor')) {
					heater.sensor = heater.channel;
				}
			});
		}

		// Add missing, delete obsolete and fix remaining fields
		this.fixFields(template, this.getDefaultTemplate());

		// IO Mapping
		const board = Boards.getBoard(template.board), maxDrives = this.getMaxDrives(template);
		if (template.drives.length > maxDrives) {
			if (template.expansion_boards.length === 0 && board.expansionBoards.length > 0) {
				// Add new expansion board
				template.expansion_boards.push(board.expansionBoards[board.expansionBoards.length - 1]);
			} else {
				// Too many drives. Delete obsolete items
				while (template.drives.length > maxDrives) {
					template.drives.pop();
				}
			}
		}

		// General
		if (template.firmware < 1.21) {
			// Firmware versions older than 1.21 are no longer supported
			template.firmware = 1.21;
		}

		template.auto_save.enabled = template.auto_save.enabled && board.hasPowerFailureDetection;

		// Endstops
		template.probe.deploy = template.probe.deploy || (template.probe.type === 'bltouch');

		template.drives.forEach(function(drive, index) {
			if ((drive.endstop_type == 3 && template.probe.type === 'noprobe') ||
				(drive.endstop_type == 4 && !board.hasMotorLoadDetection)) {
				drive.endstop_type = 2;
			}
		});

		if (template.geometry.type === 'delta') {
			template.drives[0].endstop_location = 2;
			template.drives[1].endstop_location = 2;
			template.drives[2].endstop_location = 2;
		} else {
			template.slow_homing = false;
		}

		if (template.board.startsWith('duetm')) {
			template.probe.pwm_channel = 64;		// Z probe mod pin
			template.probe.pwm_inverted = false;
		}

		// Heaters
		if (template.bed_is_nozzle) {
			if (template.bed.heater == 0) {
				template.bed.heater = (template.chamber.present && template.chamber.heater === 1) ? 2 : 1;
			}
			if (template.chamber.heater == 0) {
				template.chamber.heater = (template.bed.present && template.bed.heater === 1) ? 2 : 1;
			}
		}

		// Update Steinhart-Hart coefficients
		template.heaters.forEach(heater => {
			if (heater != null) {
				if (heater.hasOwnProperty('a')) {
					delete heater.a;
				}
				if (heater.hasOwnProperty('b')) {
					delete heater.b;
				}
				// c is added before we get here
			}
		});

		this.fixNozzles(template, this.getDefaultTemplate());
		
		// Fans
		while (template.fans.length > board.maxFans) {
			template.fans.pop();
		}

		// Tools
		template.tools.forEach(function(tool) {
			// Recalculate mix ratios if the number of extruders has changed
			if (Math.max(tool.mix_ratio.length, 1) !== Math.max(tool.extruders.length, 1)) {
				tool.mix_ratio = [];
				if (tool.extruders.length > 1) {
					let remaining = 1;
					for (let i = 1; i < tool.extruders.length; i++) {
						const ratio = parseFloat((1 / tool.extruders.length).toFixed(2));
						remaining -= ratio;
						tool.mix_ratio.push(ratio);
					}
					tool.mix_ratio.push(parseFloat(remaining.toFixed(2)));
				}
			}

			// Make sure only valid extruders and heaters are assigned
			const filteredExtruders = tool.extruders.filter(drive => drive + 3 < template.drives.length);
			if (filteredExtruders.length !== tool.extruders.length) {
				tool.extruders = filteredExtruders;
			}

			const filteredHeaters = tool.heaters.filter(heater => (heater === 0 && template.bed_is_nozzle) ||
				(heater > 0 && ((!template.bed.present || template.bed.heater !== heater) &&
				(!template.chamber.present || template.chamber.heater !== heater) &&
				(heater < template.heaters.length && template.heaters[heater] !== null))));
			if (filteredHeaters.length !== tool.heaters.length) {
				tool.heaters = filteredHeaters;
			}
		});

		// Compensation
		if (template.geometry.type === 'delta') {
			if (template.peripheral_points + template.halfway_points > 16) {
				template.halfway_points = 3;
			}

			if (template.calibration_factors > template.peripheral_points + template.halfway_points) {
				template.calibration_factors = 3;
			}

			if (template.probe.points.length !== template.peripheral_points + template.halfway_points + 1) {
				this.updateProbePoints(template);	// recalculate probe points on demand
			}
		} else {
			template.probe.points = [];				// n-point bed compensation is deprecated, generate G29 instead of G30 codes
		}
	},

	// Returns a deep copy and adds missing fields
	copy(template, preset = this.getDefaultTemplate()) {
		let obj = {};
		for (let key in preset) {
			if (preset[key] instanceof Array) {
				if (template.hasOwnProperty(key)) {
					obj[key] = [];
					let presetItem = undefined;
					for (let i = 0; i < template[key].length; i++) {
						if (preset[key].length > i) {
							presetItem = preset[key][i];
						}

						if (presetItem === undefined || template[key][i] === null || !(template[key][i] instanceof Object)) {
							obj[key].push(template[key][i]);
						} else if (template[key][i] instanceof Array) {
							obj[key].push(template[key][i].slice());
						} else {
							obj[key].push(this.copy(template[key][i], presetItem));
						}
					}
				} else {
					obj[key] = preset[key].slice();
				}
			} else if (preset[key] instanceof Object) {
				if (template.hasOwnProperty(key)) {
					obj[key] = this.copy(template[key], preset[key]);
				} else {
					obj[key] = this.copy({}, preset[key]);
				}
			} else if (template.hasOwnProperty(key) && typeof preset[key] === typeof template[key]) {
				obj[key] = template[key];
			} else if (template.hasOwnProperty(key) && preset[key].constructor instanceof Number && template[key].constructor instanceof String) {
				obj[key] = parseFloat(template[key]);
			} else {
				obj[key] = preset[key];
			}
		}
		return obj;
	},

	// Update drives and heater configurations
	fixNozzles(template, preset) {
		const maxHeaters = this.getMaxHeaters(template);
		while (template.heaters.length > maxHeaters) {
			template.heaters.pop();
		}

		const maxDrives = this.getMaxDrives(template);
		while (template.drives.length > maxDrives) {
			template.drives.pop();
		}

		if (template.firmware < 3) {
			let configuredHeaters = 0, configuredNozzles = 0;
			for (let index = 0; index < maxHeaters; index++) {
				const isSlowHeater = (template.bed.present && template.bed.heater === index) ||
					(template.chamber.present && template.chamber.heater === index);
				const skipHeater = (configuredNozzles >= template.num_nozzles && !isSlowHeater) ||
					(index === 0 && !template.bed_is_nozzle && !isSlowHeater) ||
					(template.probe.type === 'bltouch' && template.probe.pwm_channel === index);

				let heater;
				if (template.heaters.length < index + 1 || template.heaters[index] === null) {
					// Add missing heater
					if (skipHeater) {
						heater = null;
					} else {
						if (isSlowHeater) {
							heater = Object.assign({}, preset.heaters[0]);
						} else {
							const presetIndex = Math.min(preset.heaters.length - 1, 1);
							heater = Object.assign({}, preset.heaters[presetIndex]);
						}
						heater.channel = index;
						heater.output_pin = null;
						heater.sensor_pin = null;
						heater.sensor_type = null;
					}

					if (template.heaters.length < index + 1) {
						template.heaters.push(heater);
					} else {
						template.heaters[index] = heater;
					}
				} else if (skipHeater) {
					// Remove obsolete heater
					template.heaters[index] = null;
					heater = null;
				} else {
					// Get existing heater
					heater = template.heaters[index];
				}

				if (heater) {
					configuredHeaters++;
					if (template.bed.present && template.bed.heater === index) {
						if (!template.bed.use_pid) {
							heater.scale_factor = 100;
						}
					} else if (template.chamber.present && template.chamber.heater === index) {
						if (!template.bed.use_pid) {
							heater.scale_factor = 100;
						}
					} else {
						configuredNozzles++;
					}
				}
			}

			let index = template.heaters.length - 1;
			while (index > 0 && !template.heaters[index]) {
				template.heaters.pop();
				index--;
			}
		} else {
			let numHeaters = template.num_nozzles;
			if (template.bed.present) {
				numHeaters++;
			}
			if (template.chamber.present) {
				numHeaters++;
			}
			numHeaters = Math.min(numHeaters, this.getMaxHeaters(template));

			for (let i = template.heaters.length; i < numHeaters; i++) {
				let heater;
				if ((template.bed.present && template.bed.heater === i) ||
					(template.chamber.present && template.chamber.heater === i)) {
					heater = Object.assign({}, preset.heaters[0]);
				} else {
					const presetIndex = Math.min(preset.heaters.length - 1, 1);
					heater = Object.assign({}, preset.heaters[presetIndex]);
				}
				heater.channel = i;
				heater.output_pin = null;
				heater.sensor_pin = null;
				heater.sensor_type = null;
				template.heaters.push(heater);
			}

			while (template.heaters.length > numHeaters) {
				template.heaters.pop();
			}
		}

		if (template.bed.present && template.bed.heater >= template.heaters.length) {
			template.bed.present = false;
			this.fixNozzles(template);
		}
		if (template.chamber.present && template.chamber.heater >= template.heaters.length) {
			template.chamber.present = false;
			this.fixNozzles(template);
		}
	},

	// Recalculate probe points
	updateProbePoints(template) {
		if (template.geometry.type === 'delta') {
			if (!isNumber(template.probe_radius) || !isNumber(template.probe.x_offset) || !isNumber(template.probe.y_offset)) {
				return;
			}

			// Recalculate and add all probe points
			// Thanks to dc42 for providing the calculation code (original source from escher3d.com)
			const prevPoints = template.probe.points.slice();
			template.probe.points = [];
			for (let i = 0; i < template.peripheral_points; i++) {
				let probeX = template.probe_radius * Math.sin((2 * Math.PI * i) / template.peripheral_points);
				let probeY = template.probe_radius * Math.cos((2 * Math.PI * i) / template.peripheral_points);
				const rad = Math.sqrt(Math.pow(probeX + template.probe.x_offset, 2) + Math.pow(probeY + template.probe.y_offset, 2)) + 0.1;
				if (rad > template.probe_radius) {
					const factor = template.probe_radius / rad;
					probeX *= factor;
					probeY *= factor;
				}
				template.probe.points.push({
					x: probeX,
					y: probeY,
					z: (prevPoints.length > i) ? prevPoints[i].z : 0
				});
			}

			for (let i = 0; i < template.halfway_points; i++) {
				let probeX = (template.probe_radius / 2) * Math.sin((2 * Math.PI * i) / template.halfway_points);
				let probeY = (template.probe_radius / 2) * Math.cos((2 * Math.PI * i) / template.halfway_points);
				const rad = Math.sqrt(Math.pow(probeX + template.probe.x_offset, 2) + Math.pow(probeY + template.probe.y_offset, 2)) + 0.1;
				if (rad > template.probe_radius / 2) {
					const factor = (template.probe_radius / 2) / rad;
					probeX *= factor;
					probeY *= factor;
				}
				template.probe.points.push({
					x: probeX,
					y: probeY,
					z: (prevPoints.length > template.peripheral_points + i) ? prevPoints[template.peripheral_points + i].z : 0
				});
			}

			template.probe.points.push({
				x: 0,
				y: 0,
				z: 0
			});

			template.probe.points.forEach(point => {
				point.x = parseFloat(point.x.toFixed(2));
				point.y = parseFloat(point.y.toFixed(2));
			});
		}
	}
}
