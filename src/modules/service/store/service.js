import { get, post, put } from 'axios'

export const service = {
	state: () => ({
		assignments: [],
		loading: false,
		serverModuleName: 'meter-service',
		assignmentsLogs: [],
		assignmentCloseReasonTypes: [],
		assignmentEventTypes: [],
	}),
	getters: {
		getAssignments(state) {
			return state.assignments
		},
		
		getAssignmentsLogs(state) {
			return state.assignmentsLogs
		},
	},
	mutations: {
		setAssignments(state, assignments) {
			state.assignments = assignments
		},
		
		setAssignmentsLogs(state, assignmentsLogs) {
			state.assignmentsLogs = assignmentsLogs
		},
		
		setLoading(state, bool) {
			state.loading = bool
		}
	},
	actions: {
		async fetchAssignments({ state, commit }, options) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignments`,
					{ options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const { assignments, totalAssignmentsCount } = response.data
				commit('setAssignments', assignments)
				return totalAssignmentsCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async assignmentsFilter({ state, commit }, { filters, options }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/filter`,
					{ filters, options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				const { assignments, totalAssignmentsCount } = response.data
				commit('setAssignments', assignments)
				return totalAssignmentsCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchAssignmentsLogs({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/assignments-logs`,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			const assignmentsLogs = response.data.map((log) => ({
				...log,
				data: JSON.parse(log.data)
			}))
	
			commit('setAssignmentsLogs', assignmentsLogs)
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
		
		async addAssignment({ state, commit }, { type, serialNumber }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/add-assignment`,
					{ type, serialNumber },
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
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/add-action-assignment-event/${ assignmentId }`,
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
					this.state.serverUrl + `/api/${ this.state.service.serverModuleName }/delete-action-assignment-event/${ eventId }`,
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