import axios from "axios";

export const profile = {
    state: () => ({
        serverModule: 'profile'
    }),
    actions: {
        async getProfileData({ state }) {
            const response = await axios.get(
                this.state.serverUrl + `/api/${ state.serverModule }/get-account-info`,
                { headers: { 'authorization': $cookies.get('auth_token') } })
            const [ profileData ] = response.data
            return profileData
        },
        
        async changePassword({ state }, { oldPassword, newPassword }) {
            const response = await axios.post(
                this.state.serverUrl + `/api/${ state.serverModule}/change-password`,
                { oldPassword , newPassword },
                { headers: { 'authorization': $cookies.get('auth_token') } })
            return response.data
        },
    },
    namespaced: true
}
