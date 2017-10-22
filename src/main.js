import Vue from 'vue'
import App from './App'

import VueResource from 'vue-resource'

Vue.use(VueResource);

if (process.env.NODE_ENV === 'development') {
    Vue.http.options.crossOrigin = true
    Vue.http.headers.common['Access-Control-Allow-Origin'] = '*'
}

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    template: '<App/>',
    components: {App}
})