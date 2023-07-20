import { post } from "axios";

export const common = {
    state: () => ({
        serverModule: 'common',
        favoriteModuleColor: 'grey',
    }),
    getters: {
        getFavoriteModuleColor(state) {
            return state.favoriteModuleColor
        },
    },
    mutations: {
        setFavoriteModuleColor(state, color) {
            state.favoriteModuleColor = color
        },
    },
    actions: {
        async saveSettings({ state }, { module, settings, value }) {
            const response = await post(
                this.state.serverUrl + `/api/${ state.serverModule }/save-settings`,
                {
                    module,
                    settings,
                    value: typeof value === 'string' ? value : value.toString() //массив с колонками
                },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },
    
        async changeCredentials({ state }, { name, login, password }) {
            const response = await post(
                this.state.serverUrl + `/api/${ state.serverModule }/change-credentials`,
                { name, login, password },
                { headers: { 'authorization': $cookies.get('auth_token') }})
        
            return response.data
        },
    },
    namespaced: true
}
