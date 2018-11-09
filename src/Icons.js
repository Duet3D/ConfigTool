import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faPlus, faMinus, faExclamationTriangle, faSave, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCheck, faPlus, faMinus, faExclamationTriangle, faSave, faDownload)
Vue.component('font-awesome-icon', FontAwesomeIcon)
