import { get, post } from "axios"

export const storage = {
	state: () => ({
		meters: [],
		searchMetersView: [],
		meterLoading: false,
		logLoading: false,
		serverModuleName: 'meter-storage',
		meterTypes: [],
		meterTypesInRepair: [],
		materialTypes: [],
		employees: [],
		storageEmployees: [],
		logs: [],
		locations: [
			{ text: 'Склад', value: 0 },
			{ text: 'Ремонт(УИТ)', value: 1 },
			{ text: 'Проверка(УИТ)', value: 2 },
			{ text: 'Ремонт(завод)', value: 3 },
			{ text: 'Монтаж', value: 4 },
			{ text: 'Списание', value: 5 },
			{ text: 'Поверка', value: 6 },
			/*{ text: 'Объект', value: 7 },*/
			{ text: 'Окно выдачи потребителю', value: 8 },
			{ text: 'Программирование(УИТ)', value: 9 },
		],
		operations: [
			{ text: 'Регистрация(без с.н.)', value: 0, notAcceptOrIssueOperation: true },
			{ text: 'Выдача в ремонт(УИТ)', value: 1, routerOperation: true },
			{ text: 'Выдача на проверку(УИТ)', value: 2 },
			{ text: 'Выдача на ремонт(завод)', value: 3, routerOperation: true },
			{ text: 'Выдача на монтаж', value: 4, routerOperation: true },
			{ text: 'Списание', value: 5 },
			{ text: 'Выдача на поверку', value: 6 },
			{ text: 'Регистрация', value: 7, notAcceptOrIssueOperation: true  },
			{ text: 'Редактирование', value: 8, notAcceptOrIssueOperation: true },
			{ text: 'Прием на склад', value: 9 },
			{ text: 'Установка на объект', value: 10, notAcceptOrIssueOperation: true  },
			{ text: 'Выдача потребителю', value: 11 },
			{ text: 'Выдача на программирование', value: 12 }
		],
		conditions: [
			{ text: 'Новый', value: 0},
			{ text: 'Б/у', value: 1}
		],
		intervals: [
			{ text: '10', value: 10 },
			{ text: '16', value: 16 }
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
		],
		options: [],
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
		getSearchMetersView(state) {
			return state.searchMetersView
		},
		getMeterTypes(state) {
			return state.meterTypes
		},
		getMaterialTypes(state) {
			return state.materialTypes
		},
		getMeterRepairTypes(state) {
			return state.meterTypesInRepair
		},
		getAccuracyClasses(state) {
			return state.accuracyClasses
		},
		getConditions(state) {
			return state.conditions
		},
		getIntervals(state) {
			return state.intervals
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
		getStorageEmployees(state) {
			return state.storageEmployees
		},
		getLogs(state) {
			return state.logs
		},
		getLVStates(state) {
			return state.lvStates
		},
		getOptions(state) {
			return state.options
		},
	},
	mutations: {
		setMeters(state, meters) {
			state.meters = meters
		},
		setSearchMetersView(state, meters) {
			state.searchMetersView = meters
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
		setMeterTypesInRepair(state, meterTypesInRepair) {
			state.meterTypesInRepair = meterTypesInRepair
		},
		setMaterialTypes(state, materialTypes) {
			state.materialTypes = materialTypes
		},
		setEmployees(state, employees) {
			state.employees = employees
		},
		setStorageEmployees(state, employees) {
			state.storageEmployees = employees
		},
		setLogs(state, logs) {
			state.logs = logs
		},
		setOptions(state, options) {
			state.options = options
		}
	},
	actions: {
		async fetchMeters({ state, commit }) {
			try {
				commit('setMeterLoading', true)
				const response = await get(
					this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/meters`,
					{ headers: {'authorization': $cookies.get('auth_token')} })
				
				commit('setMeters', response.data)
				console.log(response.data)
				return response.data
			} finally {
				commit('setMeterLoading', false)
			}
		},
		
		async fetchMetersPerPage({ state, commit }, options) {
			try {
				commit('setMeterLoading', true)
				const response = await post(
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
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/meter-types`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			commit('setMeterTypes',
				response
					.data
					.map(type => { return { title: type.TYPE_NAME, index: type.TYPE_INDEX, option: type.MNF_ID } })
					.sort((a, b) => a.title > b.title ? 1 : -1))
		},
		
		async fetchMaterialsTypes({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/materials-types`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			commit('setMaterialTypes', response.data.map(type => { return { id: type.ID, title: type.ITEM } }))
		},
		
		async fetchEmployees({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/employees`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			commit('setEmployees', response.data)
		},
		
		async fetchStorageEmployees({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/storage-employees`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			const employees = response.data.map(emp => {
				const nameArr = emp.name.trim().split(' ')
				const name = `${ nameArr[0] } ${ nameArr[1][0] }. ${ nameArr[2][0] }.`
				return { staffId: emp.staff_id, name, card: emp.card }
			}).sort((a, b) => a.name > b.name ? 1 : -1)
			
			commit('setStorageEmployees', employees)
		},
		
		async meterFilter({ state, commit }, { filters, options }) {
			try {
				commit('setMeterLoading', true)
				const response = await post(
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
				const response = await get(
					this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/logs/${ GUID }`,
					{ headers: {'authorization': $cookies.get('auth_token')} })
					
				commit('setLogs', response.data)
			} finally {
				commit('setLogLoading', false)
			}
		},
		
		async checkMeterInDB({ state, commit }, { serialNumber, type }) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/check-meter`,
				{ serialNumber, type },
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			return response.data
		},
		
		async checkMeterInRepairDB({ state, commit }, { serialNumber, type }) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/check-meter-in-repair`,
				{ serialNumber, type },
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			return response.data
		},
		
		async registration({ state, commit },
		                   {
		                   	   meters,
			                   accuracyClass,
			                   condition,
			                   issuingPersonStaffId,
			                   acceptedPersonStaffId,
			                   interval,
			                   owner,
			                   calibration,
			                   passportNumber,
			                   comment,
			                   isRouter
		                   }) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/registration`,
				{
					meters,
					accuracyClass,
					condition,
					acceptedPersonStaffId,
					issuingPersonStaffId,
					interval,
					owner,
					calibration,
					passportNumber,
					comment,
					isRouter
				},
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async editMeter({ state, commit },
		                   {
			                   type,
			                   editorStaffId,
			                   serialNumber,
			                   accuracyClass,
			                   condition,
			                   interval,
			                   owner,
			                   calibration,
			                   comment,
			                   passportNumber,
			                   guid,
			                   updateField
		                   }) {
			
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/edit`,
				{
					type,
					serialNumber,
					accuracyClass,
					condition,
					editorStaffId,
					interval,
					owner,
					calibration,
					passportNumber,
					comment,
					guid,
					updateField
				},
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async createAcceptOrIssueLog({ state, commit },
		                {
		                	meters,
			                operationType,
			                newLocation,
			                issuingPersonStaffId,
			                acceptedPersonStaffId,
			                comment
		                }) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/create-accept-or-issue-log`,
				{
					meters,
					operationType,
					newLocation,
					issuingPersonStaffId,
					acceptedPersonStaffId,
					comment
				},
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async fetchParseOptions({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/parse-options`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			commit('setOptions', response.data)
		},
		
		parseSerialNumber({ state, commit }, { parseOption, serialNumber }) {
			const option = this.state.storage.options.find(option => parseOption === option.ID)
			if (option && option.PARSE_OPTION) {
				return option.PARSE_OPTION.split(',').reduce((sum, cur) => {
					return sum += serialNumber[cur]
				}, '')
			} else {
				return serialNumber
			}
		},
		
		async deleteMeter({ state, commit }, { guid, editorStaffId, meter }) {
			try {
				commit('setMeterLoading', true)
				const response = await post(
					this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/delete`,
					{ guid, editorStaffId, meter },
					{ headers: { 'authorization': $cookies.get('auth_token') } })
				
				return response.data
			} finally {
				commit('setMeterLoading', false)
			}
		},
		
		async getMeterTypesInRepair({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/get-meter-types-in-repair`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			const meterTypesInRepair = response.data.map(type => type.METER_TYPE)
			commit('setMeterTypesInRepair', meterTypesInRepair)
		},
		
		async getAllAvailableMetersFromRepair({ state, commit }) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/get-available-meters-from-repair/`,
				{ headers: {'authorization': $cookies.get('auth_token')} })
			
			return response.data
			
		},
		
		async getAllAvailableMetersByTypeFromRepair({ state, commit }, meterType) {
			const response = await get(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/get-available-meters-from-repair/` + meterType,
				{ headers: {'authorization': $cookies.get('auth_token')} })
		
			return response.data
		},
		
		async insertMeterStorageMaterials({ state, commit }, { meters, materials, updateStr }) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/insert-meter-materials`,
				{ meters, materials, updateStr },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async insertMaterialToStorage({ state, commit }, materials) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/insert-material-to-storage`,
				{ materials },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
		
		async insertMeterWorkStatus({ state, commit }, { meters, isWorkable, comment, updateStr }) {
			const response = await post(
				this.state.serverUrl + `/api/${ this.state.storage.serverModuleName }/insert-meter-work-status`,
				{ meters, isWorkable, comment, updateStr },
				{ headers: { 'authorization': $cookies.get('auth_token') } })
			
			return response.data
		},
	},
	namespaced: true
}