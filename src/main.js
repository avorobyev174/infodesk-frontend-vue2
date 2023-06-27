import Vue from 'vue'
import './plugins/fontawesome'
import './plugins/bootstrap-vue'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import vueCookies from 'vue-cookies'
import VueApexCharts from 'vue-apexcharts'
import * as VueGoogleMaps from 'vue2-google-maps'
import key from '/google-map'

Vue.use(vueCookies)
Vue.use(VueApexCharts)
Vue.use(VueGoogleMaps, {
    load: {
        key,
        region: 'RU',
        language: 'ru',
    }
})

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')
