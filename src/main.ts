import Vue from 'vue';
import App from './App.vue';
import router from './router';
import '@mdi/font/css/materialdesignicons.css';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

// @ts-ignore
import frag from 'vue-frag';

import store from './store';

Vue.config.productionTip = false;
Vue.directive('frag', frag);
Vue.use(Buefy);
new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
