import { get, post } from 'axios'

export const repair = {
	state: () => ({
		meters: [],
		loading: false,
		serverModule: 'meter-repair'
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
		setLoading(state, loading) {
			state.loading = loading
		}
	},
	actions: {
		async fetchMeters({ state, commit }) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ state.serverModule }/meters`,
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
					this.state.serverUrl + `/api/${ state.serverModule }/set-prog-value`,
					{ id, value },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
					
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},
	},
	namespaced: true
}