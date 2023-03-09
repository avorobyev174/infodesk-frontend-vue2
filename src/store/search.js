import axios from "axios";

export const search = {
    state: () => ({
        serverModuleName: 'search'
    }),
    actions: {
        async getMeterBySerialNumber({state, commit}, serialNumber) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${this.state.search.serverModuleName}/get-meter-by-serial-number/` + serialNumber,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
