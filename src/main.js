// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.


import Vue from 'vue';
import App from './App';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faClock, faAlignLeft, faUser, faPen, faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import VueMoment from 'vue-moment';
const moment = require('moment');
require('moment/locale/en-gb');
require('moment/locale/fr');
Vue.use(VueMoment, {
  moment
});

library.add( faClock, faAlignLeft, faUser, faPen, faTrash, faTimes, faCheck);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;


/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',


});


