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
                        <v-chip label v-if="moveMeters.length" :color="resultColor">
                            {{ meterCount }}
                        </v-chip>
                    </span>
                </v-card-title>
                <div class="dialog-wrapper">
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="currentOperation"
                            :items="dialogOperations"
                            item-text="title"
                            item-value="value"
                            label="Тип операции"
                            :disabled="formSubmit"
                        />
                        <v-select
                            v-show="currentOperation === Operation.STORE"
                            v-model="storageType"
                            :items="storageTypes"
                            item-text="title"
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
                        :meters="moveMeters"
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
                    <v-btn v-if="!formSubmit" color="primary" text @click="close">Отмена</v-btn>
                    <v-btn v-if="!formSubmit" color="primary" text type="submit">ОК</v-btn>
                    <v-btn v-if="formSubmit" color="primary" text @click="clear">Очистить</v-btn>
                    <v-btn v-if="formSubmit" color="primary" text @click="close">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
    import { mapActions, mapGetters, mapState } from "vuex"
    import AddMeterView from "./AddMeterView"
    import { Location, Operation, OperationStatus } from "../const"

    export default {
        name: "AcceptOrIssueDialog",
        components: {
	        AddMeterView
        },
        data: () => ({
	        Operation,
	        EMPTY_STAFF_ID: 0,
	        oldLocationColor: 'green',
	        resultColor: 'grey',
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
            moveMeters:  [],
	        currentOperation: Operation.STORE,
	        newLocation: Location.STORAGE,
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
            'getMeters',
        ],
	    computed: {
		    ...mapState([ 'colorGreen', 'colorOrange', 'colorGrey' ]),
            ...mapGetters({
                locations: 'dictionary/getLocations',
	            operations: 'dictionary/getOperations',
	            staffId: 'getStaffId',
	            storageTypes: 'storage/getStorageTypes',
            }),
        },
	    watch: {
	        currentOperation(operation) {
		        this.newLocation = operation
		        switch (operation) {
			        case Operation.STORE: this.newLocation = this.storageType; break
			        case Operation.CUSTOMER: this.newLocation = Location.CUSTOMER_WINDOW; break
			        case Operation.PROGRAMMING: this.newLocation = Location.PROGRAMMING; break
		        }
		        this.changeDefaultPerson(operation)
		        this.resetValidation()
            },
		    storageType(val) {
	        	if (this.currentOperation === Operation.STORE) {
			        this.newLocation = val
		        }
            },
		    dialogModel: function (val) {
			    if (val) {
				    this.changeDefaultPerson(this.currentOperation)
			    }
		    }
        },
        methods: {
	        ...mapActions('storage', [ 'createAcceptOrIssueLog', ]),

            changeDefaultPerson(currentOperation) {
	        	if (!this.isRouter) {
			        if (currentOperation !== Operation.STORE) {
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
		        this.issuingPersonLabel= this.getEmployeeTitleByCard(+this.issuingPerson)
	        },

	        acceptedPersonOnFocusOut() {
		        this.acceptedPersonLabel= this.getEmployeeTitleByCard(+this.acceptedPerson)
	        },

	        checkIfMeterLocationValid(meter) {
		        const storageLocations = [ Location.STORAGE, Location.STORAGE_TEMPORARY ]
		        if (this.isRouter) {
			        return meter.oldLocation === Location.REPAIR
				        ? this.newLocation !== Location.REPAIR
				        : this.newLocation === Location.REPAIR
		        } else {
			        const nonStorageLocations = this.locations
				        .map(({ value }) => value)
				        .filter((location) => !storageLocations.includes(location))

			        return storageLocations.includes(meter.oldLocation)
                        ? nonStorageLocations.includes(this.newLocation)
			            : storageLocations.includes(this.newLocation)
		        }
	        },

	        meterCountUpdate(count) {
	            this.meterCount = count
            },

            open(isRouter) {
	            this.isRouter = isRouter
                if (this.isRouter) {
	                this.currentOperation = Operation.REPAIR
	                this.dialogOperations =
                        this.operations.filter(({ value }) => [ Operation.REPAIR, Operation.FACTORY, Operation.INSTALL ].includes(value))
                } else {
	                this.dialogOperations =
                        this.operations.filter(({ value }) =>
                            ![ Operation.REGISTRATION_WITHOUT_SERIAL_NUMBER, Operation.REGISTRATION, Operation.EDIT, Operation.OBJECT ].includes(value))
	                if ([ 124911, 23745 ].includes(this.staffId)) {
		                this.storageType = Location.STORAGE_TEMPORARY
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
		        this.currentOperation = this.isRouter ? Operation.REPAIR : Operation.STORE
		        this.newLocation = this.isRouter ? Location.REPAIR : Location.STORAGE
		        this.storageType = 0
		        this.issuingPerson = ''
		        this.acceptedPerson = ''
		        this.comment = ''
                this.resultColor = this.colorGrey
                this.oldLocationColor = this.colorGreen
		        this.moveMeters = []
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
                if (!this.isRouter && !this.$refs.form?.validate()) {
                    return
                }

		        if (!this.moveMeters.length) {
			        return this.showNotificationWarning('Для выполнения операции заполните таблицу счетчиков')
		        }

		        if (!this.isRouter) {
			        this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
			        this.acceptedPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.acceptedPerson))
		        }

		        if (this.isRouter) {
			        if (this.currentOperation !== Operation.REPAIR) {
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

                if (!this.moveMeters.every((meter) => this.checkIfMeterLocationValid(meter))) {
	                return this.showNotificationWarning('Не возможно произвести операцию, в таблице выбрана запрещенная схема смены местоположения')
                }

	            try {
		            this.formSubmit = true
		            this.$refs.addMeterTable.setLoading(true)

		            const movedMeters = await this.createAcceptOrIssueLog({
                        meters: this.moveMeters,
                        operationType: this.currentOperation,
                        newLocation: this.newLocation,
                        issuingPersonStaffId: this.issuingPersonStaffId,
			            acceptedPersonStaffId: this.acceptedPersonStaffId,
                        comment: this.comment
		            })

                    const successCount = movedMeters.length
                    this.moveMeters.forEach((meter) => {
                        const updatedMeter = movedMeters.find(({ guid }) => guid === meter.guid)
                        meter.status = updatedMeter ? OperationStatus.SUCCESS : OperationStatus.ERROR
                    })
                    this.showMessage(successCount)
                    this.meterCount = `${ successCount }/${  this.moveMeters.length }`
		            await this.getMeters()
	            } catch (e) {
		            this.showNotificationRequestError(e)
		            this.formSubmit = false
	            } finally {
		            this.$refs.addMeterTable.setLoading(false)
	            }
            },

	        showMessage(successCount) {
		        if (this.moveMeters.length === successCount) {
			        this.showNotificationSuccess('Операция выполнена успешно')
			        this.resultColor = this.colorGreen
			        this.oldLocationColor = this.colorGrey
		        } else {
			        this.showNotificationWarning('Операция выполнена с ошибками')
			        this.resultColor = this.colorOrange
			        this.oldLocationColor = this.colorGrey
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
