import Vue from 'vue'
import VueRouter from 'vue-router'
import Registration from '../modules/registration/MeterRegistration'
import Charts from "../modules/Charts"
import Search from "../modules/Search"
import Map from "../modules/map/Map"
import Login from "../modules/Login"
import PageNotFound from "../modules/PageNotFound"
import Profile from "../profile/Profile"
import TestUtils from "../modules/test-utils/TestUtils"
import Reports from "../modules/reports/Reports"
import Welcome from "../modules/Welcome"
import Admin from "../modules/Admin"
import Storage from "../modules/storage/Storage"
import Repair from "../modules/repair/Repair"
import Service from "../modules/service/Service"

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Welcome',
        component: Welcome
    },
    {
        path: '/charts',
        name: 'Charts',
        component: Charts
    },
    {
        path: '/programming',
        name: 'Programming',
        component: Registration
    },
    {
        path: '/map',
        name: 'Map',
        component: Map
    },
    {
        path: '/search',
        name: 'Search',
        component: Search
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile
    },
    {
        path: '/test-utils',
        name: 'Test-Utils',
        component: TestUtils
    },
    {
        path: '/reports',
        name: 'Reports',
        component: Reports
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin
    },
    {
        path: '/storage',
        name: 'Storage',
        component: Storage
    },
    {
        path: '/repair',
        name: 'Repair',
        component: Repair
    },
    {
        path: '/service',
        name: 'Service',
        component: Service
    },
    {
        path: '/*',
        name: 'PageNotFound',
        component: PageNotFound
    },
]

const router = new VueRouter({
      routes,
      mode: 'history'
})

export default router
