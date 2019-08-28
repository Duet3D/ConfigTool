'use strict';

function validateElement(element) {
	const isValid = element.checkValidity();
	element.classList.toggle('is-valid', isValid);
	element.classList.toggle('is-invalid', !isValid);
}

let disabledObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
			if (mutation.target.disabled) {
				mutation.target.classList.remove('is-valid');
				mutation.target.classList.remove('is-invalid');
			} else {
				validateElement(mutation.target);
			}
        }
    });    
});

export default {
	mounted() {
		if (this.$options._componentTag === 'b-form-input' && this.$state == null) {
			// Assign initial state for standard inputs
			if (!this.$el.disabled) {
				const isValid = this.$el.checkValidity();
				this.$el.classList.toggle('is-valid', isValid);
				this.$el.classList.toggle('is-invalid', !isValid);
			}

			// Toggle validation classes when an input element is enabled or disabled
			disabledObserver.observe(this.$el, { attributes: true });

			// Make sure this state is updated dynamically when the data changes
			this.$on('input', function() {
				if (!this.$el.disabled) {
					validateElement(this.$el);
				}
			});
		}
	}
}
