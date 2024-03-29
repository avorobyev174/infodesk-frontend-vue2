import axios from "axios"

export const storageReports = {
    actions: {
        async getLocationReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-location-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getOwnerReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-owner-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getMeterReport({ state, commit }, { type, serialNumber }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-meter-report`,
                { type, serialNumber },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getStoragePeriodReport({ state, commit }, { startDate, endDate }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-storage-logs-by-period-report`,
                { startDate, endDate },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getInOutByPeriodAndLocationReport({ state, commit }, { startDate, endDate, location }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-in-out-by-period-and-location-report`,
                { startDate, endDate, location },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getInOutByPeriodAndEmployeeReport({ state, commit }, { startDate, endDate, empStaffId }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-in-out-by-period-and-emp-report`,
                { startDate, endDate, empStaffId },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getLogsByPeriodAndLocationReport({ state, commit }, { startDate, endDate, location }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-storage-logs-by-location-report`,
                { startDate, endDate, location },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getLogsByPeriodAndEmpReport({ state, commit }, { startDate, endDate, empStaffId }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-storage-logs-by-emp-report`,
                { startDate, endDate, empStaffId },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getGroupLogsByPeriodAndEmpReport({ state, commit }, { startDate, endDate, empStaffId }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-storage-group-logs-by-emp-report`,
                { startDate, endDate, empStaffId },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getCurrentCountByLocationReport({ state, commit }, { location }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-storage-count-by-current-location-report`,
                { location },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getRepairCountAndMaterialReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-repair-count-and-material-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getSpentByYearReport({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-spent-by-year-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getMaterialSpentByMonthReport({ state, commit }, { startDate, endDate }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-spent-by-month-report`,
                { startDate, endDate },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getMetersLastLogsReport({ state, commit }, { serialNumber }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-meters-last-logs-report`,
                { serialNumber },
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
        
        async getGroupByTypeAndEmpStorageReport({ state, commit }, reportData) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-group-by-type-and-emp-count-report`,
                reportData,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    
        async getInstallDataByPeriodStorageReport({ state, commit }, reportData) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.reports.serverModule }/get-last-install-data-by-period-report`,
                reportData,
                { headers: { 'authorization': $cookies.get('auth_token') } })
        
            return response.data
        },
    },
    namespaced: true,
}
