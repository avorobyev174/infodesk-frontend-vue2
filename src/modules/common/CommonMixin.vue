<template>
    
</template>

<script>
	import { mapGetters } from "vuex"

	export default {
		name: "CommonMixin",
		computed: {
			...mapGetters({
				accounts: 'getAccounts'
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

			getAccountFullName(accountId) {
				const account = this.accounts.find((account) => account.id === accountId)
                if (account) {
                	const [ secondName, firstName, middleName ] = account.full_name.split(' ')
                    return `${ secondName } ${ firstName[0] }. ${ middleName[0] }.`
                }
                return accountId
			},
		}
	}
</script>

<style scoped>

</style>