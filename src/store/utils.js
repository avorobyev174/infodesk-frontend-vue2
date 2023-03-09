import axios from "axios";

export const utils = {
    state: () => ({
        serverModuleName: 'utils'
    }),
    actions: {
        async saveSettings({state, commit}, { settingsName, settingsVal }) {
            const response = await axios.post(
                this.state.serverUrl + '/api/save-settings',
                {
                    module: 'common',
                    settings: settingsName,
                    value: typeof settingsVal === 'string' ? settingsVal : settingsVal.toString()
                },
                { headers: { 'authorization': $cookies.get('auth_token') }})

            return response.data
        },
    },
    namespaced: true
}
