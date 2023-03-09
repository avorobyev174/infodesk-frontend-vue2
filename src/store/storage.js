import axios from "axios"

export const storage = {
	state: () => ({
		meters: [],
		meterLoading: false,
		logLoading: false,
		serverModuleName: 'meter-storage',
		meterTypes: [],
		employees: [],
		logs: [],
		locations: [
			{ text: 'Склад', value: 0 },
			{ text: 'Ремонт(УИТ)', value: 1 },
			{ text: 'Проверка(УИТ)', value: 2 },
			{ text: 'Ремонт(завод)', value: 3 },
			{ text: 'Монтаж', value: 4 },
			{ text: 'Списан', value: 5 },
			{ text: 'Поверка', value: 6 },
			{ text: 'Объект', value: 7 },
			{ text: 'Окно выдачи потребителю', value: 8 },
			{ text: 'Программирование(УИТ)', value: 9 },
		],
		operations: [
			{ text: 'Регистрация(без с.н.)', value: 0 },
			{ text: 'Выдача в ремонт(УИТ)', value: 1 },
			{ text: 'Выдача на проверку(УИТ)', value: 2 },
			{ text: 'Выдача на ремонт(завод)', value: 3 },
			{ text: 'Выдача на монтаж', value: 4 },
			{ text: 'Списание', value: 5 },
			{ text: 'Выдача на поверку', value: 6 },
			{ text: 'Регистрация', value: 7 },
			{ text: 'Редактирование', value: 8},
			{ text: 'Прием на склад', value: 9 },
			{ text: 'Установка на объект', value: 10 },
			{ text: 'Выдача потребителю', value: 11 },
			{ text: 'Выдача на программирование', value: 12 }
		],
		conditions: [
			{ text: 'Новый', value: 0},
			{ text: 'Б/у', value: 1}
		],
		customerTypes: [
			{ text: 'Физ. лицо', value: 0 },
			{ text: 'Юр. лицо', value: 1 }
		],
		accuracyClasses: [
			{ text: '0,5', value: 0 },
			{ text: '1', value: 1 }
		],
		owners: [
			{ text: 'МЭК', value: 0 },
			{ text: 'Потребитель', value: 1 }
		],
		lvStates: [
			{ text: 'отсутствует',  value: 0 },
			{ text: 'не работает', value: 1 },
			{ text: 'работает', value: 2 }
		]
	}),
	getters: {
		getMeters(state) {
			return state.meters
		},
		getMeterTypes(state) {
			return state.meterTypes
		},
		getAccuracyClasses(state) {
			return state.accuracyClasses
		},
		getCustomerTypes(state) {
			return state.customerTypes
		},
		getConditions(state) {
			return state.conditions
		},
		getOperations(state) {
			return state.operations
		},
		getLocations(state) {
			return state.locations
		},
		getOwners(state) {
			return state.owners
		},
		getEmployees(state) {
			return state.employees
		},
		getLogs(state) {
			return state.logs
		},
		getLVStates(state) {
			return state.lvStates
		},
	},
	mutations: {
		setMeters(state, meters) {
			state.meters = meters
		},
		setMeterLoading(state, bool) {
			state.meterLoading = bool
		},
		setLogLoading(state, bool) {
			state.logLoading = bool
		},
		setMeterTypes(state, meterTypes) {
			state.meterTypes = meterTypes
		},
		setEmployees(state, employees) {
			state.employees = employees
		},
		setLogs(state, logs) {
			state.logs = logs
		},
	},
	actions: {
		async fetchMeters({ state, commit }) {
			console.log('fetchMeters')
			try {
				commit('setMeterLoading', true)
				const response = await axios.get(
					this.state.serverUrl + `/api/${this.state.storage.serverModuleName}/meters`,
					{ headers: {'authorization': $cookies.get('auth_token')} })
				
				commit('setMeters', response.data)
				return response.data
			} finally {
				commit('setMeterLoading', false)
			}
		},
		
		async fetchMetersPerPage({ state, commit }, options) {
			try {
				commit('setMeterLoading', true)
				const response = await axios.post(
					this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/meters`,
					{ options },
					{ headers: {'authorization': $cookies.get('auth_token')} })
				
				commit('setMeters', response.data.rows)
				//console.log(response.data)
				return response.data.total
			} finally {
				commit('setMeterLoading', false)
			}
		},
		
		async fetchMeterTypes({ state, commit }) {
			const response = await axios.get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/meter-types`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
				
			commit('setMeterTypes', response.data)
		},
		
		async fetchEmployees({ state, commit }) {
			const response = await axios.get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/employees`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			commit('setEmployees', response.data)
		},
		
		async filter({ state, commit }, { filters, options }) {
			try {
				commit('setMeterLoading', true)
				const response = await axios.post(
					this.state.serverUrl +
					`/api/${ this.state.storage.serverModuleName }/filter`,
					{ filters, options },
					{ headers: {'authorization': $cookies.get('auth_token')} })
				
				commit('setMeters', response.data.rows)
				return response.data.total
			} finally {
				commit('setMeterLoading', false)
			}
		},
		
		async fetchLogs({ state, commit }, GUID) {
			try {
				commit('setLogLoading', true)
				const response = await axios.get(
					this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/logs/${ GUID }`,
					{ headers: {'authorization': $cookies.get('auth_token')} })
					
				commit('setLogs', response.data)
			} finally {
				commit('setLogLoading', false)
			}
		},
	},
	namespaced: true
}