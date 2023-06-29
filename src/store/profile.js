import axios from "axios";

export const profile = {
    state: () => ({
        serverModuleName: 'profile'
    }),
    actions: {
        async getProfileData({ state, commit }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ this.state.profile.serverModuleName }/get-info`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
            const [ profileData ] = response.data
            return profileData
        },
        async changePassword({ state, commit }, { oldPassword, newPassword }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ this.state.profile.serverModuleName }/change-password`,
                { oldPassword , newPassword },
                { headers: { 'authorization': $cookies.get('auth_token') } })
            return response.data
        },
    },
    namespaced: true
}
