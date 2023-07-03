<template>
    <!-- Диалог приема/выдачи -->
    <v-dialog
        v-model="dialogModel"
        max-width="1200px"
        @click:outside="close"
        @keydown.esc="close"
    >
        <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
            @submit.prevent="accept"
            @keypress.enter.native.prevent
            @keypress.esc="close"
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
                        <v-select
                            v-show="currentOperation === STORAGE_OPERATION"
                            v-model="storageType"
                            :items="storageTypes"
                            item-text="text"
                            item-value="value"
                            label="Тип склада"
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
                            v-show="!isRouter"
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
                            v-show="!isRouter"
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
                        :is-router="isRouter"
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
	        STORAGE_LOCATION: 0,
	        REPAIR_LOCATION: 1,
	        SECOND_STORAGE_LOCATION: 7,
	        EMPTY_STAFF_ID: 0,
	        oldLocationColor: 'green',
	        resultColor: 'grey',
	        STORAGE_OPERATION: 9,
	        REPAIR_OPERATION: 1,
	        storageType: 0,
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
	        newLocation: 0,
            isRouter: false
        }),
        mounted() {
            this.acceptedPerson = this.getEmployeeCardByStaffId(this.staffId)
            this.acceptedPersonLabel = this.getEmployeeTitleByCard(this.acceptedPerson)
        },
	    inject: [
	    	'showNotificationSuccess',
            'showNotificationWarning',
            'showNotificationRequestError',
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
	            storageTypes: 'storage/getStorageTypes',
            }),
        },
	    watch: {
	        currentOperation(operation) {
		        this.newLocation = operation
		        switch (operation) {
			        //case 5: this.needAcceptedPerson = false; break
			        case 9:	this.newLocation = this.storageType; break
			        case 11:  this.newLocation = 8; break
			        case 12:  this.newLocation = 9; break
		        }
		        this.changeDefaultPerson(operation)
		        this.resetValidation()
            },
		    storageType(newVal) {
	        	if (this.currentOperation === this.STORAGE_OPERATION) {
			        this.newLocation = newVal
		        }
            },
		    dialogModel: function (newVal) {
			    if (newVal) {
				    this.changeDefaultPerson(this.currentOperation)
			    }
		    }
        },
        methods: {
	        ...mapActions('storage', [
                'createAcceptOrIssueLog',
	        ]),

            changeDefaultPerson(currentOperation) {
	        	if (!this.isRouter) {
			        if (currentOperation !== 9) {
				        this.acceptedPerson = ''
				        this.acceptedPersonLabel = 'Принимающий сотрудник'
				        this.issuingPerson = this.getEmployeeCardByStaffId(this.staffId)
				        this.issuingPersonLabel = this.getEmployeeTitleByCard(this.issuingPerson)
			        } else {
				        this.issuingPerson = ''
				        this.issuingPersonLabel = 'Отдающий сотрудник'
				        this.acceptedPerson = this.getEmployeeCardByStaffId(this.staffId)
				        this.acceptedPersonLabel = this.getEmployeeTitleByCard(this.acceptedPerson)
			        }
		        }
            },

	        issuingPersonOnFocusOut() {
		        this.issuingPersonLabel= this.getEmployeeTitleByCard(parseInt(this.issuingPerson))
	        },

	        acceptedPersonOnFocusOut() {
		        this.acceptedPersonLabel= this.getEmployeeTitleByCard(parseInt(this.acceptedPerson))
	        },

	        checkIfMeterLocationValid(meter) {
		        // if (this.isRouter) {
			    //     return (meter.oldLocation === 1 && this.newLocation !== 1) ||
				//         (meter.oldLocation !== 1 && this.newLocation === 1)
		        // } else {
			    //     return (meter.oldLocation === 0 && this.newLocation !== 0) ||
				//         (meter.oldLocation !== 0 && this.newLocation === 0)
		        // }
		        const storageLocations = [ this.STORAGE_LOCATION, this.SECOND_STORAGE_LOCATION ]
		        if (this.isRouter) {
			        return meter.oldLocation === this.REPAIR_LOCATION
				        ? this.newLocation !== this.REPAIR_LOCATION
				        : this.newLocation === this.REPAIR_LOCATION
		        } else {
			        const nonStorageLocations = this.locations
				        .map((location) => location.value)
				        .filter((location) => !storageLocations.includes(location))

			        if (storageLocations.includes(meter.oldLocation)) {
				        return nonStorageLocations.includes(this.newLocation)
			        } else {
				        return storageLocations.includes(this.newLocation)
			        }
		        }
	        },

	        meterCountUpdate(count) {
	            this.meterCount = count
            },

            open(isRouter) {
	            this.isRouter = isRouter
                if (this.isRouter) {
	                this.currentOperation = this.REPAIR_OPERATION
	                this.dialogOperations = this.operations.filter(operation => operation.routerOperation)
                } else {
	                this.dialogOperations = this.operations.filter(operation => !operation.notAcceptOrIssueOperation)
	                if ([ 124911, 23745 ].includes(this.staffId)) {
		                this.storageType = 7
	                }
                }

	           	this.dialogModel = true
            },

            close() {
                this.dialogModel = false
                this.clear()
            },

	        clear() {
	        	this.meterCount = ''
		        this.currentOperation = this.isRouter ? this.REPAIR_OPERATION : this.STORAGE_OPERATION
		        this.newLocation = this.isRouter ? this.REPAIR_LOCATION : this.STORAGE_LOCATION
		        this.storageType = 0
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
	            if (this.$refs.form) {
		            this.$refs.form.resetValidation()
	            }
            },

	        async accept() {
                if (!this.isRouter && this.$refs.form && !this.$refs.form.validate()) {
                    return
                }

		        if (!this.replaceMeters.length) {
			        return this.showNotificationWarning('Для выполнения операции заполните таблицу счетчиков')
		        }

		        if (!this.isRouter) {
			        this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
			        this.acceptedPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.acceptedPerson))
		        }

		        if (this.isRouter) {
			        if (this.currentOperation !== this.REPAIR_OPERATION) {
				        this.acceptedPersonStaffId = this.EMPTY_STAFF_ID
				        this.issuingPersonStaffId = this.staffId
			        } else {
				        this.acceptedPersonStaffId = this.staffId
				        this.issuingPersonStaffId = this.EMPTY_STAFF_ID
			        }
		        }

		        if (isNaN(this.issuingPersonStaffId) || isNaN(this.acceptedPersonStaffId)) {
			        return this.showNotificationWarning( 'Операция с неизвестным сотрудником невозможна')
		        }

                if (!this.replaceMeters.every(meter => this.checkIfMeterLocationValid(meter))) {
	                return this.showNotificationWarning('Не возможно произвести операцию, в таблице выбрана запрещенная схема смены местоположения')
                }

	            try {
		            this.formSubmit = true
		            this.$refs.addMeterTable.setLoading(true)

		            const res = await this.createAcceptOrIssueLog({
                        meters: this.replaceMeters,
                        operationType: this.currentOperation,
                        newLocation: this.newLocation,
                        issuingPersonStaffId: this.issuingPersonStaffId,
			            acceptedPersonStaffId: this.acceptedPersonStaffId,
                        comment: this.comment
		            })

                    if (!res) {
	                    this.showNotificationError('Что то пошло не так при приеме/выдаче')
                    } else {
	                    let successCount = 0
                    	this.replaceMeters.map((movedMeter) => {
		                    const updatedMeter = res.find((meter) => meter.guid === movedMeter.guid)
		                    if (updatedMeter?.success) {
			                    successCount++
			                    movedMeter.status = 1
		                    } else {
			                    movedMeter.status = 2
		                    }
	                    })

                        if (this.replaceMeters.length === successCount) {
	                        this.showNotificationSuccess('Операция выполнена успешно')
                            this.resultColor = this.colorGreen
                        } else {
	                        this.showNotificationWarning('Операция выполнена с ошибками')
	                        this.resultColor = this.colorOrange
                        }

                        this.resetFilters()
	                    this.initializeMeters()
	                    this.oldLocationColor = this.colorGrey
	                    this.meterCount = `${ successCount }/${  this.replaceMeters.length }`
                    }
                } catch (e) {
		            this.showNotificationRequestError(e)
		            this.formSubmit = false
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
