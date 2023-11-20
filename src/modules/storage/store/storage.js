import { get, post } from "axios"
import { Location } from "../const";

export const storage = {
	state: () => ({
		meters: [],
		loading: false,
		serverModule: 'meter-storage',
		meterTypesInRepair: [],
		storageTypes: [
			{ title: 'Склад', value: Location.STORAGE },
			{ title: 'Склад (ВХ)', value: Location.STORAGE_TEMPORARY }
		],
		intervals: [
			{ title: '10', value: 10 },
			{ title: '16', value: 16 }
		],
		parseOptionsTODO: [
			{ 1: { firstChar: 0, lastChar: 7 } },
			{ 'Меркурий': { firstChar: 3, lastChar: 10 } },
			{ 'Нева': { firstChar: 0, lastChar: { firstChar: 4, lastChar: 12 } } },
			{ 'АГАТ': { firstChar: 0, lastChar: 5 } },
			{ 'Маршрутизатор': { firstChar: 0, lastChar: 12 } },
			{ 'ЦЭ': { firstChar: 0, lastChar: 6 } },
			{ 'СОИ': { firstChar: 0, lastChar: 14 } },
			{ 'СО': { firstChar: 0, lastChar: 6 } },
			{ 'ЕМ': { firstChar: 0, lastChar: 4 } },
			{ 'МИР': { firstChar: 0, lastChar: 13 } },
			{ 'ЭНЕРГОМЕРА': { firstChar: 1, lastChar: 14 } },
			{ 'ЭНЕРГОМЕРА2': { firstChar: 0, lastChar: 15 } },
			{ 'МИРТЕК': { firstChar: 0, lastChar: 12 } },
		]
	}),
	getters: {
		getMeters(state) {
			return state.meters
		},
	
		getStorageTypes(state) {
			return state.storageTypes
		},
		
		getIntervals(state) {
			return state.intervals
		},
		
		getMeterRepairTypes(state) {
			return state.meterTypesInRepair
		},
	},
	mutations: {
		setMeters(state, meters) {
			state.meters = meters
		},
		
		setLoading(state, loading) {
			state.loading = loading
		},
		
		setMeterTypesInRepair(state, meterTypesInRepair) {
			state.meterTypesInRepair = meterTypesInRepair
		},
	},
	actions: {
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
		
		async metersFilter({ state, commit }, { filters, options }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl +
					`/api/${ state.serverModule }/filter`,
					{ filters, options },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				const { meters, totalMetersCount } = response.data
				commit('setMeters', meters)
				return totalMetersCount
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchEvents({ state, commit }, guid) {
			try {
				commit('setLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ state.serverModule }/logs/${ guid }`,
					{ headers: { 'authorization': $cookies.get('auth_token') } })
					
				return  response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async fetchMeterRepairData({ state }, logIds) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/get-meter-repair-data`,
				{ logIds },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return  response.data
		},

		async checkMeterInDB({ state }, { serialNumber, type }) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/check-meter`,
				{ serialNumber, type },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async checkMeterInRepairDB({ state }, { serialNumber, type }) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/check-meter-in-repair`,
				{ serialNumber, type },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async registration({ state }, metersData) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/registration`,
				metersData,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async editMeter({ state }, meterData) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/edit`,
				meterData,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async createAcceptOrIssueLog({ state }, metersData) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/accept-or-issue`,
				metersData,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async deleteMeter({ state, commit }, { guid, editorStaffId, meter }) {
			try {
				commit('setLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ state.serverModule }/delete`,
					{ guid, editorStaffId, meter },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				return response.data
			} finally {
				commit('setLoading', false)
			}
		},
		
		async getMeterTypesInRepair({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ state.serverModule }/get-meter-types-in-repair`,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			const meterTypesInRepair = response.data.map(({ meter_type }) => meter_type)
			commit('setMeterTypesInRepair', meterTypesInRepair)
		},
		
		async getAllAvailableMetersFromRepair({ state }) {
			const response = await get(
				this.state.serverUrl + `/api/${ state.serverModule }/get-available-meters-from-repair/`,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
			
		},
		
		async getAllAvailableMetersByTypeFromRepair({ state }, meterType) {
			const response = await get(
				this.state.serverUrl + `/api/${ state.serverModule }/get-available-meters-from-repair/` + meterType,
				{ headers: { 'authorization': $cookies.get('auth_token') } })
		
			return response.data
		},
		
		async insertMeterStorageMaterials({ state }, { meters, materials }) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/insert-meter-materials`,
				{ meters, materials },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async insertMaterialToStorage({ state }, materials) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/insert-material-to-storage`,
				{ materials },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async insertMeterWorkStatus({ state }, { meters, isWorkable, comment }) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/insert-meter-work-status`,
				{ meters, isWorkable, comment },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async editLogComment({ state }, { comment, logId }) {
			const response = await post(
				this.state.serverUrl + `/api/${ state.serverModule }/edit-log-comment`,
				{ comment, logId },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
	},
	namespaced: true
}