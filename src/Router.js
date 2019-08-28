import Vue from 'vue'
import VueRouter from 'vue-router'

import Start from './views/Start.vue'
import General from './views/General.vue'
import Mapping from './views/Mapping.vue'
import Motors from './views/Motors.vue'
import Endstops from './views/Endstops.vue'
import Heaters from './views/Heaters.vue'
import Fans from './views/Fans.vue'
import Tools from './views/Tools.vue'
import Compensation from './views/Compensation.vue'
import Display from './views/Display.vue'
import Network from './views/Network.vue'
import Finish from './views/Finish.vue'

Vue.use(VueRouter);

export default new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/Start',
			component: Start
		},
		{
			path: '/General',
			component: General
		},
		{
			path: '/Mapping',
			component: Mapping
		},
		{
			path: '/Motors',
			component: Motors
		},
		{
			path: '/Endstops',
			component: Endstops
		},
		{
			path: '/Heaters',
			component: Heaters
		},
		{
			path: '/Fans',
			component: Fans
		},
		{
			path: '/Tools',
			component: Tools
		},
		{
			path: '/Compensation',
			component: Compensation
		},
		{
			path: '/Display',
			component: Display
		},
		{
			path: '/Network',
			component: Network
		},
		{
			path: '/Finish',
			component: Finish
		},
		{
			path: '*',
			redirect: '/Start'
		}
	]
})
