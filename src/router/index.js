import Vue from 'vue'
import VueRouter from 'vue-router'
import Registration from '../modules/registration/MeterRegistration.vue'
import Charts from "../modules/Charts";
import Search from "../modules/Search";
import Map from "../modules/map/Map";
import Meters from "../modules/Meters";
import Login from "../modules/Login";
import PageNotFound from "../modules/PageNotFound";
import Profile from "../profile/Profile";
import Alpha from "../modules/alpha/Alpha";
import TestUtils from "../modules/test-utils/TestUtils";
import Reports from "../modules/reports/Reports";
import Welcome from "../modules/Welcome";
import Admin from "../modules/Admin";
import Storage from "../modules/storage/Storage";

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
    path: '/registration',
    name: 'Registration',
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
    path: '/meters',
    name: 'Meters',
    component: Meters
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
    path: '/alpha',
    name: 'Alpha',
    component: Alpha
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
    path: "*",
    component: PageNotFound
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
