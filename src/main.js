'use strict';

import 'babel-polyfill'
import 'es6-promise/auto'

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './Icons.js'

import App from './App.vue'
import Preset from './directives/Preset.js'
import Router from './Router.js'
import store from './store'
import ValidityIndicator from './mixins/ValidityIndicator.js'

Vue.config.productionTip = false;

Vue.directive('preset', Preset);
Vue.mixin(ValidityIndicator);
Vue.use(BootstrapVue);

window.isNumber = function(value) {
	return (value !== undefined && value !== null && value.constructor == Number && !isNaN(value) && isFinite(value));
}

const app = new Vue({
    el: '#app',
	render: h => h(App),
    router: Router,
	store
});
