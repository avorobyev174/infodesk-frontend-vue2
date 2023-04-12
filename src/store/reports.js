import axios from "axios";

export const reports = {
    state: () => ({
        serverModuleName: 'reports'
    }),
    actions: {
        async getAlphaLastTimeDataReport({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/alpha-last-time-data-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getLoadedPyramidCountByCustomerAddress({state, commit}, metersArr) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-meter-loaded-count-by-customer-address`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getMeterFromRepairToStorageCount({state, commit}, metersArr) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-meter-from-repair-to-storage-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getDataByNotInPyramid({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-meter-not-loaded-in-pyramid`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getNonActiveInPyramid({state, commit}, days) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-non-active-meters-from-pyramid/` + days,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getCountByAddress({state, commit}, created) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-meter-count-by-address/` + created,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getRotecMetersInfo({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-rotec-meters-info`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
            
            return response.data
        },
    },
    namespaced: true
}
