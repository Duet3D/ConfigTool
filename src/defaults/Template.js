export default {
	getDefaultTemplate() {
		return {
			board: "duetwifi10",
			firmware: 1.21,
			nvram: false,
			auto_save: {
				enabled: false,
				save_threshold: 10,
				resume_threshold: 11,
				gcodes_to_run: "M913 X0 Y0 G91 M83 G1 Z3 E-5 F1000"
			},
			geometry: {
				type: "cartesian",

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
				type: "unmodulated",
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
				use_pid: false,
				width: 210,
				length: 230
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
					name: "",
					extruders: [0],
					heaters: [1],
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
				mac_address: "",
				name: "My Printer",
				password: "",
				ssid: "",
				ssid_password: "",
				dhcp: true,
				ip: "192.168.1.20",
				netmask: "255.255.255.0",
				gateway: "192.168.1.254",
				protocols: {
					http: true,
					ftp: false,
					telnet: false
				}
			},
			fans: [
				{
					value: 30,
					inverted: false,
					frequency: 500,
					thermostatic: true,
					heaters: [],
					trigger_temperature: 45
				},
				{
					value: 100,
					inverted: false,
					frequency: 500,
					thermostatic: true,
					heaters: [1],
					trigger_temperature: 45
				}
			],
			custom_settings: ""
		}
	},

	// Add missing and remove obsolete fields from obj
	update(obj) {
		// Add Steinhart-Hart coefficients back
		obj.heaters.forEach(heater => {
			if (heater != null && (!heater.hasOwnProperty("a") || heater.a == 0)) {
				heater.a = (1.0 / 298.15) - (1.0 / heater.beta) * Math.log(heater.thermistor);
				heater.b = 1.0 / heater.beta;
				heater.c = 0.0;
			}
		});

		// Create a usable copy of the template and assign the fields
		let copy = this.copy(this.getDefaultTemplate(), obj);
		for(let key in copy) {
			obj[key] = copy[key];
		}
		for(let key in obj) {
			if (!copy.hasOwnProperty(key)) {
				delete obj[key];
			}
		}
	},

	// Returns a deep copy of source and adds missing fields from preset
	copy(preset, source) {
		let obj = {};
		for(let key in preset) {
			if (preset[key].constructor === Object) {
				if (source.hasOwnProperty(key)) {
					obj[key] = this.copy(preset[key], source[key]);
				} else {
					obj[key] = this.copy(preset[key], {});
				}
			} else if (preset[key].constructor === Array) {
				if (source.hasOwnProperty(key)) {
					obj[key] = [];
					let presetItem = undefined;
					for(let i = 0; i < source[key].length; i++) {
						if (preset[key].length > i) {
							presetItem = preset[key][i];
						}

						if (presetItem == undefined || source[key][i] == null || source[key][i].constructor !== Object) {
							obj[key].push(source[key][i]);
						} else {
							obj[key].push(this.copy(presetItem, source[key][i]));
						}
					}
				} else {
					obj[key] = preset[key].slice();
				}
			} else if (source.hasOwnProperty(key) && preset[key].constructor === source[key].constructor) {
				obj[key] = source[key];
			} else {
				obj[key] = preset[key];
			}
		}
		return obj;
	}
}
