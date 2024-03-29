import Vue from 'vue'
import VueRouter from 'vue-router'
import Programming from '../modules/programming/Programming'
import Charts from "../modules/charts/Charts"
import Search from "../modules/search/Search"
import Map from "../modules/map/Map"
import Login from "../modules/Login"
import PageNotFound from "../modules/PageNotFound"
import Profile from "../modules/profile/Profile"
import TestUtils from "../modules/test-utils/TestUtils"
import Reports from "../modules/reports/Reports"
import Welcome from "../modules/Welcome"
import Admin from "../modules/Admin"
import Storage from "../modules/storage/Storage"
import Repair from "../modules/repair/Repair"
import Service from "../modules/service/Service"
import Objects from "../modules/objects/Objects"

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
        component: Programming
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
        path: '/objects',
        name: 'Objects',
        component: Objects
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
