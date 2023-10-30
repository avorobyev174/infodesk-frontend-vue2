import axios, { get, post, put } from 'axios'

export const objects = {
	state: () => ({
		objects: [],
		loading: false,
		serverModule: 'objects',
	}),
	getters: {
		getObjects(state) {
			return state.objects
		},
	},
	mutations: {
		setLoading(state, loading) {
			state.loading = loading
		},
		
		setObjects(state, objects) {
			state.objects = objects
		}
	},
	actions: {
		async fetchObjects({ state, commit }, objectType) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ state.serverModule }/${ objectType }`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const objects = response.data
				commit('setObjects', objects)
			} finally {
				commit('setLoading', false)
			}
		},
		
		async deleteObject({ state, commit }, objectId) {
			try {
				commit('setLoading', true)
				const response = await axios.delete(
					this.state.serverUrl + `/api/${ state.serverModule }/${ objectId }`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const [ objectData ] = response.data
				return objectData
			} finally {
				commit('setLoading', false)
			}
		},
		
		async editObject({ state, commit }, object) {
			try {
				commit('setLoading', true)
				const response = await put(
					this.state.serverUrl + `/api/${ state.serverModule }/${ object.id }`,
					{ object },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
	
				return  response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async addObject({ state, commit }, object) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModule }/add-object`,
					object,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const [ objectData ] = response.data
				return objectData
			} finally {
				commit('setLoading', false)
			}
		},
		
	},
	namespaced: true
}