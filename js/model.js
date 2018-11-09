/* RepRapFirmware Configuration Tool
 *
 * created by Christian Hammacher, (c) 2016-2018
 */

// Config serialization
function generateTemplate() {
	var template = {};

	// General preferences
	template.board = $("#board").val();
	template.firmware = parseFloat($("#firmware").val());
	template.compatibility = parseInt($("#compatibility").val());
	template.nvram = $("#nvram").is(":checked");
	template.auto_save = {};
	template.auto_save.enabled = $("#power_failure_handling").is(":checked");
	template.auto_save.save_threshold = parseFloat($("#auto_save_threshold").val());
	template.auto_save.resume_threshold = parseFloat($("#auto_resume_threshold").val());
	template.auto_save.gcodes_to_run = $("#auto_save_gcodes").val();
	template.geometry = {};
	template.geometry.type = $("#geometry > li.active > a").attr("href").substr(1);
	if (template.geometry.type != "delta") {
		template.geometry.mins = [];
		["#x_min", "#y_min", "#z_min"].forEach(function(id) {
			template.geometry.mins.push(parseFloat($(id).val()));
		});
		template.geometry.maxes = [];
		["#x_max", "#y_max", "#z_max"].forEach(function(id) {
			template.geometry.maxes.push(parseFloat($(id).val()));
		});
	} else {
		template.geometry.delta_radius = parseFloat($("#delta_radius").val());
		template.geometry.rod_length = parseFloat($("#rod_length").val());
		template.geometry.print_radius = parseFloat($("#print_radius").val());
		template.geometry.homed_height = parseFloat($("#homed_height").val());
		template.geometry.z_min = parseFloat($("#z_min_delta").val());
		template.geometry.max_carriage_travel = parseFloat($("#max_carriage_travel").val());
		template.geometry.homed_height_warning = $("#homed_height_warning").is(":checked");
	}

	// Motors
	template.drives = [];
	var i = 0;
	$("#table_axes > tbody > tr, #table_extruders > tbody > tr:not(.hidden)").each(function() {
		var drive = {};
		drive.direction = parseInt($("input[name=\"drive" + i + "_forward\"]:checked").val());
		drive.microstepping = $("#drive" + i + "_microstepping").val();
		if (drive.microstepping.endsWith("_i")) {
			drive.microstepping = parseInt(drive.microstepping.split("_")[0]);
			drive.microstepping_interpolation = true;
		} else {
			drive.microstepping = parseInt(drive.microstepping);
			drive.microstepping_interpolation = false;
		}
		drive.steps_per_mm = parseFloat($("#drive" + i + "_steps_per_mm").val());
		drive.instant_dv = parseFloat($("#drive" + i + "_instant_dv").val());
		drive.max_speed = parseFloat($("#drive" + i + "_max_speed").val());
		drive.acceleration = parseFloat($("#drive" + i + "_acceleration").val());
		drive.current = parseFloat($("#drive" + i + "_current").val());
		drive.driver = parseInt($("#drive" + i + "_driver").val());

		template.drives.push(drive);
		i++;
	});

	template.idle = {};
	template.idle.used = $("#idle_used").is(":checked");
	if (template.idle.used) {
		template.idle.factor = parseFloat($("#idle_factor").val());
		template.idle.timeout = parseFloat($("#idle_timeout").val());
	}

	// Endstops
	$("#table_endstops > tbody > tr").each(function(i) {
		template.drives[i].endstop_type = parseInt($("input[name=\"drive" + i + "_endstop_type\"]:checked").val());
		if (template.geometry.type != "delta") {
			template.drives[i].endstop_location = parseInt($("input[name=\"drive" + i + "_endstop_location\"]:checked").val());
		} else {
			template.drives[i].endstop_location = 2;
		}
	});

	template.homing_speed_fast = $("#homing_speed_fast").val();
	template.homing_speed_slow = $("#homing_speed_slow").val();
	template.travel_speed = parseFloat($("#travel_speed").val());
	template.z_dive_height = parseFloat($("#z_dive_height").val());
	template.slow_homing = $("#slow_homing").is(":checked");

	template.probe = {};
	template.probe.type = $("#probe > li.active > a").attr("href").substr(1);
	if (template.probe.type == "effector") {
		template.probe.trigger_height = parseFloat($("#effector_trigger_height").val());
		template.probe.trigger_value = parseFloat($("#effector_trigger_value").val());
		template.probe.recovery_time = parseFloat($("#effector_recovery_time").val());
	} else if (template.probe.type == "bltouch") {
		template.probe.trigger_height = parseFloat($("#bltouch_trigger_height").val());
		template.probe.trigger_value = 25;
		template.probe.pwm_channel = $("#bltouch_channel").val();
	} else if (template.probe.type != "noprobe") {
		template.probe.trigger_height = parseFloat($("#trigger_height").val());
		template.probe.trigger_value = parseFloat($("#trigger_value").val());
	}
	template.probe.x_offset = parseFloat($("#probe_x_offset").val());
	template.probe.y_offset = parseFloat($("#probe_y_offset").val());
	template.probe.speed = parseFloat($("#probe_speed").val());
	template.probe.deploy = $("#probe_deploy").is(":checked");

	// Heaters
	template.num_nozzles = parseInt($("#num_nozzles").val());
	template.bed_is_nozzle = $("#bed_is_nozzle").is(":checked");

	template.bed = {};
	template.bed.present = $("#bed_present").is(":checked");
	if (template.bed.present) {
		template.bed.heater = parseInt($("#bed_heater").val());
		template.bed.use_pid = $("input[name=\"bed_pid\"]:checked").val() == 1;
	}

	template.chamber = {};
	template.chamber.present = $("#chamber_present").is(":checked");
	if (template.chamber.present) {
		template.chamber.heater = parseInt($("#chamber_heater").val());
		template.chamber.use_pid = $("input[name=\"chamber_pid\"]:checked").val() == 1;
	}

	template.heaters = [];
	$("#table_heaters > tbody > tr").each(function(i) {
		if ($(this).hasClass("hidden")) {
			template.heaters.push(null);
		} else {
			var heater = {};
			heater.temp_limit = parseFloat($("#heater" + i + "_temp_limit").val());
			heater.scale_factor = parseFloat($("#heater" + i + "_scale_factor").val());
			heater.series = parseFloat($("#heater" + i + "_series").val());
			heater.thermistor = parseFloat($("#heater" + i + "_thermistor").val());
			heater.beta = parseFloat($("#heater" + i + "_beta").val());
			if (template.firmware != "1.16") {
				heater.a = parseFloat($("#heater" + i + "_a").val());
				heater.b = parseFloat($("#heater" + i + "_b").val());
				heater.c = parseFloat($("#heater" + i + "_c").val());
			}
			heater.channel = parseInt($("#heater" + i + "_channel").val());
			template.heaters.push(heater);
		}
	});
	// Remove last null elements from list
	for(var i = template.heaters.length - 1; i > 0; i--) {
		if (template.heaters[i] != null) {
			template.heaters = template.heaters.slice(0, i + 1);
			break;
		}
	}

	// Tools
	template.toolchange_wait_for_temperatures = $("#toolchange_wait_for_temperatures").is(":checked");
	template.generate_t_code = $("#generate_t_code").is(":checked");

	template.tools = [];
	$("#table_tools > tbody > tr").each(function(i) {
		var tool = {};
		tool.number = parseInt($("#tool" + i + "_number").val());
		tool.extruders = [];
		$("input[name^=\"tool" + i + "_extruder\"]:checked").each(function() {
			tool.extruders.push(parseInt($(this).val()));
		});
		tool.heaters = [];
		$("input[name^=\"tool" + i + "_heater\"]:checked").each(function() {
			tool.heaters.push(parseInt($(this).val()));
		});
		tool.x_offset = parseFloat($("#tool" + i + "_x_offset").val());
		tool.y_offset = parseFloat($("#tool" + i + "_y_offset").val());
		tool.z_offset = parseFloat($("#tool" + i + "_z_offset").val());
		if (tool.extruders.length > 1) {
			tool.mix_ratio = [];
			$("#tool" + i + "_mix_ratio").val().split(":").forEach(function(value) {
				tool.mix_ratio.push(parseFloat(value));
			});
		}
		template.tools.push(tool);
	});

	// Compensation
	if (template.geometry.type != "delta") {
		template.bed.width = parseFloat($("#bed_width").val());
		template.bed.length = parseFloat($("#bed_length").val());
		template.compensation_x_offset = parseFloat($("#compensation_x_offset").val());
		template.compensation_y_offset = parseFloat($("#compensation_y_offset").val());
		template.mesh = {};
		template.mesh.x_min = parseFloat($("#mesh_x_min").val());
		template.mesh.x_max = parseFloat($("#mesh_x_max").val());
		template.mesh.y_min = parseFloat($("#mesh_y_min").val());
		template.mesh.y_max = parseFloat($("#mesh_y_max").val());
		template.mesh.spacing = parseFloat($("#mesh_cartesian_spacing").val());
	} else {
		template.peripheral_points = parseInt($("#num_peripheral_points").val());
		template.halfway_points = parseInt($("#num_halfway_points").val());
		template.calibration_factors = parseInt($("#num_calibration_factors").val());
		template.probe_radius = parseFloat($("#probe_radius").val());
		template.mesh = {};
		template.mesh.radius = parseFloat($("#mesh_radius").val());
		template.mesh.spacing = parseFloat($("#mesh_delta_spacing").val());
	}
	template.home_first = $("#home_first").is(":checked");

	template.probe.points = [];
	$("#table_points > tbody > tr").each(function(i) {
		var point = {};
		point.x = parseFloat($("#point" + i + "_x").val());
		point.y = parseFloat($("#point" + i + "_y").val());
		point.z = parseFloat($("#point" + i + "_z").val());
		template.probe.points.push(point);
	});

	template.orthogonal = {};
	template.orthogonal.compensation = $("#orthogonal").is(":checked");
	if (template.orthogonal.compensation) {
		template.orthogonal.height = parseFloat($("#measured_height").val());
		template.orthogonal.deviations = [];
		["#x_deviation", "#y_deviation", "#z_deviation"].forEach(function(id) {
			template.orthogonal.deviations.push(parseFloat($(id).val()));
		});
	}

	// Network
	template.network = {};
	template.network.enabled = $("#enable_network").is(":checked");
	if (template.network.enabled) {
		template.network.name = $("#name").val().trim();
		template.network.password = $("#password").val();
		if (template.board.startsWith("duetwifi")) {
			template.network.ssid = $("#ssid").val().trim();
			template.network.ssid_password = $("#ssid_password").val();
		} else {
			template.network.mac_address = $("#mac_address").val();
		}
		template.network.dhcp = $("#dhcp").is(":checked");
		if (!template.network.dhcp) {
			template.network.ip = $("#ip_address").val();
			template.network.netmask = $("#netmask").val();
			template.network.gateway = $("#gateway").val();
		}
		template.network.protocols = {};
		template.network.protocols.http = $("#http").is(":checked");
		template.network.protocols.ftp = $("#ftp").is(":checked");
		template.network.protocols.telnet = $("#telnet").is(":checked");
	}

	// Finish
	template.fans = [];
	$("#table_fans > tbody > tr:not(.hidden)").each(function(i) {
		var fan = {};
		fan.value = $("#fan" + i + "_value").val();
		fan.inverted = $("input[name=\"fan" + i + "_inverted\"]:checked").val() != 0;
		fan.frequency = parseFloat($("#fan" + i + "_frequency").val());
		fan.thermostatic = $("input[name=\"fan" + i + "_thermostatic\"]:checked").val() != 0;
		if (fan.thermostatic) {
			fan.heaters = [];
			$("input[name^=\"fan" + i + "_heater\"]:checked").each(function() {
				fan.heaters.push(parseInt($(this).val()));
			});
			fan.trigger_temperature = parseFloat($("#fan" + i + "_trigger_temperature").val());
		}
		template.fans.push(fan);
	});

	template.custom_settings = $("#custom_settings").val();

	return template;
}

function applyTemplate(template) {
	// General preferences
	setBoard(template.board);
	setFirmware(template.hasOwnProperty("firmware") ? template.firmware : "1.16");
	$("#compatibility").val(template.compatibility);
	$("#nvram").prop("checked", template.nvram);
	if (template.firmware >= 1.20 && template.hasOwnProperty("auto_save")) {
		setAutoSave(template.auto_save.enabled);
		$("#auto_save_threshold").val(template.auto_save.save_threshold);
		$("#auto_resume_threshold").val(template.auto_save.resume_threshold);
		$("#auto_save_gcodes").val(template.auto_save.gcodes_to_run);
	} else {
		setAutoSave(false);
	}
	setGeometry(template.geometry.type);
	if (template.geometry.type != "delta") {
		$("#x_min").val(template.geometry.mins[0]).trigger("change");
		$("#y_min").val(template.geometry.mins[1]).trigger("change");
		$("#z_min").val(template.geometry.mins[2]).trigger("change");
		$("#x_max").val(template.geometry.maxes[0]).trigger("change");
		$("#y_max").val(template.geometry.maxes[1]).trigger("change");
		$("#z_max").val(template.geometry.maxes[2]).trigger("change");
	} else {
		$("#delta_radius").val(template.geometry.delta_radius).trigger("change");
		$("#rod_length").val(template.geometry.rod_length);
		$("#print_radius").val(template.geometry.print_radius);
		$("#homed_height").val(template.geometry.homed_height);
		$("#z_min_delta").val(template.geometry.hasOwnProperty("z_min") ? template.geometry.z_min : 0);
		$("#max_carriage_travel").val(template.geometry.hasOwnProperty("max_carriage_travel") ? template.geometry.max_carriage_travel : template.geometry.homed_height + 10);
		$("#homed_height_warning").prop("checked", template.geometry.homed_height_warning);
	}

	// Motors
	var axisRows = $("#table_axes > tbody > tr");
	axisRows.each(function(axis) {
		setRadio("drive" + axis + "_forward", template.drives[axis].direction);
		var microstepping = template.drives[axis].microstepping + (template.drives[axis].microstepping_interpolation ? "_i" : "");
		$("#drive" + axis + "_microstepping").val(microstepping);
		$("#drive" + axis + "_steps_per_mm").val(template.drives[axis].steps_per_mm);
		$("#drive" + axis + "_instant_dv").val(template.drives[axis].instant_dv);
		$("#drive" + axis + "_max_speed").val(template.drives[axis].max_speed);
		$("#drive" + axis + "_acceleration").val(template.drives[axis].acceleration);
		$("#drive" + axis + "_current").val(template.drives[axis].current).trigger("change");
		$("#drive" + axis + "_driver").val(template.drives[axis].driver);
	});

	updateMotors();
	var numExtruders = template.drives.length - axisRows.length;
	$("#num_extruders").val(numExtruders).trigger("change");
	$("#table_extruders > tbody > tr:not(.hidden)").each(function(extruder) {
		setRadio("drive" + (extruder + axisRows.length) + "_forward", template.drives[extruder + axisRows.length].direction);
		var microstepping = template.drives[extruder + axisRows.length].microstepping + (template.drives[extruder + axisRows.length].microstepping_interpolation ? "_i" : "");
		$("#drive" + (extruder + axisRows.length) + "_microstepping").val(microstepping);
		$("#drive" + (extruder + axisRows.length) + "_steps_per_mm").val(template.drives[extruder + axisRows.length].steps_per_mm);
		$("#drive" + (extruder + axisRows.length) + "_instant_dv").val(template.drives[extruder + axisRows.length].instant_dv);
		$("#drive" + (extruder + axisRows.length) + "_max_speed").val(template.drives[extruder + axisRows.length].max_speed);
		$("#drive" + (extruder + axisRows.length) + "_acceleration").val(template.drives[extruder + axisRows.length].acceleration);
		$("#drive" + (extruder + axisRows.length) + "_current").val(template.drives[extruder + axisRows.length].current).trigger("change");
		$("#drive" + (extruder + axisRows.length) + "_driver").val(template.drives[extruder + axisRows.length].driver);
	});

	// Apply last extruder's settings to all hidden E drives
	if (numExtruders != 0) {
		var lastExtruder = template.drives[numExtruders + 2];
		var maxDrives = parseInt($("#num_extruders > option:last-child").val()) + 3;
		for(var drive = numExtruders + 3; drive < maxDrives; drive++) {
			setRadio("drive" + drive + "_forward", lastExtruder.direction);
			$("#drive" + drive + "_microstepping").val(lastExtruder.microstepping);
			$("#drive" + drive + "_steps_per_mm").val(lastExtruder.steps_per_mm);
			$("#drive" + drive + "_instant_dv").val(lastExtruder.instant_dv);
			$("#drive" + drive + "_max_speed").val(lastExtruder.max_speed);
			$("#drive" + drive + "_acceleration").val(lastExtruder.acceleration);
			$("#drive" + drive + "_current").val(lastExtruder.current);
			// see above for driver assignment
		}
	}

	$("#idle_used").prop("checked", template.idle.used);
	if (template.idle.used) {
		$("#idle_factor").val(template.idle.factor);
		$("#idle_timeout").val(template.idle.timeout);
	}

	// Endstops
	updateEndstops();
	$("#table_endstops > tbody > tr").each(function(i) {
		setRadio("drive" + i + "_endstop_type", template.drives[i].endstop_type);
		setRadio("drive" + i + "_endstop_location", template.drives[i].endstop_location);
	});

	$("#homing_speed_fast").val(template.homing_speed_fast);
	$("#homing_speed_slow").val(template.homing_speed_slow);
	$("#travel_speed").val(template.travel_speed);
	$("#z_dive_height").val(template.z_dive_height);
	$("#slow_homing").prop("checked", template.slow_homing);

	$("#probe_x_offset").val(template.probe.x_offset);
	$("#probe_y_offset").val(template.probe.y_offset);
	$("#probe_speed").val(template.probe.speed);
	$("a[href=\"#" + template.probe.type + "\"]").tab("show");
	if (template.probe.type == "effector") {
		$("#effector_trigger_height").val(template.probe.trigger_height);
		$("#effector_trigger_value").val(template.probe.trigger_value);
		$("#effector_recovery_time").val(template.probe.recovery_time);
	} else if (template.probe.type == "bltouch") {
		$("#bltouch_trigger_height").val(template.probe.trigger_height);
		$("#bltouch_channel").val(template.probe.pwm_channel);
	} else if (template.probe.type != "noprobe") {
		$("#trigger_height").val(template.probe.trigger_height);
		$("#trigger_value").val(template.probe.trigger_value);
	}
	$("#probe_deploy").val(template.probe.deploy);

	// Heaters
	$("#num_nozzles").val(template.num_nozzles);
	$("#bed_is_nozzle").prop("checked", template.bed_is_nozzle);

	$("#bed_present").prop("checked", template.bed.present).trigger("change");
	if (template.bed.present) {
		$("#bed_heater > option").prop("disabled", false);
		$("#bed_heater").val(template.bed.heater);
		setRadio("bed_pid", template.bed.use_pid ? "1" : "0");
	}

	$("#chamber_present").prop("checked", template.chamber.present).trigger("change");
	if (template.chamber.present) {
		$("#chamber_heater > option").prop("disabled", false);
		$("#chamber_heater").val(template.chamber.heater);
		setRadio("chamber_pid", template.chamber.use_pid ? "1" : "0");
	}

	updateHeaters();
	var heater;
	$("#table_heaters > tbody > tr:not(.hidden)").each(function(i) {
		if (template.heaters[i] == null) {
			heater = firmwareDefaults.heaters[Math.min(i, 1)];
		} else {
			heater = template.heaters[i];
		}

		if (!heater.hasOwnProperty("temp_limit")) {
			heater.temp_limit = (i == 0) ? 120 : 280;
		}
		$("#heater" + i + "_temp_limit").val(heater.temp_limit);

		$("#heater" + i + "_scale_factor").val(heater.scale_factor);
		$("#heater" + i + "_series").val(heater.series);
		$("#heater" + i + "_thermistor").val(heater.thermistor);
		$("#heater" + i + "_beta").val(heater.beta);
		if (!heater.hasOwnProperty("a") || heater.a == 0) {
			heater.a = (1.0 / 298.15) - (1.0 / heater.beta) * Math.log(heater.thermistor);
			heater.b = 1.0 / heater.beta;
			heater.c = 0.0;
		}
		$("#heater" + i + "_a").val((heater.a == 0) ? 0 : heater.a.toExponential(8));
		$("#heater" + i + "_b").val((heater.b == 0) ? 0 : heater.b.toExponential(8));
		$("#heater" + i + "_c").val((heater.c == 0) ? 0 : heater.c.toExponential(8));
		$("#heater" + i + "_channel").val(heater.channel);
	});

	// Apply last nozzles's settings to all hidden nozzle heaters
	if (template.num_nozzles != 0) {
		var lastNozzleHeater = template.heaters.length - 1;
		if (template.bed.present && template.bed.heater == lastNozzleHeater) {
			lastNozzleHeater--;
		}
		if (template.chamber.present && template.chamber.heater == lastNozzleHeater) {
			lastNozzleHeater--;
		}
		if (template.bed.present && template.bed.heater == lastNozzleHeater) {
			lastNozzleHeater--;
		}

		var lastNozzle = template.heaters[lastNozzleHeater];
		$("#table_heaters > tbody > tr.hidden[data-type=\"nozzle\"]").each(function() {
			$(this).find("[id$=_scale_factor]").val(lastNozzle.scale_factor);
			$(this).find("[id$=_series]").val(lastNozzle.series);
			$(this).find("[id$=_thermistor]").val(lastNozzle.thermistor);
			$(this).find("[id$=_beta]").val(lastNozzle.beta);
			$(this).find("[id$=_a]").val(lastNozzle.a);
			$(this).find("[id$=_b]").val(lastNozzle.b);
			$(this).find("[id$=_c]").val(lastNozzle.c);
			// see above for channel
		});
	}

	// Tools
	toolsChanged = (numExtruders != template.num_nozzles);
	$("#num_tools").val(template.tools.length);
	$("#toolchange_wait_for_temperatures").prop("checked", template.toolchange_wait_for_temperatures);
	$("#generate_t_code").prop("checked", template.generate_t_code);
	updateToolCount();

	updateTools();
	$("#table_tools > tbody > tr").each(function(i) {
		$("#tool" + i + "_number").val(template.tools[i].number);
		$("input[name^=\"tool" + i + "_extruder\"]").each(function() {
			var value = parseInt($(this).val());
			var driveAssigned = template.tools[i].extruders.indexOf(value) != -1;
			$(this).prop("checked", driveAssigned).parent().toggleClass("active", driveAssigned);
		});
		$("input[name^=\"tool" + i + "_heater\"]").each(function() {
			var value = parseInt($(this).val());
			var heaterAssigned = template.tools[i].heaters.indexOf(value) != -1;
			$(this).prop("checked", heaterAssigned).parent().toggleClass("active", heaterAssigned);
		});
		$("#tool" + i + "_x_offset").val(template.tools[i].x_offset);
		$("#tool" + i + "_y_offset").val(template.tools[i].y_offset);
		$("#tool" + i + "_z_offset").val(template.tools[i].hasOwnProperty("z_offset") ? template.tools[i].z_offset : 0);
		$("#tool" + i + "_mix_ratio").prop("disabled", template.tools[i].extruders.length <= 1);
		if (template.tools[i].extruders.length > 1) {
			$("#tool" + i + "_mix_ratio").val(template.tools[i].mix_ratio.reduce(function(a, b) { return a + ":" + b; }));
		}

		if (template.tools[i].extruders.length != 1 || template.tools[i].heaters.length != 1 ||
				template.tools[i].extruders[0] != i || template.tools[i].heaters[0] != i + 1) {
			// If this template uses unique tool mappings, disable automatic tool updates
			toolsChanged = true;
		}
	});

	// Compensation
	if (template.geometry.type != "delta") {
		$("#num_probe_points").val(template.probe.points.length);
		$("#bed_width").val(template.bed.width);
		$("#bed_length").val(template.bed.length);
		$("#compensation_x_offset").val(template.compensation_x_offset);
		$("#compensation_y_offset").val(template.compensation_y_offset);

		bedDimensionsChanged = (template.bed.width != template.geometry.maxes[1]) || (template.bed.length != template.geometry.maxes[0]);

		if (template.hasOwnProperty("mesh")) {
			meshDimensionsChanged = false;
			$("#mesh_x_min").val(template.mesh.x_min);
			meshDimensionsChanged |= (template.mesh.min_x != template.compensation_x_offset);
			$("#mesh_x_max").val(template.mesh.x_max);
			meshDimensionsChanged |= (template.mesh.max_x != template.bed.width - template.compensation_x_offset);
			$("#mesh_y_min").val(template.mesh.y_min);
			meshDimensionsChanged |= (template.mesh.min_y != template.compensation_y_offset);
			$("#mesh_y_max").val(template.mesh.y_max);
			meshDimensionsChanged |= (template.mesh.max_y != template.bed.length - template.compensation_y_offset);
			$("#mesh_cartesian_spacing").val(template.mesh.spacing);
		} else {
			meshDimensionsChanged = false;
		}
	} else {
		$("#num_peripheral_points").val(template.peripheral_points);
		$("#num_halfway_points").val(template.halfway_points);
		$("#num_calibration_factors").val(template.calibration_factors);
		$("#probe_radius").val(template.probe_radius);

		probeRadiusChanged = (template.probe_radius != template.print_radius);

		if (template.hasOwnProperty("mesh")) {
			$("#mesh_radius").val(template.mesh.radius);
			$("#mesh_delta_spacing").val(template.mesh.spacing);
		} else {
			$("#mesh_radius").val(template.probe_radius);
		}
	}
	$("#home_first").prop("checked", template.home_first);

	$("#table_points > tbody > tr").remove();
	for(var i = 0; i < template.probe.points.length; i++) {
		addProbePoint(i, template.probe.points[i].x, template.probe.points[i].y, template.probe.points[i].z);
	}

	$("#orthogonal").prop("checked", template.orthogonal.compensation).trigger("change");
	if (template.orthogonal.compensation) {
		$("#measured_height").val(template.orthogonal.height);
		$("#x_deviation").val(template.orthogonal.deviations[0]);
		$("#y_deviation").val(template.orthogonal.deviations[1]);
		$("#z_deviation").val(template.orthogonal.deviations[2]);
	}

	// Network
	updateNetwork();
	$("#enable_network").prop("checked", template.network.enabled).trigger("change");
	if (template.network.enabled) {
		$("#name").val(template.network.name);
		$("#password").val(template.network.password);
		if (template.board == "duet06" || template.board == "duet085") {
			$("#mac_address").val(template.network.mac_address);
		}
		$("#dhcp").prop("checked", template.network.dhcp).trigger("change");
		if (!template.network.dhcp) {
			$("#ip_address").val(template.network.ip);
			$("#netmask").val(template.network.netmask);
			$("#gateway").val(template.network.gateway);
		}
	}
	$("#ssid").val(template.network.hasOwnProperty("ssid") ? template.network.ssid : "");
	$("#ssid_password").val(template.network.hasOwnProperty("ssid_password") ? template.network.ssid : "");
	if (template.network.hasOwnProperty("protocols")) {
		$("#http").prop("checked", template.network.protocols.http);
		$("#ftp").prop("checked", template.network.protocols.ftp);
		$("#telnet").prop("checked", template.network.protocols.telnet);
	} else {
		$("#http").prop("checked", true);
		$("#ftp, #telnet").prop("checked", false);
	}

	// Finish
	updateFans();
	$("#table_fans > tbody > tr:not(.hidden)").each(function(i) {
		$("#fan" + i + "_value").val(template.fans[i].value);
		setRadio("fan" + i + "_inverted", template.fans[i].inverted ? "1" : "0");
		$("#fan" + i + "_frequency").val(template.fans[i].frequency);
		setRadio("fan" + i + "_thermostatic", template.fans[i].thermostatic ? "1" : "0");
		if (template.fans[i].thermostatic) {
			$("input[name^=\"fan" + i + "_heater\"]").each(function() {
				$(this).prop("checked", template.fans[i].heaters.indexOf($(this).val()) != -1);
				$(this).trigger("change");
			});
			$("#fan" + i + "_trigger_temperature").val(template.fans[i].trigger_temperature);
		}
	});

	$("#custom_settings").val(template.custom_settings);

	// Revalidate all input data
	$("input").trigger("keyup");
}

// AJAX functions
function loadMachineTemplate(template) {
	$.ajax("machines/" + template + ".json", {
		dataType: "json",
		beforeSend: function (xhr) {
			if (xhr && xhr.overrideMimeType) {
				xhr.overrideMimeType('application/json;charset=utf-8');
			}
		},
		success: function(response) {
			applyTemplate(response);
			updateDefaults();
		}
	});
}

function loadEJS(filename, callback, cb_payload, payload) {
	$.ajax(filename, {
		cache: false,
		dataType: "text",
		beforeSend: function (xhr) {
			if (xhr && xhr.overrideMimeType) {
				xhr.overrideMimeType("text/plain;charset=utf-8");
			}
		},
		success: function(response) {
			var result = ejs.render(response, payload);
			var lines = result.split('\n');
			var maxCommandLength = 0;

			// Find out how long the maximum command is
			lines.forEach(function(line) {
				var index = line.indexOf(";");
				if (index == 1) {
					index = line.substr(1).indexOf(";") - 1;
				}

				if (index > maxCommandLength) {
					maxCommandLength = index;
				}
			});

			// Align line comments
			var newResult = "";
			lines.forEach(function(line) {
				var index = line.indexOf(";"), startingWithComment = (index == 0);
				if (startingWithComment) {
					line = line.substr(1);
					index = line.indexOf(";");
				}

				if (index == -1) {
					newResult += (startingWithComment ? ";" : "") + line + "\n";
				} else {
					var commandPart = (startingWithComment ? ";" : "") + line.substr(0, index - 1);
					var commentPart = line.substr(index);
					for(var i = commandPart.length; i < maxCommandLength; i++) {
						commandPart += " ";
					}
					newResult += commandPart + commentPart + "\n";
				}
			});
			result = newResult.trim();

			callback(filename, result, cb_payload);
		}
	});
}

// File generation
function generateFile(targetFile, callback) {
	var options = {};
	var templateFile = "templates/" + targetFile.replace(".g", ".ejs");
	if (targetFile.startsWith("tfree")) {
		templateFile = "templates/tfree.ejs";
		options.index = parseInt(targetFile.match("tfree(\\d+).g")[1]);
	} else if (targetFile.startsWith("tpre")) {
		templateFile = "templates/tpre.ejs";
		options.index = parseInt(targetFile.match("tpre(\\d+).g")[1]);
	} else if (targetFile.startsWith("tpost")) {
		templateFile = "templates/tpost.ejs";
		options.index = parseInt(targetFile.match("tpost(\\d+).g")[1]);
	}

	loadEJS(templateFile, function(filename, content, payload) {
		callback(payload, content);
	}, targetFile, options);
}
