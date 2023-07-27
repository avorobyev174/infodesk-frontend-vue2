import { get, post } from 'axios'

export const repair = {
	state: () => ({
		meters: [],
		loading: false,
		serverModule: 'repair',
		programmingValues: [
			{ title: 'Не перепрограммировано', value: 0 },
			{ title: 'Перепрограммировано', value: 1 },
			{ title: 'Загружено', value: 2 },
		],
	}),
	getters: {
		getMeters(state) {
			return state.meters
		},
		
		getProgrammingValues(state) {
			return state.programmingValues
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
		async fetchAllMeters({ state, commit }, isCommit) {
			const response = await get(
				this.state.serverUrl + `/api/${ state.serverModule }/all-meters`,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			const meters = response.data
			if (isCommit) {
				commit('setMeters', meters)
			}
			return meters
		},
		
		async fetchMeters({ state, commit }, options) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModule }/meters`,
					{ options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const { meters, totalMetersCount } = response.data
				commit('setMeters', meters)
				return totalMetersCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async repairFilter({ state, commit }, { filters, options }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModule }/filter`,
					{ filters, options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				const { meters, totalMetersCount } = response.data
				commit('setMeters', meters)
				return totalMetersCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async setProgrammingValue({ state, commit }, { id, value }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModule }/set-programming-value/`,
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