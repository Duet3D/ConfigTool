import { Tooltip } from "bootstrap";
import type { Directive, DirectiveBinding } from "vue";

/**
 * Interface for accessing tooltip elements
 */
interface VTitleElement {
	tooltip?: Tooltip;
}

export const VTitle: Directive<Element & VTitleElement> = {
	mounted(el: Element & VTitleElement, binding: DirectiveBinding): void {
		el.tooltip = new Tooltip(el, {
			html: true,
			title: () => binding.value,
			trigger: "hover"
		});
	},
	beforeUnmount(el: Element & VTitleElement) {
		if (el.tooltip) {
			el.tooltip.dispose();
			el.tooltip = undefined;
		}
	}
}

export default VTitle
