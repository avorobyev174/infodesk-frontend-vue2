<template>
    <div>
        <dialog-with-table-slot
                :dialog-open="dialogModel"
                max-width="1200px"
                title="Групповая отправка смс"
                :item-titles="titles"
                :items="groupMetersForRegistration"
                :success-action-status="successGroupSms"
                action-button-title="Отправить"
                :actionButtonLoading="loading"
                @okButtonClickEvent="sendGroupSmsForRegistration"
                @cancelButtonClickEvent="close"
        >
            <template v-slot:table-row-data>
                <tr
                    v-for="meter in groupMetersForRegistration"
                    :key="meter.icc"
                >
                    <td>{{ getMeterTypeTitle(meter.type) }}</td>
                    <td>{{ meter.serial_number }}</td>
                    <td>{{ meter.icc }}</td>
                    <td>{{ getPhaseTitle(meter.phase) }}</td>
                    <td>{{ meter.phone }}</td>
                    <td>{{ getStatusTitle(meter.status) }}</td>
                    <td class="text-center">
                        <v-chip v-if="meter.sms_status === 1" :color="colorGrey">
                            {{ getSmsTitleBySmsStatus(meter.sms_status) }}
                        </v-chip>
                        <v-chip v-else-if="meter.sms_status === 2 || meter.sms_status === 5" :color="colorOrange">
                            {{ getSmsTitleBySmsStatus(meter.sms_status) }}
                        </v-chip>
                        <v-chip v-else-if="meter.sms_status === 4 || meter.sms_status === 6" :color="colorRed">
                            {{ getSmsTitleBySmsStatus(meter.sms_status) }}
                        </v-chip>
                        <v-chip v-else :color="colorGreen">{{ getSmsTitleBySmsStatus(meter.sms_status) }}</v-chip>
                    </td>
                </tr>
            </template>
        </dialog-with-table-slot>
        <!-- Диалог отправки смс -->
        <simple-dialog
            :dialog-open="smsConfirmDialogModel"
            max-width="600px"
            title="Вы уверены что хотите послать смс?"
            @okButtonClickEvent="sendSmsForRegistration(meterForSmsRegistration)"
            @cancelButtonClickEvent="smsConfirmDialogClose"
        />
    </div>
</template>

<script>
    import {mapActions, mapState} from "vuex";
    import DialogWithTableSlot from "../../utils-components/DialogWithTableSlot";
    import SimpleDialog from "../../utils-components/SimpleDialog";

    export default {
        name: "SingleAndGroupSmsSendDialog",
        data: () => ({
            dialogModel: false,
            titles: [ "Тип", "Серийный номер", "ICC", "Фазность", "Номер телефона", "Статус", "Смс" ],
            successGroupSms: false,
            loading: false,
            groupMetersForRegistration: [],
            componentTitle: 'Диалог получения данных из ростелекома',
            smsConfirmDialogModel: false,
            meterForSmsRegistration: null,
            groupMetersForCheckingStatus: [],
        }),
        components: {
            dialogWithTableSlot: DialogWithTableSlot,
            simpleDialog: SimpleDialog
        },
        props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: [
            'showNotification',
            'showNotificationComponentError',
            'showNotificationStandardError',
            'showNotificationError',
            'getPhaseTitle',
            'getStatusTitle',
            'getSmsTitleBySmsStatus',
            'getMeterTypeTitle'
        ],
        computed: {
            ...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue'])
        },
        methods: {
            ...mapActions('registration', [
                'registerMeterBySms',
                'checkMeterSmsStatus',
                'registerGroupMeterBySms',
                'checkMeterSmsStatus',
                'registerGroupMeterBySms']),
            //Обработчик открытия диалога групповой отправки смс
            open() {
                this.groupMetersForRegistration = []

                this.meters.forEach((meter) => {
                    if ([1, 4, 6].includes(meter.sms_status)) {
                        this.groupMetersForRegistration.push(meter)
                    }
                })

                this.groupMetersForRegistration.length
                    ? this.dialogModel = true
                    : this.showNotification(`Не найдено ни одного счетчика для групповой отправки смс`, this.colorOrange)
            },

            //Обработчик события групповой отправки смс
            async sendGroupSmsForRegistration() {
                this.loading = true

                if (!this.successGroupSms) {
                    console.log(`Число счетчиков для групповой регистрации: ${ this.groupMetersForRegistration.length }`)
                    for (const meter of this.groupMetersForRegistration) {
                        await this.sendSmsForRegistration(meter)
                    }

                    this.loading = false
                    this.successGroupSms = true
                } else {
                    this.close()
                }
            },

            //Обработчик события отмены групповой отправки смс
            close() {
                this.dialogModel = false
                this.loading = false
                this.successGroupSms = false
                this.groupMetersForRegistration = []
            },

            //Функция ограничения для отправки смс и получения статуса (register - отправка)
            checkSmsStatusRestriction(item, isSend) {
                switch (item.sms_status) {
                    case 0:
                       isSend
                            ? this.showNotification(`Отправка смс для счетчика с серийным номером ${ item.serial_number }
                                                                пока не доступна, привяжите его к номеру телефона
                                                                (для этого актуализируйте данные)`, this.colorOrange)
                            : this.showNotification(`Получение статуса смс для счетчика с серийным номером
                                                    ${ item.serial_number } пока не доступно, привяжите его к номеру
                                                    телефона (для этого актуализируйте данные)`, this.colorOrange);
                        return false
                    case 1:
                        if (!isSend)
                            this.showNotification(`Сначало отправьте смс для счетчика
                                                                            ${ item.serial_number }`, this.colorBlue)
                        return isSend
                    case 2:
                        if (isSend)
                            this.showNotification(`Смс для счетчика с серийным номером
                                                            ${item.serial_number} уже отправлена и находится в очереди,
                                                                        вы можете обновить ее статус`, this.colorBlue);
                        return !isSend
                    case 3:
                        this.showNotification(`Смс для счетчика с серийным номером
                                                                ${item.serial_number} уже доставлена`, this.colorBlue);
                        return false
                    case 4:
	                case 6:
		               isSend
                            ? this.showNotification(`Повторный запрос на отправку смс для счетчика с серийным номером
                                                                            ${ item.serial_number }`, this.colorGreen)
                            : this.showNotification(`Отправьте повторно смс для счетчика ${ item.serial_number }`,
                                                                                                    this.colorGreen);
                        return isSend
                    case 5:
                        if (isSend)
                            this.showNotification(`Смс для счетчика с серийным номером
                                                                    ${item.serial_number} передано оператору,
                                                                    вы можете обновить ее статус позже`, this.colorBlue);
                        return !isSend
                    case 7:
                        this.showNotification(`Отправка смс для счетчика с серийным номером
                                                                   ${item.serial_number} не требуется`, this.colorBlue);
                        return false
	                case 8:
		                if (isSend)
			                this.showNotification(`Смс для счетчика с серийным номером
                                                            ${ item.serial_number } уже отправлена и находится в ожидании
                                                             подтверждения, вы можете обновить ее статус`, this.colorBlue);
		                return !isSend
                }
            },

            //Обработчик события подтверждения отправки смс для счетчика
            smsConfirmDialogOpen(item) {
                if (this.checkSmsStatusRestriction(item, true) &&
                    !this.smsConfirmDialogModel &&
                    this.meterForSmsRegistration === null)
                {
                    this.smsConfirmDialogModel = true
                    this.meterForSmsRegistration = item
                }
            },

            //Обработчик события отмены отправки смс для счетчика
            smsConfirmDialogClose() {
                this.smsConfirmDialogModel = false
                this.meterForSmsRegistration = null
            },

            //Обработчик отправки смс для регистрации счетчика
            async sendSmsForRegistration(meter) {
                try {
	                this.showNotification(`Запрос на отправку смс для счетчика с серийным номером
                                                                       ${ meter.serial_number }`, this.colorBlue);
                    this.smsConfirmDialogModel = false
                    const updatedMeter = await this.registerMeterBySms(meter)
                    const mainUpdatedMeter = this.meters.find(mainMeter => updatedMeter.id === mainMeter.id)
                    Object.assign(mainUpdatedMeter, updatedMeter)
                    this.meterForSmsRegistration = null
                } catch (e) {
                    this.showNotificationError(`Ошибка при отправке смс (id счетчика: ${ meter.id })`, e)
	                this.meterForSmsRegistration = null
                }
            },

            //Обработчик проверки статуса смс для счетчика
            async checkSmsStatus(item, isGroup) {
                if (await this.checkSmsStatusRestriction(item, false)) {
                    try {
                        let updatedMeter = await this.checkMeterSmsStatus(item)
                        if (updatedMeter.message) {
	                        this.showNotification(`${ updatedMeter.message }`, this.colorBlue)
                            return
                        }

                        const mainUpdatedMeter = this.meters.find((mainMeter) => updatedMeter.id === mainMeter.id)
                        if (mainUpdatedMeter) {
	                        Object.assign(mainUpdatedMeter, updatedMeter)
                        }

                        if (!isGroup) {
	                        this.showNotification(`Статус смс счетчика
                                                            ${ updatedMeter.serial_number } обновлен`, this.colorGreen)
                        }
                    } catch (e) {
                        this.showNotificationError('Ошибка при получении статуса смс', e)
                    }
                }
            },

            //Групповое полчение статуса по  смс
            async checkSmsStatusForAllAvailableMeters() {
                this.groupMetersForCheckingStatus = []

                this.meters.forEach(meter => {
                    if (meter.sms_status === 2 || meter.sms_status === 5) {
                        this.groupMetersForCheckingStatus.push(meter)
                    }
                })
                let checkSum = 0
                if (this.groupMetersForCheckingStatus.length) {
                    for (const meter of this.groupMetersForCheckingStatus) {
                        await this.checkSmsStatus(meter, true)
                        checkSum++
                    }
                    this.showNotification(`Количество обновленных смс статусов ${ checkSum } шт.`, this.colorBlue)
                } else {
	                this.showNotification(`Не найдено ни одного счетчика для обновления статуса смс`, this.colorOrange)
                }
            },
        },
    }
</script>

<style scoped>

</style>