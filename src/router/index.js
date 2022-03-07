import VueRouter from 'vue-router'
import Simulation from "@/views/Simulation";
import TestView from "@/views/TestView";
import Comparison from "@/views/Comparison";
import GHive from "@/views/GHive";

const routes = [
    {path: '/simulation', component: Simulation},
    {path: '/system', component: Comparison},
    {path: '/test', component: TestView},
    {path: '/', redirect: '/ghive'},
    {path: '/ghive', component: GHive}
]

export default new VueRouter({
    mode: 'history',
    routes
})
