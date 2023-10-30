//Не используется
<template>
    <div>
        <dialog-with-table-slot
            ref="UpdateDialog"
            :max-width="1200"
            dialog-title="Данные по групповой отправке смс"
            :table-headers="tableHeaders"
            reject-button-title="Закрыть"
            is-only-close
            :count="updatedMeters.length"
            @reject="$refs.UpdateDialog.dialogClose()"
        >
            <template v-slot:table-data>
                <tr v-for="meter in groupMetersForRegistration" :key="meter.icc">
                    <td>{{ getMeterTypeTitle(meter.type) }}</td>
                    <td>{{ meter.serial_number }}</td>
                    <td>{{ meter.icc }}</td>
                    <td>{{ getPhaseTitle(meter.phase) }}</td>
                    <td>{{ meter.phone }}</td>
                    <td>{{ getSimStatusTitle(meter.status) }}</td>
                    <td class="text-center">
                        <v-chip v-if="meter.sms_status === 1" :color="colorGrey">
                            {{ getSmsTitleByStatus(meter.sms_status) }}
                        </v-chip>
                        <v-chip v-else-if="meter.sms_status === 2 || meter.sms_status === 5" :color="colorOrange">
                            {{ getSmsTitleByStatus(meter.sms_status) }}
                        </v-chip>
                        <v-chip v-else-if="meter.sms_status === 4 || meter.sms_status === 6" :color="colorRed">
                            {{ getSmsTitleByStatus(meter.sms_status) }}
                        </v-chip>
                        <v-chip v-else :color="colorGreen">{{ getSmsTitleByStatus(meter.sms_status) }}</v-chip>
                    </td>
                </tr>
            </template>
        </dialog-with-table-slot>
        <dialog-custom
            :max-width="600"
            title="Вы уверены что хотите послать смс?"
            @submit="sendSmsForRegistration(meterForSmsRegistration)"
        />
    </div>
</template>

<script>
    import { mapActions, mapState } from "vuex"
    import DialogWithTableSlot from "../../utils-components/dialog/DialogWithTableSlot"
    import DialogCustom from "../../utils-components/dialog/DialogCustom"

    export default {
        name: "SmsSendDialog",
        data: () => ({
            tableHeaders: [ "Тип", "Серийный номер", "ICC", "Фазность", "Номер телефона", "Статус", "Смс" ],
            successGroupSms: false,
            loading: false,
            groupMetersForRegistration: [],
            componentTitle: 'Диалог получения данных из ростелекома',
            smsConfirmDialogModel: false,
            meterForSmsRegistration: null,
            groupMetersForCheckingStatus: [],
        }),
        components: {
	        DialogCustom,
	        DialogWithTableSlot,
        },
        props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: [
            'showNotificationSuccess',
            'showNotificationError',
            'showNotificationWarning',
            'showNotificationInfo',
            'getPhaseTitle',
            'getSimStatusTitle',
            'getSmsTitleByStatus',
            'getMeterTypeTitle'
        ],
        computed: {
            ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange' ])
        },
        methods: {
            ...mapActions('programming', [
                'registerMeterBySms',
                'checkMeterSmsStatus',
                'registerGroupMeterBySms',
                'checkMeterSmsStatus',
                'registerGroupMeterBySms'
            ]),

            open() {
                this.groupMetersForRegistration = []

                this.meters.forEach((meter) => {
                    if ([1, 4, 6].includes(meter.sms_status)) {
                        this.groupMetersForRegistration.push(meter)
                    }
                })

                this.groupMetersForRegistration.length
                    ? this.dialogModel = true
                    : this.showNotificationWarning('Не найдено ни одного счетчика для групповой отправки смс')
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
                            ? this.showNotificationWarning(`Отправка смс для счетчика с серийным номером ${ item.serial_number }
                                                                пока не доступна, привяжите его к номеру телефона
                                                                (для этого актуализируйте данные)`)
                            : this.showNotificationWarning(`Получение статуса смс для счетчика с серийным номером
                                                    ${ item.serial_number } пока не доступно, привяжите его к номеру
                                                    телефона (для этого актуализируйте данные)`);
                        return false
                    case 1:
                        if (!isSend)
                            this.showNotificationInfo(`Сначало отправьте смс для счетчика ${ item.serial_number }`)
                        return isSend
                    case 2:
                        if (isSend)
                            this.showNotificationInfo(`Смс для счетчика с серийным номером
                                                            ${item.serial_number} уже отправлена и находится в очереди,
                                                                        вы можете обновить ее статус`)
                        return !isSend
                    case 3:
                        this.showNotificationInfo(`Смс для счетчика с серийным номером
                                                                ${item.serial_number} уже доставлена`)
                        return false
                    case 4:
	                case 6:
		               isSend
                            ? this.showNotificationSuccess(`Повторный запрос на отправку смс для счетчика с серийным номером
                                                                            ${ item.serial_number }`)
                            : this.showNotificationSuccess(`Отправьте повторно смс для счетчика ${ item.serial_number }`)
                        return isSend
                    case 5:
                        if (isSend)
                            this.showNotificationInfo(`Смс для счетчика с серийным номером
                                                                    ${item.serial_number} передано оператору,
                                                                    вы можете обновить ее статус позже`)
                        return !isSend
                    case 7:
                        this.showNotificationInfo(`Отправка смс для счетчика с серийным номером
                                                                   ${item.serial_number} не требуется`)
                        return false
	                case 8:
		                if (isSend)
			                this.showNotificationInfo(`Смс для счетчика с серийным номером
                                                            ${ item.serial_number } уже отправлена и находится в ожидании
                                                             подтверждения, вы можете обновить ее статус`)
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

           /* //Обработчик события отмены отправки смс для счетчика
            smsConfirmDialogClose() {
                this.smsConfirmDialogModel = false
                this.meterForSmsRegistration = null
            },*/

            //Обработчик отправки смс для регистрации счетчика
            async sendSmsForRegistration(meter) {
                try {
	                this.showNotificationInfo(`Запрос на отправку смс для счетчика с серийным номером ${ meter.serial_number }`)
                    this.smsConfirmDialogModel = false
                    const updatedMeter = await this.registerMeterBySms(meter)
                    const mainUpdatedMeter = this.meters.find(mainMeter => updatedMeter.id === mainMeter.id)
                    Object.assign(mainUpdatedMeter, updatedMeter)
                    this.meterForSmsRegistration = null
                } catch (e) {
                    this.showNotificationRequestErrorWithCustomText(`Ошибка при отправке смс (id счетчика: ${ meter.id })`, e)
	                this.meterForSmsRegistration = null
                }
            },

            //Обработчик проверки статуса смс для счетчика
            async checkSmsStatus(item, isGroup) {
                if (await this.checkSmsStatusRestriction(item, false)) {
                    try {
                        let updatedMeter = await this.checkMeterSmsStatus(item)
                        if (updatedMeter.message) {
	                        this.showNotificationInfo(`${ updatedMeter.message }`)
                            return
                        }

                        const mainUpdatedMeter = this.meters.find((mainMeter) => updatedMeter.id === mainMeter.id)
                        if (mainUpdatedMeter) {
	                        Object.assign(mainUpdatedMeter, updatedMeter)
                        }

                        if (!isGroup) {
	                        this.showNotificationSuccess(`Статус смс счетчика ${ updatedMeter.serial_number } обновлен`)
                        }
                    } catch (e) {
                        this.showNotificationRequestErrorWithCustomText('Ошибка при получении статуса смс', e)
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
                    this.showNotificationInfo(`Количество обновленных смс статусов ${ checkSum } шт.`)
                } else {
	                this.showNotificationWarning('Не найдено ни одного счетчика для обновления статуса смс')
                }
            },
        },
    }
</script>

<style scoped>

</style>