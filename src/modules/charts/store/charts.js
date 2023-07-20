import axios from "axios";

export const charts = {
    state: () => ({
        serverModule: 'charts'
    }),
    actions: {
        async getMeterRegistrationChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/meter-registration-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterInPyramidChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${state.serverModule }/meter-in-pyramid-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationTypesChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${state.serverModule }/meter-registration-types-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationBuildingsChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${state.serverModule }/meter-in-pyramid-buildings-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationCustomerTypeChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${state.serverModule }/meter-in-pyramid-customer-types-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationNotInPyramidTypeChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/meter-not-in-pyramid-types-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationInPyramidCountChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/meter-in-pyramid-count-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },

        async getMeterRegistrationActiveInPyramidChartData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/meter-active-in-pyramid-chart`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
