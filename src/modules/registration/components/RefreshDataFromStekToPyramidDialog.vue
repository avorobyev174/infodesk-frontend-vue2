<template>
    <v-dialog
        v-model="dialogModel"
        max-width="1400px"
        @keydown.enter="refreshDataFromStek"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-card>
            <v-card-title style="display: flex; flex-direction: column">
                <span class="m-auto text-h5">Список счетчиков для акутализации данных</span>
                <span class="m-auto text-h7">{{ successNumber }}</span>
            </v-card-title>

            <v-card-text>
                <v-data-table
                    fixed-header
                    height="500px"
                    :items="refreshMeters"
                    :headers="headers"
                    class="elevation-1"
                    :loading="loading"
                    :footer-props="{
                        'items-per-page-text':'записей на странице',
                        'items-per-page-options': [10, 20, 40, 100]
                    }"
                >
                <template v-slot:item.readyToActualize="{ item }">
                    <v-checkbox
                        ref="readyToActualizeCheckBox"
                        :color="colorGreen"
                        v-model="item.readyToActualize"
                    />
                </template>
                <template v-slot:item.oldMeterData.type="{ item }">
                    {{ getMeterTypeTitle(item.oldMeterData.type) }}
                </template>
                <template v-slot:item.oldMeterData.personal_account="{ item }">
                    <v-chip
                        v-if="item.diff === 'diff' && item.oldMeterData.personal_account !== item.newMeterData.personal_account"
                        :color="colorOrange"
                    >
                        {{ `${item.oldMeterData.personal_account ? item.oldMeterData.personal_account : 'отсутствует'}  →  ${item.newMeterData.personal_account ? item.newMeterData.personal_account : 'отсутствует'}` }}
                    </v-chip>
                    <v-chip
                        v-else-if="item.diff === 'not_exist'"
                        :color="colorRed"
                    >
                        {{ item.oldMeterData.personal_account }}
                    </v-chip>
                    <span v-else> {{ item.oldMeterData.personal_account }}</span>
                </template>
                <template v-slot:item.oldMeterData.customer_address="{ item }">
                    <v-chip
                        v-if="item.diff === 'diff' && item.oldMeterData.customer_address !== item.newMeterData.customer_address"
                        :color="colorOrange"
                    >
                        {{ `${item.oldMeterData.customer_address ? item.oldMeterData.customer_address : 'отсутствует' }`+ '  →  ' + item.newMeterData.customer_address }}
                    </v-chip>
                    <v-chip
                        v-else-if="item.diff === 'not_exist'"
                        :color="colorRed"
                    >
                        {{ item.oldMeterData.customer_address }}
                    </v-chip>
                    <span v-else> {{ item.oldMeterData.customer_address }}</span>
                </template>
                <template v-slot:item.oldMeterData.kftt="{ item }">
                    <v-chip
                        v-if="item.diff === 'diff' && item.oldMeterData.kftt !== parseInt(item.newMeterData.kftt)"
                        :color="colorOrange"
                    >
                        {{ `${ item.oldMeterData.kftt ? item.oldMeterData.kftt : 'отсутствует'}`+ '  →  ' + item.newMeterData.kftt }}
                    </v-chip>
                    <v-chip
                        v-else-if="item.diff === 'not_exist'"
                        :color="colorRed"
                    >
                        {{ item.oldMeterData.kftt }}
                    </v-chip>
                    <span v-else> {{ item.oldMeterData.kftt }}</span>
                </template>
                <template v-slot:item.actualizeStatus="{ item }">
                    <v-chip v-if="item.actualizeStatus === 'нет'" :color="colorGrey">{{ item.actualizeStatus }}</v-chip>
                    <v-chip v-else-if="item.actualizeStatus === 'ошибка'" :color="colorRed">{{ item.actualizeStatus }}</v-chip>
                    <v-chip v-else :color="colorGreen"> {{ item.actualizeStatus }}</v-chip>
                </template>
                <template v-slot:header.readyToActualize="{ header }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <button
                                @click="selectAllClick"
                                v-bind="attrs"
                                v-on="on"
                                style="margin-right: 8px; text-align: left !important;"
                            >
                                <v-icon v-if="selectAll">mdi-checkbox-marked</v-icon>
                                <v-icon v-else="selectAll">mdi-checkbox-blank</v-icon>
                            </button>
                        </template>
                        <span>Выделить/Снять все</span>
                    </v-tooltip>
                </template>
                </v-data-table>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="refreshDataFromStek"
                >
                    {{ okButtonTitle }}
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="showAllListMeters"
                >
                    {{ showListTitle }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import DialogWithTableSlot from "../../utils-components/DialogWithTableSlot";
    import {mapActions, mapMutations, mapState} from "vuex";
    import saveExcelFileForPyramid from "../js/saveLoadDataToPyramidExcel";
    import saveDeletedMeterDataFromStekToExcelFile from "../js/saveDeletedFromStekMetersDataToExcel";

    export default {
        name: "RefreshDataFromStekToPyramidDialog",
        components: {
            dialogWithTableSlot: DialogWithTableSlot
        },
        data: () => ({
            dialogModel: false,
            hide: false,
            selectAll: false,
            headers: [
                { text: '', align: 'center', value: 'readyToActualize', sortable: false },
                { text: 'Тип счетчика', align: 'center', value: 'oldMeterData.type', cellClass: 'table-small-cell', sortable: false  },
                { text: 'Серийный номер', align: 'center', value: 'oldMeterData.serial_number', cellClass: 'table-small-cell', sortable: false },
                { text: 'Номер лицевого', align: 'center', value: 'oldMeterData.personal_account', cellClass: 'table-small-cell', sortable: false },
                { text: 'Адрес', align: 'center', value: 'oldMeterData.customer_address', cellClass: 'table-small-cell', sortable: false },
                { text: 'Коэффициент трансформации', align: 'center', value: 'oldMeterData.kftt', cellClass: 'table-small-cell', sortable: false },
                { text: 'Актуализирован', align: 'center', value: 'actualizeStatus', sortable: false},
            ],
            successActualize: false,
            loading: false,
            showAllList: false,
            successNumber: '',
            refreshMeters: [],
            refreshOtherMeters: [],
            updatedMeters: [],
            componentTitle: 'Диалог обновления данных из стека'
        }),
        props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: [
        	'showNotificationRequestError',
            'showNotificationInfo',
            'showNotificationWarning',
            'getMeterTypeTitle',
            'getIpAddressTitle'
        ],
        computed: {
            ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue' ]),
            okButtonTitle() {
                return this.successActualize ? 'Скачать excel файл для удаления' : 'Актуализировать'
            },
	        showListTitle() {
		        return this.showAllList ? 'Скрыть незначительные' : 'Показать полный список'
	        }
        },
        methods: {
            ...mapMutations('registration', [ 'setLoading' ]),
            ...mapActions('registration', [ 'refreshMetersDataFromStek','saveRefreshedMeterDataFromStek' ]),
            //Обработчик открытия диалога актуализации из стэка
            async open() {
                try {
                    this.showNotificationInfo('Ожидаем ответа от базы СТЭКа, пожалуйста подождите (ожидаемое время 5 мин)')
                    this.setLoading(true)

                    const data = await this.refreshMetersDataFromStek()
                    this.refreshMeters = data.diff.map(m => ({ ...m, actualizeStatus: 'нет'}))

                    //console.log(this.refreshMeters)
                    this.setLoading(false)

                    if (this.refreshMeters.length) {
                        this.successNumber = `${ this.refreshMeters.length } / ${ data.total }`

                        if (this.refreshMeters.length) {
                            this.refreshMeters = this.refreshMeters.map(m => {
                                let readyToActualize = true
                                if (m.diff === 'diff' &&
                                    m.oldMeterData.customer_address !== m.newMeterData.customer_address &&
                                    m.oldMeterData.personal_account === m.newMeterData.personal_account
                                ) {
                                    const oldAddressArray = m.oldMeterData.customer_address.split(' ')
                                    const newAddressArray = m.newMeterData.customer_address.split(' ')

                                    const diffAddressArray = []
                                    try {
                                        for (let i = 0; i < oldAddressArray.length; i++) {
                                            //console.log(oldAddressArray[i], newAddressArray[i], oldAddressArray[i] !== newAddressArray[i])
                                            if (oldAddressArray[i] !== newAddressArray[i]) {
                                                diffAddressArray.push(1)
                                            }
                                        }
                                    } catch (e) {}
                                    finally {
                                        //console.log(m.oldMeterData.serial_number, diffAddressArray.length)
                                        if (diffAddressArray.length <= 2) {
	                                        readyToActualize = false
                                        }
                                    }

                                }
                                return { ...m, readyToActualize }
                            })
	                        this.refreshOtherMeters = this.refreshMeters.filter(m => !m.readyToActualize)
                            this.refreshMeters = this.refreshMeters.filter(m => m.readyToActualize)

                            this.dialogModel = true
                        }
                    } else {
                        this.showNotificationWarning('В базе не найдено подходящих счетчиков для обновления информации из стэка')
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                } finally {
                    this.setLoading(false)
                }
            },

            //Обработчик закрытия диалога актуализации
            close() {
                this.dialogModel = false
                this.successActualize = false
                this.refreshMeters = []
                this.updatedMeters = []
                this.loading = false
            },

            //Обработчик события актуализации(получение и сохранение данных из стэка)
            async refreshDataFromStek() {
                this.loading = true
                try {
                    if (!this.successActualize) {
                        for (const meter of this.refreshMeters.filter(m => m.readyToActualize)) {

                            const emptyMeter = {
                                comment: null,
                                customer: null,
                                customer_address: null,
                                customer_email: null,
                                customer_phone: null,
                                customer_type: null,
                                personal_account: null,
                                serial_number: null,
                                kftt: null,
                            }

                            let refreshMeter = meter.newMeterData ? meter.newMeterData : emptyMeter
                            const diff = meter.diff
                            refreshMeter = { ...refreshMeter, id: meter.oldMeterData.id, data: meter.oldMeterData }
                            //сохранение данных в бд и замена данных в главной таблице
                            this.saveRefreshedMeterDataFromStek(refreshMeter).then(
                                result => {
                                    const updatedMeter = result.data
                                    const mainUpdatedMeter = this.meters.find((mainMeter) => {
                                        return updatedMeter.id === mainMeter.id
                                    })

                                    if (mainUpdatedMeter) {
	                                    Object.assign(mainUpdatedMeter, updatedMeter)
                                    }

                                    this.updatedMeters.push({ ...updatedMeter, diff, oldAddress: meter.oldMeterData.customer_address })
                                    meter.actualizeStatus = 'да'
                                },
                                e => {
                                    this.showNotificationRequestError(e)
                                    meter.actualizeStatus = 'ошибка'
                                }
                            )
                        }
                        this.loading = false
                        this.successActualize = true
                    } else {
                        console.log(this.updatedMeters)
                        const diffArray = this.updatedMeters.filter(m => m.diff === 'diff')
                        //const notExistArray = this.updatedMeters.filter(m => m.diff === 'not_exist')
                        const deleteArray = this.updatedMeters
                        //console.log(diffArray.length + ' ' + deleteArray.length)
                        if (diffArray.length) {
	                        saveExcelFileForPyramid(diffArray, this.getIpAddressTitle)
                        }
                        if (deleteArray.length) {
	                        saveDeletedMeterDataFromStekToExcelFile(deleteArray, this.getMeterTypeTitle)
                        }
                        this.loading = false
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },

            selectAllClick() {
                this.refreshMeters = this.refreshMeters.map(meter => {
                    let readyToActualize = !this.selectAll
                    return { ...meter, readyToActualize }
                })
                this.selectAll = !this.selectAll
            },

	        showAllListMeters() {
		        this.showAllList = !this.showAllList
		        this.refreshMeters =
                    this.showAllList
		            ? this.refreshMeters.concat(this.refreshOtherMeters)
                    : this.refreshMeters.filter(m => m.readyToActualize)
            }
        },
    }
</script>

<style scoped>

</style>