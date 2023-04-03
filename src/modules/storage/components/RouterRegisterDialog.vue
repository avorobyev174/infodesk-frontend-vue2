<template>
    <div>
        <v-dialog
            v-model="dialogModel"
            max-width="900"
            @click:outside="close"
            @keydown.esc="close"
        >
            <v-form
                ref="form"
                v-model="formValid"
                lazy-validation
                @submit.prevent
            >
                <v-card class="p-2">
                    <v-card-title>
                    <span class="m-auto text-h5 pb-2">
                        Регистрация
                          <v-chip label v-if="regRepairMeters.length" :color="resultColor">
                            {{ meterCount }}
                        </v-chip>
                    </span>
                    </v-card-title>
                    <div class="dialog-wrapper-grid">
                        <v-card-text>
                            <v-text-field
                                v-model="comment"
                                label="Комментарий"
                                :disabled="formSubmit"
                            ></v-text-field>
                        </v-card-text>
                        <v-divider vertical></v-divider>
                        <add-meter-view
                            :form-submit="formSubmit"
                            :meters="regRepairMeters"
                            :new-location="1"
                            ref="addMeterTable"
                            @onResetValidation="resetValidation"
                            @onMeterCountUpdate="meterCountUpdate"
                            :resultColor="resultColor"
                            is-register
                            is-router
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
                            color="primary"
                            text
                            @click="accept"
                            v-if="!formSubmit"
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
	import {mapActions, mapGetters, mapState} from "vuex";
	import AddMeterView from "./AddMeterView"

	export default {
		name: "RouterRegisterDialog",
		components: {
			AddMeterView,
		},
        data: () => ({
        	comment: '',
	        formSubmit: false,
	        resultColor: 'grey',
	        meterCount: '',
	        dialogModel: false,
	        formValid: true,
	        regRepairMeters:  [],
	        oldLocationColor: 'grey',
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
			'resetFilters'
		],
		methods: {
			...mapActions('storage', [
				'registration',
			]),

			meterCountUpdate(count) {
				this.meterCount = count
			},

			resetValidation() {
				this.$refs.form.resetValidation()
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
				this.oldLocationColor = this.colorGrey
				this.resultColor = this.colorGrey
				this.regRepairMeters = []
				this.formSubmit = false
				this.$refs.addMeterTable.serialNumberClear()
				this.comment = ''
			},

			async accept() {
				if (!this.regRepairMeters.length) {
					return this.showNotification(
						`Для выполнения операции заполните таблицу маршрутизаторов`, this.colorOrange)
				}

				this.acceptedPersonStaffId = this.staffId

				if (isNaN(this.acceptedPersonStaffId)) {
					return this.showNotification(
						'Операция с неизвестным сотрудником не возможна', this.colorOrange)
				}

				try {
					this.formSubmit = true
					this.$refs.addMeterTable.setLoading(true)

					const res = await this.registration({
						meters: this.regRepairMeters,
						acceptedPersonStaffId: this.acceptedPersonStaffId,
						accuracyClass: 0,
                        condition: 0,
						issuingPersonStaffId: 0,
						interval: 0,
						owner: 0,
						calibration: null,
						passportNumber: 0,
						comment: this.comment,
						isRouter: true
					})

					if (!res.length) {
						this.showNotificationStandardError('Что то пошло не так при регистрации маршрутизатора')
					} else {
						let successCount = 0
						this.regRepairMeters.forEach(regMeter => {
							const createdMeter = res.find(meter => meter.serial_number === regMeter.serialNumber)
							if (createdMeter && createdMeter.success) {
								successCount++
								regMeter.status = 1
							} else {
								regMeter.status = 2
							}
						})

						if (this.regRepairMeters.length === successCount) {
							this.showNotification('Операция выполнена успешно', this.colorGreen)
							this.resultColor = this.colorGreen
							this.oldLocationColor = this.colorGreen
						} else {
							this.showNotification('Операция выполнена с ошибками', this.colorOrange)
							this.resultColor = this.colorOrange
							this.oldLocationColor = this.colorOrange
						}

						this.meterCount = `${ successCount / this.regRepairMeters.length }`
						this.resetFilters()
						this.initializeMeters()
					}
				} catch (e) {
					this.showNotificationStandardError(e)
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
        grid-template-columns: 250px 10px 1fr;
        grid-template-rows: 1fr;
        justify-content: start;
    }
    ::v-deep .v-data-table__empty-wrapper {
        display: none;
    }
</style>