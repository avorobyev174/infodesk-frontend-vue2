<template>
    <div class="pr-3">
        <div class="add-panel">
            <v-combobox
                :items="types"
                item-text="title"
                item-value="index"
                label="Тип"
                class="pl-1 pt-2 pb-0 pr-3"
                v-model="type"
                outlined
                :disabled="formSubmit"
            >
            </v-combobox>
            <v-text-field
                class="pt-2 pb-0 pr-3"
                type="text"
                label="Серийный номер"
                v-model="serialNumber"
                clearable
                outlined
                :disabled="formSubmit"
                @keypress.enter="parseSerialNumberAndInsertOnEnterPress"
            >
            </v-text-field>
            <v-btn-toggle
            >
                <v-btn @click="meterAddButtonOnClick" :disabled="formSubmit">
                    <v-icon :color="colorGreen" large>mdi-plus-thick</v-icon>
                </v-btn>
                <v-btn @click="meterDeleteButtonOnClick" :disabled="formSubmit">
                    <v-icon :color="colorRed" large>mdi-minus-thick</v-icon>
                </v-btn>
                <v-btn @click="scannerActiveOnClick" :disabled="formSubmit">
                    <v-icon :color="scannerButtonColor" large>mdi-barcode-scan</v-icon>
                </v-btn>
            </v-btn-toggle>
        </div>
        <v-data-table
            fixed-header
            height="300px"
            class="meter-add-table pl-1"
            :items="meters"
            single-select
            item-key="serialNumber"
            :headers="headers"
            hide-default-footer
            @click:row="selectRow"
            loading-text="Идет поиск счетчика..."
            :loading="loading"
        >
            <template v-slot:no-data>
                <p class="pt-4">Нет данных</p>
            </template>
            <template v-slot:no-results>
                <p class="pt-4">Нет данных</p>
            </template>
            <template v-slot:item.type="{ item }">
                {{ getMeterTypeTitle(item.type) }}
            </template>
            <template v-slot:item.oldLocation="{ item }">
                <v-chip small tag="span" :color="oldLocationColor"> {{ getMeterLocationTitle(item.oldLocation) }}</v-chip>
                <span> &#10132; </span>
                <v-chip
                    small
                    tag="span"
                    :color="checkIfMeterLocationValid(item) ? resultColor : colorRed">
                    {{ getMeterLocationTitle(newLocation) }}
                    <v-icon right small v-if="item.status === 1">
                        mdi-check-circle-outline
                    </v-icon>
                    <v-icon right small v-if="item.status === 2">
                        mdi-close-circle-outline
                    </v-icon>
                </v-chip>
            </template>
        </v-data-table>
    </div>
</template>

<script>
	import {mapActions, mapGetters, mapState} from "vuex";

	export default {
		name: "AddMeterView",
        data: () => ({
	        loading: false,
	        headers: [
		        {
			        text: 'Тип',
			        align: 'center',
			        value: 'type',
			        sortable: false,
			        cellClass: 'table-header-size',
			        width: '37%'
		        },
		        {
			        text: 'Серийный номер',
			        align: 'center',
			        value: 'serialNumber',
			        sortable: false,
			        cellClass: 'table-header-size',
		        },
		        {
			        text: 'Операция',
			        align: 'center',
			        value: 'oldLocation',
			        sortable: false,
			        cellClass: 'table-header-size',

		        },
	        ],
	        scannerButtonColor: 'grey',
	        serialNumber: '',
	        type: { index: 121, title: 'AIU5' },
	        scannerActive: false,
	        selectedMeterIndex: 0,
	        metersWithLetters: [ 66, 111, 119, 120 ],
        }),
        props: {
	        newLocation: {
	        	type: Number,
                required: true
            },
            meters: {
	        	type: Array,
                required: true
            },
	        formSubmit: {
		        type: Boolean,
		        required: true
	        },
	        resultColor: {
		        type: String,
		        required: true
            },
	        oldLocationColor: {
		        type: String,
		        required: true
	        }
        },
		inject: [
			'getMeterLocationTitle',
			'getMeterTypeTitle',
			'showNotification',
			'showNotificationStandardError',
            'checkIfMeterLocationValid'
		],
		watch: {
			scannerActive(newVal) {
				this.scannerButtonColor = newVal ? this.colorBlue : this.colorGrey
			},
		},
		computed: {
			...mapState({
				colorBlue: state => state.colorBlue,
				colorRed: state => state.colorRed,
				colorGreen: state => state.colorGreen,
				colorOrange: state => state.colorOrange,
				colorGrey: state => state.colorGrey,
				colorGold: state => state.colorGold,
			}),
			...mapGetters({
				types: 'storage/getMeterTypes',
				options: 'storage/getOptions',
			}),
		},
        methods: {
	        ...mapActions('storage', [
		        'parseSerialNumber',
		        'checkMeterInDB',
	        ]),

            setLoading(loading) {
	        	this.loading = loading
            },

	        selectRow(item, row) {
		        this.selectedMeterIndex = row.index
		        row.select(true)
	        },

	        scannerActiveOnClick() {
		        this.scannerActive = !this.scannerActive
	        },

	        meterAddButtonOnClick() {
		        if (!this.formSubmit) {
			        this.checkMeterAndInsert()
		        } else {
			        this.showNotification(
				        'Операция уже завершена, редактирование списка не доступно',
				        this.colorBlue)
		        }
	        },

	        meterDeleteButtonOnClick() {
		        if (!this.formSubmit) {
			        this.meters.splice(this.selectedMeterIndex, 1)
			        this.$emit('onMeterCountUpdate', this.meters.length)
			        //this.meterTotalSuccess = this.meters.length
		        } else {
			        this.showNotification(
				        'Операция уже завершена, редактирование списка не доступно',
				        this.colorBlue)
		        }
	        },

	        async parseSerialNumberAndInsertOnEnterPress() {
		        if (this.scannerActive && this.options) {
			        const parseOption = this.types.find(type => this.type.index === type.index)
			        if (parseOption && parseOption.option) {
				        this.serialNumber = await this.parseSerialNumber({
					        parseOption: parseOption.option,
					        serialNumber: this.serialNumber
				        })
			        }
		        }

                await this.checkMeterAndInsert()
	        },

	        serialNumberClear() {
	        	this.serialNumber = ''
            },

	        async checkMeterAndInsert() {
		        if (!this.serialNumber) {
			        this.showNotification(`Серийный номер не должен быть пустым`, this.colorOrange)
			        return
		        }

		        const meterType = this.type.index

		        //Проверка на счетчики с буквами в серийных номерах и минусом в начале
		        if (!this.metersWithLetters.includes(meterType)) {
			        this.serialNumber = parseInt(this.serialNumber).toString()
		        } else if (this.serialNumber.indexOf('-') !== -1) {
			        this.serialNumber = this.serialNumber.slice(1)
		        }

		        if (this.meters.find(meter => meter.serialNumber === this.serialNumber && meter.type === meterType)) {
			        this.showNotification(`Счетчик с типом ${ this.getMeterTypeTitle(meterType) }
                                                    и серийным номером ${ this.serialNumber } уже добавлен в таблицу`,
				                                    this.colorOrange)
			        //$("#wrong").trigger('play');
			        return
		        }

		        try {
			        this.loading = true

			        const res = await this.checkMeterInDB({ type: meterType, serialNumber: this.serialNumber })
			        if (!res.length) {
				        return this.showNotification(
					        `Счетчик с типом ${ this.getMeterTypeTitle(meterType) }
                                          и серийным номером ${ this.serialNumber } не найден в базе данных`,
                                          this.colorOrange)
			        }

			        const oldLocation = res[0].METER_LOCATION
			        const guid = res[0].GUID

			        this.meters.push({
				        type: meterType,
				        serialNumber: this.serialNumber,
				        status: 0,
				        oldLocation,
				        guid,
			        })
                    this.$emit('onMeterCountUpdate', this.meters.length)

			        this.serialNumber = ''
                    this.$emit('onResetValidation', true)
		        } catch (e) {
			        this.showNotificationStandardError(e)
		        } finally {
			        this.loading = false
		        }
	        },
        },
	}
</script>

<style scoped>
    .add-panel {
        display: flex;
        align-items: flex-start;
    }

    .v-btn-toggle {
        padding-top: 8px;
    }

    .v-btn-toggle button {
        height: 56px !important;
    }

    .theme--light.v-btn-toggle:not(.v-btn-toggle--group) .v-btn.v-btn {
        border-color: rgba(0, 0, 0, 0.42) !important;
    }

    .theme--light.v-btn--active:hover::before, .theme--light.v-btn--active::before {
        opacity: 0 !important;
    }

    .theme--light.v-icon:focus::after {
        opacity: 0 !important;
    }

    .v-data-table::v-deep th {
        font-size: 14px !important;
    }

</style>