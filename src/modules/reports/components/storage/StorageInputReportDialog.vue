<template>
    <simple-dialog-with-input-slot
            :title="title"
            ref="meterReportDialog"
            @okButtonClickEvent="submit"
            @closeEvent="clear"
        >
            <template v-slot:fields v-if="id === 3">
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
                    v-if="[5, 7, 10].includes(id)"
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
                    v-if="[6, 8, 9].includes(id)"
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
    </simple-dialog-with-input-slot>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex'
    import SimpleDialogWithInputSlot from "../../../utils-components/SimpleDialogWithInputSlot"

	export default {
		name: "StorageInputReportDialog",
        components: {
            SimpleDialogWithInputSlot
        },
        computed: {
	        ...mapGetters({
                types: 'storage/getMeterTypes',
                locations: 'storage/getLocations',
                employees: 'storage/getStorageEmployees',
	        }),
        },
		data: () => ({
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
        inject: [ 'formatDate' ],
        methods: {
            ...mapActions('reports', [  ]),
	        open(report) {
            	this.id = report.id
            	this.title = report.name
            	this.$refs.meterReportDialog.open()
            },

            clear() {
	            this.employee = null
	            this.location = null
	            this.type = null
                this.serialNumber = ''
            },

            close() {
	            this.$refs.meterReportDialog.setLoading(false)
	            this.$refs.meterReportDialog.close()
            },

	        submit() {
            	let reportInputData = {}
            	switch (this.id) {
		            case 3:
		            	reportInputData = {	type: this.type.index, serialNumber: this.serialNumber };
		            	break
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

                return this.$emit('submitClick', {
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