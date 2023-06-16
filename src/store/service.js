import { get, post, put } from 'axios'

export const service = {
	state: () => ({
		assignments: [],
		loading: false,
		serverModuleName: 'meter-service'
	}),
	getters: {
		getAssignments(state) {
			return state.assignments
		},
	},
	mutations: {
		setAssignments(state, assignments) {
			state.assignments = assignments
		},
		setLoading(state, bool) {
			state.loading = bool
		}
	},
	actions: {
		async fetchAssignments({ state, commit }) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignments`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				console.log(response.data)
				commit('setAssignments', response.data)
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchAssignmentEvents({ state, commit }, id) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignment-events/${ id }`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},

		async acceptAssignment({ state, commit }, id) {
			try {
				commit('setLoading', true)
				const response = await put(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignment-accept/${ id }`,
					{},
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				console.log(response.data)
				const [ assignment ] = response.data
				return assignment
			} finally {
				commit('setLoading', false)
			}
		},
	},
	namespaced: true
}