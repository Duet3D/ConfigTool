import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faPlus, faEdit, faMinus, faExclamationTriangle, faSave, faDownload, faUpload, faEye, faTrash, faDotCircle, faHourglass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCheck, faPlus, faEdit, faMinus, faExclamationTriangle, faSave, faDownload, faUpload, faEye, faTrash, faDotCircle, faHourglass);
Vue.component('font-awesome-icon', FontAwesomeIcon);
