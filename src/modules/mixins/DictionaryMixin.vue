<script>
	import { mapActions, mapGetters } from "vuex"

	export default {
		name: "DictionaryMixin",
		computed: {
			...mapGetters({
				assignmentEventTypes: 'dictionary/getAssignmentEventTypes',
				assignmentStatuses: 'dictionary/getAssignmentStatuses',
				assignmentCloseReasonTypes: 'dictionary/getAssignmentCloseReasonTypes',
				meterTypes: 'dictionary/getMeterTypes',
				meterProgrammingTypes: 'dictionary/getMeterProgrammingTypes',
				ipAddresses: 'dictionary/getIpAddresses',
				simStatuses: 'dictionary/getSimStatuses',
				accounts: 'dictionary/getAccounts',
				accuracy: 'dictionary/getAccuracy',
				conditions: 'dictionary/getConditions',
				locations: 'dictionary/getLocations',
				operations: 'dictionary/getOperations',
				lvStates: 'dictionary/getLvStates',
				owners: 'dictionary/getOwners',
				materialTypes: 'dictionary/getMaterialTypes',
				storageEmployees: 'dictionary/getStorageEmployees',
				phases: 'dictionary/getPhases',
				smsStatus: 'dictionary/getSmsStatuses',
                isLogin: 'getIsLogin',
            })
		},
        inject: [ 'showNotificationRequestErrorWithCustomText' ],
        async created() {
			if (!this.isLogin) {
				return
            }

	        try {
		        await this.fetchDictionaries()
	        } catch (e) {
		        this.showNotificationRequestErrorWithCustomText('Произошла ошибка при получении словарей', e)
	        }
        },
		methods: {
            ...mapActions('dictionary', [ 'fetchDictionaries' ]),

			formatDate(dateToFormat, withTime) {
				if (!dateToFormat) {
					return 'отсутствует'
				}

				const date = new Date(dateToFormat)
				let day = String(date.getDate())
				let month = String(date.getMonth() + 1)
				const year = date.getFullYear()

				day = day.length < 2 ? day.padStart(2, '0') : day
				month = month.length < 2 ? month.padStart(2, '0') : month

				if (withTime) {
					let hours = date.getHours()
					let minutes = date.getMinutes()
					let seconds = date.getSeconds()

					if (hours < 10) hours = '0' + hours
					if (minutes < 10) minutes = '0' + minutes
					if (seconds < 10) seconds = '0' + seconds

					return `${ day }.${ month }.${ year } ${ hours }:${ minutes }:${ seconds }`
				}

				return `${ day }.${ month }.${ year }`
			},

			formatDateIso(dateToFormat, withTime) {
				if (!dateToFormat) {
					return 'отсутствует'
				}

				const date = new Date(dateToFormat)
				let day = String(date.getDate())
				let month = String(date.getMonth() + 1)
				const year = date.getFullYear()

				day = day.length < 2 ? day.padStart(2, '0') : day
				month = month.length < 2 ? month.padStart(2, '0') : month

				if (withTime) {
					let hours = date.getHours()
					let minutes = date.getMinutes()
					let seconds = date.getSeconds()

					if (hours < 10) hours = '0' + hours
					if (minutes < 10) minutes = '0' + minutes
					if (seconds < 10) seconds = '0' + seconds

					return `${ year }-${ month }-${ day } ${ hours }:${ minutes }:${ seconds }`
				}

				return `${ year }-${ month }-${ day }`
			},

			getAccountFullName(accountId) {
				const account = this.accounts.find((account) => account.id === accountId)
                if (account) {
                	const [ secondName, firstName, middleName ] = account.name.split(' ')
                    return `${ secondName } ${ firstName[0] }. ${ middleName[0] }.`
                } else {
                	if (accountId === 0) {
                		return 'отсутствует'
                    }
                }
                return accountId
			},

			getAssignmentEventTypeTitle(value) {
				const assignmentEventType = this.assignmentEventTypes.find((eventType) => eventType.id === value)
                return assignmentEventType ? assignmentEventType.title : value
			},

			getAssignmentStatusTitle(value) {
				const assignmentStatus = this.assignmentStatuses.find((status) => status.value === value)
				return assignmentStatus ? assignmentStatus.title : value
			},

			getAssignmentEventCloseReasonTitle(value) {
				const assignmentCloseEventType = this.assignmentCloseReasonTypes.find((closeEventType) => closeEventType.id === value)
				return assignmentCloseEventType ? assignmentCloseEventType.title : value
			},

			getMeterTypeTitle(meterType) {
				const mType = this.meterTypes.find(({ value }) => meterType === value)
				return mType ? mType.title : meterType
			},

			getIpAddressTitle(ipAddress) {
				const addr = this.ipAddresses.find((address) => ipAddress === address.value)
				return addr ? addr.title : ipAddress
			},

			getSimStatusTitle(simStatus) {
				const status = this.simStatuses.find((status) => simStatus === status.value)
				return status ? status.title : simStatus
			},

			getMaterialTypeTitle(materialType) {
				const type = this.materialTypes.find(({ value }) => +materialType === value)
				return type ? type.title : materialType
			},

			getAccuracyClassTitle(accuracy) {
				const acc = this.accuracy.find(({ value }) => accuracy === value)
				return acc ? acc.title : accuracy
			},

			getConditionTitle(condition) {
				const cond = this.conditions.find(({ value }) => condition === value)
				return cond ? cond.title : condition
			},

			getLocationTitle(location) {
				const loc = this.locations.find(({ value }) => location === value)
				return loc ? loc.title : location
			},

			getOwnerTitle(owner) {
				const own =  this.owners.find(({ value })  => owner === value)
				return own ? own.title : owner
			},

			getLVStateTitle(lvState) {
				const state = this.lvStates.find(({ value }) => lvState === value)
				return state ? state.title : lvState
			},

			getOperationTitle(operation) {
				const oper = this.operations.find(({ value }) => operation === value)
				return oper ? oper.title : operation
			},

			getPhaseTitle(phase) {
				const mPhase = this.phases.find(({ value }) => phase === value)
				return mPhase ? mPhase.title : phase
			},

			getSmsColorByStatus(status) {
				const smsStatus = this.smsStatus.find(({ value }) => status === value)
				return smsStatus ? smsStatus.color : status
			},

			getSmsTitleByStatus(status) {
				const smsStatus = this.smsStatus.find(({ value }) => status === value)
				return smsStatus ? smsStatus.title : status
			},

			getEmployeeTitleByStaffId(staffId) {
				if (staffId === 0) {
					return 'отсутствует'
				}
				const emp = this.storageEmployees.find(({ staff_id }) => staffId === staff_id)
				return emp ? emp.name : staffId
			},

			getEmployeeStaffIdByCard(empCard) {
				if (!empCard) {
					return 'неизвестный сотрудник'
				}
				const emp = this.storageEmployees.find(({ card }) => +empCard === card)
				return emp ? emp.staff_id : 'неизвестный сотрудник'
			},

			getEmployeeCardByStaffId(staffId) {
				if (!staffId) {
					return 'неизвестный сотрудник'
				}
				const emp = this.storageEmployees.find(({ staff_id }) => staffId === staff_id)
				return emp ? emp.card : 'неизвестный сотрудник'
			},

			getEmployeeTitleByCard(empCard) {
				if (!empCard) {
					return 'неизвестный сотрудник'
				}
				const emp = this.storageEmployees.find(({ card }) => +empCard === card)
				return emp ? emp.name : 'неизвестный сотрудник'
			},
		}
	}
</script>
