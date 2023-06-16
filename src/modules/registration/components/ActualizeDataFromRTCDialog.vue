<template>
    <dialog-with-table-slot
        :dialog-open="dialogModel"
        max-width="1200px"
        title="Анализ полученных данных"
        :item-titles="titles"
        :success-action-status="successActualize"
        action-button-title="Актуализировать"
        :actionButtonLoading="loading"
        @okButtonClickEvent="actualizeDataFromRTC"
        @cancelButtonClickEvent="close"
    >
        <template v-slot:table-row-data>
            <tr
                v-for="meter in actualizeMeters"
                :key="meter.icc"
            >
                <td>{{ getMeterTypeTitle(meter.type) }}</td>
                <td>{{ meter.serial_number }}</td>
                <td>{{ meter.icc }}</td>
                <td>{{ getPhaseTitle(meter.phase) }}</td>
                <td>{{ meter.phone }}</td>
                <td>{{ getStatusTitle(meter.status) }}</td>
                <td class="text-center">
                    <v-chip v-if="meter.actualizeStatus === 'нет'" :color="colorGrey">{{ meter.actualizeStatus }}</v-chip>
                    <v-chip v-else-if="meter.actualizeStatus === 'ошибка'" :color="colorRed">{{ meter.actualizeStatus }}</v-chip>
                    <v-chip v-else-if="meter.actualizeStatus === 'да'" :color="colorGreen"> {{ meter.actualizeStatus }}</v-chip>
                    <v-chip v-else :color="colorOrange"> {{ meter.actualizeStatus }}</v-chip>
                </td>
            </tr>
        </template>
    </dialog-with-table-slot>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex"
    import DialogWithTableSlot from "../../utils-components/DialogWithTableSlot"

    export default {
        name: "ActualizeDataFromRTCDialog",
        data: () => ({
            dialogModel: false,
            titles: ["Тип", "Серийный номер", "ICC", "Фазность", "Номер телефона", "Статус", "Актуализирован"],
            successActualize: false,
            loading: false,
            successNumber: '',
            actualizeMeters: [],
            componentTitle: 'Диалог получения данных из ростелекома'
        }),
        components: {
            dialogWithTableSlot: DialogWithTableSlot
        },
        props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: ['showNotification', 'showNotificationComponentError', 'showNotificationStandardError', 'getPhaseTitle', 'getStatusTitle', 'getMeterTypeTitle' ],
        computed: {
            ...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue'])
        },
        methods: {
            ...mapActions('registration', ['actualizeMeterDataFromRTC', 'updateMeterDataFromRTC']),
            //Обработчик открытия диалога актуализации из ростелекома
            async open() {
                try {
                    this.meters.forEach((meter) => {
                        if (meter.phone === null)
                            this.actualizeMeters.push({ ...meter, actualizeStatus: 'нет' })
                    })

                    if (!this.actualizeMeters.length) {
                        this.showNotification(
                        	`Не найдено подходящих счетчиков для актуализации из ростелекома`,
                            this.colorOrange)
                        return
                    } else
                        this.showNotification(
                        	`Найдено несколько счетчиков (${this.actualizeMeters.length} шт.)
                                для актуализации в таблице, ожидаем ответа от Ростелекома, пожалуйста подождите`,
                                this.colorBlue)

                    //получаем список сим карт с данных от ростелекома и обновляем данные в диалоге
                    let rtcSimCardList = await this.actualizeMeterDataFromRTC()
                    this.actualizeMeters.forEach(meter => {
                        let find = false
                        rtcSimCardList.forEach(rtkSimData => {
                            if (meter.icc === rtkSimData.ICC) {
                                meter.status = rtkSimData.simcardStatus.SIMCardStatusId
                                meter.phone = rtkSimData.MSISDN
                                find = true
                            }
                        })

                        if (!find) {
	                        meter.actualizeStatus = 'не найден в базе ростелекома'
                        }
                    })

                    if (this.actualizeMeters.length)
                        this.dialogModel = true
                    else {
	                    this.showNotification('В базе ростелекома не найдено подходящих счетчиков для актуализации', this.colorOrange)
                    }
                } catch (e) {
                    this.showNotificationComponentError(this.componentTitle, e)
                }
            },

            //Обработчик события актуализации(получение данных о номера телефона и статусе счетчика из данных ростекома)
            async actualizeDataFromRTC() {
                this.loading = true

                if (!this.successActualize) {
                    //console.log(this.actualizeMeters)
                    this.actualizeMeters.forEach((meter) => {
                        //сохранение данных в бд и замена данных в главной таблице
                        this.updateMeterDataFromRTC(meter).then(
                            result => {
                                const updatedMeter = result.data
                                const mainUpdatedMeter = this.meters.find(mainMeter => updatedMeter.id === mainMeter.id)

                                Object.assign(mainUpdatedMeter, updatedMeter)
                                meter.actualizeStatus = 'да'
                                //console.log(meter)
                            },
                            e => {
                                this.showNotificationStandardError(e)
                                meter.actualizeStatus = 'ошибка'
                            }
                        )
                    })
                    this.loading = false
                    this.successActualize = true
                } else {
                    this.close()
                }
            },

            //Обработчик закрытия диалога актуализации
            close() {
                this.dialogModel = false
                this.actualizeMeters = []
                this.loading = false
                this.successActualize = false
            }
        }
    }
</script>

<style scoped>

</style>