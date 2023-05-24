export enum LegacyGeometry {
	Cartesian = "cartesian",
	CoreXY = "corexy",
	CoreXZ = "corexz",
	Delta = "delta"
}

export interface LegacyMenuItem {
	name: string;
	value: string;
}

export enum LegacyEndstopType {
	None,
	Switch,
	Switch_deprecated,
	ZProbe,
	StallDetection
}

export enum LegacyEndstopLocation {
	LowEnd = 1,
	HighEnd,
}

export interface LegacyDrive {
	direction: boolean;
	microstepping: number;
	microstepping_interpolation: boolean;
	steps_per_mm: number;
	instant_dv: number;
	max_speed: number;
	acceleration: number;
	current: number;
	driver: number;				    // v1-2 only
	driver_v3: string;			    // v3+
	endstop_pin: string | null;		// v3+
	endstop_type: LegacyEndstopType;
	endstop_location: LegacyEndstopLocation;
}

export interface LegacyPoint {
	x: number;
	y: number;
	z: number;
}

export interface LegacyHeater {
	temp_limit: number;
	scale_factor: number;
	series: number;
	thermistor: number;
	beta: number;
	a: number;
	b: number;
	c: number;
	channel: number;			// v1-2 only
	sensor: number;				// v1-2 only
	output_pin: string | null;	// v3+
	sensor_type: string;       	// v3+
	sensor_pin: string | null;  // v3+
}

export interface LegacyTool {
	mix_ratio: Array<number>;
	number: number;
	name: string;
	extruders: Array<number>;
	heaters: Array<number>;
	fans: Array<number>;
	x_offset: number;
	y_offset: number;
	z_offset: number;
}

export interface LegacyFan {
	name: string;
	value: number;
	inverted: boolean;			    // v1-2 only
	frequency: number;
	thermostatic: boolean;
	heaters: Array<number>;
	trigger_temperature: number;
	output_pin: string | null;		// v3+
}

export enum LegacyProbeType {
	None = "noprobe",
	Switch = "switch",
	Unmodulated = "unmodulated",
	Modulated = "modulated",
	SmartEffector = "effector",
	BLTouch = "bltouch"
}

export interface LegacyPreset {
	board: string;
	expansion_boards: Array<string>;
	firmware: number;
	standalone: boolean;
	nvram: boolean;
	auto_save: {
		enabled: boolean;
		save_threshold: number;
		resume_threshold: number;
		gcodes_to_run: string;
	};
	display: {
		type: number;
		encoder_steps: number;
		spi_frequency: number;
		menus: Array<LegacyMenuItem>;
		images: Array<LegacyMenuItem>;
	},
	panelDue: boolean;
	geometry: {
		type: LegacyGeometry;

		// Cartesian, CoreXY, CoreXZ
		mins: Array<number>;
		maxes: Array<number>;

		// Delta
		delta_radius: number;
		homed_height: number;
		low_dive_height: boolean;
		max_carriage_travel: number;
		print_radius: number;
		rod_length: number;
		z_min: number;
	};
	drives: Array<LegacyDrive>;
	idle: {
		used: boolean;
		factor: number;
		timeout: number;
	};
	homing_speed_fast: number;
	homing_speed_slow: number;
	travel_speed: number;
	z_dive_height: number;
	slow_homing: boolean;
	probe: {
		type: LegacyProbeType;
		recovery_time: number;
		trigger_height: number;
		trigger_value: number;
		x_offset: number;
		y_offset: number;
		speed: number;
		deploy: boolean;
		points: Array<LegacyPoint>;
		pwm_channel: number;			// v1-2 only
		pwm_inverted: boolean;			// v1-2 only
		pwm_pin: string | null;			// v3+
		input_pin: string | null;		// v3+
		modulation_pin: string | null;	// v3+
	},
	bed_is_nozzle: boolean;
	bed: {
		present: boolean;
		use_pid: boolean;
		heater: number;
	},
	chamber: {
		present: boolean;
		use_pid: boolean;
		heater: number;
	};
	heaters: Array<LegacyHeater>;
	num_nozzles: number;
	toolchange_wait_for_temperatures: boolean;
	generate_t_code: boolean;
	tools: Array<LegacyTool>;
	compensation_x_offset: number;
	compensation_y_offset: number;
	peripheral_points: number;
	halfway_points: number;
	calibration_factors: number;
	probe_radius: number;
	mesh: {
		x_min: number;
		x_max: number;
		y_min: number;
		y_max: number;
		radius: number;
		spacing: number;
	};
	home_first: boolean;
	orthogonal: {
		compensation: boolean;
		height: number;
		deviations: Array<number>;
	};
	network: {
		enabled: boolean;
		mac_address: string;
		name: string;
		password: string;
		ssid: string;
		ssid_password: string;
		dhcp: boolean;
		ip: string;
		netmask: string;
		gateway: string;
		protocols: {
			http: boolean;
			ftp: boolean;
			telnet: boolean;
		};
	},
	fans: Array<LegacyFan>;
	custom_settings: string;
}
