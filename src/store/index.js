import Vue from 'vue'
import Vuex from 'vuex'
import simulation from "@/store/modules/simulation";
import comparison from "@/store/modules/comparison";
import ghive from "@/store/modules/ghive";

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        simulation,
        comparison,
        ghive
    },
    // strict: debug,
    strict: false,
})
