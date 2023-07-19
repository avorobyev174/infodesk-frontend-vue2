<template>
    <v-dialog
        v-model="dialogModel"
        max-width="1400px"
        @keydown.esc="close"
        @click:outside="hide = true"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5">Список данных для выгрузки в пирамиду</span>
            </v-card-title>

            <v-card-text>
                <div style="display:flex; gap: 10px;">
                    <v-autocomplete
                        :items="buildings"
                        label="Адрес"
                        @change="addressChange"
                        chips
                        multiple
                        deletable-chips
                        clearable
                        filled
                        ref="BuildingSelect"
                        no-data-text="Ничего не найдено"
                        height="100px"
                    />
                    <div style="display:flex; flex-direction: column; justify-content: start; gap: 10px">
                        <button-with-tooltip
                            title="Подтвердить загрузку в пирамиду"
                            icon="mdi-database-check"
                            @click="approveLoad"
                            :height="45"
                        />
                        <button-with-tooltip
                            title="Скачать файл excel"
                            icon="mdi-download-box"
                            @click="saveDataToExcel"
                            :height="45"
                            :color="colorGreen"
                        />
                    </div>
                </div>
                <v-data-table
                    fixed-header
                    height="500px"
                    :items="unloadMeters"
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
                            :color="colorGreen"
                            v-model="item.readyToLoad"
                            :disabled="item.in_pyramid === 1"
                        />
                    </template>
                    <template v-slot:footer.prepend>

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
                <v-btn color="blue darken-1" text @click="close">Закрыть</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import saveDataToPyramidExcelFile from "../js/saveDataToPyramidExcelFile"
    import { spliceCustomerAddress } from "../js/meters-filter-values"
    import { mapActions, mapState } from "vuex"
    import ButtonWithTooltip from "../../utils-components/button/ButtonWithTooltip"
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "SaveDataToExcelDialog",
        components: {
            ButtonWithTooltip,
        },
        data: () => ({
            loading: false,
            hide: false,
            selectAll: false,
            defaultUnloadMeters: [],
            unloadMeters: [],
            buildings: [],
            availableStreetsModel: [],
            actionButtonLoading: false,
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
        mixins: [ DialogMixin ],
        computed: {
            ...mapState([ 'colorGreen', 'colorGrey' ])
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
            'showNotificationInfo',
            'showNotificationRequestError',
            'getIpAddressTitle',
            'getMeters'
        ],
        methods: {
            ...mapActions('programming', [ 'updateMeterLoad', 'fetchAllMeters' ]),

            async open() {
                if (this.hide) {
	                this.dialogOpen()
                    return
                }

                try {
                	const meters = await this.fetchAllMeters(false)
                    const readyToLoadMeters = meters.filter(({ personal_account, in_pyramid }) => personal_account && !in_pyramid)

                    for (const meter of readyToLoadMeters) {
                        const building = spliceCustomerAddress(meter.customer_address, true, true)
	                    this.unloadMeters.push(Object.assign({}, {
	                    	...meter,
		                    readyToLoad: false,
		                    building
                        }))
	                    this.buildings.push(building)
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }

                if (this.unloadMeters.length) {
                    this.dialogOpen()
                    this.defaultUnloadMeters = this.unloadMeters
                } else {
                    this.showNotificationInfo('Не найдено счетчиков для выгрузки в пирамиду')
                    this.close()
                }
            },

            close() {
                this.dialogClose()
                this.unloadMeters = []
                this.defaultUnloadMeters = []
                this.buildings = []
                if (this.$refs.BuildingSelect) {
	                this.$refs.BuildingSelect.reset()
                }
                this.selectAll = false
                this.hide = false
            },

            addressChange(selectedBuildings) {
                if (selectedBuildings.length) {
                    let selectedMeters = []
                    for (const selectedBuilding of selectedBuildings) {
	                    selectedMeters =
                            selectedMeters.concat(this.defaultUnloadMeters.filter(({ building }) => selectedBuilding === building))
                    }

                    this.unloadMeters = selectedMeters
                } else {
                    this.unloadMeters = this.defaultUnloadMeters
                }
            },

            saveDataToExcel() {
                const preloadedMeters = this.unloadMeters.filter(({ readyToLoad, in_pyramid, loaded }) => readyToLoad && !in_pyramid && !loaded)
                if (!preloadedMeters.length) {
	                return this.showNotificationInfo('Нет выделенных записей для выгрузки в excel')
                }
                saveDataToPyramidExcelFile(preloadedMeters, this.getIpAddressTitle)
            },

            selectAllClick() {
                this.unloadMeters = this.unloadMeters.map((meter) => ({
	                ...meter,
	                readyToLoad: meter.in_pyramid && meter.loaded ? false : !this.selectAll
	            }))
                this.selectAll = !this.selectAll
            },

            async approveLoad() {
                let preloadedMeters = this.unloadMeters.filter(({ readyToLoad, in_pyramid, loaded }) => readyToLoad && !in_pyramid && !loaded)

                if (!preloadedMeters.length) {
	                return this.showNotificationInfo('Нет подходящих записей для подтверждения загрузки')
                }

                try {
	                const loadedMeters = await this.updateMeterLoad(preloadedMeters)
	                this.showNotificationSuccess('Подтверждение данных прошло успешно')
	                for (const meter of loadedMeters) {
		                //Обновление записи в текущем интерфейсе выбранных счетчиков по адресу
		                const updatedMeter = this.unloadMeters.find(({ id }) => meter.id === id)
		                Object.assign(updatedMeter, meter)
		                //Обновление записи в дефолтном списке счетчиков (при условии очищения списка адресов)
		                const updatedDefaultMeter = this.defaultUnloadMeters.find(({ id }) => meter.id === id)
		                Object.assign(updatedDefaultMeter, meter)
	                }
	                await this.getMeters()
                } catch (e) {
                 this.showNotificationRequestError(e)
                }
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
</style>