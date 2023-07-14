<template>
    
</template>

<script>
	import { mapGetters } from "vuex"

	export default {
		name: "StorageMixin",
        computed: {
			...mapGetters({
				owners: 'storage/getOwners',
				storageEmployees: 'storage/getStorageEmployees',
				types: 'storage/getMeterTypes',
				accuracyClasses: 'storage/getAccuracyClasses',
				conditions: 'storage/getConditions',
				locations: 'storage/getLocations',
				materialTypes: 'storage/getMaterialTypes',
				operations: 'storage/getOperations',
				lvStates: 'storage/getLVStates',
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

	        getMeterTypeTitle(meterType) {
		        const type = this.types.find(type => parseInt(meterType) === type.index)
		        return type ? type.title : meterType
	        },

	        getMaterialTypeTitle(materialType) {
		        const type = this.materialTypes.find(type => parseInt(materialType) === type.id)
		        return type ? type.title : materialType
	        },

	        getAccuracyClassTitle(accuracyClass) {
		        const accClass = this.accuracyClasses.find(accClass => accuracyClass === accClass.value)
		        return accClass ? accClass.text : accuracyClass
	        },

	        getConditionTitle(condition) {
		        const cond = this.conditions.find(cond => condition === cond.value)
		        return cond ? cond.text : condition
	        },

	        getLocationTitle(location) {
		        const loc = this.locations.find(loc => location === loc.value)
		        return loc ? loc.text : location
	        },

	        getOwnerTitle(owner) {
		        const own =  this.owners.find(own => owner === own.value)
		        return own ? own.text : owner
	        },

	        getEmployeeTitleByStaffId(employeeStaffId) {
		        if (employeeStaffId === 0) {
			        return 'Отсутствует'
		        }
		        const emp = this.storageEmployees.find(emp => employeeStaffId === emp.staffId)
		        return emp ?  emp.name : employeeStaffId
	        },

	        getEmployeeStaffIdByCard(employeeCard) {
		        if (!employeeCard) {
			        return 'Неизвестный сотрудник'
		        }
		        const emp = this.storageEmployees.find(emp => parseInt(employeeCard) === emp.card)
		        return emp ? emp.staffId : 'Неизвестный сотрудник'
	        },

	        getEmployeeCardByStaffId(staffId) {
		        if (!staffId) {
			        return 'Неизвестный сотрудник'
		        }
		        const emp = this.storageEmployees.find(emp => staffId === emp.staffId)
		        return emp ? emp.card : 'Неизвестный сотрудник'
	        },

	        getEmployeeTitleByCard(employeeCard) {
		        if (!employeeCard) {
			        return 'Неизвестный сотрудник'
		        }
		        const emp = this.storageEmployees.find(emp => parseInt(employeeCard) === emp.card)
		        return emp ? emp.name : 'Неизвестный сотрудник'
	        },

	        getLVStateTitle(lvState) {
		        const state = this.lvStates.find((state) => lvState === state.value)
		        return state ? state.text : lvState
	        },

	        getOperationTitle(operation) {
		        const oper = this.operations.find((oper) => operation === oper.value)
		        return oper ? oper.text : operation
	        },
        }
	}
</script>

<style scoped>

</style>