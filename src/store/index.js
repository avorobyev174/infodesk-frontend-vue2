import Vue from 'vue'
import Vuex from 'vuex'
import { production, dev } from '../../server-urls.js'

Vue.use(Vuex)

import { registration } from "@/store/registration"
import { charts } from "@/store/charts"
import { profile } from "@/store/profile"
import { utils } from "@/store/utils"
import { alpha } from "@/store/alpha"
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
        assignmentEventTypes: [],
        dictionaries: {},
        accounts: [],
        isUserLogin: false,
        colorRed: 'red lighten-1',
        colorBlue: 'blue lighten-1',
        colorGreen: 'green lighten-1',
        colorOrange: 'orange lighten-1',
        colorGrey: 'grey lighten-1',
        colorGold: '#ecc700',
        serverUrl: process.env.NODE_ENV === "production" ? production : dev,
        cookies: [],
        favoriteModuleColor: '',
    },
    
    getters: {
        getSideBarState(state) {
            return state.sideBarState
        },
        
        getActiveModules(state) {
            return state.activeModules
        },
        
        isLogin(state) {
            return state.isUserLogin
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
        
        getAccounts(state) {
            return state.accounts
        },
        
        getAccountId(state) {
            return state.accountId
        },
        
        getAssignmentEventTypes(state) {
            return state.assignmentEventTypes
        },
    
        getDictionaries(state) {
            return state.dictionaries
        },
    },
    
    mutations: {
        setSideBarState(state, sideBarState) {
            state.sideBarState = sideBarState
        },
        
        setActiveModules(state, activeModules) {
            state.activeModules = activeModules
        },
        
        login(state, isUserLogin) {
            state.isUserLogin = isUserLogin
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
        
        setAccounts(state, accounts) {
            state.accounts = accounts
        },
        
        setAssignmentEventTypes(state, assignmentEventTypes) {
            state.assignmentEventTypes = assignmentEventTypes
        },
    
        setDictionaries(state, dictionaries) {
            state.dictionaries = dictionaries
        },
    },

    actions: {
        async loginUser({state, commit}, { authToken, roleToken, cookies }) {
            $cookies.set('auth_token', authToken, '4h')
            $cookies.set('role_token', roleToken, '4h')
            
            commit('login', true)
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
        
        async logoutUser({ state, commit }) {
            $cookies.remove('auth_token')
            $cookies.remove('role_token')
            commit('login', false)
            await router.push('/login')
        },
        
        async fetchAccounts({ state, commit }) {
            const response = await get(
                this.state.serverUrl + `/api/common/accounts`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })
            const { data } = response
            commit('setAccounts', data)
        },
        
        async fetchAssignmentEventTypes({ state, commit }) {
            const response = await get(
                this.state.serverUrl + `/api/common/assignment-event-types`,
                    { headers: { 'authorization': $cookies.get('auth_token') } })
            const { data } = response
            commit('setAssignmentEventTypes', data)
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
        alpha,
        testUtils,
        search,
        reports,
        storage,
        repair,
        service,
        map
    }
})
