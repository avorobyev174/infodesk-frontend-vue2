<template>
    <simple-dialog-with-input-slot
            :title="title"
            ref="meterReportDialog"
            :loading="loading"
            @okButtonClickEvent="submit"
        >
            <template v-slot:fields v-if="id === 3">
                <v-combobox
                    :items="types"
                    item-text="title"
                    item-value="index"
                    label="Тип"
                    v-model="type"
                    outlined
                    required
                >
                </v-combobox>
                <v-text-field
                    type="text"
                    label="Серийный номер"
                    v-model="serialNumber"
                    :rules="serialNumberRules"
                    clearable
                    outlined
                    required
                >
                </v-text-field>
            </template>
            <template v-slot:fields v-else-if="[4, 5, 6, 7, 8].includes(id)">
                <v-combobox
                    :items="locations"
                    item-text="text"
                    item-value="value"
                    label="Местонахождение"
                    v-model="location"
                    outlined
                    v-show="id === 5 || id === 7"
                >
                </v-combobox>
                <v-combobox
                    :items="employees"
                    item-text="name"
                    item-value="staffId"
                    label="Сотрудник"
                    v-model="employee"
                    outlined
                    v-show="id === 6 || id === 8"
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
        mounted() {
	        //this.type = { index: 121, title: 'AIU5' }
	        // this.location = { text: 'Склад', value: 0 }
	        // this.employee = { name: 'Авдонин И. Д.', staffId: 107315 }
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
				v => v && String(v).length >= 8 || 'Должно быть не меньше 8 символов',
			],
			dateRules: [
				v => !!v || 'Обязательно к заполнению',
			],
        }),
        inject: [ 'formatDate' ],
        methods: {
            ...mapActions('reports', [  ]),
	        reportDialogOpen(report) {
            	this.id = report.id
            	this.title = report.name
            	this.$refs.meterReportDialog.open()
            },

            setLoading(loading) {
            	this.loading = loading
            },

	        submit() {
            	let reportInputData = {}
            	switch (this.id) {
		            case 3:
		            	reportInputData = {	type: this.type.index, serialNumber: this.serialNumber }; break
		            case 4:
		            	reportInputData = {	startDate: this.startDate, endDate: this.endDate }; break
		            case 5:
                        reportInputData = {
                            location: this.location.value,
                            startDate: this.formatDate(this.startDate),
                            endDate: this.formatDate(this.endDate)
                        }; break
		            case 6:
			            reportInputData = {
				            empStaffId: this.employee.staffId,
				            startDate: this.formatDate(this.startDate),
				            endDate: this.formatDate(this.endDate)
			            }; break
		            case 7:
			            reportInputData = {
				            location: this.location.value,
				            startDate: this.formatDate(this.startDate),
				            endDate: this.formatDate(this.endDate)
			            }; break
		            case 8:
			            reportInputData = {
				            empStaffId: this.employee.staffId,
				            startDate: this.formatDate(this.startDate),
				            endDate: this.formatDate(this.endDate)
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