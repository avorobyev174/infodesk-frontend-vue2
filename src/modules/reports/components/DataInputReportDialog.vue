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
        <template v-slot:fields v-else-if="[
        	Reports.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS
        ].includes(id)">
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
        <template v-slot:fields v-else-if="[
        	Reports.STORAGE_METER_BY_SERIAL_NUMBER,
            Reports.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER
        ].includes(id)">
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
                v-if="[ 5, 7, 10 ].includes(id)"
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
                v-if="[ 6, 8, 9 ].includes(id)"
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
    import { createCustomerAddressesArray } from '../../service/js/assignments-filter-values'

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
            type: { index: 121, title: 'AIU5' },
            customerAddress: null,
            location: { text: 'Склад', value: 0 },
            employee: { name: 'Авдонин И. Д.', staffId: 107315 },
            serialNumber: '',
            loading: false,
			id: 0,
			title: '',
            startDate: '',
            endDate: '',
            serviceCustomerAddresses: [],
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

                if (id === Reports.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS) {
                	try {
                	    await this.fetchAllAssignments()
                        this.serviceCustomerAddresses = createCustomerAddressesArray(this.assignments)
                    } catch (e) {
                        this.showNotificationRequestError(e)
	                }
                }

            	this.$refs.DataInputDialog.dialogOpen()
            },

            clear() {
	            this.employee = null
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
                    case 12:
		            case 4:
		            	reportInputData = {	startDate: this.startDate, endDate: this.endDate };
		            	break
		            case 5:
		            case 7:
		            case 10:
                        reportInputData = {
                            location: this.location.value,
                            startDate: this.startDate,
                            endDate: this.endDate
                        }; break
		            case 6:
		            case 8:
		            case 9:
			            reportInputData = {
				            empStaffId: this.employee.staffId,
				            startDate: this.startDate,
				            endDate: this.endDate
			            }; break
                    case 15: reportInputData = {
	                    customerAddress: this.customerAddress
                    }; break
		            case 16: reportInputData = {
                        days: this.days
		            }; break
		            case 17: reportInputData = {
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