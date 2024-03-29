import Vue from 'vue'
import Vuex from 'vuex'
import { production, dev } from '../../server-urls.js'

Vue.use(Vuex)

import { programming } from "@/modules/programming/store/programming"
import { charts } from "@/modules/charts/store/charts"
import { profile } from "@/modules/profile/store/profile"
import { common } from "@/store/common"
import { testUtils } from "@/modules/test-utils/store/test-utils"
import { reports } from "@/modules/reports/store/reports"
import { search } from "@/modules/search/store/search"
import { storage } from "@/modules/storage/store/storage"
import { repair } from "@/modules/repair/store/repair"
import { service } from "@/modules/service/store/service"
import { map } from "@/modules/map/store/map"
import { serviceReports } from "@/modules/reports/store/service-reports"
import { storageReports } from "@/modules/reports/store/storage-reports"
import { dictionary } from "@/store/dictionary"
import { objects } from "@/modules/objects/store/objects"

import router from '../router/index.js'

export default new Vuex.Store({
    state: {
        sideBarState: true,
        staffId: 0,
        accountId: 0,
        roles: null,
        activeModules: [],
        isLogin: false,
        colorRed: 'red lighten-1',
        colorBlue: 'blue lighten-1',
        colorGreen: 'green lighten-1',
        colorOrange: 'orange lighten-1',
        colorGrey: 'grey lighten-1',
        colorSuperGrey: 'rgba(0, 0, 0, 0.54)',
        colorDarkGrey: 'grey',
        colorGold: '#ecc700',
        serverUrl: process.env.NODE_ENV === "production" ? production : dev,
        cookies: [],
    },

    getters: {
        getSideBarState(state) {
            return state.sideBarState
        },

        getActiveModules(state) {
            return state.activeModules
        },

        getIsLogin(state) {
            return state.isLogin
        },

        getStaffId(state) {
            return state.staffId
        },

        getRoles(state) {
            return state.roles
        },

        getAccountId(state) {
            return state.accountId
        },
    },

    mutations: {
        setSideBarState(state, sideBarState) {
            state.sideBarState = sideBarState
        },

        setActiveModules(state, activeModules) {
            state.activeModules = activeModules
        },

        setLogin(state, isLogin) {
            state.isLogin = isLogin
        },

        setStaffId(state, staffId) {
            state.staffId = staffId
        },

        setAccountId(state, accountId) {
            state.accountId = accountId
        },

        setRoles(state, roles) {
            state.roles = roles
        },
    },

    actions: {
        async loginUser({ state, commit }, { authToken, roleToken, cookies }) {
            $cookies.set('auth_token', authToken, '4h')
            $cookies.set('role_token', roleToken, '4h')
            commit('setLogin', true)
    
            for (const module of Object.keys(cookies)) {
                for (const cookie of cookies[ module ]) {
                    if (cookie.settings === 'favorite_module') {
                        await router.push(cookie.value)
                    }
                    $cookies.set(`${ module }_${ cookie.settings }`, cookie.value, '4h')
                }
            }
            
            if (router.currentRoute.name === 'Login') {
                await router.push('/')
            }
        },
    
        async logoutUser({ state, commit }, isRedirectToLoginPage) {
            try {
                $cookies.remove('auth_token')
                $cookies.remove('role_token')
                commit('setLogin', false)
                console.log(isRedirectToLoginPage)
                if (isRedirectToLoginPage) {
                    await router.push('/login')
                }
            } catch (e) {
                console.log(e)
            }
        },
    },
   
    modules: {
        programming,
        charts,
        profile,
        common,
        testUtils,
        search,
        reports,
        serviceReports,
        storageReports,
        storage,
        repair,
        service,
        map,
        dictionary,
        objects,
    }
})
