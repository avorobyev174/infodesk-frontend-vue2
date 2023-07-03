<<script>
	import { mapGetters } from "vuex"

	export default {
		name: "RegistrationMixin",
		computed: {
			...mapGetters({
				phases: 'registration/getPhases',
				status: 'registration/getStatus',
				smsStatus: 'registration/getSmsStatus',
				ipAddresses: 'registration/getIpAddress',
			})
		},
		methods: {
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

			getSmsColorByStatus(smsStatus) {
				const smsSt = this.smsStatus.find((status) => smsStatus === status.value)
				return smsSt ? smsSt.color : smsStatus
			},

			getSmsTitleBySmsStatus(smsStatus) {
				const smsSt = this.smsStatus.find((status) => smsStatus === status.value)
				return smsSt ? smsSt.title : smsStatus
			},

			getMeterTypeTitle(meterType) {
				const mType = this.types.find((type) => meterType === type.value)
				return mType ? mType.text : meterType
			},

			getStatusTitle(meterStatus) {
				const status = this.status.find((status) => meterStatus === status.value)
				return status ? status.text : meterStatus
			},

			getPhaseTitle(meterPhase) {
				const mPhase = this.phases.find((phase) => meterPhase === phase.value)
				return mPhase ? mPhase.text : meterPhase
			},

			getIpAddressTitle(ipAddress) {
				const isAddr = this.ipAddresses.find((address) => ipAddress === address.value)
				return isAddr ? isAddr.text : ipAddress
			},
		}
	}
</script>
