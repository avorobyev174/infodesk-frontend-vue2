import axios from "axios"

export const reports = {
    state: () => ({
        serverModuleName: 'reports'
    }),
    actions: {
        async getAlphaLastTimeDataReport({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/alpha-last-time-data-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getLoadedPyramidCountByCustomerAddressReport({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/get-meter-loaded-count-by-customer-address`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getMeterFromRepairToStorageCountReport({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/get-meter-from-repair-to-storage-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getDataByNotInPyramidReport({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/get-meter-not-loaded-in-pyramid`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getNonActiveInPyramidReport({ state }, days) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/get-non-active-meters-from-pyramid/` + days,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getCountByAddressReport({ state }, sort) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/get-meter-count-by-address/` + sort,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getRotecMeterReport({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModuleName }/get-rotec-meters-info`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
            
            return response.data
        },
    },
    namespaced: true,
}
