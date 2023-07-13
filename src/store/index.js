import Vue from 'vue'
import Vuex from 'vuex'
import { production, dev } from '../../server-urls.js'

Vue.use(Vuex)

import { registration } from "@/store/registration"
import { charts } from "@/store/charts"
import { profile } from "@/store/profile"
import { common } from "@/store/common"
import { testUtils } from "@/store/test-utils"
import { reports } from "@/modules/reports/store/reports"
import { search } from "@/store/search"
import { storage } from "@/store/storage"
import { repair } from "@/store/repair"
import { service } from "@/modules/service/store/service"
import { map } from "@/store/map"
import { serviceReports } from "@/modules/reports/store/service-reports"
import { storageReports } from "@/modules/reports/store/storage-reports"

import router from '../router/index.js'
import { get } from "axios"

export default new Vuex.Store({
    state: {
        sideBarState: true,
        staffId: 0,
        accountId: 0,
        roles: null,
        activeModules: [],
        dictionaries: {},
        isLogin: false,
        colorRed: 'red lighten-1',
        colorBlue: 'blue lighten-1',
        colorGreen: 'green lighten-1',
        colorOrange: 'orange lighten-1',
        colorGrey: 'grey lighten-1',
        colorDarkGrey: 'grey',
        colorGold: '#ecc700',
        serverUrl: process.env.NODE_ENV === "production" ? production : dev,
        cookies: [],
        assignmentEventTypes: [],
        assignmentCloseReasonTypes: [],
        assignmentStatuses: [],
        accounts: [],
        meterTypes: [],
        meterProgTypes: [],
        ipAddresses: [],
        simStatuses: [],
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

        getDictionaries(state) {
            return state.dictionaries
        },
    
        getMeterTypes(state) {
            return state.meterTypes
        },
    
        getMeterProgTypes(state) {
            return state.meterProgTypes
        },
    
        getAssignmentEventTypes(state) {
            return state.assignmentEventTypes
        },
    
        getAssignmentCloseReasonTypes(state) {
            return state.assignmentCloseReasonTypes
        },
    
        getAccounts(state) {
            return state.accounts
        },
    
        getAssignmentStatuses(state) {
            return state.assignmentStatuses
        },
    
        getSimStatuses(state) {
            return state.simStatuses
        },
    
        getIpAddresses(state) {
            return state.ipAddresses
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

        setDictionaries(state, dictionaries) {
            const {
                assignmentEventTypes,
                assignmentCloseReasonTypes,
                accounts,
                meterTypes,
                meterProgTypes,
                ipAddresses,
                simStatuses,
                assignmentStatuses
            } = dictionaries
    
            state.assignmentEventTypes = assignmentEventTypes
            state.assignmentCloseReasonTypes = assignmentCloseReasonTypes
            state.accounts = accounts
            state.meterTypes = meterTypes
            state.meterProgTypes = meterProgTypes
            state.ipAddresses = ipAddresses
            state.simStatuses = simStatuses
            state.assignmentStatuses = assignmentStatuses
            state.dictionaries = dictionaries
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

        async fetchDictionaries({ state, commit }) {
            const response = await get(
                this.state.serverUrl + `/api/common/dictionaries`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            const { data } = response
            const dictionaries = {}
            for (const { title, value } of data) {
                dictionaries[title] = value
            }
            
            commit('setDictionaries', dictionaries)
        },
   },
   
   modules: {
        registration,
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
   }
})
