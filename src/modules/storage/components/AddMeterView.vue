<template>
    <div class="pr-3">
        <div class="add-panel">
            <v-combobox
                :items="meterTypes"
                item-text="title"
                item-value="index"
                label="Тип"
                class="pl-1 pt-2 pb-0 pr-3"
                v-model="type"
                outlined
                :disabled="formSubmit"
                @change="meterTypeOnChange"
            >
            </v-combobox>
            <v-combobox
                v-if="isRepair"
                :items="availableByTypeSerials"
                item-text="title"
                item-value="index"
                label="Серийный номер"
                class="pl-1 pt-2 pb-0 pr-3"
                :search-input.sync="serialNumber"
                outlined
                :disabled="formSubmit"
            >
            </v-combobox>
            <v-text-field
                v-else
                class="pt-2 pb-0 pr-3"
                type="text"
                label="Серийный номер"
                v-model="serialNumber"
                clearable
                outlined
                :disabled="formSubmit"
                @keypress.enter="parseSerialNumberOnEnterPress"
            >
            </v-text-field>
            <v-btn-toggle
            >
                <v-btn @click="meterAddButtonOnClick" :disabled="formSubmit">
                    <v-icon :color="colorGreen" large>mdi-plus-thick</v-icon>
                </v-btn>
                <v-btn
                        @click="meterDeleteButtonOnClick"
                        :disabled="formSubmit"
                        :class="isRouter ? 'round-button' : ''"
                >
                    <v-icon :color="colorRed" large>mdi-minus-thick</v-icon>
                </v-btn>
                <v-btn
                        @click="scannerActiveOnClick"
                        :disabled="formSubmit"
                        v-show="!(isRepair || isRouter)"
                        :class="!(isRepair || isRouter) ? 'round-button' : ''"
                >
                    <v-icon :color="scannerButtonColor" large>mdi-barcode-scan</v-icon>
                </v-btn>
                <v-btn @click="addAllMetersByTypeOnClick" :disabled="formSubmit" v-show="isRepair">
                    <v-icon :color="colorGreen" large>mdi-playlist-plus</v-icon>
                </v-btn>
                <v-btn @click="addAllAvailableMetersOnClick" :disabled="formSubmit" v-show="isRepair">
                    <v-icon :color="colorGreen" v-if="isAddAll" large>mdi-playlist-star</v-icon>
                    <v-icon :color="colorRed" v-else large>mdi-playlist-remove</v-icon>
                </v-btn>
            </v-btn-toggle>
        </div>
        <v-data-table
            fixed-header
            :height="isRepair ? 200 : 400"
            class="pl-1"
            :items="meters"
            single-select
            item-key="serialNumber"
            :headers="headers"
            hide-default-footer
            @click:row="selectRow"
            loading-text="Идет поиск счетчика..."
            :loading="loading"
            :items-per-page="200"
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
                <v-chip
                    small
                    tag="span"
                    :color="oldLocationColor"
                    v-show="!isRepair"
                >
                    {{ getLocationTitle(item.oldLocation) }}
                    <v-icon right small v-show="isRegister && oldLocationColor === colorGreen">`
                        mdi-check-circle-outline
                    </v-icon>
                </v-chip>
                <span v-show="!(isRegister || isRepair)"> &#10132; </span>
                <v-chip
                    v-show="!(isRegister || isRepair)"
                    small
                    tag="span"
                    :color="checkLocation(item) ? resultColor : colorRed">
                    {{ getLocationTitle(newLocation) }}
                    <v-icon right small v-if="item.status === 1">`
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
	import { mapActions, mapGetters, mapState } from "vuex"
    import correctSound from '../audio/correct.mp3'
    import wrongSound from '../audio/wrong.mp3'

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
			        text: 'Направление',
			        align: 'center',
			        value: 'oldLocation',
			        sortable: false,
			        cellClass: 'table-header-size',

		        },
	        ],
	        scannerButtonColor: '',
	        serialNumber: '',
	        serialNumberRules: [
		        v => v && String(v).length >= 6 || 'Должно быть не меньше 6 символов',
            ],
	        type: {},
	        scannerActive: true,
	        selectedMeterIndex: 0,
	        metersWithLetters: [ 66, 111, 119, 120 ],
            meterTypes: [],
	        isAddAll: true,
	        availableByTypeSerials: [],
	        availableByTypeMeters: []
        }),
        props: {
			isRegister: Boolean,
	        isRouter: Boolean,
	        isRepair: Boolean,
	        newLocation: Number,
            meters: {
	        	type: Array,
                required: true
            },
	        formSubmit: {
		        type: Boolean,
		        required: true
	        },
	        resultColor: String,
	        oldLocationColor: String,
	        currentTab: String,
        },
		inject: [
			'getLocationTitle',
			'getMeterTypeTitle',
			'showNotification',
			'showNotificationStandardError',
		],
        async mounted() {
	        this.checkIsRouter()
	        this.scannerButtonColor = this.colorBlue
	        if (this.isRepair) {
		        this.headers = this.headers.slice(0, this.headers.length - 1)
	        }
	        await this.meterTypeOnChange()
        },
		watch: {
			scannerActive(newVal) {
				this.scannerButtonColor = newVal ? this.colorBlue : this.colorGrey
			},
			isRouter() {
				this.checkIsRouter()
			},
			isRepair() {
				this.headers = this.headers.slice(0, this.headers.length - 1)
				this.checkIsRouter()
            }
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
				typesInRepair: 'storage/getMeterRepairTypes',
			}),
		},
        methods: {
	        ...mapActions('storage', [
		        'parseSerialNumber',
		        'checkMeterInDB',
		        'checkMeterInRepairDB',
		        'getAllAvailableMetersFromRepair',
		        'getAllAvailableMetersByTypeFromRepair',
	        ]),

            checkIsRouter() {
	            if (this.isRouter) {
		            this.meterTypes = this.types.filter(type => type.option === 41)
		            this.type = { index: 46, title: 'RTR512.10-6L/EY' }
	            } else if (this.isRepair) {
		            this.meterTypes =  this.types.filter(type => this.typesInRepair.includes(type.index))
		            if (this.meterTypes.length) {
			            this.type = { index: this.meterTypes[0].index, title: this.meterTypes[0].title }
		            }
	                this.meterTypeOnChange()
	            } else  {
		            this.meterTypes = this.types.slice()
		            this.type = { index: 121, title: 'AIU5' }
	            }

            },

	        checkLocation(meter) {
	        	if (this.isRouter) {
			        return (meter.oldLocation === 1 && this.newLocation !== 1) ||
				        (meter.oldLocation !== 1 && this.newLocation === 1)
                } else {
			        return (meter.oldLocation === 0 && this.newLocation !== 0) ||
				        (meter.oldLocation !== 0 && this.newLocation === 0)
                }
	        },

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
		        !this.formSubmit
			        ? this.checkMeterAndInsert()
			        : this.showNotification('Операция уже завершена, редактирование списка не доступно', this.colorBlue)
	        },

	        meterDeleteButtonOnClick() {
		        if (!this.formSubmit) {
			        this.meters.splice(this.selectedMeterIndex, 1)
			        this.$emit('onMeterCountUpdate', this.meters.length)
		        } else {
			        this.showNotification(
				        'Операция уже завершена, редактирование списка не доступно',
				        this.colorBlue)
		        }
	        },

	        async parseSerialNumberOnEnterPress() {
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

		        if (!this.type) {
			        this.showNotification(`Тип счетчика не должен быть пустым`, this.colorOrange)
			        return
		        }

		        const correct = new Audio(correctSound)
		        const wrong = new Audio(wrongSound)

		        const meterType = this.type.index

		        //Проверка на счетчики с буквами в серийных номерах и минусом в начале
		        if (!this.metersWithLetters.includes(meterType)) {
			        this.serialNumber = parseInt(this.serialNumber).toString()
		        } else if (this.serialNumber.startsWith('-')) {
			        this.serialNumber = this.serialNumber.slice(1)
		        }

		        if (this.meters.find(meter => meter.serialNumber === this.serialNumber && meter.type === meterType)) {
			        await wrong.play()

			        return this.showNotification(`Счетчик с типом ${ this.getMeterTypeTitle(meterType) }
                                                    и серийным номером ${ this.serialNumber } уже добавлен в таблицу`,
				                                    this.colorOrange)
		        }

		        this.loading = true
		        try {
			        let meterInDb = this.isRepair
                        ? await this.checkMeterInRepairDB({ type: meterType, serialNumber: this.serialNumber })
                        : await this.checkMeterInDB({ type: meterType, serialNumber: this.serialNumber })

			        if (this.isRegister) {
				        //регистрация
				        if (meterInDb.length) {
					        await wrong.play()

					        return this.showNotification(
						        `${ this.isRouter ? 'Маршрутизатор' : 'Счетчик' } с типом
						         ${ this.getMeterTypeTitle(meterType) }
						         и серийным номером ${ this.serialNumber } уже найден в базе данных`,
						        this.colorBlue)
				        }

				        await correct.play()

				        this.meters.unshift({
					        type: meterType,
					        serialNumber: this.serialNumber,
					        status: 0,
					        oldLocation: this.isRouter ? 1: 0
				        })
			        } else {
			        	//прием выдача
				        if (!meterInDb.length) {
					        await wrong.play()

					        return this.showNotification(
						        `${ this.isRouter ? 'Маршрутизатор' : 'Счетчик' } с типом
						         ${ this.getMeterTypeTitle(meterType) }
						         и серийным номером ${ this.serialNumber } не найден в базе данных
						         ${ this.isRepair ? 'или не находится в ремонте' : '' }`,
						        this.colorOrange)
				        }

				        const oldLocation = meterInDb[0].meter_location
				        const guid = meterInDb[0].guid
                        const meter = { type: meterType, serialNumber: this.serialNumber }

				        await correct.play()

				        this.isRepair
					        ? this.meters.unshift({ ...meter, guid })
                            : this.meters.unshift({ ...meter, status: 0, oldLocation, guid })
                    }

                    this.$emit('onMeterCountUpdate', this.meters.length)

			        this.serialNumber = ''
                    this.$emit('onResetValidation', true)
		        } catch (e) {
			        console.log(e)
			        this.showNotificationStandardError(e)
		        } finally {
			        this.loading = false
		        }
	        },

	        async addAllAvailableMetersOnClick() {
	        	if (this.isAddAll) {
			        const availableMeters = await this.getAllAvailableMetersFromRepair()
			        for (const availableMeter of availableMeters) {
			        	if (!this.meters.find(meter => meter.guid === availableMeter.guid) &&
                                                                this.checkIfUpdateFieldIsValidForButtonAll(availableMeter)) {
						        this.meters.push({
							        type: availableMeter.meter_type,
							        serialNumber: availableMeter.serial_number,
							        status: 0,
							        guid: availableMeter.guid
						        })
                        }
			        }
			        this.$emit('onMeterCountUpdate', this.meters.length)
		        } else {
			        this.$emit('onMeterCountUpdate', '')
			        this.$emit('metersClear')
                }
                this.isAddAll = !this.isAddAll
            },

            async meterTypeOnChange() {
	        	if (this.isRepair) {
			        this.availableByTypeMeters = await this.getAllAvailableMetersByTypeFromRepair(this.type.index)
                    this.availableByTypeSerials = this.availableByTypeMeters
                        .filter((availableMeter) => this.checkIfUpdateFieldIsValid(availableMeter))
                        .map((availableMeter) => availableMeter.serial_number)
                }
            },

	        async addAllMetersByTypeOnClick() {
                for (const availableMeter of this.availableByTypeMeters) {
			        if (!this.meters.find((meter) => meter.guid === availableMeter.guid) &&
                                                    this.checkIfUpdateFieldIsValidForButtonAll(availableMeter)) {
                        this.meters.push({
                            type: availableMeter.meter_type,
                            serialNumber: availableMeter.serial_number,
                            status: 0,
                            guid: availableMeter.guid
                        })
                    }
                }

		        this.$emit('onMeterCountUpdate', this.meters.length)
            },

            checkIfUpdateFieldIsValid(availableMeter) {
	        	if (availableMeter.updateField) {
			        if (this.currentTab === 'materialInsertTab') {
				        return !(availableMeter.updateField.includes('Используемые материалы:') ||
                            !availableMeter.updateField.includes('Статус ремонта:'))
			        } else if (this.currentTab === 'meterWorkabilityTab') {
				        return !availableMeter.updateField.includes('Статус ремонта:')
			        }
                }
	        	return true
            },

	        checkIfUpdateFieldIsValidForButtonAll(availableMeter) {
		        return availableMeter.updateField ? !availableMeter.updateField.includes('Статус ремонта:')	: true
	        }
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

    .round-button {
        border-top-right-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
    }

    .scanner-button-show {
        display: none;
    }
</style>