import { VBTooltip } from 'bootstrap-vue/src/directives/tooltip/tooltip.js'

// Get description tooltip and default value
function getTitle(preset, el, binding, vnode) {
	// Get default preset if no explicit value is set
	if (preset === undefined) {
		if (vnode.data.model) {
			let expression = vnode.data.model.expression.replace('template', 'preset');
			if (expression.indexOf('preset') === -1) {
				expression = 'preset.' + expression;
			}
			preset = eval('vnode.context.$store.state.' + expression);
		} else {
			console.warn('Failed to get preset, no model binding present');
			console.warn(el);
			return 'unknown';
		}
	}

	let unit = '';
	if (el.parentElement) {
		for (let i = 0; i < el.parentElement.children.length; i++) {
			const child = el.parentElement.children[i];
			if (child.classList.contains('input-group-append')) {
				unit = ' ' + child.textContent;
				break;
			}
		}
	}

	let defaultValue;
	if (el.tagName === 'SELECT') {
		for(let i = 0; i < el.options.length; i++) {
			const option = el.options[i];
			const value = option.hasOwnProperty('_value') ? option._value : option.value;
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
	} else if (preset === '' && el.tagName === 'INPUT' && el.placeholder !== '') {
		defaultValue = el.placeholder;
	} else if (el.classList.contains('btn-group-toggle')) {
		for(let i = 0; i < el.children.length; i++) {
			const child = el.children[i];
			if (child.children.length > 0) {
				const subChild = child.children[0];
				if (subChild.tagName === 'INPUT') {
					if (preset.constructor === Array) {
						preset.forEach(function(element) {
							if (element.toString() == subChild.value) {
								if (defaultValue == undefined) {
									defaultValue = child.textContent;
								} else {
									defaultValue += ', ' + child.textContent;
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
			defaultValue = 'None';
		}
	} else if (preset.constructor === Boolean) {
		defaultValue = preset ? 'Enabled' : 'Disabled';
	} else {
		defaultValue = preset + unit;
	}

	let range = '<br>';
	if (el.tagName === 'INPUT') {
		if (el.min != '' && el.max != '') {
			range += '<br>Allowed Range: ' + el.min + ' - ' + el.max + unit;
		} else if (el.min != '') {
			range += '<br>Minimum Value: ' + el.min + unit;
		} else if (el.max != '') {
			range += '<br>Maximum Value: ' + el.max + unit;
		}
	}

	let title = el.dataset.originalTitle;
	if (!title) {
		// FIXME This is a work-around for checkboxes
		for (let i = 0; i < el.children.length; i++) {
			const child = el.children[i];
			if (child.title) {
				title = child.title;
				break;
			}
		}
	}
	return title + range + '<br>Default Value: ' + defaultValue;
}

export default {
	bind(el, binding, vnode) {
		const preset = binding.value;
		binding.modifiers.hover = true;
		binding.modifiers.html = true;
		binding.value = () => getTitle(preset, el, binding, vnode);
		VBTooltip.bind(el, binding, vnode);
	},
	componentUpdated(el, binding, vnode) {
		binding.modifiers.html = true;
		VBTooltip.componentUpdated(el, binding, vnode);
	},
	unbind(el) {
		VBTooltip.unbind(el);
	}
}
