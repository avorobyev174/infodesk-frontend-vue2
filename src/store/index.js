import Vue from 'vue'
import Vuex from 'vuex'
import { production, dev } from '../../server-urls.js'

Vue.use(Vuex)

import { registration } from "@/store/registration"
import { charts } from "@/store/charts"
import { profile } from "@/store/profile"
import { utils } from "@/store/utils"
import { testUtils } from "@/store/test-utils"
import { reports } from "@/store/reports"
import { search } from "@/store/search"
import { storage } from "@/store/storage"
import { repair } from "@/store/repair"
import { service } from "@/store/service"
import { map } from "@/store/map"

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
        colorGold: '#ecc700',
        serverUrl: process.env.NODE_ENV === "production" ? production : dev,
        cookies: [],
        favoriteModuleColor: '',
        assignmentEventTypes: [],
        assignmentCloseReasonTypes: [],
        assignmentStatuses: [],
        accounts: [],
        meterTypes: [],
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

        getCookies(state) {
            return state.cookies
        },

        getFavoriteModuleColor(state) {
            return state.favoriteModuleColor
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

        setCookies(state, cookies) {
            state.cookies = cookies
        },

        setFavoriteModuleColor(state, color) {
            state.favoriteModuleColor = color
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
                ipAddresses,
                simStatuses,
                assignmentStatuses
            } = dictionaries
    
            state.assignmentEventTypes = assignmentEventTypes
            state.assignmentCloseReasonTypes = assignmentCloseReasonTypes
            state.accounts = accounts
            state.meterTypes = meterTypes
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
            commit('setCookies', cookies)

            let redirect = '/'

            if (cookies && cookies.common && cookies.common.length) {
                cookies.common.forEach((cookie) => {
                    if (cookie.settings === 'favorite_module') {
                        redirect = cookie.value
                        $cookies.set(`common_${ cookie.settings }`, cookie.value, '4h')
                    }
                })
            }
            
            await router.push(redirect)
        },

        async logoutUser({ state, commit }, isRedirectToLoginPage) {
            try {
                $cookies.remove('auth_token')
                $cookies.remove('role_token')
                commit('setLogin', false)
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
        utils,
        testUtils,
        search,
        reports,
        storage,
        repair,
        service,
        map
    }
})
