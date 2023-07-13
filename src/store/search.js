import axios from "axios";

export const search = {
    state: () => ({
        serverModule: 'search'
    }),
    actions: {
        async getMeterBySerialNumber( {state }, serialNumber) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-meter-by-serial-number/` + serialNumber,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
