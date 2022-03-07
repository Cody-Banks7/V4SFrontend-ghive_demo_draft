import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'

Vue.config.productionTip = false
Vue.use(ElementUI, {locale})


import Vuex from 'vuex'
import VueRouter from "vue-router";
import router from '@/router'
import store from '@/store'

import * as echarts from "echarts";

import axios from 'axios'
import VueAxios from 'vue-axios'
axios.defaults.baseURL = 'http://192.168.1.215:5001';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
Vue.use(VueAxios, axios)


Vue.prototype.$echarts = echarts;

Vue.use(Vuex)
Vue.use(VueRouter)

new Vue({
    el: '#app',
    router,
    render: h => h(App),
    components: {App},
    store: store,
}).$mount('#app')
