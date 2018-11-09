'use strict';

import 'babel-polyfill'
import 'es6-promise/auto'

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './Icons.js'

import Preset from './directives/Preset.js'

import App from './App.vue'
import Router from './Router.js'
import Store from './Store.js'

Vue.directive('preset', Preset);
Vue.use(BootstrapVue);
Vue.config.productionTip = false;

window.isNumber = function(value) {
	return (value != undefined && value.constructor == Number && !isNaN(value) && isFinite(value));
}

const app = new Vue({
    el: '#app',
	mixins: [Store],
	render: h => h(App),
    router: Router
});
