<template>
    <div>
        <v-dialog
        v-model="dialogModel"
        max-width="1100"
        @click:outside="close"
        @keydown.esc="close"
    >
        <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
            @keypress.enter.native.prevent
            @keypress.esc="close"
        >
            <v-card class="p-2">
                <v-card-title>
                    <span class="m-auto text-h5 pb-2">
                        Регистрация
                        <v-chip label v-if="registrationMeters.length" :color="resultColor">
                            {{ meterCount }}
                        </v-chip>
                    </span>
                </v-card-title>
                <div class="dialog-wrapper-grid">
                    <v-card-text>
                        <add-or-edit-view
                            :form-submit="formSubmit"
                            ref="addOrEditView"
                            :is-router="isRouter"
                            >
                                <template v-slot:storage-select>
                                    <v-select
                                        v-show="!isRouter"
                                        v-model="storageType"
                                        :items="storageTypes"
                                        item-text="title"
                                        item-value="value"
                                        label="Тип склада"
                                        :disabled="formSubmit"
                                    />
                                </template>
                                <template v-slot:issuing-person-input>
                                    <v-text-field
                                        v-show="!isRouter"
                                        v-model="issuingPerson"
                                        :label="issuingPersonLabel"
                                        :rules="personRules"
                                        @focusout="issuingPersonOnFocusOut"
                                        type="number"
                                        hide-spin-buttons
                                        :disabled="formSubmit"
                                    ></v-text-field>
                                </template>
                        </add-or-edit-view>
                    </v-card-text>
                    <v-divider vertical></v-divider>
                    <add-meter-view
                        :form-submit="formSubmit"
                        :meters="registrationMeters"
                        :new-location="storageType"
                        ref="addMeterTable"
                        @onResetValidation="resetValidation"
                        @onMeterCountUpdate="meterCountUpdate"
                        :resultColor="resultColor"
                        :is-router="isRouter"
                        is-register
                        :oldLocationColor="oldLocationColor"
                    ></add-meter-view>
                </div>
                <v-card-actions class="pt-4">
                    <v-spacer></v-spacer>
                    <v-btn v-if="!formSubmit" color="primary" text @click="close">Отмена</v-btn>
                    <v-btn v-if="!formSubmit" color="primary" text @click="accept">ОК</v-btn>
                    <v-btn v-if="formSubmit" color="primary" text @click="clear">Очистить</v-btn>
                    <v-btn v-if="formSubmit" color="primary" text @click="close">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
    </div>
</template>

<script>
	import AddMeterView from "./AddMeterView"
	import { mapActions, mapGetters, mapState } from "vuex"
	import AddOrEditView from "./AddOrEditView"
	import { Location, OperationStatus } from "../const"

	export default {
		name: "RegisterDialog",
		components: {
			AddMeterView,
			AddOrEditView,
		},
		data: () => ({
			resultColor: 'grey',
			meterCount: '',
			dialogModel: false,
			dialogDeleteModel: false,
			issuingPerson: '',
			issuingPersonStaffId: '',
			acceptedPersonStaffId: '',
			issuingPersonLabel: 'Отдающий сотрудник',
			formValid: true,
			formSubmit: false,
			registrationMeters:  [],
			storageType: 0,
			oldLocationColor: 'grey',
            isRouter: false,
			personRules: [
				v => !String(v).match('[^0-9]') || 'Должны присутствовать только цифры'
			],
		}),
		computed: {
			...mapState([ 'colorGreen', 'colorOrange', 'colorGrey' ]),
			...mapGetters({
				staffId: 'getStaffId',
				storageTypes: 'storage/getStorageTypes',
			}),
		},
        props: {
		    meters: {
		    	type: Array,
                required: true
            }
        },
		inject: [
			'showNotificationSuccess',
			'showNotificationWarning',
			'showNotificationError',
			'showNotificationRequestError',
			'getEmployeeStaffIdByCard',
			'getEmployeeTitleByCard',
            'getMeters',
            'formatDate'
		],
		provide: function () {
			return {
				formatDate: this.formatDate,
			}
		},
        methods: {
	        ...mapActions('storage', [
		        'registration',
	        ]),

	        issuingPersonOnFocusOut() {
		        this.issuingPersonLabel= this.getEmployeeTitleByCard(parseInt(this.issuingPerson))
	        },

	        meterCountUpdate(count) {
		        this.meterCount = count
	        },

	        open(isRouter) {
	        	this.isRouter = isRouter
                if ([ 124911, 23745 ].includes(this.staffId)) {
	                this.storageType = Location.STORAGE_TEMPORARY
                }
		        this.dialogModel = true
	        },

	        close() {
		        this.dialogModel = false
		        this.clear()
	        },

	        clear() {
		        this.meterCount = ''
		        this.issuingPerson = ''
		        this.oldLocationColor = this.colorGrey
		        this.resultColor = this.colorGrey
		        this.registrationMeters = []
		        this.formSubmit = false
		        this.issuingPersonLabel = 'Отдающий сотрудник'
		        this.resetValidation()
		        this.$refs.addMeterTable.serialNumberClear()
		        this.$refs.addOrEditView.clear()
	        },

	        resetValidation() {
		        this.$refs.form.resetValidation()
	        },

	        async accept() {
		        if (!this.isRouter && this.$refs.form && !this.$refs.form.validate()) {
			        return
		        }

                if (!this.registrationMeters.length) {
                    return this.showNotificationWarning(`Для выполнения операции заполните таблицу`)
                }

                this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
                this.acceptedPersonStaffId = this.staffId

                if (isNaN(this.acceptedPersonStaffId)) {
                    return this.showNotificationWarning('Операция с неизвестным сотрудником не возможна')
                }

		        if (this.issuingPerson && isNaN(this.issuingPersonStaffId)) {
			        return this.showNotificationWarning('Операция с неизвестным отрудником не возможна')
		        }

                try {
                    this.formSubmit = true
                    this.$refs.addMeterTable.setLoading(true)
                    const meterData = this.$refs.addOrEditView.getData()
	                delete meterData.serialNumber

                    const createdMeters = await this.registration({
                        meters: this.registrationMeters,
                        issuingPersonStaffId: this.isRouter || !this.issuingPerson ? 0 : this.issuingPersonStaffId,
                        acceptedPersonStaffId: this.acceptedPersonStaffId,
	                    storageType: this.storageType,
                        ...meterData
                    })
                    const successCount = createdMeters.length
                    this.registrationMeters.forEach((meter) => {
                        const createdMeter = createdMeters.find(({ serial_number }) => serial_number === meter.serialNumber)
	                    meter.status = createdMeter ? OperationStatus.SUCCESS : OperationStatus.ERROR
                    })
                    this.showMessage(successCount)
                    this.meterCount = `${ successCount }/${ this.registrationMeters.length }`
                    await this.getMeters()
                } catch (e) {
                    this.showNotificationRequestError(e)
	                this.formSubmit = false
                } finally {
                    this.$refs.addMeterTable.setLoading(false)
                }
	        },

            showMessage(successCount) {
	            if (this.registrationMeters.length === successCount) {
		            this.showNotificationSuccess('Операция выполнена успешно')
		            this.resultColor = this.colorGreen
		            this.oldLocationColor = this.colorGreen
	            } else {
		            this.showNotificationWarning('Операция выполнена с ошибками')
		            this.resultColor = this.colorOrange
		            this.oldLocationColor = this.colorOrange
	            }
            }
        }
	}
</script>

<style scoped>
    .dialog-wrapper-grid {
        display: grid;
        grid-template-columns: 350px 10px 1fr;
        grid-template-rows: 1fr;
        justify-content: start;
    }
    ::v-deep .v-data-table__empty-wrapper {
        display: none;
    }
</style>