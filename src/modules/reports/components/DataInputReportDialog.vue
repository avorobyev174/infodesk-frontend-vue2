<template>
    <dialog-with-data-slot
        :title="title"
        ref="DataInputDialog"
        @submit="submit"
        @close="clear"
    >
        <template v-slot:fields v-if="[
        	Reports.STORAGE_METER_BY_SERIAL_NUMBER,
            Reports.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER
        ].includes(id)">
            <v-combobox
                :items="types"
                item-text="title"
                item-value="index"
                label="Тип"
                v-model="type"
                :rules="selectRules"
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
                :rules="selectRules"
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
                :rules="selectRules"
                outlined
                v-if="[ 6, 8, 9 ].includes(id)"
            >
            </v-combobox>
            <v-text-field
                type="date"
                label="Начало периода"
                v-model="startDate"
                :rules="dateRules"
                clearable
                outlined
            >
            </v-text-field>
            <v-text-field
                type="date"
                label="Конец периода"
                v-model="endDate"
                :rules="dateRules"
                clearable
                outlined
            >
            </v-text-field>
        </template>
    </dialog-with-data-slot>
</template>

<script>
	import { mapGetters } from 'vuex'
    import DialogWithDataSlot from "../../utils-components/dialog/DialogWithDataSlot"
	import DictionaryMixin from "../../mixins/DictionaryMixin"
	import { Reports } from "../const"

	export default {
		name: "DataInputReportDialog",
        components: {
            DialogWithDataSlot
        },
        mixins: [ DictionaryMixin ],
        computed: {
	        ...mapGetters({
                types: 'storage/getMeterTypes',
                locations: 'storage/getLocations',
                employees: 'storage/getStorageEmployees',
	        }),
        },
		data: () => ({
			Reports,
            type: { index: 121, title: 'AIU5' },
            location: { text: 'Склад', value: 0 },
            employee: { name: 'Авдонин И. Д.', staffId: 107315 },
            serialNumber: '',
            loading: false,
			id: 0,
			title: '',
            startDate: '',
            endDate: '',
			serialNumberRules: [
				v => !!v || 'Обязательно к заполнению',
				v => v && String(v).length >= 6 || 'Должно быть не меньше 6 символов',
			],
			dateRules: [
				v => !!v || 'Обязательно к заполнению',
			],
			selectRules: [
				v => !!v || 'Обязательно к заполнению',
			],
        }),
        methods: {
	        open({ id, name }) {
            	this.id = id
            	this.title = name
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