import { get, post, put } from 'axios'
import { isJsonValid } from "../../Utils"

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
		
		setLoading(state, loading) {
			state.loading = loading
		}
	},
	actions: {
		async fetchAssignments({ state, commit }, options) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModuleName }/assignments`,
					{ options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const { assignments, totalAssignmentsCount } = response.data
				commit('setAssignments', assignments)
				return totalAssignmentsCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchAllAssignments({ state, commit }, isCommit) {
			const response = await get(
				this.state.serverUrl + `/api/${ state.serverModuleName }/all-assignments`,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			const assignments = response.data
			if (isCommit) {
				commit('setAssignments', assignments)
			}
			return assignments
		},
		
		async assignmentsFilter({ state, commit }, { filters, options }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModuleName }/filter`,
					{ filters, options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				const { assignments, totalAssignmentsCount } = response.data
				commit('setAssignments', assignments)
				return totalAssignmentsCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async getAssignmentsAndEventsInWorkByUser({ state, commit }) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ state.serverModuleName }/assignments-and-events-by-user-in-work`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const assignments = response.data
				return assignments
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchAssignmentsLogs({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ state.serverModuleName }/assignments-logs`,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			const logs = response.data
			const assignmentsLogs = []
			
			for (const log of logs) {
				if (isJsonValid(log.data)) {
					assignmentsLogs.push({ ...log, data: JSON.parse(log.data) })
				}
			}
			commit('setAssignmentsLogs', assignmentsLogs)
		},
		
		async fetchAssignmentEvents({ state, commit }, assignmentId) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ state.serverModuleName }/assignment-events/${ assignmentId }`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},

		async acceptOrDeclineAssignment({ state, commit }, { id, isDecline }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModuleName }/assignment-accept-decline/${ id }`,
					{ isDecline },
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
					this.state.serverUrl + `/api/${ state.serverModuleName }/add-assignment`,
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
					this.state.serverUrl + `/api/${ state.serverModuleName }/add-action-assignment-event/${ assignmentId }`,
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
					this.state.serverUrl + `/api/${ state.serverModuleName }/change-action-event/${ actionEventId }`,
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
					this.state.serverUrl + `/api/${ state.serverModuleName }/delete-action-assignment-event/${ eventId }`,
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
					this.state.serverUrl + `/api/${ state.serverModuleName }/close-assignment/${ assignmentId }`,
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
					this.state.serverUrl + `/api/${ state.serverModuleName }/save-assignment-contacts/${ assignmentId }`,
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