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
        
        async getLocationReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-location-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getOwnerReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-owner-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getMeterReport({ state, commit }, { type, serialNumber }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-meter-report`,
                { type, serialNumber },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getStoragePeriodReport({ state, commit }, { startDate, endDate }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-storage-logs-by-period-report`,
                { startDate, endDate },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getInOutByPeriodAndLocationReport({ state, commit }, { startDate, endDate, location }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-in-out-by-period-and-location-report`,
                { startDate, endDate, location },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getInOutByPeriodAndEmployeeReport({ state, commit }, { startDate, endDate, empStaffId }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-in-out-by-period-and-emp-report`,
                { startDate, endDate, empStaffId },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getLogsByPeriodAndLocationReport({ state, commit }, { startDate, endDate, location }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-storage-logs-by-location-report`,
                { startDate, endDate, location },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getLogsByPeriodAndEmpReport({ state, commit }, { startDate, endDate, empStaffId }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-storage-logs-by-emp-report`,
                { startDate, endDate, empStaffId },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getGroupLogsByPeriodAndEmpReport({ state, commit }, { startDate, endDate, empStaffId }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-storage-group-logs-by-emp-report`,
                { startDate, endDate, empStaffId },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getCurrentCountByLocationReport({ state, commit }, { startDate, endDate, location }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-storage-count-by-current-location-report`,
                { startDate, endDate, location },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getRepairCountAndMaterialReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-repair-count-and-material-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getSpentByYearReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-spent-by-year-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getMaterialSpentByMonthReport({ state, commit }, { startDate, endDate }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModuleName }/get-spent-by-month-report`,
                { startDate, endDate },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    },
    namespaced: true
}
