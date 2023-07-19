<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="1400"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-card>
            <v-card-title style="display: flex; flex-direction: column">
                <span class="m-auto text-h5">Список счетчиков для обновления данных</span>
                <span class="m-auto text-h7">{{ meterCount }}</span>
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
                        'items-per-page-options': [ 20, 50, 100 ]
                    }"
                >
                <template v-slot:item.readyToRefresh="{ item }">
                    <v-checkbox
                        ref="readyToRefreshCheckBox"
                        :color="colorGreen"
                        v-model="item.readyToRefresh"
                        @change="test"
                    />
                </template>
                <template v-slot:item.oldData.type="{ item }">
                    {{ getMeterTypeTitle(item.oldData.type) }}
                </template>
                <template v-slot:item.oldData.personal_account="{ item }">
                    <v-chip v-if="item.difference.includes(Difference.PERSONAL_ACCOUNT)" :color="colorOrange">
                        {{ `${ checkIfNoExist(item.oldData.personal_account) } → ${ checkIfNoExist(item.newData.personal_account) }` }}
                    </v-chip>
                    <v-chip v-else-if="item.difference.includes(Difference.NOT_EXIST)" :color="colorRed">
                        {{ checkIfNoExist(item.oldData.personal_account) }}
                    </v-chip>
                    <span v-else>{{ checkIfNoExist(item.oldData.personal_account) }}</span>
                </template>
                <template v-slot:item.oldData.customer_address="{ item }">
                    <v-chip  v-if="item.difference.includes(Difference.ADDRESS)" :color="colorOrange">
                        {{ `${ checkIfNoExist(item.oldData.customer_address) } → ${ checkIfNoExist(item.newData.customer_address)}` }}
                    </v-chip>
                    <v-chip v-else-if="item.difference.includes(Difference.NOT_EXIST)" :color="colorRed">
                        {{ checkIfNoExist(item.oldData.customer_address) }}
                    </v-chip>
                    <span v-else>{{ checkIfNoExist(item.oldData.customer_address) }}</span>
                </template>
                <template v-slot:item.oldData.kftt="{ item }">
                    <v-chip v-if="item.difference.includes(Difference.KFTT)" :color="colorOrange">
                        {{ `${ checkIfNoExist(item.oldData.kftt) } → ${ item.newData.kftt }` }}
                    </v-chip>
                    <v-chip v-else-if="item.difference.includes(Difference.NOT_EXIST)" :color="colorRed">
                        {{ item.oldData.kftt }}
                    </v-chip>
                    <span v-else>{{ item.oldData.kftt }}</span>
                </template>
                <template v-slot:item.refreshStatus="{ item }">
                    <v-chip v-if="item.refreshStatus === 'нет'" :color="colorGrey">{{ item.refreshStatus }}</v-chip>
                    <v-chip v-else-if="item.refreshStatus === 'ошибка'" :color="colorRed">{{ item.refreshStatus }}</v-chip>
                    <v-chip v-else :color="colorGreen"> {{ item.refreshStatus }}</v-chip>
                </template>
                <template v-slot:header.readyToRefresh="{ header }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <button
                                @click="selectAllClick"
                                v-bind="attrs"
                                v-on="on"
                                style="margin-right: 8px; text-align: left !important;"
                            >
                                <v-icon v-if="selectAll">mdi-checkbox-marked</v-icon>
                                <v-icon v-else>mdi-checkbox-blank</v-icon>
                            </button>
                        </template>
                        <span>Выделить/Снять все</span>
                    </v-tooltip>
                </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Отмена</v-btn>
                <v-btn color="blue darken-1" text @click="actualizeDataFromSTEK">{{ okButtonTitle }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions, mapState } from "vuex"
    import saveDataToPyramidExcelFile from "../js/saveDataToPyramidExcelFile"
    import { saveDataToExcelFile } from "../../Utils"
    import { Difference } from "../../../const"
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "RefreshDataFromSTEKDialog",
        data: () => ({
	        Difference,
            hide: false,
            selectAll: false,
            headers: [
                { text: '', align: 'center', value: 'readyToRefresh', sortable: false },
                { text: 'Тип счетчика', align: 'center', value: 'oldData.type', sortable: false  },
                { text: 'Серийный номер', align: 'center', value: 'oldData.serial_number', sortable: false },
                { text: 'Номер лицевого', align: 'center', value: 'oldData.personal_account', sortable: false },
                { text: 'Адрес', width: '100px', align: 'center', value: 'oldData.customer_address', sortable: false },
                { text: 'Коэффициент трансформации', align: 'center', value: 'oldData.kftt', sortable: false },
                { text: 'Обновлен', align: 'center', value: 'refreshStatus', sortable: false},
            ],
	        emptyMeter: {
		        comment: null,
		        customer: null,
		        customer_address: null,
		        customer_email: null,
		        customer_phone: null,
		        customer_type: null,
		        personal_account: null,
		        serial_number: null,
		        kftt: 1,
	        },
            successRefresh: false,
            loading: false,
            meterCount: '',
            refreshMeters: [],
            successfullyRefreshedMeters: [],
        }),
        mixins: [ DialogMixin ],
        props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: [
        	'showNotificationRequestError',
            'showNotificationInfo',
            'getMeterTypeTitle',
            'getIpAddressTitle',
            'getMeters'
        ],
        computed: {
            ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange' ]),
            okButtonTitle() {
                return this.successRefresh ? 'Скачать excel файл для удаления' : 'Актуализировать'
            },
        },
        methods: {
            ...mapActions('programming', [ 'refreshMeterDataFromSTEK', 'saveRefreshedMetersDataFromSTEK' ]),
            async open() {
                try {
                    this.showNotificationInfo('Отправлен запрос на получение обновленных данных из СТЕКа')
                    const { refreshedMeters, totalCount } = await this.refreshMeterDataFromSTEK()
	                console.log(refreshedMeters)
                    if (!refreshedMeters?.length) {
	                   return this.showNotificationInfo('Обновленные данные не найдены')
                    }                    
                    this.refreshMeters = refreshedMeters.map((meterData) => ({
                        ...meterData,
                        refreshStatus: 'нет',
                        readyToRefresh: false
                    }))
                    this.meterCount = `${ this.refreshMeters.length } / ${ totalCount }`
                    this.dialogOpen()
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },

            //Обработчик закрытия диалога актуализации
            close() {
	            this.dialogClose()
                this.successRefresh = false
                this.refreshMeters = []
                this.successfullyRefreshedMeters = []
                this.loading = false
            },

            //Обработчик события актуализации(получение и сохранение данных из стэка)
            async actualizeDataFromSTEK() {
                try {
                    if (!this.successRefresh) {
	                    console.log(this.refreshMeters)
	                    const metersReadyToRefresh = this.refreshMeters.filter(({ readyToRefresh }) => readyToRefresh).map((meterData) => {
		                    const { id, oldData, newData, difference } = meterData
		                    const refreshMeterData = newData ? newData : this.emptyMeter
		                    return { id, oldData, ...refreshMeterData, difference }
	                    })
	                    console.log(metersReadyToRefresh)
	                    this.loading = true
	                    this.successfullyRefreshedMeters = await this.saveRefreshedMetersDataFromSTEK(metersReadyToRefresh)
	                    console.log(this.successfullyRefreshedMeters)
                        for (const successfullyRefreshedMeter of this.successfullyRefreshedMeters) {
                        	const refreshMeter = this.refreshMeters.find(({ id }) => successfullyRefreshedMeter.id === id)
	                        refreshMeter ? refreshMeter.refreshStatus = 'да': refreshMeter.refreshStatus = 'ошибка'
                        }
	                    this.loading = false
	                    this.successRefresh = true
	                    await this.getMeters()
                    } else {
                        console.log(this.successfullyRefreshedMeters)
                        const differenceMeters = this.successfullyRefreshedMeters.filter(({ difference }) => !difference.includes(Difference.NOT_EXIST))
                        const deleteMeters = this.successfullyRefreshedMeters
                        if (differenceMeters.length) {
	                        saveDataToPyramidExcelFile(differenceMeters, this.getIpAddressTitle)
                        }
                        if (deleteMeters.length) {
                        	const data = this.prepareData(deleteMeters)
                            data.unshift([ 'Тип', 'Серийный номер', 'Адрес' ])
	                        saveDataToExcelFile(
		                        data,
		                        'Список счетчиков для удаления',
                                [ { width: 25 }, { width: 15 }, { width: 35 } ],
		                        'delete_pyramid.xlsx'
                            )
                        }
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },

            selectAllClick() {
                this.refreshMeters = this.refreshMeters.map((meter) => ({ ...meter, readyToRefresh: !this.selectAll }))
                this.selectAll = !this.selectAll
            },

            checkIfNoExist(value) {
            	return value ? value : 'отсутствует'
            },

	        prepareData(meters) {
		        return meters.map(({ type, serial_number, oldAddress }) => [
		        	this.getMeterTypeTitle(type),
                    serial_number,
                    oldAddress
                ])
            },

	        test() {
		        console.log(this.refreshMeters)
            }
        },
    }
</script>
