import { get, post } from 'axios'

export const repair = {
	state: () => ({
		meters: [],
		isMetersLoading: false,
		serverModuleName: 'meter-repair'
	}),
	getters: {
		getMeters(state) {
			return state.meters
		},
	},
	mutations: {
		setMeters(state, meters) {
			state.meters = meters;
		},
		setLoading(state, bool) {
			state.isMetersLoading = bool
		}
	},
	actions: {
		async fetchMeters({ state, commit }) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ this.state.repair.serverModuleName }/meters`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				commit('setMeters', response.data)
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async setProgrammingValue({ state, commit }, { id, value }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.repair.serverModuleName }/set-prog-value`,
					{ id, value },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
					
				return response.data[0]
			} finally {
				commit('setLoading', false)
			}
		},
	},
	namespaced: true
}