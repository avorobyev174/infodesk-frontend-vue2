<template>
    <!-- Диалог редактирования -->
    <div>
        <v-dialog
            v-model="dialogModel"
            max-width="450"
            @click:outside="close"
            @keydown.esc="close"
        >
            <v-form
                ref="form"
                v-model="formValid"
                lazy-validation
                @submit.prevent="save"
            >
                <v-card class="p-2">
                    <v-card-title>
                    <span class="m-auto text-h5 pb-2">
                        Редактирование
                    </span>
                    </v-card-title>
                    <v-card-text>
                        <add-or-edit-view
                            is-edit
                            ref="addOrEditView"
                            :serial-number-temp="editedItem.SERIAL_NUMBER"
                            :type-temp="editedItem.METER_TYPE"
                            :accuracy-class-temp="editedItem.ACCURACY_CLASS"
                            :condition-temp="editedItem.CONDITION"
                            :owner-temp="editedItem.PROPERTY"
                            :interval-temp="editedItem.CALIBRATION_INTERVAL"
                            :calibration-date-temp="editedItem.CALIBRATION_DATE"
                            :passport-number-temp="editedItem.PASSPORT_NUMBER"
                            :parent-dialog-model="dialogModel"
                        >
                        </add-or-edit-view>
                    </v-card-text>
                    <v-card-actions class="pt-4">
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            text
                            @click="close"
                        >
                            Отмена
                        </v-btn>
                        <v-btn
                            color="primary"
                            text
                            type="submit"
                            :loading="saveLoading"
                        >
                            Сохранить
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
        <simple-dialog
            :dialog-open="dialogDeleteModel"
            max-width="600px"
            title="Вы уверены что хотите удалить это счетчик?"
            @okButtonClickEvent="deleteConfirm"
            @cancelButtonClickEvent="closeDialogDeleteConfirm"
        />
    </div>
</template>

<script>
	import AddOrEditView from "./AddOrEditView"
	import {mapActions, mapGetters, mapState} from "vuex"
    import SimpleDialog from "../../utils-components/SimpleDialog"

	export default {
		name: "EditDialog",
		components: {
			AddOrEditView,
			SimpleDialog
		},
		data: () => ({
			dialogModel: false,
			dialogDeleteModel: false,
			formValid: true,
			editedItem: {},
			saveLoading: false,
		}),
        props: {
            meters: {
			    type: Array,
                required: true
            }
        },
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
		inject: [
			'showNotification',
			'showNotificationComponentError',
			'showNotificationStandardError',
			'showNotificationError',
			'getEmployeeStaffIdByCard',
			'getEmployeeTitleByCard',
			'initializeMeters',
			'resetFilters'
		],
		methods: {
			...mapActions('storage', [
				'editMeter',
				'checkMeterInDB',
				'deleteMeter'
			]),

			close() {
				this.dialogModel = false
				this.clear()
			},

			clear() {
				this.resetValidation()
				this.$refs.addOrEditView.clear()
			},

			resetValidation() {
				this.$refs.form.resetValidation()
			},

			edit(item) {
				this.editedItem = item
				this.dialogModel = true
			},

			delete(item) {
				this.editedItem = Object.assign({}, item)
				this.editedIndex = this.meters.indexOf(item)
				this.dialogDeleteModel = true
			},

			async deleteConfirm() {
				if (!this.staffId) {
					return this.showNotification(
						'Операция невозможна, ваш номер сотрудника не определен', this.colorOrange)
                }
				try {
					const res = await this.deleteMeter({
                        guid: this.editedItem.GUID,
                        meter: this.editedItem,
                        editorStaffId: this.staffId
					})
					//console.log(res)
					if (!res.length) {
						this.showNotificationStandardError(
							`Что то пошло не так при удалении счетчика ${ this.editedItem.SERIAL_NUMBER }`,
                            this.colorRed)
					} else {
						if (res[0].success) {
							this.meters.splice(this.editedIndex, 1)
							this.closeDialogDeleteConfirm()
							this.showNotification(
								`Счетчик ${ this.editedItem.SERIAL_NUMBER } успешно удален`,
                                this.colorGreen)
							this.resetFilters()
							this.initializeMeters()
						} else {
							this.showNotification(
								`Что то пошло не так при удалении счетчика ${ this.editedItem.SERIAL_NUMBER }`,
                                this.colorRed)
						}
					}
                } catch (e) {
					this.showNotificationStandardError(e)
				}
			},

			//Обработчик события отмены удаления счетчика
			closeDialogDeleteConfirm() {
				this.dialogDeleteModel = false
				this.$nextTick(() => {
					this.editedItem = Object.assign({}, this.defaultItem)
					this.editedIndex = -1
				})
			},

			compareData(meter, newMeterData) {
                let updateField = ''

				if (meter.METER_TYPE !== newMeterData.type) {
					updateField += `Type CurrentValue=${ newMeterData.type } OldValue=${ meter.METER_TYPE };`
				}
				if (meter.SERIAL_NUMBER !== newMeterData.serialNumber) {
					updateField += `SerialNumber CurrentValue=${ newMeterData.serialNumber } OldValue=${ meter.SERIAL_NUMBER };`
				}
				if (meter.ACCURACY_CLASS !== newMeterData.accuracyClass) {
					updateField += `AccuracyClass CurrentValue=${ newMeterData.accuracyClass } OldValue=${ meter.ACCURACY_CLASS };`
				}
				if (meter.PASSPORT_NUMBER !== newMeterData.passportNumber) {
					updateField += `PassportNumber CurrentValue=${ newMeterData.passportNumber } OldValue=${ meter.PASSPORT_NUMBER };`
				}
				if (meter.CONDITION !== newMeterData.condition) {
					updateField += `Condition CurrentValue=${ newMeterData.condition } OldValue=${ meter.CONDITION };`
				}
				if (meter.CALIBRATION_DATE !== newMeterData.calibration) {
					updateField += `CalibrationDate CurrentValue=${ newMeterData.calibration } OldValue=${ meter.CALIBRATION_DATE };`
				}
				if (meter.CALIBRATION_INTERVAL !== newMeterData.interval) {
					updateField += `CalibrationInterval CurrentValue=${ newMeterData.interval } OldValue=${ meter.CALIBRATION_INTERVAL };`
				}

				return updateField
			},

			async checkDataAndUpdate(newMeterData) {
				const meter = await this.checkMeterInDB({
					type: this.editedItem.METER_TYPE,
					serialNumber: this.editedItem.SERIAL_NUMBER
				})

                return this.compareData(meter[0], newMeterData)
			},

			async save() {
				this.formSubmit = true
				const meterData = this.$refs.addOrEditView.getData()
				const updateField = await this.checkDataAndUpdate(meterData)

                if (!updateField) {
	                return this.showNotification(
		                'Ничего не отредактировано', this.colorBlue)
                }

				if (!this.staffId) {
					return this.showNotification(
						'Операция невозможна, ваш номер сотрудника не определен', this.colorOrange)
				}

				this.saveLoading = true
                try {
	                const res = await this.editMeter({
		                ...meterData,
		                editorStaffId: this.staffId,
		                guid: this.editedItem.GUID,
		                updateField
	                })

	                if (!res.length) {
		                this.showNotificationStandardError('Что то пошло не так при редактировании')
	                } else {
		                if (res[0].success) {
			                this.showNotification('Операция выполнена успешно', this.colorGreen)
                            this.close()
		                } else {
			                this.showNotification('Операция выполнена с ошибкой', this.colorRed)
		                }
		                this.resetFilters()
		                this.initializeMeters()
	                }
                } catch (e) {
	                this.showNotificationStandardError(e)
                } finally {
	                this.saveLoading = false
                }

			}
		}
	}
</script>

<style scoped>

</style>