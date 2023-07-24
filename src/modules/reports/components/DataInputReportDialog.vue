<template>
    <dialog-with-data-slot
        :title="title"
        ref="DataInputDialog"
        @submit="submit"
        @close="clear"
    >
        <template v-slot:fields v-if="[ Report.PYRAMID_LOADED_BY_CUSTOMER_ADDRESS ].includes(id)">
            <v-select
                v-model="sort"
                label="Выборка по"
                :items="sortItems"
                :rules="requiredRules"
                item-text="title"
                item-value="value"
            />
        </template>
        <template v-slot:fields v-else-if="[ Report.NOT_ACTIVE_IN_PYRAMID ].includes(id)">
            <v-text-field
                v-model="days"
                label="Количество дней без ответа"
                type="number"
                hide-spin-buttons
                :rules="daysRules"
            />
        </template>
        <template v-slot:fields v-else-if="[ Report.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS ].includes(id)">
            <v-combobox
                :items="serviceCustomerAddresses"
                item-text="title"
                item-value="value"
                label="Адреса"
                v-model="customerAddress"
                :rules="requiredRules"
                outlined
            >
            </v-combobox>
        </template>
        <template v-slot:fields v-else-if="[ Report.STORAGE_METER_BY_SERIAL_NUMBER, Report.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER ].includes(id)">
            <v-combobox
                :items="types"
                item-text="title"
                item-value="index"
                label="Тип"
                v-model="type"
                :rules="requiredRules"
                outlined
            >
            </v-combobox>
            <v-text-field
                type="text"
                label="Серийный номер"
                v-model="serialNumber"
                :rules="serialNumberRules"
                clearable
                outlined
            >
            </v-text-field>
        </template>
        <template v-slot:fields v-else-if="[ Report.STORAGE_LAST_LOGS ].includes(id)">
            <v-text-field
                type="text"
                label="Серийные номера"
                v-model="serialNumber"
                :rules="serialNumberRules"
                clearable
                outlined
            >
            </v-text-field>
        </template>
        <template v-slot:fields v-else>
            <v-combobox
                :items="locations"
                item-text="text"
                item-value="value"
                label="Местонахождение"
                v-model="location"
                :rules="requiredRules"
                outlined
                v-if="[ Report.STORAGE_LOGS_BY_LOCATION, Report.STORAGE_COUNT_BY_LOCATION, Report.STORAGE_GROUP_BY_OWNER_AND_TYPE ].includes(id)"
            >
            </v-combobox>
            <v-combobox
                :items="serviceEmployees"
                item-text="title"
                item-value="value"
                label="Сотрудник"
                v-model="serviceEmployee"
                :rules="requiredRules"
                outlined
                v-if="[ Report.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER ].includes(id)"
            >
            </v-combobox>
            <v-combobox
                :items="employees"
                item-text="name"
                item-value="staffId"
                label="Сотрудник"
                v-model="employee"
                :rules="requiredRules"
                outlined
                v-if="[
                	Report.STORAGE_IN_OUT_BY_LOCATION,
                    Report.STORAGE_LOGS_BY_OWNER,
                    Report.STORAGE_IN_OUT_BY_OWNER,
                ].includes(id)"
            >
            </v-combobox>
            <v-text-field
                type="date"
                label="Начало периода"
                v-model="startDate"
                :rules="requiredRules"
                clearable
                outlined
            >
            </v-text-field>
            <v-text-field
                type="date"
                label="Конец периода"
                v-model="endDate"
                :rules="requiredRules"
                clearable
                outlined
            >
            </v-text-field>
        </template>
    </dialog-with-data-slot>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
    import DialogWithDataSlot from "../../utils-components/dialog/DialogWithDataSlot"
	import DictionaryMixin from "../../mixins/DictionaryMixin"
	import { Report } from "../const"
    import { createCustomerAddressesArray, createServiceEmployeeArray } from '../../service/js/assignments-filter-values'

	export default {
		name: "DataInputReportDialog",
        components: {
            DialogWithDataSlot
        },
		data: () => ({
			Report,
			days: 0,
			sortItems: [
				{ title: 'Время создания записи', value: 1 },
                { title: 'Время загрузки в пирамиду', value: 2 }
            ],
			sort: null,
            type: null,
            customerAddress: null,
            location: null,
            employee: null,
			serviceEmployee : null,
            serialNumber: '',
            loading: false,
			id: 0,
			title: '',
            startDate: '',
            endDate: '',
            serviceCustomerAddresses: [],
            serviceEmployees: [],
			serialNumberRules: [
				v => !!v || 'Обязательно к заполнению',
				v => v && String(v).length >= 6 || 'Должно быть не меньше 6 символов',
			],
			requiredRules: [
				v => !!v || 'Обязательно к заполнению',
			],
			daysRules: [
				v => v !== '' || 'Обязательно к заполнению',
				v => v >= 0 || 'Не должно быть меньше нуля',
			],
        }),
		mixins: [ DictionaryMixin ],
		inject: [ 'showNotificationRequestError' ],
		computed: {
			...mapGetters({
				types: 'dictionary/getMeterTypes',
				locations: 'dictionary/getLocations',
				employees: 'dictionary/getStorageEmployees',
				assignments: 'service/getAssignments',
			}),
		},
        methods: {
			...mapActions('service', [
				'fetchAllAssignments'
            ]),

	        async open({ id, name }) {
            	this.id = id
            	this.title = name

                if ([ Report.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS, Report.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER ].includes(id)) {
                	try {
                	    await this.fetchAllAssignments(true)
                        this.serviceCustomerAddresses = createCustomerAddressesArray(this.assignments)
                        this.serviceEmployees = createServiceEmployeeArray(this.assignments, this.getAccountFullName)
                    } catch (e) {
                        this.showNotificationRequestError(e)
	                }
                }

            	this.$refs.DataInputDialog.dialogOpen()
            },

            clear() {
	            this.employee = null
	            this.serviceEmployee = null
	            this.location = null
	            this.type = null
                this.serialNumber = ''
            },

            setLoading(loading) {
	        	this.loading = loading
            },

            close() {
	            this.$refs.DataInputDialog.setLoading(false)
	            this.$refs.DataInputDialog.dialogClose()
            },

	        submit() {
            	let reportInputData = {}
            	switch (this.id) {
		            case Report.STORAGE_LAST_LOGS:
			            reportInputData = {	serialNumber: this.serialNumber };
			            break
		            case Report.STORAGE_METER_BY_SERIAL_NUMBER:
		            case Report.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER:
		            	reportInputData = {	type: this.type.value, serialNumber: this.serialNumber };
		            	break
                    case Report.STORAGE_SYSTEM_LOGS:
		            case Report.SPENT_MATERIALS:
		            case Report.ASSIGNMENT_GROUP_BY_STATUS:
		            	reportInputData = {	startDate: this.startDate, endDate: this.endDate };
		            	break
		            case Report.STORAGE_LOGS_BY_LOCATION:
		            case Report.STORAGE_COUNT_BY_LOCATION:
		            case Report.STORAGE_GROUP_BY_OWNER_AND_TYPE:
                        reportInputData = {
                            location: this.location.value,
                            startDate: this.startDate,
                            endDate: this.endDate
                        }; break
		            case Report.STORAGE_IN_OUT_BY_LOCATION:
		            case Report.STORAGE_LOGS_BY_OWNER:
		            case Report.STORAGE_IN_OUT_BY_OWNER:
			            reportInputData = {
				            empStaffId: this.employee.staffId,
				            startDate: this.startDate,
				            endDate: this.endDate
			            }; break
		            case Report.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER:
			            reportInputData = {
				            employee: this.serviceEmployee,
				            startDate: this.startDate,
				            endDate: this.endDate
			            }; break
                    case Report.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS:
                    	reportInputData = {
                            customerAddress: this.customerAddress
                        }; break
		            case Report.NOT_ACTIVE_IN_PYRAMID: reportInputData = {
                        days: this.days
		            }; break
		            case Report.PYRAMID_LOADED_BY_CUSTOMER_ADDRESS: reportInputData = {
			            sort: this.sortItems.find(({ value }) => value === this.sort)
		            }; break
	            }

                return this.$emit('submit', {
	                id: this.id,
	                title: this.title,
                    ...reportInputData
                })
	        }
        }
	}
</script>

<style scoped>

</style>