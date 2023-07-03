<template>
    <v-dialog
        v-model="dialogModel"
        max-width="1400px"
        @keydown.enter="saveDataToExcel"
        @keydown.esc="close"
        @click:outside="hideDialog"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5">Список данных для выгрузки в пирамиду</span>
            </v-card-title>

            <v-card-text>
                <v-autocomplete
                    :items="availableStreetsArray"
                    label="Группировка по адресу"
                    @change="groupAddressOnChange"
                    chips
                    multiple
                    deletable-chips
                    clearable
                    filled
                    ref="addressSelect"
                    no-data-text="Ничего не найдено"
                />
                <v-data-table
                    fixed-header
                    height="500px"
                    :items="availableMetersArray"
                    :headers="headers"
                    class="elevation-1"
                    :loading="loading"
                    :footer-props="{
                        'items-per-page-text':'записей на странице',
                        'items-per-page-options': [10, 20, 40, 100]
                    }"
                >
                    <template v-slot:item.type="{ item }">
                        {{ getMeterTypeTitle(item.type) }}
                    </template>
                    <template v-slot:item.in_pyramid="{ item }">
                        <v-chip v-if="item.in_pyramid === 0" :color="colorGrey">Не загружен</v-chip>
                        <v-chip v-else :color="colorGreen">Загружен</v-chip>
                    </template>
                    <template v-slot:item.readyToLoad="{ item }">
                        <v-checkbox
                            ref="readyToLoadCheckBox"
                            :color="colorGreen"
                            v-model="item.readyToLoad"
                            :disabled="item.in_pyramid === 1"
                        />
                    </template>
                    <template v-slot:footer.prepend>
                        <buttonWithTooltip
                            title="Скачать файл excel"
                            icon="mdi-download-box"
                            @buttonClickEvent="saveDataToExcel"
                            btnClass="mr-1"
                        />
                        <buttonWithTooltip
                            title="Подтвердить загрузку в пирамиду"
                            icon="mdi-database-check"
                            @buttonClickEvent="approveLoadedExcelData"
                            btnClass=""
                        />
                    </template>
                    <template v-slot:header.readyToLoad >
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <button
                                    @click="selectAllClick"
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-right: 8px"
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
                    ОК
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import saveExcelFileForPyramid from "../js/saveLoadDataToPyramidExcel";
    import { mapActions, mapState } from "vuex";
    import ButtonWithTooltip from "../../utils-components/ButtonWithTooltip";

    export default {
        name: "SaveDataToExcelDialog",
        components: {
            buttonWithTooltip: ButtonWithTooltip,
        },
        data: () => ({
            loading: false,
            hide: false,
            selectAll: false,
            defaultMetersArray: [],
            availableMetersArray: [],
            availableStreetsArray: [],
            availableStreetsModel: [],
            actionButtonLoading: false,
            dialogModel: false,
            headers: [
                { text: '', align: 'center', value: 'readyToLoad', sortable: false  },
                { text: 'ID', align: 'center', value: 'id', sortable: false  },
                { text: 'Тип лица', align: 'center', value: 'customer_type', cellClass: 'table-small-cell', sortable: false },
                { text: 'Тип счетчика', align: 'center', value: 'type', cellClass: 'table-small-cell', sortable: false  },
                { text: 'Серийный номер', align: 'center', value: 'serial_number', cellClass: 'table-small-cell', sortable: false },
                { text: 'Номер лицевого', align: 'center', value: 'personal_account', cellClass: 'table-small-cell', sortable: false },
                { text: 'Наименование', align: 'center', value: 'customer', cellClass: 'table-small-cell', sortable: false },
                { text: 'Адрес', align: 'center', value: 'customer_address', cellClass: 'table-small-cell', sortable: false  },
                { text: 'Пирамида', align: 'center', value: 'in_pyramid', sortable: false},
            ],
        }),
        computed: {
            ...mapState({
                colorBlue: state => state.colorBlue,
                colorRed: state => state.colorRed,
                colorGreen: state => state.colorGreen,
                colorOrange: state => state.colorOrange,
                colorGrey: state => state.colorGrey
            }),
        },
        props: {
            meters: {
                type: Array,
                required: true
            },
        },
        inject: [
        	'getMeterTypeTitle',
            'showNotificationSuccess',
            'showNotificationWarning',
            'showNotificationError',
            'getIpAddressTitle'
        ],
        methods: {
            ...mapActions('registration', ['updateMeterAfterLoadInPyramid']),
            open() {
                //console.log(this.availableMetersArray)
                if (this.hide) {
                    this.dialogModel = true
                    return
                }

                this.meters.forEach(meter => {
                    if (meter.personal_account && meter.in_pyramid === 0) {
                        let addressArray = meter.customer_address.split(',')
                        let house =
                            addressArray[1]
                                ? addressArray[2]
                                    ? `${ addressArray[1]}, ${addressArray[2] }`
                                    : `${ addressArray[1] }`
                                : addressArray[0]

                        meter.calculatedHouse = house
                        meter.readyToLoad = false
                        this.availableMetersArray.push(Object.assign({}, meter))
                        this.availableStreetsArray.push(house)
                    }
                })

                if (this.availableMetersArray.length) {
                    this.dialogModel = true
                    this.defaultMetersArray = this.availableMetersArray
                }
                else {
                    this.showNotificationWarning('Не найдено счетчиков для выгрузки в пирамиду')
                    this.close()
                }

            },

            close() {
                this.dialogModel = false
                this.availableMetersArray = []
                this.defaultMetersArray.length = []
                this.availableStreetsArray.length = []
                if (this.$refs.addressSelect) {
	                this.$refs.addressSelect.reset()
                }
                this.selectAll = false
                this.hide = false
            },

            hideDialog() {
                this.hide = true
            },

            groupAddressOnChange(houses) {
                if (houses.length) {
                    let selectedMeters = []
                    houses.forEach((house) => {
                    	const metersArray = this.defaultMetersArray.filter((meter) => house === meter.calculatedHouse)
                        selectedMeters = selectedMeters.concat(metersArray)
                    })
                    this.availableMetersArray = selectedMeters
                } else {
                    this.availableMetersArray = this.defaultMetersArray
                }
            },

            saveDataToExcel() {
                let preUpdateArray = this.availableMetersArray
                        .filter(meter => meter.in_pyramid === 0 && !meter.loaded)
                if (!preUpdateArray.length) {
                    this.showNotificationWarning('Нет подходящих записей для выгрузки в excel')
                    return
                }
                saveExcelFileForPyramid(preUpdateArray, this.getIpAddressTitle)
            },

            selectAllClick() {
                this.availableMetersArray = this.availableMetersArray.map((meter) => {
                    const readyToLoad = meter.in_pyramid === 1 && meter.loaded ? false : !this.selectAll
                    return { ...meter, readyToLoad: readyToLoad }
                })
                this.selectAll = !this.selectAll
            },

            async approveLoadedExcelData() {
                let preUpdateArray = this.availableMetersArray
                                .filter(meter => meter.readyToLoad && meter.in_pyramid === 0 && !meter.loaded)

                if (!preUpdateArray.length) {
                    this.showNotificationWarning('Нет подходящих записей для подтверждения загрузки')
                    return
                }

                this.updateMeterAfterLoadInPyramid(preUpdateArray.map((meter) => meter.id)).then(
                    data => {
                        for (const record of data) {
                            //Обновление записи в текущем интерфейсе выбранных счетчиков по адресу
                            const updatedMeter = this.availableMetersArray.find((meter) => record.id === meter.id)
                            Object.assign(updatedMeter, record)

                            //Обновление записи в главном интерфейсе
                            const updatedMainMeter = this.meters.find((meter) => record.id === meter.id)
                            Object.assign(updatedMainMeter, record)

                            //Обновление записи в дефолтном списке счетчиков (при условии очищения списка адресов)
                            const updatedDefaultMeter = this.defaultMetersArray.find((meter) => record.id === meter.id)
                            Object.assign(updatedDefaultMeter, record)
                        }
                        this.showNotificationSuccess('Подтверждение данных прошло успешно')
                    }
                ).catch(
                    e => this.showNotificationRequestErrorWithCustomText('При подтверждения данных произошла ошибка', e)
                )
            },
        }
    }
</script>

<style>
    td  {
        font-size: 12px !important;
    }
    th  {
        font-size: 10px !important;
    }
    .table-small-cell {
        font-size: 12px !important;
    }
</style>