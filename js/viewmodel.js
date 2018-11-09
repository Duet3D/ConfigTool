/* RepRapFirmware Configuration Tool
 *
 * created by Christian Hammacher, (c) 2016-2018
 */


/* General UI Logic */

var firmwareDefaults = generateTemplate();		// Default firmware values
var defaultSettings;							// Default template/geometry settings

var lastTabLink = "#start";
var lastMachine = "custom";

$("nav a[data-toggle], ul.pager a[data-toggle]").on("show.bs.tab", function(e) {
	// Update navbar UI elements
	var tabLink = $(e.target).attr("href");
	$("nav a[data-toggle], ul.pager a[data-toggle]").parent("li").removeClass("active");
	$("a[href=\"" + tabLink + "\"]").parent("li").addClass("active");

	// Check which page has been hidden
	if (lastTabLink == "#start") {
		var machine = $("input[name=machine]:checked").val();
		if (machine != "custom" && machine != "existing" && machine != lastMachine) {
			loadMachineTemplate(machine);
			lastMachine = machine;
		}
	} else if (lastTabLink == "#general") {
		var isDelta = $("#geometry > li.active > a").attr("href") == "#delta";
		$(".cartesian").toggleClass("hidden", isDelta);
		$(".delta").toggleClass("hidden", !isDelta);
	}

	// Check which page is shown
	if (tabLink == "#motors") {
		updateMotors();
	} else if (tabLink == "#endstops") {
		updateEndstops();
	} else if (tabLink == "#heaters") {
		updateHeaters();
	} else if (tabLink == "#tools") {
		updateToolCount();
		updateTools();
	} else if (tabLink == "#finish") {
		checkForErrors();
	} else if (tabLink == "#compensation") {
		updateCompensation();
	} else if (tabLink == "#network") {
		updateNetwork();
	}

	lastTabLink = tabLink;
});

$("form").submit(function(e) {
	// Don't send the form content anywhere, everything is bound to JS
	e.preventDefault();
});

function setRadio(name, value) {
	$("input[name=\"" + name + "\"]").parent().removeClass("active");
	var radio = $("input[name=\"" + name + "\"][value=\"" + value + "\"]");
	radio.prop("checked", true).parent().addClass("active");
}

$(document).ready(function() {
	// Bootstrap bug: If the "title" attribute is set, the getter function will be never called
	$("[data-title]").tooltip({ title: getTooltip, html: true, container: "body", trigger: "hover" });

	// Bind default values to each text input and select control
	updateDefaults();
});

function getTooltip() {
	// Get target element
	var target;
	if ($(this).is("input") || $(this).is("select")) {
		target = $(this);
	} else {
		target = $(this).find("input");
		if (target.length == 0) {
			target = $(this).find("select");
		}
		if (target.length == 0) {
			target = $(this).parent().children("input");
		}
	}

	// Check if only the title can be shown
	var tooltip = $(this).data("title");
	if (target == undefined) {
		return tooltip;
	}

	// Else prepare alternative tooltip text including ranges and default value including unit (if defined)
	if (target.attr("min") != undefined || target.attr("max") != undefined || target.data("default") != undefined) {
		var unitSpan = target.closest("div.input-group").find("span.input-group-addon:not(:first-child)");
		var unit = (unitSpan == undefined) ? "" : " " + unitSpan.text();

		tooltip += "<br/>";
		if (target.attr("min") != undefined && target.attr("max") != undefined) {
			tooltip += "<br/>Allowed range: " + target.attr("min") + " - " + target.attr("max") + unit;
		} else if (target.attr("min") != undefined) {
			tooltip += "<br/>Minimum value: " + target.attr("min") + unit;
		} else if (target.attr("max") != undefined) {
			tooltip += "<br/>Maximum value: " + target.attr("max") + unit;
		}

		var defaultValue = target.data("default");
		if (defaultValue != undefined && defaultValue != "") {
			tooltip += "<br/>Default value: " + defaultValue + unit;
		}
	}
	return tooltip;
}

function updateDefaults() {
	$("input[type=\"number\"], input[type=\"text\"]").each(function() { $(this).data("default", $(this).val()); });
	$("input[type=\"checkbox\"]").each(function() { $(this).data("default", $(this).is(":checked") ? "Enabled" : "Disabled"); });
	$("select").each(function() {
		var selectedOption = $(this).children("[value=\"" + $(this).val() + "\"]");
		$(this).data("default", selectedOption.text());
	});

	$("#bed_length, #bed_width, #probe_radius, #password").removeData("default");
	$("#table_fans input[type=\"checkbox\"]").removeData("default");
	defaultSettings = generateTemplate();
}


/* Start page */

$("input[value=\"existing\"]").click(function(e) {
	// Open file dialog
	$("#input_file_upload").click();
	e.preventDefault();
});

$("#input_file_upload").change(function() {
	if (this.files.length > 0) {
		// Load JSON from file
		var file = this.files[0];
		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			try {
				// Try to load settings from specified file
				applyTemplate(JSON.parse(e.target.result));

				// Select radio option
				$("input[name=\"machine\"][value=\"existing\"]").prop("checked", true);
			} catch (e) {
				// Something went wrong. Display an error message and revert to defaults
				alert("Error: The specified file could not be read!");
				applyTemplate(defaultSettings);
			}
		};
		fileReader.readAsText(file);

		// Clear input again
		$(this).val(null);
	}
});


/* General page */

var lastGeometry = "cartesian";

$("#board").change(function() {
	var board = $(this).val();
	setBoard(board);

	// Show modal dialog for Duet 0.6 here
	if (board == "duet06") {
		$("#modal_duet06").modal("show");
	}
});

$("#duet06_1k").click(function() {
	$("[id$='_series']").val(1000);
	$("#modal_duet06").modal("hide");
});

$("#duet06_4_7k").click(function() {
	$("[id$='_series']").val(4700);
	$("#modal_duet06").modal("hide");
});

$("#firmware").change(function() {
	setFirmware(parseFloat($(this).val()));
});

$("#power_failure_handling").click(function() {
	$("#power_failure_options").toggleClass("hidden", !$(this).is(":checked"));
});

$("#geometry a").on("show.bs.tab", function(e) {
	var geometry = $(e.target).attr("href").substr(1);
	if (geometry != lastGeometry) {
		lastGeometry = geometry;
		setGeometry(geometry);
	}
});

$("#x_min, #y_min, #z_min").change(function() {
	var id = "#" + $(this).attr("id");
	var value = parseFloat($(this).val());
	var max = $(id.replace("min", "max"));
	var maxValue = parseFloat(max.val());
	if (!isNaN(value) && !isNaN(maxValue)) {
		if (value < maxValue) {
			// Value OK, change min for max input
			max.attr("min", value);
			max.trigger("keyup");
		} else {
			// Validation failed
			setValidated(id, false);
		}
	}
});

$("#x_max, #y_max, #z_max").change(function() {
	var id = "#" + $(this).attr("id");
	var value = parseFloat($(this).val());
	var min = $(id.replace("max", "min"));
	var minValue = parseFloat(min.val());
	if (!isNaN(value) && !isNaN(minValue)) {
		if (value > minValue) {
			// Value OK, change max for min input
			min.attr("max", value);
			min.trigger("keyup");
		} else {
			// Validation failed
			setValidated(id, false);
		}
	}
});

$("#delta_radius").change(function() {
	var value = parseFloat($(this).val());
	if (!isNaN(value)) {
		$("#print_radius").attr("max", value);
		$("#print_radius").trigger("keyup");
	}
});

function setBoard(value) {
	var boardDefinition = getBoardDefinition(value);

	// Set selected board
	$("#board").val(value);

	// Update stepper driver interpolation
	var allowMaxInterpolation = (value == "duetm10");
	$("select[id$='_microstepping'] > option[value$='_i'][value!='16_i']").toggleClass("hidden", !allowMaxInterpolation);
	if (!allowMaxInterpolation) {
		$("[id$='_microstepping']").each(function() {
			var value = $(this).val();
			if (value.indexOf("_i") != -1 && value != "16_i") {
				$(this).val("16_i");
			}
		});
	}

	// Update motor currents
	$("[id$='_current']").prop("max", boardDefinition.motorLimitCurrent).trigger("change");

	// Update motor load detection
	updateMotorLoadDetection();

	// Update series resistors
	$("[id$='_series']").val(boardDefinition.seriesResistor).trigger("change");

	// Update E2 thermistor caption
	$("select[id$='_channel']").children().eq(3).text(value == "duetm10" ? "C TEMP Thermistor" : "E2 Thermistor");
	$("select[id$='_channel']").children().eq(35).text(value == "duetm10" ? "PT1000 on C TEMP Input" : "PT1000 on E2 Input");

}

function setFirmware(value) {
	// Set firmware version selection
	$("#firmware").val(value);

	// Show/hide controls for specific firmware versions
	$(".fw-116").toggleClass("hidden", value > 1.16);
	$(".fw-117").toggleClass("hidden", value < 1.17);
	$(".fw-120").toggleClass("hidden", value < 1.20);
	if (value == 1.16) {
		$(".beta-parameter").removeClass("hidden");
		$(".abc-parameter").addClass("hidden");
	}

	// Misc
	$("#power_failure_options").toggleClass("hidden", !$("#power_failure_handling").prop("checked"));
	updateMotorLoadDetection();
}

function updateMotorLoadDetection() {
	var boardDefinition = getBoardDefinition($("#board").val());
	var supportsLoadDetection = boardDefinition.hasMotorLoadDetection && $("#firmware").val() >= 1.20;
	$(".motor-load-detection").toggleClass("hidden", !supportsLoadDetection);
	if (!supportsLoadDetection) {
		for (var axis = 0; axis < 3; axis++) {
			if ($("input[name=\"drive" + axis + "_endstop_type\"]:checked").val() == 4) {
				setRadio("drive" + axis + "_endstop_type", 1);
			}
		}
	}
}

function setAutoSave(enabled) {
	$("#power_failure_handling").prop("checked", enabled);
	$("#power_failure_options").toggleClass("hidden", !enabled);
}

function setGeometry(value) {
	var isDelta = (value == "delta");
	$("#geometry a[href=\"#" + value + "\"]").tab("show");
	$(".cartesian").toggleClass("hidden", isDelta);
	$(".delta").toggleClass("hidden", !isDelta);

	// As requested by T3P3: Fill in some reasonable values if a Delta config is set
	if (lastMachine == "custom") {
		if (isDelta) {
			// Update motors page
			for(var drive = 0; drive < 3; drive++) {
				setDefaultValue("#drive" + drive + "_steps_per_mm", 80);
				setDefaultValue("#drive" + drive + "_instant_dv", 20);
				setDefaultValue("#drive" + drive + "_max_speed", 300);
				setDefaultValue("#drive" + drive + "_acceleration", 1000);
				setDefaultValue("#drive" + drive + "_current", 1000);
			}

			for(var drive = 3; drive < $("#table_extruders > tbody > tr").length + 3; drive++) {
				setDefaultValue("#drive" + drive + "_steps_per_mm", 663);
				setDefaultValue("#drive" + drive + "_instant_dv", 20);
				setDefaultValue("#drive" + drive + "_max_speed", 20);
				setDefaultValue("#drive" + drive + "_acceleration", 1000);
				setDefaultValue("#drive" + drive + "_current", 800);
			}

			// Update endstops page
			for(var drive = 0; drive < 3; drive++) {
				if ($("input[name=\"drive" + drive + "_endstop_type\"]:checked").val() == firmwareDefaults.drives[drive].endstop_type) {
					// Default endstops on delta printers are all active high
					setRadio("drive" + drive + "_endstop_type", 1);
				}
				if ($("input[name=\"drive" + drive + "_endstop_location\"]:checked").val() == firmwareDefaults.drives[drive].endstop_location) {
					// Default endstop location on delta printers are usually at high end
					setRadio("drive" + drive + "_endstop_location", 2);
				}
			}

			// Don't allow the endstop location to be changed (requested by dc42)
			$("input[name$=\"_endstop_location\"]").prop("disabled", true).parent().addClass("disabled");
		} else {
			// Update motors page
			for(var drive = 0; drive < $("#table_extruders > tbody > tr").length + 3; drive++) {
				var driveToUse = (drive < firmwareDefaults.drives.length) ? drive : firmwareDefaults.drives.length - 1;
				setDefaultValue("#drive" + drive + "_steps_per_mm", firmwareDefaults.drives[driveToUse].steps_per_mm);
				setDefaultValue("#drive" + drive + "_instant_dv", firmwareDefaults.drives[driveToUse].instant_dv);
				setDefaultValue("#drive" + drive + "_max_speed", firmwareDefaults.drives[driveToUse].max_speed);
				setDefaultValue("#drive" + drive + "_acceleration", firmwareDefaults.drives[driveToUse].acceleration);
				setDefaultValue("#drive" + drive + "_current", firmwareDefaults.drives[driveToUse].current);
			}

			// Update endstops page
			for(var drive = 0; drive < 3; drive++) {
				if ($("input[name=\"drive" + drive + "_endstop_type\"]:checked").val() == 1) {
					setRadio("drive" + drive + "_endstop_type", firmwareDefaults.drives[drive].endstop_type);
				}
				if ($("input[name=\"drive" + drive + "_endstop_location\"]:checked").val() == 2) {
					setRadio("drive" + drive + "_endstop_location", firmwareDefaults.drives[drive].endstop_location);
				}
			}

			// Allow endstop location to be changed
			$("input[name$=\"_endstop_location\"]").prop("disabled", false).parent().removeClass("disabled");
		}

		updateDefaults();
	}
}

function setDefaultValue(id, value) {
	// Only overwrite existing values if they haven't changed
	if ($(id).val() == $(id).data("default")) {
		$(id).val(value);
		setValidated(id, true);
	}

	$(id).data("default", value);
}


/* Motors page */

function updateMotors() {
	var boardDefinition = getBoardDefinition();

	// Update number of extruders
	if ($("#num_extruders").val() > boardDefinition.maxExtruders) {
		$("#num_extruders").val(boardDefinition.maxExtruders).trigger("change");
	}

	for(var i = $("#num_extruders > option").length; i <= boardDefinition.maxExtruders; i++) {
		$("#num_extruders").append("<option value=\"" + i + "\">" + i + "</option>");
	}
	for(var i = $("#num_extruders > option").length; i > boardDefinition.maxExtruders; i--) {
		$("#num_extruders > option").eq(i).remove();
	}

	// Update microstepping and motor drivers
	var axisRows = $("#table_axes > tbody > tr");
	for(var i = 0; i < axisRows.length + boardDefinition.maxExtruders; i++) {
		var microsteppingSelect = $("#drive" + i + "_microstepping");
		if (boardDefinition.configurableMicrostepping) {
			microsteppingSelect.prop("disabled", false);
		} else {
			microsteppingSelect.prop("disabled", true);

			// Set fixed microstepping to x16
			microsteppingSelect.val("16");
		}

		var select = $("#drive" + i + "_driver");
		select.children().each(function() {
			if ($(this).val() < 100) {
				$(this).toggleClass("hidden", $(this).val() >= axisRows.length + boardDefinition.maxExtruders);
			}
		});

		if ($("#drive" + i + "_driver > option").eq(select.val()).hasClass("hidden")) {
			select.val(i);
		}
	}
}

$("[id$=\"_current\"]").change(function() {
	var id = "#" + $(this).prop("id");
	if (isValidated(id)) {
		var value = parseFloat($(this).val());
		if (!isNaN(value)) {
			var boardDefinition = getBoardDefinition();
			setValidatedWarning(id, value <= boardDefinition.motorWarningCurrent);

			$("#current_warning").toggleClass("hidden", $("[id$=\"_current\"]").closest("div.has-warning").length == 0);
		}
	}
});

$("#num_extruders").change(function() {
	var rows = $("#table_extruders > tbody > tr");
	$("#table_extruders").toggleClass("hidden", $(this).val() == 0);
	for(var i = 0; i < rows.length; i++) {
		$(rows[i]).toggleClass("hidden", i >= $(this).val());
	}
});

$("#idle_used").change(function() {
	var checked = $(this).is(":checked");
	if (!checked) {
		if (!isValidated("#idle_factor")) {
			$("#idle_factor").val(30).trigger("keyup");
		}
		if (!isValidated("#idle_timeout")) {
			$("#idle_timeout").val(30).trigger("keyup");
		}
	}
	$("#idle_factor, #idle_timeout").prop("disabled", !checked);
});


/* Endstops page */

function updateEndstops() {
	var isDelta = $("#geometry > li.active > a").attr("href") == "#delta";

	// On a delta printers all the endstops must be either at the low or at the high end
	if (isDelta) {
		var value = $("input[name=\"drive0_endstop_location\"]:checked").val();
		setRadio("drive0_endstop_location", value);
		setRadio("drive1_endstop_location", value);
		setRadio("drive2_endstop_location", value);
	}
}

$("#table_endstops input[name$=\"endstop_type\"]").change(function() {
	// Bootstrap bug: Allows disabled items to be selected
	if ($(this).parent().hasClass("disabled")) {
		setRadio($(this).prop("name"), 0);
	}
});

$("#table_endstops input[name$=\"endstop_location\"]").change(function() {
	var isDelta = $("#geometry > li.active > a").attr("href") == "#delta";
	if (isDelta) {
		var value = $(this).val();
		setRadio("drive0_endstop_location", value);
		setRadio("drive1_endstop_location", value);
		setRadio("drive2_endstop_location", value);
	}
});

$("#probe a[data-toggle]").on("show.bs.tab", function(e) {
	var tabLink = $(e.target).attr("href");
	$("#zprobe_params").toggleClass("hidden", (tabLink == "#noprobe" || tabLink == "#effector" || tabLink == "#bltouch"));
	$("#switch_params").toggleClass("hidden", tabLink != "#switch");
	$("#effector_params").toggleClass("hidden", tabLink != "#effector");

	if (tabLink == "#bltouch") {
		$("#probe_deploy").prop("checked", true).prop("disabled", true);
	} else {
		$("#probe_deploy").prop("disabled", false);
	}

	if (tabLink == "#noprobe") {
		if (!isValidated("#probe_x_offset")) {
			$("#probe_x_offset").val("0");
			setValidated("#probe_x_offset", true);
		}
		if (!isValidated("#probe_y_offset")) {
			$("#probe_y_offset").val("0");
			setValidated("#probe_y_offset", true);
		}
	}

	setDefaultValue("#probe_speed", (tabLink == "#effector") ? 20 : defaultSettings.probe.speed);

	$("#probe_x_offset, #probe_y_offset").prop("disabled", tabLink == "#noprobe");

	// Z-Probe cannot be available if it is turned off
	for (var axis = 0; axis < 3; axis++) {
		if (tabLink == "#noprobe" && $("input[name=\"drive" + axis + "_endstop_type\"]:checked").val() == 3) {
			setRadio("drive" + axis + "_endstop_type", 0);
		}

		$("input[name=\"drive" + axis + "_endstop_type\"][value=\"3\"]").parent().toggleClass("disabled", tabLink == "#noprobe");
		$("input[name=\"drive" + axis + "_endstop_type\"][value=\"3\"]").prop("disabled", tabLink == "#noprobe");
	}
});


/* Heaters page */

$("#num_nozzles").change(function() {
	updateHeaters();
});

$("#bed_is_nozzle, #bed_present, #bed_heater, input[name=\"bed_pid\"]").change(function() {
	$("#bed_options").toggleClass("hidden", !$("#bed_present").is(":checked"));
	updateHeaters();
});

$("#chamber_present, #chamber_heater, input[name=\"chamber_pid\"]").change(function() {
	$("#chamber_options").toggleClass("hidden", !$("#chamber_present").is(":checked"));
	updateHeaters();
});

function updateHeaters() {
	var boardDefinition = getBoardDefinition();

	// Update max allowed nozzles
	var numNozzles = parseInt($("#num_nozzles").val());
	if (numNozzles > boardDefinition.maxNozzles) {
		numNozzles = boardDefinition.maxNozzles;
		$("#num_nozzles").val(numNozzles);
	}

	var numNozzleItems = $("#num_nozzles > option").length;
	for(var i = numNozzleItems; i < boardDefinition.maxNozzles + 1; i++) {
		$("#num_nozzles").append("<option value=\"" + i + "\">" + i + "</option>");
	}
	for(var i = numNozzleItems; i > boardDefinition.maxNozzles; i--) {
		$("#num_nozzles > option").eq(i).remove();
	}

	// Update special heaters
	var numSpecialHeaters = $("#bed_heater > option").length;
	for(var i = numSpecialHeaters; i < boardDefinition.maxNozzles; i++) {
		$("#bed_heater, #chamber_heater").append("<option value=\"" + i + "\">E" + (i - 1) + "</option>");
	}
	for(var i = numSpecialHeaters; i >= boardDefinition.maxNozzles; i--) {
		$("#bed_heater > option").eq(i).remove();
		$("#chamber_heater > option").eq(i).remove();
	}

	if ($("#bed_heater").val() == null) {
		$("#bed_heater").val($("#bed_heater > option:first-chid").val());
	}
	if ($("#chamber_heater").val() == null) {
		$("#chamber_heater").val($("#chamber_heater > option:first-chid").val());
	}

	// Update sensor channels
	for(var i = 0; i <= boardDefinition.maxNozzles; i++) {
		var select = $("#heater" + i + "_channel");
		select.children().each(function() {
			if ($(this).val() < 100) {
				$(this).toggleClass("hidden", $(this).val() >= boardDefinition.maxNozzles);
			} else if ($(this).val() >= 500 && $(this).val() < 600) {
				$(this).toggleClass("hidden", $(this).val() - 500 >= boardDefinition.maxNozzles);
			} else {
				$(this).toggleClass("hidden", ($(this).val() % 50) >= boardDefinition.maxRtdBoards);
			}
		});

		if (select.children("[value='" + select.val() + "']").hasClass("hidden")) {
			select.val(i);
		}
	}

	// First heater must be assigned to nozzle if max. number of nozzles is selected
	var bedIsNozzle = $("#bed_is_nozzle").is(":checked");
	if (!bedIsNozzle && numNozzles == $("#num_nozzles > option:last-child").val()) {
		bedIsNozzle = true;
		$("#bed_is_nozzle").prop("checked", true);
	}

	// Reset special heaters if the hot bed is supposed to be assigned to a nozzle
	var bedHeater = $("#bed_present").is(":checked") ? parseInt($("#bed_heater").val()) : null;
	var bedHeaters = $("#bed_heater").children().removeAttr("disabled");
	var chamberHeater = $("#chamber_present").is(":checked") ? parseInt($("#chamber_heater").val()) : null;
	var chamberHeaters = $("#chamber_heater").children().removeAttr("disabled");

	if (bedIsNozzle) {
		if (numNozzles == 0) {
			bedIsNozzle = false;
		} else {
			if (bedHeater == null) {
				$("#bed_heater").val(1);
			} else if (bedHeater == 0) {
				bedHeater = 1;
				$("#bed_heater").val(bedHeater);
			}
			$(bedHeaters[0]).prop("disabled", true);

			if (chamberHeater == null) {
				$("#chamber_heater").val(1)
			} else if (chamberHeater == 0) {
				chamberHeater = 1;
				$("#chamber_heater").val(chamberHeater);
			}
			$(chamberHeaters[0]).prop("disabled", true);
		}
	}

	// Check for special heater conflicts
	if (bedHeater != null && bedHeater == chamberHeater) {
		if (chamberHeater == $("#chamber_heater > option:last-child").val()) {
			chamberHeater = 1;
		} else {
			chamberHeater++;
		}
		$("#chamber_heater").val(chamberHeater);
	}

	// Update special heaters
	var specialHeaters = 0;
	if (bedHeater != null) {
		$(bedHeaters[chamberHeater]).prop("disabled", true);
		specialHeaters++;
	}

	if (chamberHeater != null) {
		$(chamberHeaters[bedHeater]).prop("disabled", true);
		specialHeaters++;
	}

	// Update nozzle count
	var nozzleHeaters = $("#num_nozzles").children();
	var maxAllowedNozzles = nozzleHeaters.length - specialHeaters - 1;
	nozzleHeaters.removeAttr("disabled");
	for(var i = nozzleHeaters.length - 1; i > maxAllowedNozzles; i--)
	{
		$(nozzleHeaters[i]).prop("disabled", true);
	}
	if (numNozzles > maxAllowedNozzles) {
		numNozzles = maxAllowedNozzles;
		$("#num_nozzles").val(numNozzles);
	}

	// Update heaters table
	var nozzlesToDisplay = numNozzles;
	$("#table_heaters > tbody > tr").each(function(i) {
		var showRow = false;
		var type = "nozzle";
		var caption = "Nozzle";
		var usingBangBang = false;

		if (bedHeater == i) {
			showRow = true;
			type = "bed";
			caption = "Heated bed";
			usingBangBang = $("input[name=\"bed_pid\"]:checked").val() == 0;
		} else if (chamberHeater == i) {
			showRow = true;
			type = "chamber";
			caption = "Chamber";
			usingBangBang = $("input[name=\"chamber_pid\"]:checked").val() == 0;
		} else if (nozzlesToDisplay > 0 && (i != 0 || bedIsNozzle)) {
			showRow = true;
			--nozzlesToDisplay;
		}

		$(this).attr("data-type", type);	// DO NOT use data() here because it doesn't overwrite DOM attributes
		$(this).children(":nth-child(2)").text(caption);
		if (usingBangBang) {
			$("#heater" + i + "_scale_factor").prop("disabled", true).val(100).trigger("keyup");
		} else {
			$("#heater" + i + "_scale_factor").prop("disabled", false);
		}
		$(this).toggleClass("hidden", !showRow);
	});

	// Show heaters table only if it contains data
	$("#panel_heaters").toggleClass("hidden", numNozzles + specialHeaters == 0);
};

$("#a_thermistor_coefficients").click(function(e) {
	var betaHidden = $(".beta-parameter").first().hasClass("hidden");
	$(".abc-parameter").toggleClass("hidden", betaHidden);
	$(".beta-parameter").toggleClass("hidden", !betaHidden);
	e.preventDefault();
});

// If the AB parameters are hidden, recalculate A when C changes
// If the beta parameters are hidden, recalculate R25
$("input[id$='_c']").change(function() {
	var heater = $(this).prop("id").match("heater(\\d+)_c")[1];
	if ($(".abc-parameter").first().hasClass("hidden")) {
		$("#heater" + heater + "_thermistor").change();
	} else {
		$("#heater" + heater + "_a").change();
	}
});

// Recalculate A when R25 changes
$("input[id$='_thermistor']").change(function() {
	var heater = $(this).prop("id").match("heater(\\d+)_thermistor")[1];
	if (isValidated("#heater" + heater + "_thermistor, #heater" + heater + "_b")) {
		var b = parseFloat($("#heater" + heater + "_b").val());
		var c = 0;
		if (isValidated("#heater" + heater + "_c")) {
			c = parseFloat($("#heater" + heater + "_c").val());
		}

		var l1 = Math.log($(this).val());
		var a = (1.0 / 298.15) - (b + l1 * l1 * c) * l1;
		$("#heater" + heater + "_a").val((a == 0) ? 0 : a.toExponential(6));
	}
});

// Recalculate A+B when beta changes (B only if C==0)
$("input[id$='_beta']").change(function() {
	var heater = $(this).prop("id").match("heater(\\d+)_beta")[1];
	if (isValidated("#heater" + heater + "_beta, #heater" + heater + "_c") && parseFloat($("#heater" + heater + "_c").val()) == 0) {
		// The legacy beta value is the reciprocal of the 'B' parameter and vice versa
		var b = 1.0 / $(this).val();
		$("#heater" + heater + "_b").val((b == 0) ? 0 : b.toExponential(6));
	}

	// Recalculate A via the R25 change event
	$("#heater" + heater + "_thermistor").change();
});

// Recalculate R25 when A(BC) change
$("input[id$='_a']").change(function() {
	var heater = $(this).prop("id").match("heater(\\d+)_a")[1];
	if (isValidated("#heater" + heater + "_a, #heater" + heater + "_b")) {
		var a = parseFloat($(this).val());
		var b = parseFloat($("#heater" + heater + "_b").val());
		var c = 0;
		if (isValidated("#heater" + heater + "_c")) {
			c = parseFloat($("#heater" + heater + "_c").val());
		}

		var r25;
		if (c == 0) {
			r25 = Math.exp(1 / (298.15 * b) - a / b);
		} else {
			var x = (1.0 / c) * (a - 1 / 298.15);
			var y = Math.sqrt(Math.pow(b / (3 * c), 3) + Math.pow(x / 2, 2));
			r25 = Math.exp(Math.pow(y - x / 2, 1/3) - Math.pow(y + x / 2, 1/3));
		}
		$("#heater" + heater + "_thermistor").val(Math.round(r25));
	}
});

// Recalculate beta when B changes (only if C==0)
$("input[id$='_b']").change(function() {
	var heater = $(this).prop("id").match("heater(\\d+)_b")[1];
	if (isValidated("#heater" + heater + "_b, #heater" + heater + "_c") && parseFloat($("#heater" + heater + "_c").val()) == 0) {
		// The legacy beta value is the reciprocal of the 'B' parameter and vice versa
		$("#heater" + heater + "_beta").val(Math.round(1.0 / $(this).val()));

		if ($(this).val() > 1.0) {
			// Some users will probably try to use beta values as 'B', so ask them if they want to convert it
			$("#modal_convert_b").data("heater", heater).modal("show");
		} else {
			// Recalculate R25 when B changes
			$("#heater" + heater + "_a").change();
		}
	}
});

// Recalculate B if it seems to be too large and the user confirms this
$("#btn_convert_beta").click(function() {
	var heater = $("#modal_convert_b").data("heater");
	var value = 1 / $("#heater" + heater + "_b").val();
	$("#heater" + heater + "_b").val(value.toExponential(6)).change();

	$("#modal_convert_b").modal("hide");
});


/* Tools page */

var toolsChanged = false;

$("#tools").on("change", "input", function() {
	toolsChanged = true;
});

$("#num_tools").change(updateToolCount);

$("#btn_add_tool").click(function() {
	if (!$(this).hasClass("disabled")) {
		$("#num_tools").val(parseInt($("#num_tools").val()) + 1).trigger("change");
	}
});

$("#btn_delete_tool").click(function() {
	if (!$(this).hasClass("disabled")) {
		$("#num_tools").val(parseInt($("#num_tools").val()) - 1).trigger("change");
	}
});

function updateToolCount() {
	// Try to deterime number of tools to use automatically if the config hasn't been changed
	if (!toolsChanged) {
		$("#num_tools").val(Math.min($("#num_extruders").val(), $("#num_nozzles").val()));
	}

	// Verify value for add/delete button
	var enableAdd = false;
	var enableDelete = false;
	if (isValidated("#num_tools")) {
		var numTools = parseInt($("#num_tools").val());
		enableAdd = numTools < $("#num_tools").prop("max");
		enableDelete = numTools > $("#num_tools").prop("min");
	}
	$("#btn_add_tool").toggleClass("disabled", !enableAdd);
	$("#btn_delete_tool").toggleClass("disabled", !enableDelete);

	// Update tool mapping table count
	if (isValidated("#num_tools")) {
		var numTools = parseInt($("#num_tools").val());
		var rows = $("#table_tools > tbody > tr");
		if (numTools > rows.length) {
			// Add new rows
			for(var i = rows.length; i < numTools; i++)
			{
				var row =	"<tr><td><div class=\"form-group has-success\"><input class=\"form-control\" id=\"tool" + i + "_number\" value=\"" + i + "\" type=\"number\"></div></td>";
				row +=		"<td><div class=\"btn-group hidden\" data-toggle=\"buttons\"></div><span>None available</span></td>";
				row +=		"<td><div class=\"btn-group hidden\" data-toggle=\"buttons\"></div><span>None available</span></td>";
				row +=		"<td><div class=\"input-group has-success\"><input class=\"form-control\" id=\"tool" + i + "_x_offset\" value=\"0\" type=\"number\"><span class=\"input-group-addon\">mm</span></div></td>";
				row +=		"<td><div class=\"input-group has-success\"><input class=\"form-control\" id=\"tool" + i + "_y_offset\" value=\"0\" type=\"number\"><span class=\"input-group-addon\">mm</span></div></td>";
				row +=		"<td><div class=\"input-group has-success\"><input class=\"form-control\" id=\"tool" + i + "_z_offset\" value=\"0\" type=\"number\"><span class=\"input-group-addon\">mm</span></div></td>";
				row +=		"<td><div class=\"form-group\"><input class=\"form-control\" id=\"tool" + i + "_mix_ratio\" value=\"n/a\" type=\"text\" disabled></div></td>";
				row +=		"</tr>";
				var rowElement = $("#table_tools").append(row);
				rowElement.find("tr > td:last-child input").keyup(onRatioChanged);
			}

			// Update their content
			updateTools();
		} else if (numTools < rows.length) {
			// Remove last rows
			for(var i = rows.length - 1; i >= numTools; i--)
			{
				$(rows[i]).remove();
			}
		}

		$("#table_tools").toggleClass("hidden", numTools == 0);
	}
}

function updateTools() {
	var numExtruders = $("#num_extruders").val();
	var numNozzles = $("#num_nozzles").val();
	var extruderDrives = $("#table_extruders > tbody > tr > td:first-child");
	var nozzleHeaters = $("#table_heaters > tbody > tr[data-type=\"nozzle\"]:not(.hidden)");

	$("#table_tools > tbody > tr").each(function(index) {
		// Update assigned extruders
		var extrDiv = $(this).find("td:nth-child(2) > div.btn-group");
		for(var i = extrDiv.children().length; i < numExtruders; i++) {
			var button = $("<label class=\"btn btn-default\"><input name=\"tool" + index + "_extruder" + i + "\" value=\"" + i + "\" type=\"checkbox\">" + $(extruderDrives[i]).text() + "</label>");
			if (i == index) {
				button.addClass("active");
				button.children().prop("checked", true);
			}
			button.children().change(onAssignedExtrudersChanged);
			extrDiv.append(button);
		}
		for(var i = extrDiv.children().length; i > numExtruders; i--) {
			extrDiv.children().eq(i - 1).remove();
		}
		extrDiv.toggleClass("hidden", numExtruders == 0);
		$(this).find("td:nth-child(2) > span").toggleClass("hidden", numExtruders != 0);

		// Update assigned heaters
		var heaterDiv = $(this).find("td:nth-child(3) > div.btn-group");
		for(var i = heaterDiv.children().length; i < numNozzles; i++) {
			var button = $("<label class=\"btn btn-default\"><input name=\"tool" + index + "_heater" + i + "\" type=\"checkbox\"><span></span></label>");
			if (i == index) {
				button.addClass("active");
				button.children().prop("checked", true);
			}
			heaterDiv.append(button);
		}
		for(var i = heaterDiv.children().length; i > numNozzles; i--) {
			heaterDiv.children().eq(i - 1).remove();
		}
		heaterDiv.children().each(function(i) {
			$(this).children("input").attr("value", nozzleHeaters[i].sectionRowIndex);
			$(this).children("span").text($(nozzleHeaters[i]).children().eq(0).text());
		});
		heaterDiv.toggleClass("hidden", numNozzles == 0);
		$(this).find("td:nth-child(3) > span").toggleClass("hidden", numNozzles != 0);
	});
}

function onAssignedExtrudersChanged() {
	var numExtruders = $(this).closest("td").find("input:checked").length;
	var inputDiv = $(this).closest("tr").find("td:last-child > div");
	var mixingInput = inputDiv.children();

	if (numExtruders <= 1) {
		// Don't allow mixing ratios to be set if one extruder or less is assigned
		inputDiv.removeClass("has-success");
		mixingInput.prop("disabled", true);
		mixingInput.val("n/a");
	} else {
		// If more than two extruder drives are assigned, update the mixing ratio
		inputDiv.addClass("has-success");
		mixingInput.prop("disabled", false);
		var avgRatioStep = Math.round(100.0 / numExtruders) / 100;
		var ratioLeft = 1.0;
		var mixingRatio = "";
		for(var i = 0; i < numExtruders; i++) {
			if (i != 0) {
				mixingRatio += ":";
			}
			if (i + 1 == numExtruders) {
				mixingRatio += ratioLeft.toFixed(2);
			} else {
				mixingRatio += avgRatioStep.toFixed(2);
			}
			ratioLeft -= avgRatioStep;
		}
		mixingInput.val(mixingRatio);
	}
}

function onRatioChanged() {
	if ($(this).prop("disabled")) {
		return;
	}

	var numExtruders = $(this).closest("tr").find("td:nth-child(2) input:checked").length;
	var ratios = $(this).val().split(":");

	var sum = 0.0;
	ratios.forEach(function(val) {
		sum += parseFloat(val);
	});
	var validated = (sum == 1.0) && (ratios.length == numExtruders);

	$(this).parent().toggleClass("has-success", validated);
	$(this).parent().toggleClass("has-error", !validated);
}


/* Compensation page */

var bedDimensionsChanged = false;

$("#bed_width, #bed_length").change(function() {
	bedDimensionsChanged = true;
	updateCompensation();
});

var probeRadiusChanged = false;

$("#num_probe_points").change(updateCompensation);
$("#compensation_x_offset, #compensation_y_offset").change(updateCompensation);

$("#num_peripheral_points, #num_halfway_points, #num_calibration_factors").change(updateCompensation);
$("#probe_radius").change(function() {
	probeRadiusChanged = true;
	updateCompensation();
});

var meshDimensionsChanged = false;

$("#mesh_x_min, #mesh_x_max, #mesh_y_min, #mesh_y_max").change(function() {
	meshDimensionsChanged = true;
});

function updateCompensation() {
	var isDelta = $("#geometry > li.active > a").attr("href") == "#delta";
	var pointRows = $("#table_points > tbody > tr");
	if (isDelta) {
		// Fetch probe radius from printable radius if possible
		if (isValidated("#print_radius")) {
			var printRadius = $("#print_radius").val();
			if (!probeRadiusChanged) {
				$("#probe_radius, #mesh_radius").val(printRadius);
			}
			$("#probe_radius, #mesh_radius").attr("max", printRadius).trigger("keyup");
		}

		// Validate number of points
		var numPeripheralPoints = parseInt($("#num_peripheral_points").val());
		var numHalfwayPoints = parseInt($("#num_halfway_points").val());
		if (numPeripheralPoints + numHalfwayPoints > 16) {
			numHalfwayPoints = 3;
			$("#num_halfway_points").val(numHalfwayPoints);
		}
		$("#num_halfway_points > option").each(function() {
			$(this).prop("disabled", numPeripheralPoints + parseInt($(this).val()) > 16);
		});

		// Validate calibration factors
		var numCalibrationFactors = parseInt($("#num_calibration_factors").val());
		if (numCalibrationFactors > numPeripheralPoints + numHalfwayPoints) {
			numCalibrationFactors = 3;
			$("#num_calibration_factors").val(numCalibrationFactors);
		}
		$("#num_calibration_factors > option").each(function() {
			$(this).prop("disabled", numPeripheralPoints + numHalfwayPoints < parseInt($(this).val()));
		});

		// Add uncalculated points on validation error or if points have been changed manually
		var recalculatePoints = $("#recalculate_points").is(":checked");
		if (!isValidated("#probe_radius, #probe_x_offset, #probe_y_offset") || !recalculatePoints) {
			for(var i = pointRows.length; i < numPoints; i++) {
				addProbePoint(i, 0, 0);
			}
			for(var i = pointRows.length; i > numPoints; i--) {
				pointRows.eq(i).remove();
			}
			validatePoints();
			return;
		}

		// Recalculate and add all probe points
		// Thanks to dc42 for providing the calculation code (original source from escher3d.com)
		var probeRadius = parseFloat($("#probe_radius").val());
		var xOffset = parseFloat($("#probe_x_offset").val());
		var yOffset = parseFloat($("#probe_y_offset").val());

		pointRows.remove();
		for(var i = 0; i < numPeripheralPoints; i++) {
			var probeX = probeRadius * Math.sin((2 * Math.PI * i) / numPeripheralPoints);
			var probeY = probeRadius * Math.cos((2 * Math.PI * i) / numPeripheralPoints);
			var rad = Math.sqrt(Math.pow(probeX + xOffset, 2) + Math.pow(probeY + yOffset, 2)) + 0.1;
			if (rad > probeRadius) {
				var factor = probeRadius / rad;
				probeX *= factor;
				probeY *= factor;
			}
			addProbePoint(i, probeX, probeY);
		}
		for(var i = 0; i < numHalfwayPoints; i++) {
			var probeX = (probeRadius / 2) * Math.sin((2 * Math.PI * i) / numHalfwayPoints);
			var probeY = (probeRadius / 2) * Math.cos((2 * Math.PI * i) / numHalfwayPoints);
			var rad = Math.sqrt(Math.pow(probeX + xOffset, 2) + Math.pow(probeY + yOffset, 2)) + 0.1;
			if (rad > probeRadius / 2) {
				var factor = (probeRadius / 2) / rad;
				probeX *= factor;
				probeY *= factor;
			}
			addProbePoint(numPeripheralPoints + i, probeX, probeY);
		}
		var lastProbeRow = addProbePoint(numPeripheralPoints + numHalfwayPoints, 0, 0);
		lastProbeRow.children("td:last-child").find("input").prop("disabled", true);
		validatePoints();
	} else {
		// Fetch bed dimensions from axis maxima if possible
		if (!bedDimensionsChanged) {
			if (isValidated("#y_max")) {
				var bedWidth = parseFloat($("#y_max").val());
				$("#bed_width").val(bedWidth);
			}

			if (isValidated("#x_max")) {
				var bedLength = parseFloat($("#x_max").val());
				$("#bed_length").val(bedLength);
			}
		}

		// Add uncalculated points on validation error or if points have been changed manually
		var numPoints = parseInt($("#num_probe_points").val());
		var recalculatePoints = $("#recalculate_points").is(":checked");
		if (!isValidated("#bed_width, #bed_length, #compensation_x_offset, #compensation_y_offset") || !recalculatePoints) {
			for(var i = pointRows.length; i < numPoints; i++) {
				addProbePoint(i, 0, 0);
			}
			for(var i = pointRows.length; i > numPoints; i--) {
				pointRows.eq(i).remove();
			}
			validatePoints();
			return;
		}

		// Fetch input values
		var xOffset = parseFloat($("#compensation_x_offset").val());
		var yOffset = parseFloat($("#compensation_y_offset").val());
		var xMax = parseFloat($("#bed_length").val());
		var yMax = parseFloat($("#bed_width").val());

		// Remove old points and add new ones
		pointRows.remove();
		switch(numPoints) {
			case 3:
				addProbePoint(0, xOffset, yOffset);
				addProbePoint(1, xOffset, yMax - yOffset);
				addProbePoint(2, xMax - xOffset, yMax / 2);
				break;

			case 4:
				addProbePoint(0, xOffset, yOffset);
				addProbePoint(1, xOffset, yMax - yOffset);
				addProbePoint(2, xMax - xOffset, yMax - yOffset);
				addProbePoint(3, xMax - xOffset, yOffset);
				break;

			case 5:
				addProbePoint(0, xOffset, yOffset);
				addProbePoint(1, xOffset, yMax - yOffset);
				addProbePoint(2, xMax - xOffset, yMax - yOffset);
				addProbePoint(3, xMax - xOffset, yOffset);
				addProbePoint(4, xMax / 2, yMax / 2);
				break;
		}
		validatePoints();

		// Update mesh grid dimensions
		if (!meshDimensionsChanged) {
			$("#mesh_x_min").val(xOffset);
			$("#mesh_y_min").val(yOffset);
			$("#mesh_x_max").val(xMax - xOffset);
			$("#mesh_y_max").val(yMax - yOffset);
		}
	}
}

function addProbePoint(index, x, y, z) {
	var row =	"<tr><td>" + (index + 1) + "</td>";
	row +=		"<td><div class=\"form-group\">";
	row +=		"<div class=\"input-group input-group-sm has-success\">";
	row += 		"<input class=\"form-control\" id=\"point" + index + "_x\" value=\"" + x.toFixed(2) + "\" type=\"number\">";
	row +=		"<span class=\"input-group-addon\">mm</span>";
	row +=		"</div></div></td>";
	row +=		"<td><div class=\"form-group\">";
	row +=		"<div class=\"input-group input-group-sm has-success\">";
	row += 		"<input class=\"form-control\" id=\"point" + index + "_y\" value=\"" + y.toFixed(2) + "\" type=\"number\">";
	row +=		"<span class=\"input-group-addon\">mm</span>";
	row +=		"</div></div></td>";
	row +=		"<td><div class=\"form-group\">";
	row +=		"<div class=\"input-group input-group-sm has-success\">";
	row += 		"<input class=\"form-control\" id=\"point" + index + "_z\" value=\"" + (z == undefined ? 0 : z.toFixed(2)) + "\" type=\"number\">";
	row +=		"<span class=\"input-group-addon\">mm</span>";
	row +=		"</div></div></td>";

	var rowElement = $(row);
	$("#table_points").append(rowElement);
	return rowElement;
}

function validatePoints() {
	var isDelta = $("#geometry > li.active > a").attr("href") == "#delta";
	if (isDelta) {
		if (!isValidated("#probe_radius")) {
			// Put all inputs into warning state if we cannot validate their values
			$("#table_points > tbody > tr > td:nth-child(2) div.input-group, #table_points > tbody > tr > td:nth-child(3) div.input-group").removeClass("has-success").addClass("has-warning");
		} else {
			// On a Delta we must validate each probe point radius
			var probeRadius = parseFloat($("#probe_radius").val());
			$("#table_points > tbody > tr").each(function(i) {
				$("#point" + i + "_x, #point" + i + "_y").removeAttr("min").removeAttr("max");
				if ($("#point" + i + "_x").val() != null && $("#point" + i + "_y").val() != null) {
					var x = parseFloat($("#point" + i + "_x").val());
					var y = parseFloat($("#point" + i + "_y").val());

					var validated = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) <= probeRadius;
					setValidated("#point" + i + "_x, #point" + i + "_y", validated);
				}
			});
		}
	} else {
		if (!isValidated("#x_min, #x_max, #y_min, #y_max, #probe_x_offset, #probe_y_offset")) {
			// Put all inputs into warning state if we cannot validate their values
			$("#table_points > tbody > tr > td:nth-child(2) div.input-group, #table_points > tbody > tr > td:nth-child(3) div.input-group").removeClass("has-success").addClass("has-warning");
		} else {
			// On cartesian geometries we can use the axis min+max values for validation
			var xMin = $("#x_min").val();
			var xMax = $("#x_max").val();
			var yMin = $("#y_min").val();
			var yMax = $("#y_max").val();
			$("#table_points > tbody > tr").each(function() {
				var xCoord = $(this).children("td:nth-child(2)").find("input");
				xCoord.attr("min", xMin).attr("max", xMax).trigger("keyup");

				var yCoord = $(this).children("td:nth-child(3)").find("input");
				yCoord.attr("min", yMin).attr("max", yMax).trigger("keyup");
			});
		}
	}
}

$("#table_points").on("change", "input", function() {
	$("#recalculate_points").prop("checked", false);
	validatePoints();
});

$("#grid_compensation").change(function() {
	var checked = $(this).is(":checked");
	$("#grid_settings").toggleClass("hidden", !checked);
});

$("#orthogonal").change(function() {
	var checked = $(this).is(":checked");
	$("#orthogonal_settings").toggleClass("hidden", !checked);
});


/* Network page */

function updateNetwork() {
	var boardDefinition = getBoardDefinition();

	// Hide MAC address for WiFi boards
	$("#mac_address").closest("div.form-group").toggleClass("hidden", boardDefinition.hasWiFi);
	$("label[for=\"mac_address\"]").toggleClass("hidden", boardDefinition.hasWiFi);

	// Hide access point settings for Ethernet boards
	$("#wifi_settings").toggleClass("hidden", boardDefinition.hasEthernet);
}

$("#enable_network").change(function() {
	// Hide network settings if it not enabled
	var enableNetwork = $(this).is(":checked");
	$("#network_settings").toggleClass("hidden", !enableNetwork);
});

$("#name").keyup(function() {
	// Name must not be empty
	setValidated("#name", $("#name").val().trim() != "");
});

$("#mac_address").keyup(function() {
	// Verify MAC address
	setValidated("#mac_address", /^[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]:[\dA-F][\dA-F]$/.test($("#mac_address").val()) || $("#mac_address").val() == "");
});

$("#ssid").keyup(function() {
	setValidatedWarning("#ssid", $(this).val().trim() != "");
});

$("#dhcp").change(function() {
	// Hide static IP properties if DHCP is enabled
	var enableDHCP = $("#dhcp").is(":checked");
	$("#staticip").toggleClass("hidden", enableDHCP);
});

$(".ip").keyup(function() {
	// Verify IPv4 values
	var id = "#" + $(this).prop("id");
	var matches = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec($(this).val());

	if (matches == null) {
		setValidated(id, false);
	} else {
		var limit = (id == "#netmask") ? 256 : 255;
		var ok = matches[1] < limit;
		ok &= matches[2] < limit;
		ok &= matches[3] < limit;
		ok &= matches[4] < limit;
		setValidated(id, ok);
	}
});


/* Finish page */

$("#table_fans > tbody > tr > td:nth-child(5) input").change(function() {
	if ($(this).val() == 0) {
		$(this).closest("tr").find(".has-error").removeClass("has-error").find("label").removeClass("btn-danger").addClass("btn-default");
		checkForErrors();
	} else {
		var parentDiv = $(this).closest("tr").children().eq(5).children("div");
		if (parentDiv.find("input:checked").length == 0) {
			parentDiv.find("label").removeClass("btn-default").addClass("btn-danger");
			parentDiv.addClass("has-error");
			checkForErrors();
		}
	}
});

function updateFans() {
	var boardDefinition = getBoardDefinition();
	var heaters = $("#table_heaters > tbody > tr:not(.hidden)");

	$("#table_fans > tbody > tr").each(function(index) {
		// Update assigned heaters
		var heaterDiv = $("#fan" + index + "_heaters");
		for(var i = heaterDiv.children().length; i < heaters.length; i++) {
			var button = $("<label class=\"btn btn-default\"><input name=\"fan" + index + "_heater" + i + "\" type=\"checkbox\"><span></span></label>");
			if (i > 0) {
				button.addClass("active", true);
				button.children("input").prop("checked", true);
			}

			button.children("input").change(function() {
				var parentDiv = $(this).closest("div");
				var hasFansAssigned = parentDiv.find("input:checked").length > 0;
				parentDiv.find("label").toggleClass("btn-default", hasFansAssigned).toggleClass("btn-danger", !hasFansAssigned);
				parentDiv.toggleClass("has-error", !hasFansAssigned);
				checkForErrors();
			});

			heaterDiv.append(button);
		}
		for(var i = heaterDiv.children().length; i > heaters.length; i--) {
			heaterDiv.children().eq(i - 1).remove();
		}
		heaterDiv.children().each(function(i) {
			var heater = heaters[i].sectionRowIndex;
			$(this).children("input").attr("value", heater);
			$(this).children("span").text($(heaters[i]).children().eq(0).text());
		});
		heaterDiv.toggleClass("hidden", heaters.length == 0);
		heaterDiv.parent().children("span").toggleClass("hidden", heaters.length != 0);

		// Set thermostatic control dependencies
		var thermostaticControl = $("input[name=\"fan" + index + "_thermostatic\"]:checked").val() == 1;
		var fanValue = $("#fan" + index + "_value");
		if (thermostaticControl) {
			if (fanValue.attr("min") == 0 && fanValue.val() < 50) {
				fanValue.val(100);
			}
			fanValue.attr("min", 50);
		} else {
			if (!isValidated("#fan" + index + "_trigger_temperature")) {
				$("#fan" + index + "_trigger_temperature").val(40).trigger("keyup");
			}
			fanValue.attr("min", 0);
		}
		fanValue.trigger("keyup");

		$("#fan" + index + "_value").attr("min", thermostaticControl ? 50 : 0);
		$("#fan" + index + "_heaters").children().toggleClass("disabled", !thermostaticControl);
		$("#fan" + index + "_trigger_temperature").prop("disabled", !thermostaticControl);

		// Decide if this fan can be displayed
		$(this).toggleClass("hidden", index >= boardDefinition.numFans);
	});
}

// Returns true if the wizard can finish
function checkForErrors() {
	// Update dynamic contents
	updateMotors();
	updateEndstops();
	updateHeaters();
	updateToolCount();
	updateTools();
	updateCompensation();
	updateNetwork();
	updateFans();

	// Check for errors
	$("#error_pages").children().remove();

	var validated = true;
	$("ul.navbar-nav > li > a").each(function() {
		var contentDiv = $($(this).attr("href"));
		var pageHasErrors = false;
		contentDiv.find(".has-error").each(function() {
			// Ignore hidden elements
			if (!$(this).hasClass("hidden") && $(this).closest(".hidden").length == 0) {
				// Ignore hidden pages
				var tabPane = $(this).closest(".tab-pane");
				if (tabPane.length != 0 && tabPane.hasClass("active")) {
					pageHasErrors = true;
					return false;
				}
			}
		});

		if (pageHasErrors) {
			$("#error_pages").append("<li>" + $(this).text() + "</li>");
			validated = false;
		}
	});

	$("#error_notification").toggleClass("hidden", validated);
	$("a[href=\"#end\"]").parent().toggleClass("disabled", !validated);
	return validated;
}

$("#finish input").change(function() {
	// Run validation here, because we may have to re-enable the finish button
	checkForErrors();
});


/* Finish modal */

var config, filelist;

$("a[href=\"#end\"]").click(function(e) {
	if (checkForErrors()) {
		template = generateTemplate();
		loadEJS("templates/files.ejs", function(filename, content) {
			filelist = content.trim().split("\n");

			$("#file_list").children().remove();
			filelist.forEach(function(file) {
				$("#file_list").append("<li><a class=\"generate-file\" href=\"#" + file + "\">" + file + "</a></li>");
			});

			$("#modal_finish").modal("show");
		});
	}
	e.preventDefault();
});

$("#modal_finish").on("click", "a.generate-file", function(e) {
	generateFile($(this).attr("href").substr(1), function(filename, content) {
		var tab = window.open();
		tab.document.body.innerHTML = content.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;");
		tab.document.body.style="font-family: monospace;"
		tab.document.title = filename;
	});
	e.preventDefault();
});

$("#download_config").click(function() {
	$(this).attr("href", 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(template)));
});

var zip, generatedFiles;
$("#download_zip").click(function() {
	// Ignore this click if the button has been disabled
	if ($(this).hasClass("disabled")) {
		return;
	}

	// Set button state
	$("#download_zip").addClass("disabled"),
	$("#download_zip > span.glyphicon").removeClass("glyphicon-download-alt").addClass("glyphicon-asterisk");
	$("#download_zip > span:last-child").text("Generating...");

	// Generate new ZIP file and add current configuration
	zip = new JSZip();
	zip.file("config.json", JSON.stringify(template));
	generatedFiles = 0;

	// Generate all macro files
	filelist.forEach(function(file) {
		generateFile(file, function(filename, content) {
			// Attach to ZIP
			zip.file(filename, content);
			generatedFiles++;

			// Generate final ZIP when all files have been generated
			if (generatedFiles == filelist.length) {
				// Reset button
				$("#download_zip").removeClass("disabled");
				$("#download_zip > span.glyphicon").removeClass("glyphicon-asterisk").addClass("glyphicon-download-alt");
				$("#download_zip > span:last-child").text("Download configuration bundle as ZIP file").removeClass("disabled");

				// Generate and download final ZIP file
				if (JSZip.support.blob) {
					saveAs(zip.generate({ type: "blob" }), "config.zip");
				} else {
					alert("Error: This browser doesn't support blobs! Save your configuration template and try another one.");
				}
			}
		});
	});
});


/* Steps/mm calculator */

$("#a_steps_calculator").click(function(e) {
	calcStepsPerMm();
	$("#modal_steps_calculator").modal("show");

	e.preventDefault();
});

$('input[name="steps_drive"]').change(function() {
	var drive = $('input[name="steps_drive"]:checked').val();
	if (drive != "2") {
		setRadio("steps_type", "belt");
	} else {
		setRadio("steps_type", "leadscrew")
	}

	$('input[name="steps_type"]').trigger("change");
});

$('input[name="steps_type"]').change(function() {
	var isBelt = $('input[name="steps_type"]:checked').val() == "belt";
	$("#div_belt").toggleClass("hidden", !isBelt);
	$("#div_leadscrew").toggleClass("hidden", isBelt);

	calcStepsPerMm();
});

$("#belt_preset").change(function() {
	var value = $(this).val();
	$("#belt_pitch").val(value);

	setValidated("#belt_pitch", true);
	calcStepsPerMm();
});

$("#belt_pitch").change(function() {
	var option = $("#belt_preset > option[value=\"" + $(this).val() + "\"]");
	$("#belt_preset").val(option.length == 0 ? "custom" : $(this).val());
});

$("#leadscrew_preset").change(function() {
	var value = $(this).val();
	$("#leadscrew_pitch").val(value);

	setValidated("#leadscrew_pitch", true);
	calcStepsPerMm();
});

$("#leadscrew_pitch").change(function() {
	var option = $("#leadscrew_preset > option[value=\"" + $(this).val() + "\"]");
	$("#leadscrew_preset").val(option.length == 0 ? "custom" : $(this).val());
});

$("#modal_steps_calculator input, #step_angle").change(calcStepsPerMm);

var calculatedSteps = 80;
function calcStepsPerMm() {
	var drive = parseInt($('input[name="steps_drive"]:checked').val());
	var axis = "unknown";
	switch (drive) {
		case 0:
			axis = "X";
			break;
		case 1:
			axis = "Y";
			break;
		case 2:
			axis = "Z";
			break;
	}

	var microstepping = $("#drive" + drive + "_microstepping").val();
	var isInterpolated = false;
	if (microstepping.endsWith("_i")) {
		isInterpolated = true;
		microstepping = microstepping.substr(0, microstepping.indexOf("_"));
	}

	$("#resulting_steps_details").text("for the " + axis  + " axis at x" + microstepping + " microstepping" + (isInterpolated ? " (interpolated)" : ""));

	var stepAngle = $("#step_angle").val();
	var isBelt = $('input[name="steps_type"]:checked').val() == "belt";
	if (isBelt) {
		if (isValidated("#belt_pitch, #pulley_teeth")) {
			var beltPitch = $("#belt_pitch").val();
			var pulleyTeeth = $("#pulley_teeth").val();
			calculatedSteps = (360.0 * microstepping) / (pulleyTeeth * beltPitch * stepAngle);
		} else {
			calculatedSteps = NaN;
		}
	} else {
		if (isValidated("#leadscrew_pitch, #gear_ratio_1, #gear_ratio_2")) {
			var leadscrewPitch = $("#leadscrew_pitch").val();
			var ratio = $("#gear_ratio_2").val() / $("#gear_ratio_1").val();
			calculatedSteps = (360.0 * microstepping * ratio) / (leadscrewPitch * stepAngle);

		} else {
			calculatedSteps = NaN;
		}
	}
	if (!isFinite(calculatedSteps)) { calculatedSteps = NaN; }

	$("#resulting_steps").text("Resulting steps per mm: " + (isNaN(calculatedSteps) ? "n/a" : calculatedSteps.toFixed(3)));
	$("#btn_set_steps").toggleClass("disabled", isNaN(calculatedSteps));
}

$("#btn_set_steps").click(function() {
	if (!$(this).hasClass("disabled")) {
		var drive = parseInt($('input[name="steps_drive"]:checked').val());
		$("#drive" + drive + "_steps_per_mm").val(calculatedSteps.toFixed(3));

		$("#modal_steps_calculator").modal("hide");
	}
});


/* Thermistor coefficients calculator */

$("#a_thermistor_calculator").click(function(e) {
	// Show only visible heaters on calculator
	var firstHeater;
	$("#thermistor_heater > option").addClass("hidden");
	$("#table_heaters > tbody > tr:not(.hidden) > td:first-child").each(function() {
		var heater = $(this).text();
		$("#thermistor_heater > option").each(function() {
			if ($(this).text() == heater) {
				if (firstHeater == undefined) {
					firstHeater = $(this).val();
				}

				$(this).removeClass("hidden");
				return false;
			}
		});
	});
	$("#thermistor_heater").val(firstHeater);

	// Show modal dialog
	calcThermistor();
	$("#modal_thermistor_calculator").modal("show");
	e.preventDefault();
});

$("#thermistor_preset").change(function() {
	$("#custom_thermistor").toggleClass("hidden", $(this).val() != "custom");
	calcThermistor();
});

$("#modal_thermistor_calculator input").change(calcThermistor);

var r25, beta, a, b, c;
function calcThermistor() {
	r25 = beta = a = b = c = undefined;

	if ($("#thermistor_preset").val() == "custom") {
		// Set constraints first (R1 < R2 [< R3]), (T1 > T2 [> T3])
		if (isValidated("#r1")) {
			$("#r2").attr("max", $("#r1").val()).trigger("keyup");
		}
		if (isValidated("#r2")) {
			$("#r3").attr("max", $("#r2").val()).trigger("keyup");
		}
		if (isValidated("#t1")) {
			$("#t2").attr("min", $("#t1").val()).trigger("keyup");
		}
		if (isValidated("#t2")) {
			$("#t3").attr("min", $("#t2").val()).trigger("keyup");
		}
	
		// See if we can calculate R25 and beta
		if (isValidated("#r1, #r2, #t1, #t2")) {
			var r1 = parseFloat($("#r1").val());
			var r2 = parseFloat($("#r2").val());
			var t1 = parseFloat($("#t1").val());
			var t2 = parseFloat($("#t2").val());
			beta = Math.log(r2 / r1) / ((1 / (t2 + 273.15)) - (1 / (t1 + 273.15)));
			r25 = r1 * Math.exp(beta * ((1 / 298.15) - (1 / (t1 + 273.15))));

			// Check if we can calculate ABC or only AB
			if (isValidated("#r3, #t3")) {
				// T3+R3 are valid, so we can calculate all the ABC coefficients
				var r3 = parseFloat($("#r3").val());
				var t3 = parseFloat($("#t3").val());

				var l1 = Math.log(r1), l2 = Math.log(r2), l3 = Math.log(r3);
				var g2 = ((1 / (t2 + 273.15)) - (1 / (t1 + 273.15))) / (l2 - l1);
				var g3 = ((1 / (t3 + 273.15)) - (1 / (t1 + 273.15))) / (l3 - l1);

				c = ((g3 - g2) / (l3 - l2)) / (l1 + l2 + l3);
				if (isNaN(c) || !isFinite(c)) {
					a = b = c = 0;
				} else {
					b = g2 - c * (l1 * l1 + l1 * l2 + l2 * l2);
					a = (1 / (t1 + 273.15)) - (b + l1 * l1 * c) * l1;
				}

				// C may become extremely small so it doesn't matter if it's set to 0
				if (c > -1e-16 && c < 1e-16) {
					c = 0;
				}
			} else {
				// Calculate AB parameters only, don't care about C
				b = 1 / beta;
				a = (1 / (t1 + 273.15)) - b * Math.log(r1);
				c = 0;
			}
		}
	} else {
		// Load R25, beta and ABC from preset
		var selectedPreset = $("#thermistor_preset > option[value=\"" + $("#thermistor_preset").val() + "\"]");
		r25 = selectedPreset.data("r25");
		beta = selectedPreset.data("beta");
		a = parseFloat(selectedPreset.data("a"));
		b = parseFloat(selectedPreset.data("b"));
		c = parseFloat(selectedPreset.data("c"));
	}

	// Everything OK?
	if (r25 == undefined || beta == undefined) {
		$("#resulting_r25").text("R25: n/a");
		$("#resulting_beta").text("β: n/a");
		$("#resulting_a").text("A: n/a");
		$("#resulting_b").text("B: n/a");
		$("#resulting_c").text("C: n/a");
		$("#btn_set_coefficients").addClass("disabled");
	} else {
		$("#resulting_r25").text("R25: " + Math.round(r25) + " Ω");
		$("#resulting_beta").text("β: " + Math.round(beta) + " K");
		$("#resulting_a").text("A: " + ((a == 0) ? "0" : a.toExponential(6)));
		$("#resulting_b").text("B: " + ((b == 0) ? "0" : b.toExponential(6)));
		$("#resulting_c").text("C: " + ((c == 0) ? "0" : c.toExponential(6)));
		$("#btn_set_coefficients").removeClass("disabled");
	}
}

$("#btn_set_coefficients").click(function() {
	if (!$(this).hasClass("disabled")) {
		var heater = $("#thermistor_heater").val();

		// Beta may vary for fw 1.17+ if C is supplied. Get the reciprocal of B in this case
		beta = ($("#firmware").val() == "1.16") ? Math.round(beta) : Math.round(1 / b);

		$("#heater" + heater + "_thermistor").val(Math.round(r25));
		$("#heater" + heater + "_beta").val(beta);

		$("#heater" + heater + "_a").val(a.toExponential(6));
		$("#heater" + heater + "_b").val(b.toExponential(6));
		$("#heater" + heater + "_c").val((c == 0) ? 0 : c.toExponential(6));

		$("#modal_thermistor_calculator").modal("hide");
	}
});


/* Validation */

function isValidated(id) {
	if ($(id).hasClass("optional")) {
		return ($(id).closest("div.has-warning").length == 0);
	}
	return ($(id).closest("div.has-error").length == 0);
}

function setValidated(id, ok) {
	var parents = $(id).closest("div.has-error, div.has-warning, div.has-success");
	if (ok) {
		parents.removeClass("has-error").removeClass("has-warning").addClass("has-success");
		parents.children(".glyphicon").removeClass("glyphicon-remove").addClass("glyphicon-ok");
	} else {
		parents.removeClass("has-success").removeClass("has-warning").addClass("has-error");
		parents.children(".glyphicon").removeClass("glyphicon-ok").addClass("glyphicon-remove");
	}
}

function setValidatedWarning(id, ok) {
	var parents = $(id).closest("div.has-error, div.has-warning, div.has-success");
	if (ok) {
		parents.removeClass("has-error").removeClass("has-warning").addClass("has-success");
		parents.children(".glyphicon").removeClass("glyphicon-remove").addClass("glyphicon-ok");
	} else {
		parents.removeClass("has-success").removeClass("has-error").addClass("has-warning");
		parents.children(".glyphicon").removeClass("glyphicon-ok").addClass("glyphicon-remove");
	}
}

$("body").on("keyup", "input[type=\"number\"]", doValidation);
$(".number").keyup(doValidation);

function doValidation() {
	// Inputs must contain valid floats
	var id = "#" + $(this).prop("id");
	var value = parseFloat($(this).val());

	var validated = false;
	if (!isNaN(value) && isFinite(value)) {
		validated = true;

		var min = $(this).attr("min");
		var max = $(this).attr("max");
		if (min != undefined) {
			validated &= value >= parseFloat(min);
		}
		if (max != undefined) {
			validated &= value <= parseFloat(max);
		}
	}

	if ($(this).hasClass("optional")) {
		setValidatedWarning(id, validated);
	} else {
		setValidated(id, validated);
	}
}
