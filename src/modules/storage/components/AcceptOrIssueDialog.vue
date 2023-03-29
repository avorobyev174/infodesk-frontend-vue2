<template>
    <!-- Диалог приема/выдачи -->
    <v-dialog
        v-model="dialogModel"
        max-width="1100px"
        @click:outside="close"
        @keydown.esc="close"
    >
        <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
            @submit.prevent="accept"
            @keypress.enter.native.prevent
        >
            <v-card class="p-2">
                <v-card-title>
                    <span class="m-auto text-h5 pb-2">Прием/выдача
                        <v-chip label v-if="replaceMeters.length" :color="resultColor">
                            {{ meterCount }}
                        </v-chip>
                    </span>
                </v-card-title>
                <div class="dialog-wrapper">
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="currentOperation"
                            :items="dialogOperations"
                            item-text="text"
                            item-value="value"
                            label="Тип операции"
                            :disabled="formSubmit"
                        />
                        <v-text-field
                            v-model="issuingPerson"
                            :label="issuingPersonLabel"
                            required
                            :rules="personRules"
                            @focusout="this.issuingPersonOnFocusOut"
                            type="number"
                            hide-spin-buttons
                            :disabled="formSubmit"
                        ></v-text-field>
                        <v-text-field
                            v-model="acceptedPerson"
                            :label="acceptedPersonLabel"
                            required
                            :rules="personRules"
                            @focusout="this.acceptedPersonOnFocusOut"
                            type="number"
                            hide-spin-buttons
                            :disabled="formSubmit"
                        ></v-text-field>
                        <v-text-field
                            v-model="comment"
                            label="Комментарий"
                            :disabled="formSubmit"
                        ></v-text-field>
                    </v-card-text>
                    <v-divider vertical></v-divider>
                    <add-meter-view
                        :form-submit="formSubmit"
                        :meters="replaceMeters"
                        :new-location="newLocation"
                        ref="addMeterTable"
                        @onResetValidation="this.resetValidation"
                        @onMeterCountUpdate="meterCountUpdate"
                        :resultColor="resultColor"
                        :oldLocationColor="oldLocationColor"
                    ></add-meter-view>
                </div>
                <v-card-actions class="pt-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="close"
                        v-if="!formSubmit"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        v-if="!formSubmit"
                        color="primary"
                        text
                        type="submit"
                    >
                       ОК
                    </v-btn>
                    <v-btn
                        v-if="formSubmit"
                        color="primary"
                        text
                        @click="clear"
                    >
                        Очистить
                    </v-btn>
                    <v-btn
                        v-if="formSubmit"
                        color="primary"
                        text
                        @click="close"
                    >
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
    import { mapActions, mapGetters, mapState } from "vuex"
    import AddMeterView from "./AddMeterView";

    export default {
        name: "AcceptOrIssueDialog",
        components: {
	        AddMeterView
        },
        data: () => ({
	        oldLocationColor: 'green',
	        resultColor: 'grey',
            meterCount: '',
            dialogOperations: [],
            dialogModel: false,
	        issuingPerson: '',
	        issuingPersonStaffId: '',
	        issuingPersonLabel: 'Отдающий сотрудник',
	        acceptedPerson: '',
	        acceptedPersonStaffId: '',
	        acceptedPersonLabel: 'Принимающий сотрудник',
            comment: '',
            formValid: true,
            formSubmit: false,
	        personRules: [
		        v => !!v || 'Обязательно к заполнению',
		        v => v && !String(v).match('[^0-9]') || 'Должны присутствовать только цифры'
	        ],
            replaceMeters:  [],
	        currentOperation: 9,
	        newLocation: 0
        }),
        mounted() {
            this.dialogOperations = this.operations.filter(operation => !operation.notAcceptOrIssueOperation)
            this.acceptedPerson = this.getEmployeeCardByStaffId(this.staffId)
            this.acceptedPersonLabel = this.getEmployeeTitleByCard(this.acceptedPerson)
        },
	    inject: [
	    	'showNotification',
            'showNotificationComponentError',
            'showNotificationStandardError',
            'showNotificationError',
            'getEmployeeStaffIdByCard',
            'getEmployeeTitleByCard',
            'getEmployeeCardByStaffId',
            'initializeMeters',
            'resetFilters'
        ],
	    computed: {
		    ...mapState({
			   	colorBlue: state => state.colorBlue,
			    colorRed: state => state.colorRed,
			    colorGreen: state => state.colorGreen,
			    colorOrange: state => state.colorOrange,
			    colorGrey: state => state.colorGrey,
			    colorGold: state => state.colorGold,
		    }),
            ...mapGetters({
                locations: 'storage/getLocations',
	            operations: 'storage/getOperations',
	            staffId: 'getStaffId',
            }),
        },
	    watch: {
	        currentOperation(operation) {
		        this.newLocation = operation
		        switch (operation) {
			        //case 5: this.needAcceptedPerson = false; break
			        case 9:	this.newLocation = 0; break
			        case 11:  this.newLocation = 8; break
			        case 12:  this.newLocation = 9; break
		        }
		        //this.changeDefaultPerson(operation)
		        this.resetValidation()
            },
		    dialogModel: function (newVal) {
			    if (newVal) {
				    this.changeDefaultPerson(this.currentOperation)
			    }
		    }
        },
        methods: {
	        ...mapActions('storage', [
                'createLog',
	        ]),

            changeDefaultPerson(currentOperation) {
	            if (currentOperation !== 9) {
		            this.issuingPerson = ''
		            this.issuingPersonLabel = 'Принимающий сотрудник'
		            this.acceptedPerson = this.getEmployeeCardByStaffId(this.staffId)
		            this.acceptedPersonLabel = this.getEmployeeTitleByCard(this.acceptedPerson)
	            } else {
		            this.acceptedPerson = ''
		            this.acceptedPersonLabel = 'Отдающий сотрудник'
		            this.issuingPerson = this.getEmployeeCardByStaffId(this.staffId)
		            this.issuingPersonLabel = this.getEmployeeTitleByCard(this.issuingPerson)
	            }
            },

	        issuingPersonOnFocusOut() {
		        this.issuingPersonLabel= this.getEmployeeTitleByCard(parseInt(this.issuingPerson))
	        },

	        acceptedPersonOnFocusOut() {
		        this.acceptedPersonLabel= this.getEmployeeTitleByCard(parseInt(this.acceptedPerson))
	        },

	        checkIfMeterLocationValid(meter) {
		        return (meter.oldLocation === 0 && this.newLocation !== 0)
			        || (meter.oldLocation !== 0 && this.newLocation === 0)
	        },

	        meterCountUpdate(count) {
	            this.meterCount = count
            },

            open() {
	            this.dialogModel = true
            },

            close() {
                this.dialogModel = false
                this.clear()
            },

	        clear() {
	        	this.meterCount = ''
		        this.currentOperation = 9
		        this.newLocation = 0
		        this.issuingPerson = ''
		        this.acceptedPerson = ''
		        this.comment = ''
                this.resultColor = this.colorGrey
                this.oldLocationColor = this.colorGreen
		        this.replaceMeters = []
		        this.formSubmit = false
		        this.acceptedPersonLabel = 'Принимающий сотрудник'
		        this.issuingPersonLabel = 'Отдающий сотрудник'
		        this.resetValidation()
		        this.$refs.addMeterTable.serialNumberClear()
            },

            resetValidation() {
	            this.$refs.form.resetValidation()
            },

	        async accept() {
                if (!this.$refs.form.validate()) {
                    return
                }

		        if (!this.replaceMeters.length) {
			        return this.showNotification(
				        `Для выполнения операции заполните таблицу счетчиков`, this.colorOrange)
		        }

		        this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
                this.acceptedPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.acceptedPerson))

		        if (isNaN(this.issuingPersonStaffId) || isNaN(this.acceptedPersonStaffId)) {
			        return this.showNotification(
				        'Операция с неизвестным сотрудником невозможна', this.colorOrange)
		        }

                if (!this.replaceMeters.every(meter => this.checkIfMeterLocationValid(meter))) {
	                return this.showNotification(
		                'Не возможно произвести операцию, в таблице выбрана запрещенная схема смены местоположения',
                        this.colorOrange)
                }

	            try {
		            this.formSubmit = true
		            this.$refs.addMeterTable.setLoading(true)

		            const res = await this.createLog({
                        meters: this.replaceMeters,
                        operationType: this.currentOperation,
                        newLocation: this.newLocation,
                        issuingPersonStaffId: this.issuingPersonStaffId,
			            acceptedPersonStaffId: this.acceptedPersonStaffId,
                        comment: this.comment
		            })

                    if (!res) {
	                    this.showNotificationStandardError('Что то пошло не так при приеме/выдаче')
                    } else {
	                    let successCount = 0
                    	this.replaceMeters.map(addMeter => {
		                    const updatedMeter = res.find(meter => meter.guid === addMeter.guid)
		                    if (updatedMeter && updatedMeter.success) {
			                    successCount++
			                    addMeter.status = 1
		                    } else {
			                    addMeter.status = 2
		                    }
	                    })

                        if (this.replaceMeters.length === successCount) {
	                        this.showNotification('Операция выполнена успешно', this.colorGreen)
                            this.resultColor = this.colorGreen
                        } else {
	                        this.showNotification('Операция выполнена с ошибками', this.colorOrange)
	                        this.resultColor = this.colorOrange
                        }

                        this.resetFilters()
	                    this.initializeMeters()
	                    this.oldLocationColor = this.colorGrey
	                    this.meterCount = `${ successCount }/${  this.replaceMeters.length }`
                    }
                } catch (e) {
		            this.showNotificationStandardError(e)
	            } finally {
		            this.$refs.addMeterTable.setLoading(false)
	            }
            }
        }
    }
</script>

<style scoped>
    .dialog-wrapper {
        display: grid;
        grid-template-columns: 350px 10px 1fr;
        grid-template-rows: 1fr;
        justify-content: start;
    }
    ::v-deep .v-data-table__empty-wrapper {
        display: none;
    }
</style>
