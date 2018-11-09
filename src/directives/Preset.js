import Popper from 'popper.js'
import ToolTip from 'bootstrap-vue/src/utils/tooltip.class'
import { keys } from 'bootstrap-vue/src/utils/object'
import warn from 'bootstrap-vue/src/utils/warn'

const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

// Key which we use to store tooltip object on element
const BVTT = '__BV_ToolTip__'

// Get description tooltip and default value
function getTitle(preset, el, vnode) {
	if (preset == undefined) {
		preset = eval("vnode.context." + vnode.data.model.expression.replace("template", "preset"));
	}

	let unit = "";
	for(let i = 0; i < el.parentElement.children.length; i++) {
		const child = el.parentElement.children[i];
		if (child.classList.contains("input-group-append")) {
			unit = " " + child.textContent;
			break;
		}
	}

	let defaultValue;
	if (el.tagName == "SELECT") {
		for(let i = 0; i < el.options.length; i++) {
			const option = el.options[i];
			const value = option.hasOwnProperty("_value") ? option._value : option.value;
			if (value.constructor === Object) {
				let equal = true;
				for(let key in preset) {
					if (preset[key] != value[key]) {
						equal = false;
						break;
					}
				}
				if (equal) {
					defaultValue = option.textContent;
					break;
				}
			} else if (value == preset) {
				defaultValue = option.textContent;
				break;
			}
		}
	} else if (preset == "" && el.tagName == "INPUT" && el.placeholder != "") {
		defaultValue = el.placeholder;
	} else if (el.classList.contains("btn-group-toggle")) {
		for(let i = 0; i < el.children.length; i++) {
			const child = el.children[i];
			if (child.children.length > 0) {
				const subChild = child.children[0];
				if (subChild.tagName == "INPUT") {
					if (preset.constructor === Array) {
						preset.forEach(function(element) {
							if (element.toString() == subChild.value) {
								if (defaultValue == undefined) {
									defaultValue = child.textContent;
								} else {
									defaultValue += ", " + child.textContent;
								}
							}
						});
					} else if (subChild.value == preset.toString()) {
						defaultValue = child.textContent;
						break;
					}
				}
			}
		}
		if (defaultValue == undefined && preset.constructor === Array) {
			defaultValue = "None";
		}
	} else if (preset.constructor === Boolean) {
		defaultValue = preset ? "Enabled" : "Disabled";
	} else {
		defaultValue = preset + unit;
	}

	let range = "<br/>";
	if (el.tagName == "INPUT") {
		if (el.min != "" && el.max != "") {
			range += "<br/>Allowed Range: " + el.min + " - " + el.max + unit;
		} else if (el.min != "") {
			range += "<br/>Minimum Value: " + el.min + unit;
		} else if (el.max != "") {
			range += "<br/>Maximum Value: " + el.max + unit;
		}
	}

	return el.dataset.originalTitle + range + '<br/>Default Value: ' + defaultValue;
}

// Build a ToolTip config based on bindings (if any)
// Arguments and modifiers take precedence over passed value config object
/* istanbul ignore next: not easy to test */
function parseBindings (bindings, el, vnode) {
	// We start out with a blank config
	let config = {
		html: true,
		title: () => getTitle(bindings.value, el, vnode),
		trigger: 'hover'
	};

	// Process modifiers
	keys(bindings.modifiers).forEach(mod => {
		if (/^nofade$/.test(mod)) {
			// no animation
			config.animation = false
		} else if (/^(auto|top(left|right)?|bottom(left|right)?|left(top|bottom)?|right(top|bottom)?)$/.test(mod)) {
			// placement of tooltip
			config.placement = mod
		} else if (/^(window|viewport)$/.test(mod)) {
			// bounday of tooltip
			config.boundary = mod
		} else if (/^d\d+$/.test(mod)) {
			// delay value
			const delay = parseInt(mod.slice(1), 10) || 0
			if (delay) {
				config.delay = delay
			}
		} else if (/^o-?\d+$/.test(mod)) {
			// offset value. Negative allowed
			const offset = parseInt(mod.slice(1), 10) || 0
			if (offset) {
				config.offset = offset
			}
		}
	})

	return config;
}

//
// Add or Update tooltip on our element
//
/* istanbul ignore next: not easy to test */
function applyBVTT (el, bindings, vnode) {
	if (!inBrowser) {
		return
	}
	if (!Popper) {
		// Popper is required for tooltips to work
		warn('v-preset: Popper.js is required for tooltips to work')
		return
	}
	if (el[BVTT]) {
		el[BVTT].updateConfig(parseBindings(bindings, el, vnode))
	} else {
		el[BVTT] = new ToolTip(el, parseBindings(bindings, el, vnode), vnode.context.$root)
	}
}

//
// Remove tooltip on our element
//
/* istanbul ignore next: not easy to test */
function removeBVTT (el) {
	if (!inBrowser) {
		return
	}
	if (el[BVTT]) {
		el[BVTT].destroy()
		el[BVTT] = null
		delete el[BVTT]
	}
}

/*
 * Export our directive
 */
/* istanbul ignore next: not easy to test */
export default {
	bind (el, bindings, vnode) {
		applyBVTT(el, bindings, vnode)
	},
	inserted (el, bindings, vnode) {
		applyBVTT(el, bindings, vnode)
	},
	update (el, bindings, vnode) {
		if (bindings.value !== bindings.oldValue) {
			applyBVTT(el, bindings, vnode)
		}
	},
	componentUpdated (el, bindings, vnode) {
		if (bindings.value !== bindings.oldValue) {
			applyBVTT(el, bindings, vnode)
		}
	},
	unbind (el) {
		removeBVTT(el)
	}
}
