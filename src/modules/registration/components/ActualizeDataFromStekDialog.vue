<template>
    <!-- Диалог акутализации данных из стэка-->
    <dialog-with-table-slot
        :dialog-open="dialogModel"
        max-width="1300px"
        title="Анализ полученных данных"
        :item-titles="titles"
        :success-action-status="successActualize"
        action-button-title="Актуализировать"
        @okButtonClickEvent="actualizeDataFromStek"
        @cancelButtonClickEvent="close"
        :actionButtonLoading="loading"
        :successCountNumber="successNumber"
        height="500px"
    >
        <template v-slot:table-row-data>
            <tr
                v-for="meter in actualizeMeters"
                :key="meter.icc"
            >
                <td>{{ getMeterTypeTitle(meter.type) }}</td>
                <td>{{ meter.serial_number }}</td>
                <td>{{ meter.personal_account }}</td>
                <td>{{ meter.customer }}</td>
                <td>{{ meter.customer_address }}</td>
                <td>{{ meter.customer_phone }}</td>
                <td>{{ meter.customer_email }}</td>
                <td>{{ meter.kftt }}</td>
                <td>{{ meter.customer_type }}</td>
                <td>
                    <v-chip v-if="meter.actualizeStatus === 'нет'" :color="colorGrey">{{ meter.actualizeStatus }}</v-chip>
                    <v-chip v-else-if="meter.actualizeStatus === 'ошибка'" :color="colorRed">{{ meter.actualizeStatus }}</v-chip>
                    <v-chip v-else :color="colorGreen"> {{ meter.actualizeStatus }}</v-chip>
                </td>
            </tr>
        </template>
    </dialog-with-table-slot>
</template>

<script>
    import DialogWithTableSlot from "../../utils-components/DialogWithTableSlot";
    import {mapActions, mapMutations, mapState} from "vuex";

    export default {
        name: "ActualizeDataFromStekDialog",
        components: {
            dialogWithTableSlot: DialogWithTableSlot
        },
        data: () => ({
            dialogModel: false,
            titles: [
            	'Тип счетчика',
                'Серийный номер',
                'Номер лицевого',
                'Наименование',
                'Адрес',
                'Телефон',
                'Почта',
                'КТТ',
                'Тип лица',
                'Актуализирован'
            ],
            successActualize: false,
            loading: false,
            successNumber: '',
            actualizeMeters: [],
            componentTitle: 'Диалог получения данных из стека',
            updatedMeters: []
        }),
        props: {
          meters: {
              type: Array,
              required: true
          }
        },
        inject: ['showNotification', 'showNotificationComponentError', 'getMeterTypeTitle'],
        computed: {
            ...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue'])
        },
        methods: {
            ...mapMutations('registration', ['setLoading']),
            ...mapActions('registration', ['actualizeMetersDataFromStek', 'updateMeterDataFromStek', 'actualizeMeterDataFromStek']),
            //Обработчик открытия диалога актуализации из стэка
            async open() {
                try {
	                this.actualizeMeters.length = 0
                    this.showNotification('Ожидаем ответа от базы СТЭКа, пожалуйста подождите (ожидаемое время 2-3 мин)', this.colorBlue)
                    this.setLoading(true)
                    this.meters.forEach(meter => {
                        if (meter.personal_account === null) {
	                        this.actualizeMeters.push({ ...meter, actualizeStatus: 'нет' })
                        }
                    })

                    if (this.actualizeMeters.length > 0) {
	                    this.updatedMeters = await this.actualizeMetersDataFromStek()

                        if (!this.updatedMeters.length) {
                            this.showNotification('В базе стэка не найдено подходящих счетчиков для актуализации', this.colorOrange)
                            this.close()
                        } else {
                            this.actualizeMeters =
                                this.actualizeMeters.filter(meter => {
                                    let updMeter = this.updatedMeters
                                        .find(updatedMeter => updatedMeter.serial_number === meter.serial_number)

                                    if (!updMeter) {
	                                    return false
                                    }

                                    delete updMeter.type
                                    //если счетчик ОДУ и не имеет лицевого счета
                                    if (updMeter.customer_type === 'ОДУ') {
                                        updMeter.personal_account = '99999999999'
                                        updMeter.customer = 'Технический учет'
                                    }

                                    //замена данных в диалоге (все кроме типа)
                                    Object.assign(meter, updMeter)
                                    return true
                                })

	                            this.successNumber = `${ this.updatedMeters.length }/${ this.actualizeMeters.length }`
                            if (this.actualizeMeters.length) {
                                this.dialogModel = true
                            } else  {
                                this.showNotification(
                                	`В базе стэка не найдено подходящих счетчиков для актуализации`,
                                    this.colorOrange
                                )
                                this.close()
                            }
                        }
                    } else {
                        this.showNotification('В базе не найдено подходящих счетчиков для актуализации из стэка', this.colorOrange)
                    }
                } catch (e) {
                    this.showNotificationComponentError(this.componentTitle, e)
                } finally {
                    this.setLoading(false)
                }
            },

            //Обработчик события актуализации(получение и сохранение данных из стэка)
            async actualizeDataFromStek() {
                this.loading = true
                try {
                    if (!this.successActualize) {
                            for (const meter of this.actualizeMeters) {
                                //сохранение данных в бд и замена данных в главной таблице
                                this.updateMeterDataFromStek(meter).then(
                                    result => {
                                        const updatedMeter = result.data
                                        const mainUpdatedMeter = this.meters
                                            .find(mainMeter => updatedMeter.id === mainMeter.id)

                                        Object.assign(mainUpdatedMeter, updatedMeter)
                                        meter.actualizeStatus = 'да'
                                    },
                                    e => {
                                        this.showNotificationComponentError(this.componentTitle, e)
                                        meter.actualizeStatus = 'ошибка'
                                    }
                                )
                            }
                            this.loading = false
                            this.successActualize = true
                    } else
                        this.close()
                } catch (e) {
                    this.showNotificationComponentError(this.componentTitle, e)
                }
            },

            async actualizeSingleData(item) {
	            try {
	            	if (item.personal_account !== null) {
                        this.showNotification(`Счетчик ${ item.serial_number } уже актуализирован`,
                                                    this.colorOrange)
			            return
                    }

                    const updatedMeter = await this.actualizeMeterDataFromStek(item)
                    console.log(updatedMeter)
                    const mainUpdatedMeter = this.meters.find((mainMeter) => {
                        return updatedMeter.id === mainMeter.id
                    })

                    if (mainUpdatedMeter) {
                        Object.assign(mainUpdatedMeter, updatedMeter)
                        this.showNotification(`Данные счетчика
                                                    ${ updatedMeter.serial_number } успешно актуализированы`,
                                                    this.colorGreen)
                    }
                } catch (e) {
                    this.showNotificationComponentError(this.componentTitle, e)
                }
            },

            //Обработчик закрытия диалога актуализации
            close() {
                this.dialogModel = false
                this.successActualize = false
                this.actualizeMeters = []
                this.updatedMeters = []
                this.loading = false
            },
        },
    }
</script>

<style scoped>

</style>