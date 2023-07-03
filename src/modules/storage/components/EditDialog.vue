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
                            :serial-number-temp="editedItem.serial_number"
                            :type-temp="editedItem.meter_type"
                            :accuracy-class-temp="editedItem.accuracy_class"
                            :condition-temp="editedItem.condition"
                            :owner-temp="editedItem.property"
                            :interval-temp="editedItem.calibration_interval"
                            :calibration-date-temp="editedItem.calibration_date"
                            :passport-number-temp="editedItem.passport_number"
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
			...mapGetters({
				staffId: 'getStaffId',
			}),
		},
		inject: [
			'showNotificationSuccess',
			'showNotificationWarning',
			'showNotificationInfo',
			'showNotificationRequestError',
			'showNotificationError',
			'getEmployeeStaffIdByCard',
			'getEmployeeTitleByCard',
			'initializeMeters',
			'resetFilters',
            'formatDate'
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
					return this.showNotificationWarning('Операция невозможна, ваш номер сотрудника не определен')
                }
				try {
					const meterSerialNumber = this.editedItem.serial_number
					const res = await this.deleteMeter({
                        guid: this.editedItem.guid,
                        meter: this.editedItem,
                        editorStaffId: this.staffId
					})

					if (!res) {
						this.showNotificationError(`Что то пошло не так при удалении счетчика ${ meterSerialNumber }`)
					} else {
						this.meters.splice(this.editedIndex, 1)
						this.closeDialogDeleteConfirm()
						this.showNotificationSuccess(`Счетчик ${ meterSerialNumber } успешно удален`)
						this.resetFilters()
					}
                } catch (e) {
					this.showNotificationRequestError(e)
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

				if (meter.meter_type !== newMeterData.type) {
					updateField += `Type CurrentValue=${ newMeterData.type } OldValue=${ meter.meter_type };`
				}
				if (meter.serial_number !== newMeterData.serialNumber) {
					updateField += `SerialNumber CurrentValue=${ newMeterData.serialNumber } OldValue=${ meter.serial_number };`
				}
				if (meter.accuracy_class !== newMeterData.accuracyClass) {
					updateField += `AccuracyClass CurrentValue=${ newMeterData.accuracyClass } OldValue=${ meter.accuracy_class };`
				}
				if (meter.passport_number !== newMeterData.passportNumber) {
					updateField += `PassportNumber CurrentValue=${ newMeterData.passportNumber } OldValue=${ meter.passport_number };`
				}
				if (meter.condition !== newMeterData.condition) {
					updateField += `Condition CurrentValue=${ newMeterData.condition } OldValue=${ meter.condition };`
				}
				if (meter.calibration_date !== newMeterData.calibration) {
					updateField += `CalibrationDate CurrentValue=${ newMeterData.calibration } OldValue=${ this.formatDate(meter.calibration_date) };`
				}
				if (meter.calibration_interval !== newMeterData.interval) {
					updateField += `CalibrationInterval CurrentValue=${ newMeterData.interval } OldValue=${ meter.calibration_interval };`
				}

				return updateField
			},

			async checkDataAndUpdate(newMeterData) {
				const meter = await this.checkMeterInDB({
					type: this.editedItem.meter_type,
					serialNumber: this.editedItem.serial_number
				})

                return this.compareData(meter[0], newMeterData)
			},

			async save() {
				this.formSubmit = true
				const meterData = this.$refs.addOrEditView.getData()
				const updateField = await this.checkDataAndUpdate(meterData)

                if (!updateField) {
	                return this.showNotificationInfo('Ничего не отредактировано')
                }

				if (!this.staffId) {
					return this.showNotificationWarning(
						'Операция невозможна, ваш номер сотрудника не определен')
				}

				this.saveLoading = true
                try {
	                const res = await this.editMeter({
		                ...meterData,
		                editorStaffId: this.staffId,
		                guid: this.editedItem.guid,
		                updateField
	                })

	                if (!res) {
		                this.showNotificationError('Что то пошло не так при редактировании')
	                } else {
	                	const editedMeter = this.meters.find((meter) => meter.guid === res.guid)
                        Object.assign(editedMeter, res)
		                this.showNotificationSuccess('Редактирование выполнено успешно')
		                this.close()
		                this.resetFilters()
	                }
                } catch (e) {
	                this.showNotificationRequestError(e)
                } finally {
	                this.saveLoading = false
                }

			}
		}
	}
</script>

<style scoped>

</style>