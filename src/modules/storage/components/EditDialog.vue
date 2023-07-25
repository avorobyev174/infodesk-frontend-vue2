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
                        <v-btn  color="primary" text @click="close">Отмена</v-btn>
                        <v-btn color="primary" text type="submit" :loading="saveLoading">Сохранить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
        <dialog-custom
            ref="MeterDeleteDialog"
            :max-width="600"
            title="Вы уверены что хотите удалить этот счетчик?"
            @submit="deleteConfirm"
        />
    </div>
</template>

<script>
	import AddOrEditView from "./AddOrEditView"
	import { mapActions, mapGetters } from "vuex"
	import DialogCustom from "../../utils-components/dialog/DialogCustom"

	export default {
		name: "EditDialog",
		components: {
			DialogCustom,
			AddOrEditView,
		},
		data: () => ({
			dialogModel: false,
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
			'getMeters',
            'formatDateIfNotNull'
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

			remove(item) {
				this.editedItem = Object.assign({}, item)
				this.editedIndex = this.meters.indexOf(item)
				this.$refs.MeterDeleteDialog.dialogOpen()
			},

			async deleteConfirm() {
				if (!this.staffId) {
					return this.showNotificationWarning('Операция невозможна, ваш номер сотрудника не определен')
                }
				try {
					const meterSerialNumber = this.editedItem.serial_number
					const deletedMeter = await this.deleteMeter({
                        guid: this.editedItem.guid,
                        meter: this.editedItem,
                        editorStaffId: this.staffId
					})

                    this.meters.splice(this.editedIndex, 1)
                    this.$refs.MeterDeleteDialog.dialogClose()
                    this.showNotificationSuccess(`Счетчик ${ meterSerialNumber } успешно удален`)
                } catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			compareData(meter, newMeterData) {
                const updateFields = {}

				if (meter.meter_type !== newMeterData.type) {
					updateFields.meter_type = { title: 'Тип', old: meter.meter_type, new: newMeterData.type }
					//updateFields += `Type CurrentValue=${ newMeterData.type } OldValue=${ meter.meter_type };`
				}
				if (meter.serial_number !== newMeterData.serialNumber) {
					updateFields.serial_number = { title: 'Серийный номер', old: meter.serial_number, new: newMeterData.serialNumber }
					//updateFields += `SerialNumber CurrentValue=${ newMeterData.serialNumber } OldValue=${ meter.serial_number };`
				}
				if (meter.accuracy_class !== newMeterData.accuracyClass) {
					updateFields.accuracy_class = { title: 'Класс точности', old: meter.accuracy_class, new: newMeterData.accuracyClass }
					//updateFields += `AccuracyClass CurrentValue=${ newMeterData.accuracyClass } OldValue=${ meter.accuracy_class };`
				}
				if (meter.passport_number !== newMeterData.passportNumber) {
					updateFields.passport_number = { title: 'Номер паспорта', old: meter.passport_number, new: newMeterData.passportNumber }
					//updateFields += `PassportNumber CurrentValue=${ newMeterData.passportNumber } OldValue=${ meter.passport_number };`
				}
				if (meter.condition !== newMeterData.condition) {
					updateFields.condition = { title: 'Состояние', old: meter.condition, new: newMeterData.condition }
					//updateFields += `Condition CurrentValue=${ newMeterData.condition } OldValue=${ meter.condition };`
				}
				if (this.formatDateIfNotNull(meter.calibration_date) !== newMeterData.calibration) {
					updateFields.calibration_date = {
						title: 'Дата поверки',
                        old: this.formatDateIfNotNull(meter.calibration_date),
                        new: newMeterData.calibration
					}
					//updateFields += `CalibrationDate CurrentValue=${ newMeterData.calibration } OldValue=${ this.formatDate(meter.calibration_date) };`
				}
				if (meter.calibration_interval !== newMeterData.interval) {
					updateFields.calibration_interval = { title: 'Межповерочный интервал', old: meter.calibration_interval, new: newMeterData.interval }
					//updateFields += `CalibrationInterval CurrentValue=${ newMeterData.interval } OldValue=${ meter.calibration_interval };`
				}
				if (meter.property !== newMeterData.owner) {
					updateFields.property = { title: 'Собственник', old: meter.property, new: newMeterData.owner }
					//updateFields += `CalibrationInterval CurrentValue=${ newMeterData.interval } OldValue=${ meter.calibration_interval };`
				}

				return updateFields
			},

			async checkDataAndUpdate(newMeterData) {
				const meter = await this.checkMeterInDB({
					type: this.editedItem.meter_type,
					serialNumber: this.editedItem.serial_number
				})

                return this.compareData(meter, newMeterData)
			},

			async save() {
				this.formSubmit = true
				const meterData = this.$refs.addOrEditView.getData()
				this.saveLoading = true
                try {
	                const updateFields = await this.checkDataAndUpdate(meterData)
	                if (!Object.keys(updateFields).length) {
		                return this.showNotificationInfo('Ничего не отредактировано')
	                }

	                if (!this.staffId) {
		                return this.showNotificationWarning('Операция невозможна, ваш номер сотрудника не определен')
	                }

	                const updatedMeter = await this.editMeter({
		                ...meterData,
		                editorStaffId: this.staffId,
		                guid: this.editedItem.guid,
		                updateFields
	                })

                    const oldMeter = this.meters.find(({ guid }) => guid === updatedMeter.guid)
                    Object.assign(oldMeter, updatedMeter)
                    this.showNotificationSuccess('Редактирование выполнено успешно')
                    this.close()
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