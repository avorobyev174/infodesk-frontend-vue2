<template>
    <dialog-with-data-slot
        :title="title"
        ref="DataInputDialog"
        @submit="submit"
        @close="clear"
    >
        <template v-slot:fields v-if="[ Reports.PYRAMID_LOADED_BY_CUSTOMER_ADDRESS ].includes(id)">
            <v-select
                v-model="sort"
                label="Выборка по"
                :items="sortItems"
                :rules="requiredRules"
                item-text="title"
                item-value="value"
            />
        </template>
        <template v-slot:fields v-else-if="[ Reports.NOT_ACTIVE_IN_PYRAMID ].includes(id)">
            <v-text-field
                v-model="days"
                label="Количество дней без ответа"
                type="number"
                hide-spin-buttons
                :rules="daysRules"
            />
        </template>
        <template v-slot:fields v-else-if="[ Reports.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS ].includes(id)">
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
        <template v-slot:fields v-else-if="[ Reports.STORAGE_METER_BY_SERIAL_NUMBER, Reports.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER ].includes(id)">
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
        <template v-slot:fields v-else>
            <v-combobox
                :items="locations"
                item-text="text"
                item-value="value"
                label="Местонахождение"
                v-model="location"
                :rules="requiredRules"
                outlined
                v-if="[ Reports.STORAGE_LOGS_BY_LOCATION, Reports.STORAGE_COUNT_BY_LOCATION, Reports.STORAGE_GROUP_BY_OWNER_AND_TYPE ].includes(id)"
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
                v-if="[ Reports.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER ].includes(id)"
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
                	Reports.STORAGE_IN_OUT_BY_LOCATION,
                    Reports.STORAGE_LOGS_BY_OWNER,
                    Reports.STORAGE_IN_OUT_BY_OWNER,
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
	import { Reports } from "../const"
    import { createCustomerAddressesArray, createServiceEmployeeArray } from '../../service/js/assignments-filter-values'

	export default {
		name: "DataInputReportDialog",
        components: {
            DialogWithDataSlot
        },
		data: () => ({
			Reports,
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
				types: 'storage/getMeterTypes',
				locations: 'storage/getLocations',
				employees: 'storage/getStorageEmployees',
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

                if ([ Reports.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS, Reports.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER ].includes(id)) {
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
		            case Reports.STORAGE_METER_BY_SERIAL_NUMBER:
		            case Reports.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER:
		            	reportInputData = {	type: this.type.index, serialNumber: this.serialNumber };
		            	break
                    case Reports.STORAGE_SYSTEM_LOGS:
		            case Reports.SPENT_MATERIALS:
		            case Reports.ASSIGNMENT_GROUP_BY_STATUS:
		            	reportInputData = {	startDate: this.startDate, endDate: this.endDate };
		            	break
		            case Reports.STORAGE_LOGS_BY_LOCATION:
		            case Reports.STORAGE_COUNT_BY_LOCATION:
		            case Reports.STORAGE_GROUP_BY_OWNER_AND_TYPE:
                        reportInputData = {
                            location: this.location.value,
                            startDate: this.startDate,
                            endDate: this.endDate
                        }; break
		            case Reports.STORAGE_IN_OUT_BY_LOCATION:
		            case Reports.STORAGE_LOGS_BY_OWNER:
		            case Reports.STORAGE_IN_OUT_BY_OWNER:
			            reportInputData = {
				            empStaffId: this.employee.staffId,
				            startDate: this.startDate,
				            endDate: this.endDate
			            }; break
		            case Reports.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER:
			            reportInputData = {
				            employee: this.serviceEmployee,
				            startDate: this.startDate,
				            endDate: this.endDate
			            }; break
                    case Reports.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS:
                    	reportInputData = {
                            customerAddress: this.customerAddress
                        }; break
		            case Reports.NOT_ACTIVE_IN_PYRAMID: reportInputData = {
                        days: this.days
		            }; break
		            case Reports.PYRAMID_LOADED_BY_CUSTOMER_ADDRESS: reportInputData = {
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