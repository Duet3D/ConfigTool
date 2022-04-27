import { Tooltip } from "bootstrap";
import type { Directive, DirectiveBinding, VNode } from "vue";

/**
 * Interface for accessing tooltip elements
 */
interface TooltipElement {
	dataset: { originalTitle: string };
	title: string;
	tooltip?: Tooltip;
}

/**
 * Get the title for a given HTML element
 * @param binding Binding of the directive
 * @param el HTML element
 */
function getTitle(binding: DirectiveBinding, el: any): string {
	// Get default preset if no explicit value is set
	const preset = binding.value;
	if (preset === undefined) {
		return "";
	}
	let unit = el.dataset.unit || "";

	// Get the corresponding caption for the default value
	let defaultValue: string = "";
	if (el.tagName === "SELECT") {
		for (let option of el.options) {
			const value = option.hasOwnProperty("_value") ? option._value : option.value;
			if (value instanceof Object && !(value instanceof Array)) {
				let equal = true;
				for (let key in preset as Object) {
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
	} else if (preset === "" && el.tagName === "INPUT" && el.placeholder !== "") {
		defaultValue = el.placeholder;
	} else if (el.classList.contains("btn-group-toggle")) {
		for (let child of el.children) {
			if (child.children.length > 0) {
				const subChild = child.children[0];
				if (subChild.tagName === 'INPUT') {
					if (preset instanceof Array) {
						for (let element of preset) {
							if (element.toString() == subChild.value) {
								if (!defaultValue) {
									defaultValue = child.textContent;
								} else {
									defaultValue += ', ' + child.textContent;
								}
							}
						}
					} else if (subChild.value == preset.toString()) {
						defaultValue = child.textContent;
						break;
					}
				}
			}
		}
		if (defaultValue == undefined && preset instanceof Array) {
			defaultValue = 'None';
		}
	} else if (typeof preset === "boolean") {
		defaultValue = preset ? "Enabled" : "Disabled";
	} else {
		defaultValue = preset + unit;
	}

	// Get the range if possible
	let range = "<br>";
	if (el.tagName === "INPUT") {
		if (el.min !== "" && el.max !== "") {
			range += `<br>Allowed Range: ${el.min} - ${el.max}${unit}`;
		} else if (el.min !== "") {
			range += `<br>Minimum Value: ${el.min}${unit}`;
		} else if (el.max !== "") {
			range += `<br>Maximum Value: ${el.max}${unit}`;
		}
	}

	// Get the label for this value
	let title = el.dataset.originalTitle;
	if (!title) {
		for (let child of el.children) {
			if (child.title) {
				title = child.title;
				break;
			}
		}
	}
	return `${title}${range}<br>Default Value: ${defaultValue}`;
}

export const VPreset: Directive<Element & TooltipElement> = {
	mounted(el: Element & TooltipElement, binding: DirectiveBinding): void {
		// Delete the default title so the value can be determined from getTitle()
		el.dataset.originalTitle = el.title;
		el.title = "";

		// Register Bootstrap tooltip
		el.tooltip = new Tooltip(el, {
			html: true,
			title: () => getTitle(binding, el),
			trigger: "hover focus"
		});
	},
	beforeUnmount(el: Element & TooltipElement) {
		if (el.tooltip) {
			el.tooltip.dispose();
			el.tooltip = undefined;
		}
	}
}

export default VPreset
