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

				commit('setAssignments', response.data)
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchAssignmentEvents({ state, commit }, assignmentId) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignment-events/${ assignmentId }`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},

		async acceptAssignment({ state, commit }, assignmentId) {
			try {
				commit('setLoading', true)
				const response = await put(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignment-accept/${ assignmentId }`,
					{},
					{ headers: { 'authorization': $cookies.get('auth_token') } })

				const [ assignment ] = response.data
				return assignment
			} finally {
				commit('setLoading', false)
			}
		},
		
		async addAssignmentActionEvent({ state, commit }, { assignmentId, description }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/add-action-assignment/${ assignmentId }`,
					{ description },
					{ headers: { 'authorization': $cookies.get('auth_token') } })

				const [ assignmentEvent ] = response.data
				return assignmentEvent
			} finally {
				commit('setLoading', false)
			}
		},
		
		async changeAssignmentActionEvent({ state, commit }, { actionEventId, description }) {
			try {
				commit('setLoading', true)
				const response = await put(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/change-action-event/${ actionEventId }`,
					{ description },
					{ headers: { 'authorization': $cookies.get('auth_token') } })

				const [ assignmentEvent ] = response.data
				return assignmentEvent
			} finally {
				commit('setLoading', false)
			}
		},
		
		async removeActionEvent({ state, commit }, eventId) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/delete-action-assignment/${ eventId }`,
					{},
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const [ assignmentEvent ] = response.data
				return assignmentEvent
			} finally {
				commit('setLoading', false)
			}
		},
		
		async closeAssignment({ state, commit }, { assignmentId, closeReason, description }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/close-assignment/${ assignmentId }`,
					{ closeReason, description },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async saveAssignmentContacts({ state, commit }, { assignmentId, contacts }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/save-assignment-contacts/${ assignmentId }`,
					{ contacts },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const [ assignment ] = response.data
				return assignment
			} finally {
				commit('setLoading', false)
			}
		},
		
	},
	namespaced: true
}