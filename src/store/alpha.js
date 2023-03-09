import axios from "axios";

export const alpha = {
    state: () => ({
        serverModuleName: 'alpha'
    }),
    actions: {
        async getAlphaLastTimeDataReport({state, commit}) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.alpha.serverModuleName}/alpha-last-time-data-report`,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
