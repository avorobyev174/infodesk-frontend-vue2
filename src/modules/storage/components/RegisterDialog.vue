<template>
    <!-- Диалог регистрации -->
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
                        <v-chip label v-if="regMeters.length" :color="resultColor">
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
                        :meters="regMeters"
                        :new-location="0"
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
                        @click="accept"
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
    </div>
</template>

<script>
	import AddMeterView from "./AddMeterView"
	import { mapActions, mapGetters, mapState } from "vuex"
	import AddOrEditView from "./AddOrEditView"

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
			regMeters:  [],
			oldLocationColor: 'grey',
            isRouter: false,
			personRules: [
				v => !String(v).match('[^0-9]') || 'Должны присутствовать только цифры'
			],
		}),
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
				staffId: 'getStaffId',
			}),
		},
        props: {
		    meters: {
		    	type: Array,
                required: true
            }
        },
		inject: [
			'showNotification',
			'showNotificationStandardError',
			'getEmployeeStaffIdByCard',
			'getEmployeeTitleByCard',
            'initializeMeters',
            'resetFilters',
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
		        this.regMeters = []
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

                if (!this.regMeters.length) {
                    return this.showNotification(`Для выполнения операции заполните таблицу`, this.colorOrange)
                }

                this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
                this.acceptedPersonStaffId = this.staffId

                if (isNaN(this.acceptedPersonStaffId)) {
                    return this.showNotification('Операция с неизвестным принимающим сотрудником не возможна', this.colorOrange)
                }

		        if (this.issuingPerson && isNaN(this.issuingPersonStaffId)) {
			        return this.showNotification('Операция с неизвестным отдающим сотрудником не возможна', this.colorOrange)
		        }

                try {
                    this.formSubmit = true
                    this.$refs.addMeterTable.setLoading(true)
                    const meterData = this.$refs.addOrEditView.getData()

                    const res = await this.registration({
                        meters: this.regMeters,
                        issuingPersonStaffId: this.isRouter || !this.issuingPerson ? 0 : this.issuingPersonStaffId,
                        acceptedPersonStaffId: this.acceptedPersonStaffId,
                        ...meterData
                    })

                    if (!res.length) {
                        this.showNotificationStandardError('Что то пошло не так при регистрации')
                    } else {
                        let successCount = 0
                        this.regMeters.forEach((regMeter) => {
                            const createdMeter = res.find((meter) => meter.serial_number === regMeter.serialNumber)
                            if (createdMeter?.success) {
                                successCount++
                                regMeter.status = 1
                            } else {
                                regMeter.status = 2
                            }
                        })

                        if (this.regMeters.length === successCount) {
                            this.showNotification('Операция выполнена успешно', this.colorGreen)
                            this.resultColor = this.colorGreen
                            this.oldLocationColor = this.colorGreen
                        } else {
                            this.showNotification('Операция выполнена с ошибками', this.colorOrange)
                            this.resultColor = this.colorOrange
                            this.oldLocationColor = this.colorOrange
                        }

                        this.meterCount = `${ successCount }/${ this.regMeters.length }`
	                    this.resetFilters()
                        this.initializeMeters()
                    }
                } catch (e) {
                    this.showNotificationStandardError(e)
	                this.formSubmit = false
                } finally {
                    this.$refs.addMeterTable.setLoading(false)
                }
	        },

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