'use strict';

import Boards from './Boards.js'

export default {
	// Returns a copy of the default config template
	getDefaultTemplate() {
		return {
			board: 'duetwifi10',
			firmware: 2.03,
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
					driver: 0,
					endstop_type: 1,
					endstop_location: 1
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
					driver: 1,
					endstop_type: 1,
					endstop_location: 1
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
					driver: 2,
					endstop_type: 3,
					endstop_location: 1
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
					driver: 3
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
				pwm_channel: 3,
				pwm_inverted: true
			},
			bed_is_nozzle: false,
			bed: {
				present: true,
				heater: 0,
				use_pid: false
			},
			chamber: {
				present: false,
				heater: 2,
				use_pid: false,
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
					channel: 0
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
					channel: 1
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
			halfway_points: 0,
			calibration_factors: 3,
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
				enabled: true,
				mac_address: '',
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
					inverted: false,
					frequency: 500,
					thermostatic: false,
					heaters: [],
					trigger_temperature: 45
				},
				{
					name: '',
					value: 100,
					inverted: false,
					frequency: 500,
					thermostatic: true,
					heaters: [1],
					trigger_temperature: 45
				}
			],
			custom_settings: ''
		}
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
		// Add missing, delete obsolete and fix remaining fields
		this.fixFields(template, this.getDefaultTemplate());

		// General
		const board = Boards.getBoard(template.board);

		if (template.firmware < 1.21) {
			// Firmware versions older than 1.21 are no longer supported
			template.firmware = 1.21;
		}

		template.auto_save.enabled = template.auto_save.enabled && board.hasPowerFailureDetection;

		// Motors
		while (template.drives.length > board.maxDrives) {
			template.drives.pop();
		}

		// Endstops
		template.probe.deploy = template.probe.deploy || (template.probe.type === 'bltouch');

		template.drives.forEach(function(drive, index) {
			if (drive.driver >= board.maxDrives) {
				drive.driver = index;
			}

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
				if (!heater.hasOwnProperty('c')) {
					heater.c = 0.0;
				}
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

	// Update heater configuration
	fixNozzles(template, preset) {
		let configuredHeaters = 0, configuredNozzles = 0;
		for (let index = 0; index < Boards.getBoard(template.board).maxHeaters; index++) {
			const isSpecialHeater = (template.bed.present && template.bed.heater === index) ||
				(template.chamber.present && template.chamber.heater === index);
			const skipHeater = (index === 0 && !template.bed_is_nozzle && !isSpecialHeater) ||
				(configuredNozzles >= template.num_nozzles && !isSpecialHeater) ||
				(template.probe.type === 'bltouch' && template.probe.pwm_channel === index);

			let heater;
			if (template.heaters.length < index + 1 || template.heaters[index] === null) {
				// Add missing heater
				if (skipHeater) {
					heater = null;
				} else {
					if (isSpecialHeater) {
						heater = Object.assign({}, preset.heaters[0]);
					} else {
						const presetIndex = Math.min(preset.heaters.length - 1, 1);
						heater = Object.assign({}, preset.heaters[presetIndex]);
					}
					heater.channel = index;
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
