import { get, post } from "axios";

export const search = {
    state: () => ({
        serverModule: 'search'
    }),
    actions: {
        async getMeterDataBySerialNumber({ state }, { serialNumber, startDate, endDate, dataType }) {
            const response = await post(
                this.state.serverUrl + `/api/${ state.serverModule }/get-data-by-serial-number/`,
                { serialNumber, startDate, endDate, dataType },
                { headers: { 'authorization': $cookies.get('auth_token') } })

            return response.data
        },
    },
    namespaced: true
}
