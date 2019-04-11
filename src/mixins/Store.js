'use strict';

import Vue from 'vue'

import Boards from '../defaults/Boards.js'
import Template from '../defaults/Template.js'

// This is the mixin that registers global data and makes it accessible
// to each Vue component.
//
// In theory we could use Vuex for this but it does not allow two-way
// bindings and expects each modification to be wrapped inside a mutator, which
// would only make things more complicated for this kind of application.
//
let data = {
	board: Boards.getBoard(Template.getDefaultTemplate().board),
	machine: "custom",
	preset: Template.getDefaultTemplate(),
	template: Template.getDefaultTemplate()
};

let enforcingConstraints = false;
let oldMins = data.template.geometry.mins.slice(), oldMaxes = data.template.geometry.maxes.slice();

export default {
	beforeCreate() {
		// Make data properties accessible to every other Vue instance that is created later on
		Vue.mixin({
			beforeCreate() {
				for(let key in data) {
					if (!key.startsWith("_")) {
						Object.defineProperty(this, key, {
							get () { return data[key]; },
							set(value) { data[key] = value; }
						});
					}
				}
			},
			methods: {
				addNozzle() { this.template.num_nozzles++; },
				removeNozzle() { this.template.num_nozzles--; },

				addTool() {
					let tool = Object.assign({}, this.preset.tools[0]);
					tool.number = this.template.tools.length;
					if (this.template.bed_is_nozzle && tool.number == 0) {
						tool.heaters = [0];
					} else {
						tool.heaters = [];

						let count = 0;
						for(let i = 0; i < this.template.heaters.length; i++) {
							if ((!this.template.bed.present || this.template.bed.heater != i) &&
								(!this.template.chamber.present || this.template.chamber.heater != i)) {
								if (tool.number == count) {
									tool.heaters.push(i);
									break;
								}
								count++;
							}
						}
					}
					if (tool.number + 3 < this.template.drives.length) {
						tool.extruders = [tool.number];
					} else {
						tool.extruders = [];
					}
					this.template.tools.push(tool);
				},
				removeTool() { this.template.tools.pop(); },

				addFan() {
					const fan = Object.assign({}, this.preset.fans[this.preset.fans.length - 1]);
					this.template.fans.push(fan);
				},
				removeFan() { this.template.fans.pop(); }
			}
		});

		// Create global methods that are used both by watchers and sub-components
		Vue.prototype.enforceConstraints = function() {
			// General
			this.preset.auto_save.enabled = this.preset.auto_save.enabled && this.board.hasPowerFailureDetection;
			this.template.auto_save.enabled = this.template.auto_save.enabled && this.board.hasPowerFailureDetection;
			this.template.geometry.low_dive_height = this.template.geometry.low_dive_height && this.template.geometry.type == "delta";

			// Motors
			for(let i = this.template.drives.length - 1; i >= this.board.maxDrives; i--) {
				this.template.drives.pop();
			}

			// Endstops
			this.template.probe.deploy = this.template.probe.deploy || (this.template.probe.type == "bltouch");

			this.template.drives.forEach(function(drive, index) {
				if (drive.driver >= this.board.maxDrives) {
					drive.driver = index;
				}

				if ((drive.endstop_type == 3 && this.template.probe.type == "noprobe") ||
					(drive.endstop_type == 4 && !this.board.hasMotorLoadDetection)) {
					drive.endstop_type = 2;
				}
			}, this);

			if (this.template.geometry.type == "delta") {
				this.template.drives[0].endstop_location = 2;
				this.template.drives[1].endstop_location = 2;
				this.template.drives[2].endstop_location = 2;
			} else {
				this.template.slow_homing = false;
			}

			if (this.template.board.startsWith("duetm")) {
				this.template.probe.pwm_channel = 64;		// Z probe mod pin
				this.template.probe.pwm_inverted = false;
			}

			// Heaters
			if (this.template.bed_is_nozzle) {
				if (this.template.bed.heater == 0) {
					this.template.bed.heater = (this.template.chamber.present && this.template.chamber.heater == 1) ? 2 : 1;
				}
				if (this.template.chamber.heater == 0) {
					this.template.chamber.heater = (this.template.bed.present && this.template.bed.heater == 1) ? 2 : 1;
				}
			}
			
			this.updateNozzles();

			// Tools
			this.template.tools.forEach(function(tool) {
				// Recalculate mix ratios if the number of extruders has changed
				if (Math.max(tool.mix_ratio.length, 1) != Math.max(tool.extruders.length, 1)) {
					tool.mix_ratio = [];
					if (tool.extruders.length > 1) {
						let remaining = 1;
						for(let i = 1; i < tool.extruders.length; i++) {
							let ratio = parseFloat((1 / tool.extruders.length).toFixed(2));
							remaining -= ratio;
							tool.mix_ratio.push(ratio);
						}
						tool.mix_ratio.push(parseFloat(remaining.toFixed(2)));
					}
				}

				// Make sure only valid extruders and heaters are assigned
				let filteredExtruders = tool.extruders.filter(drive => drive + 3 < this.template.drives.length);
				if (filteredExtruders.length != tool.extruders.length) {
					tool.extruders = filteredExtruders;
				}

				let filteredHeaters = tool.heaters.filter(heater => (heater == 0 && this.template.bed_is_nozzle) ||
					(heater > 0 && ((!this.template.bed.present || this.template.bed.heater != heater) &&
									(!this.template.chamber.present || this.template.chamber.heater != heater) &&
									(heater < this.template.heaters.length && this.template.heaters[heater] != null))));
				if (filteredHeaters.length != tool.heaters.length) {
					tool.heaters = filteredHeaters;
				}
			}, this);

			// Compensation
			if (this.template.firmware > 1.20 && this.template.geometry.type != "delta") {
				this.template.probe.points = [];	// n-point bed compensation is deprecated, generate G29 instead of G30 codes
			} else if (this.template.firmware < 1.21 && this.template.probe.points.length < 3) {
				this.recalculateProbePoints(4);		// generate 4 probe points if there are too few (for backwards-compatibility)
			}

			if (this.template.peripheral_points + this.template.halfway_points > 16) {
				this.template.halfway_points = 3;
			}

			if (this.template.calibration_factors > this.template.peripheral_points + this.template.halfway_points) {
				this.template.calibration_factors = 3;
			}

			// Finish
			while (this.template.fans.length > this.board.maxFans) {
				this.template.fans.pop();
			}
		};

		Vue.prototype.enforceConstraintsNextTick = function() {
			if (!enforcingConstraints) {
				enforcingConstraints = true;
				this.$nextTick(function() {
					this.enforceConstraints();
					enforcingConstraints = false;
				});
			}
		};

		Vue.prototype.updateNozzles = function() {
			let configuredHeaters = 0, configuredNozzles = 0;
			for(let index = 0; index < this.board.maxHeaters; index++) {
				const isSpecialHeater = (this.template.bed.present && this.template.bed.heater == index) ||
										(this.template.chamber.present && this.template.chamber.heater == index);
				const skipHeater = (index == 0 && !this.template.bed_is_nozzle && !isSpecialHeater) ||
								   (configuredNozzles >= this.template.num_nozzles && !isSpecialHeater) ||
								   (this.template.probe.type == "bltouch" && this.template.probe.pwm_channel == index);

				let heater;
				if (this.template.heaters.length < index + 1 || this.template.heaters[index] == null) {
					// Add missing heater
					if (skipHeater) {
						heater = null;
					} else {
						if (isSpecialHeater) {
							heater = Object.assign({}, this.preset.heaters[0]);
						} else {
							const presetIndex = Math.min(this.preset.heaters.length - 1, 1);
							heater = Object.assign({}, this.preset.heaters[presetIndex]);
						}
						heater.channel = index;
					}

					if (this.template.heaters.length < index + 1) {
						this.template.heaters.push(heater);
					} else {
						this.template.heaters[index] = heater;
					}
				} else if (skipHeater) {
					// Remove obsolete heater
					this.template.heaters[index] = null;
					heater = null;
				} else {
					// Get existing heater
					heater = this.template.heaters[index];
				}

				if (heater != null) {
					configuredHeaters++;
					if (this.template.bed.present && this.template.bed.heater == index) {
						if (!this.template.bed.use_pid) {
							heater.scale_factor = 100;
						}
					} else if (this.template.chamber.present && this.template.chamber.heater == index) {
						if (!this.template.bed.use_pid) {
							heater.scale_factor = 100;
						}
					} else {
						configuredNozzles++;
					}
				}
			}

			let index = this.template.heaters.length - 1;
			while (index > 0 && this.template.heaters[index] == null) {
				this.template.heaters.pop();
				index--;
			}
		};

		Vue.prototype.recalculateProbePoints = function(numPoints) {
			if (numPoints == undefined) {
				numPoints = this.template.probe.points.length;
			}

			if (this.template.geometry.type == "delta") {
				if (!isNumber(this.template.probe_radius) || !isNumber(this.template.probe.x_offset) || !isNumber(this.template.probe.y_offset)) {
					return;
				}
				this.template.probe.points = [];

				// Recalculate and add all probe points
				// Thanks to dc42 for providing the calculation code (original source from escher3d.com)
				for(let i = 0; i < this.template.peripheral_points; i++) {
					let probeX = this.template.probe_radius * Math.sin((2 * Math.PI * i) / this.template.peripheral_points);
					let probeY = this.template.probe_radius * Math.cos((2 * Math.PI * i) / this.template.peripheral_points);
					let rad = Math.sqrt(Math.pow(probeX + this.template.probe.x_offset, 2) + Math.pow(probeY + this.template.probe.y_offset, 2)) + 0.1;
					if (rad > this.template.probe_radius) {
						let factor = this.template.probe_radius / rad;
						probeX *= factor;
						probeY *= factor;
					}
					this.template.probe.points.push({
						x: probeX,
						y: probeY,
						z: 0
					});
				}

				for(let i = 0; i < this.template.halfway_points; i++) {
					let probeX = (this.template.probe_radius / 2) * Math.sin((2 * Math.PI * i) / this.template.halfway_points);
					let probeY = (this.template.probe_radius / 2) * Math.cos((2 * Math.PI * i) / this.template.halfway_points);
					let rad = Math.sqrt(Math.pow(probeX + this.template.probe.x_offset, 2) + Math.pow(probeY + this.template.probe.y_offset, 2)) + 0.1;
					if (rad > this.template.probe_radius / 2) {
						let factor = (this.template.probe_radius / 2) / rad;
						probeX *= factor;
						probeY *= factor;
					}
					this.template.probe.points.push({
						x: probeX,
						y: probeY,
						z: 0
					});
				}

				this.template.probe.points.push({
					x: 0,
					y: 0,
					z: 0
				});
			} else {
				if (!isNumber(this.template.bed.width) || !isNumber(this.template.bed.length) ||
					!isNumber(this.template.compensation_x_offset) || !isNumber(this.template.compensation_y_offset) ) {
					return;
				}
				this.template.probe.points = [];

				switch (numPoints) {
					case 3:
						this.template.probe.points.push({
							x: this.template.compensation_x_offset,
							y: this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.compensation_x_offset,
							y: this.template.bed.width - this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.bed.length - this.template.compensation_x_offset,
							y: this.template.bed.width / 2,
							z: 0
						});
						break;

					case 4:
						this.template.probe.points.push({
							x: this.template.compensation_x_offset,
							y: this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.compensation_x_offset,
							y: this.template.bed.width - this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.bed.length - this.template.compensation_x_offset,
							y: this.template.bed.width - this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.bed.length - this.template.compensation_x_offset,
							y: this.template.compensation_y_offset,
							z: 0
						});
						break;

					case 5:
						this.template.probe.points.push({
							x: this.template.compensation_x_offset,
							y: this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.compensation_x_offset,
							y: this.template.bed.width - this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.bed.length - this.template.compensation_x_offset,
							y: this.template.bed.width - this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.bed.length - this.template.compensation_x_offset,
							y: this.template.compensation_y_offset,
							z: 0
						});
						this.template.probe.points.push({
							x: this.template.bed.length / 2,
							y: this.template.bed.width / 2,
							z: 0
						});
						break;
				}
			}

			this.template.probe.points.forEach(point => {
				point.x = parseFloat(point.x.toFixed(2));
				point.y = parseFloat(point.y.toFixed(2));
			});
		};
	},
	data: () => data,
	watch: {
		"template": function(to) {
			this.board = Boards.getBoard(to.board);
			if (to.board == "duet06" && to.heaters.length > 1) {
				// Duet 0.6 series resistor can vary so update the corresponding field
				this.board.seriesResistor = to.heaters[1].series;
			}

			if (to.geometry.hasOwnProperty("mins") && to.geometry.hasOwnProperty("maxes")) {
				oldMins = to.geometry.mins.slice();
				oldMaxes = to.geometry.maxes.slice();
			}
			Template.update(to);

			this.preset = Object.assign({}, to);
		},
		"template.bed_is_nozzle": function() { this.enforceConstraintsNextTick(); },
		"template.bed": {
			handler() { this.enforceConstraintsNextTick(); },
			deep: true
		},
		"template.bed.length": function(to, from) {
			if (this.template.mesh.x_max == from - this.template.compensation_x_offset) {
				this.template.mesh.x_max = to - this.template.compensation_x_offset;
			}
			this.recalculateProbePoints();
		},
		"template.bed.width": function(to, from) {
			if (this.template.mesh.y_max == from - this.template.compensation_x_offset) {
				this.template.mesh.y_max = to - this.template.compensation_x_offset;
			}
			this.recalculateProbePoints();
		},
		"template.board": function(to, from) {
			const oldBoard = this.board;
			const newBoard = Boards.getBoard(to);

			/* Enforce mandatory constraints */
			this.enforceConstraintsNextTick();

			if ((oldBoard.microstepping != newBoard.microstepping)  ||
				(oldBoard.microsteppingInterpolation != newBoard.microsteppingInterpolation)) {
				this.template.drives.forEach(function(drive) {
					if (newBoard.microstepping) {
						drive.microstepping_interpolation = (drive.microstepping == 16) || (drive.microstepping_interpolation && newBoard.microsteppingInterpolation);
					} else {
						drive.microstepping = 16;
						drive.microstepping_interpolation = false;
					}
				});
			}

			/* Update preset+template if only the board has changed */
			if (oldBoard.name != to) {
				this.preset.heaters.forEach(function(heater) {
					if (heater != null) {
						heater.series = newBoard.seriesResistor;
					}
				});
				this.template.heaters.forEach(function(heater) {
					if (heater != null && heater.series == oldBoard.seriesResistor) {
						heater.series = newBoard.seriesResistor;
					}
				});

				this.board = newBoard;
			}
		},
		"template.chamber": {
			handler() { this.enforceConstraintsNextTick(); },
			deep: true
		},
		"template.drives": function() { this.enforceConstraintsNextTick(); },
		"template.firmware": function() { this.enforceConstraintsNextTick(); },
		"template.geometry.type": function() {
			this.$nextTick(function() {
				this.enforceConstraints();
				this.recalculateProbePoints();
			});
		},
		"template.geometry.mins": function(to) {
			if (this.template.mesh.x_min == oldMins[0] + this.template.compensation_x_offset) {
				this.template.mesh.x_min = to[0] + this.template.compensation_x_offset;
			}
			if (this.template.mesh.y_min == oldMins[1] + this.template.compensation_y_offset) {
				this.template.mesh.y_min = to[1] + this.template.compensation_y_offset;
			}
			oldMins = to.slice();
		},
		"template.geometry.maxes": function(to) {
			if (this.template.bed.length == oldMaxes[0]) { this.template.bed.length = to[0]; }
			if (this.template.bed.width == oldMaxes[1]) { this.template.bed.length = to[1]; }
			oldMaxes = to.slice();
		},
		"template.geometry.print_radius": function(to, from) {
			if (this.template.probe_radius == from) { this.template.probe_radius = to; }
		},
		"template.halfway_points": function() { this.recalculateProbePoints(); },
		"template.num_nozzles": function() { this.enforceConstraintsNextTick(); },
		"template.peripheral_points": function() { this.recalculateProbePoints(); },
		"template.probe.type": function() { this.enforceConstraintsNextTick(); },
		"template.probe.pwm_channel": function() { this.enforceConstraintsNextTick(); },
		"template.probe_radius": function(to, from) { if (this.template.mesh.radius == from) { this.template.mesh.radius = to; } },
		"template.tools": {
			handler() { this.enforceConstraintsNextTick(); },
			deep: true
		}
	}
}
