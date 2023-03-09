import axios from "axios";

export const charts = {
    state: () => ({
        serverModuleName: 'charts'
    }),
    actions: {
        async getMeterRegistrationChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-registration-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterInPyramidChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-in-pyramid-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationTypesChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-registration-types-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationStreetsChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-in-pyramid-houses-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationCustomerTypeChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-in-pyramid-customer-types-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationNotInPyramidTypeChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-not-in-pyramid-types-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationInPyramidCountChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-in-pyramid-count-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationActiveInPyramidChartData({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.charts.serverModuleName}/meter-active-in-pyramid-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
