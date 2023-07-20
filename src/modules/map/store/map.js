import { get } from "axios"

export const map = {
    state: () => ({
        addresses: [],
        serverModule: 'map'
    }),
    getters: {
        getAddresses(state) {
            return state.addresses
        },
    },
    mutations: {
        setAddresses(state, addresses) {
            state.addresses = addresses
        },
    },
    actions: {
        async fetchAddresses({ state, commit }) {
            const response = await get(
                this.state.serverUrl + `/api/${ state.serverModule }/addresses`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
            
            const { data } = response
            commit('setAddresses', data)
        },
    },
    namespaced: true
}
