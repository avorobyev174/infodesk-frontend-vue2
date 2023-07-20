import { get } from "axios";

export const search = {
    state: () => ({
        serverModule: 'search'
    }),
    actions: {
        async getMeterDataBySerialNumber({ state }, serialNumber) {
            const response = await get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-data-by-serial-number/` + serialNumber,
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
