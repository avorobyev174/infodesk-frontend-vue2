<script>
	import { mapActions, mapGetters } from "vuex"

	export default {
		name: "DictionaryMixin",
		computed: {
			...mapGetters({
				assignmentEventTypes: 'getAssignmentEventTypes',
				assignmentStatuses: 'getAssignmentStatuses',
				assignmentCloseReasonTypes: 'getAssignmentCloseReasonTypes',
				meterTypes: 'getMeterTypes',
				ipAddresses: 'getIpAddresses',
				simStatuses: 'getSimStatuses',
				accounts: 'getAccounts',
                isLogin: 'getIsLogin'
            })
		},
        inject: [ 'showNotificationRequestErrorWithCustomText' ],
        async mounted() {
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
            ...mapActions([ 'fetchDictionaries' ]),

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
				const mType = this.meterTypes.find((type) => meterType === type.value)
				return mType ? mType.title : meterType
			},

			getIpAddressTitle(ipAddress) {
				const addr = this.ipAddresses.find((address) => ipAddress === address.value)
				return addr ? addr.title : ipAddress
			},

			getSimStatusTitle(meterSimStatus) {
				const status = this.simStatuses.find((status) => meterSimStatus === status.value)
				return status ? status.title : meterSimStatus
			},
		}
	}
</script>
