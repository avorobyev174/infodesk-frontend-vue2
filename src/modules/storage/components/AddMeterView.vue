<template>
    <div class="pr-3">
        <div class="add-panel">
            <v-combobox
                :items="meterTypes"
                item-text="title"
                item-value="value"
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
                item-value="value"
                label="Серийный номер"
                class="pl-1 pt-2 pb-0 pr-3"
                :search-input.sync="serialNumber"
                outlined
                :disabled="formSubmit"
                :loading="serialNumberLoading"
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
                <v-btn
                    @click="addAllAvailableMetersOnClick"
                    :disabled="formSubmit"
                    v-show="isRepair"
                    :loading="allAvailableMetersLoading"
                >
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
                    <v-icon right small v-if="item.status === OperationStatus.SUCCESS">`
                        mdi-check-circle-outline
                    </v-icon>
                    <v-icon right small v-if="item.status === OperationStatus.ERROR">
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
    import { Location, OperationStatus } from '../const'

	export default {
		name: "AddMeterView",
        data: () => ({
	        OperationStatus,
	        loading: false,
	        serialNumberLoading: false,
	        allAvailableMetersLoading: false,
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
			'showNotificationSuccess',
			'showNotificationInfo',
			'showNotificationWarning',
			'showNotificationRequestError',
		],
        async mounted() {
	        this.fillTypes()
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
				this.fillTypes()
			},

			isRepair() {
				this.headers = this.headers.slice(0, this.headers.length - 1)
				this.fillTypes()
            }
		},
		computed: {
			...mapState([ 'colorBlue', 'colorRed', 'colorGreen', 'colorGrey' ]),
			...mapGetters({
				types: 'dictionary/getMeterTypes',
				options: 'dictionary/getParseOptions',
				locations: 'dictionary/getLocations',
				typesInRepair: 'storage/getMeterRepairTypes'
			}),
		},
        methods: {
	        ...mapActions('storage', [
		        'checkMeterInDB',
		        'checkMeterInRepairDB',
		        'getAllAvailableMetersFromRepair',
		        'getAllAvailableMetersByTypeFromRepair',
	        ]),

            fillTypes() {
	            if (this.isRouter) {
		            this.meterTypes = this.types.filter(({ option }) => option === 41)
	            } else if (this.isRepair) {
		            this.meterTypes =  this.types.filter(({ value }) => this.typesInRepair.includes(value))
	            } else  {
                    this.meterTypes = this.isRegister
                        ? this.types.filter(({ is_archive }) => !is_archive)
                        : this.types.slice()
	            }
	            if (this.meterTypes?.length) {
		            this.type = this.meterTypes.at(0)
		            this.meterTypeOnChange()
                }
            },

	        checkLocation(meter) {
	        	const storageLocations = [ Location.STORAGE, Location.STORAGE_TEMPORARY ]
	        	if (this.isRouter) {
			        return meter.oldLocation === Location.REPAIR
                        ? this.newLocation !== Location.REPAIR
                        : this.newLocation === Location.REPAIR
                } else {
                    const nonStorageLocations = this.locations
                        .map(({ value }) => value)
                        .filter((location) => !storageLocations.includes(location))

                    if (storageLocations.includes(meter.oldLocation)) {
                    	return nonStorageLocations.includes(this.newLocation)
                    } else {
	                    return storageLocations.includes(this.newLocation)
                    }
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
			        : this.showNotificationInfo('Операция уже завершена, редактирование списка не доступно')
	        },

	        meterDeleteButtonOnClick() {
		        if (!this.formSubmit) {
			        this.meters.splice(this.selectedMeterIndex, 1)
			        this.$emit('onMeterCountUpdate', this.meters.length)
		        } else {
			        this.showNotificationInfo( 'Операция уже завершена, редактирование списка не доступно')
		        }
	        },

	        async parseSerialNumberOnEnterPress() {
		        if (this.scannerActive && this.options) {
			        const meterParseOption = this.meterTypes.find(({ value }) => this.type.value === value)
			        const { option } = meterParseOption
			        if (option) {
				        this.parseSerialNumber(option)
			        }
		        }

                await this.checkMeterAndInsert()
	        },

	        parseSerialNumber(parseOption) {
		        const { parse_option } = this.options.find(({ id }) => parseOption === id)
		        if (parse_option) {
			        this.serialNumber = parse_option.split(',').reduce((sum, cur) => {
			        	const letter = this.serialNumber[ cur ]
				        return sum += letter ? letter : ''
			        }, '')
		        }
	        },

	        serialNumberClear() {
	        	this.serialNumber = ''
            },

	        async checkMeterAndInsert() {
		        if (!this.serialNumber) {
			        this.showNotificationWarning('Серийный номер не должен быть пустым')
			        return
		        }

		        if (!this.type) {
			        this.showNotificationWarning('Тип счетчика не должен быть пустым')
			        return
		        }

		        const correct = new Audio(correctSound)
		        const wrong = new Audio(wrongSound)

		        const meterType = this.type.value

		        //Проверка на счетчики с буквами в серийных номерах и минусом в начале
		        if (!this.metersWithLetters.includes(meterType)) {
			        this.serialNumber = parseInt(this.serialNumber).toString()
		        } else if (this.serialNumber.startsWith('-')) {
			        this.serialNumber = this.serialNumber.slice(1)
		        }

		        if (this.meters.find(({ serialNumber, type }) => serialNumber === this.serialNumber && type === meterType)) {
			        await wrong.play()

			        return this.showNotificationWarning(`Счетчик с типом ${ this.getMeterTypeTitle(meterType) }
                                                    и серийным номером ${ this.serialNumber } уже добавлен в таблицу`)
		        }

		        this.loading = true
                const meter = { type: meterType, serialNumber: this.serialNumber }
		        try {
			        let checkedMeter = this.isRepair
                        ? await this.checkMeterInRepairDB(meter)
                        : await this.checkMeterInDB(meter)
			        if (this.isRegister) {
				        //регистрация
				        if (checkedMeter.guid) {
					        await wrong.play()

					        return this.showNotificationInfo(
						        `${ this.isRouter ? 'Маршрутизатор' : 'Счетчик' } с типом
						         ${ this.getMeterTypeTitle(meterType) }
						         и серийным номером ${ this.serialNumber } уже найден в базе данных`)
				        }

				        await correct.play()

                        const oldLocation = this.isRouter
                            ? Location.REPAIR
                            : this.newLocation ? Location.STORAGE_TEMPORARY : Location.STORAGE

				        this.meters.unshift({
					        type: meterType,
					        serialNumber: this.serialNumber,
					        status: 0,
					        oldLocation
				        })
			        } else {
			        	//прием выдача
				        if (!checkedMeter.guid) {
					        await wrong.play()

					        return this.showNotificationWarning(
						        `${ this.isRouter ? 'Маршрутизатор' : 'Счетчик' } с типом
						         ${ this.getMeterTypeTitle(meterType) }
						         и серийным номером ${ this.serialNumber } не найден в базе данных
						         ${ this.isRepair ? 'или не находится в ремонте' : '' }`)
				        }

                        const { meter_location, guid, isSetWorkStatus } = checkedMeter

				        if (this.newLocation === Location.STORAGE && meter_location === Location.REPAIR) {
					        if (!isSetWorkStatus) {
						        return this.showNotificationWarning(
							        `Счетчик ${ this.getMeterTypeTitle(meterType) } c серийным номером ${ this.serialNumber }
		                            без статуса работоспособности после ремонта`)
					        }
				        }

                        const meter = { type: meterType, serialNumber: this.serialNumber, guid }
				        await correct.play()

				        this.meters.unshift(this.isRepair ? { ...meter } : { ...meter, status: 0, oldLocation: meter_location })
                    }

                    this.$emit('onMeterCountUpdate', this.meters.length)
			        this.serialNumber = ''
                    this.$emit('onResetValidation', true)
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        } finally {
			        this.loading = false
		        }
	        },

	        async addAllAvailableMetersOnClick() {
	        	if (this.isAddAll) {
	        		this.allAvailableMetersLoading = true
			        const availableMeters = await this.getAllAvailableMetersFromRepair()
			        for (const { meter_type, serial_number, guid, isSetWorkStatus } of availableMeters) {
			        	if (!this.meters.find((meter) => meter.guid === guid) && !isSetWorkStatus) {
                            this.meters.push({
                                type: meter_type,
                                serialNumber: serial_number,
                                status: 0,
                                guid
                            })
                        }
			        }
			        this.$emit('onMeterCountUpdate', this.meters.length)
			        this.allAvailableMetersLoading = false
		        } else {
			        this.$emit('onMeterCountUpdate', '')
			        this.$emit('metersClear')
                }
                this.isAddAll = !this.isAddAll
            },

            async meterTypeOnChange() {
	        	if (this.isRepair) {
	        		this.serialNumberLoading = true
			        this.availableByTypeMeters = await this.getAllAvailableMetersByTypeFromRepair(this.type.value)
                    this.availableByTypeSerials = this.availableByTypeMeters
                        .filter(this.checkMeterValid).map(({ serial_number }) => serial_number)
			        console.log(this.availableByTypeSerials)
                    this.$emit('meterTypeChanged', this.type.value)
			        this.serialNumberLoading = false
                }
            },

	        async addAllMetersByTypeOnClick() {
		        console.log(this.availableByTypeMeters)
                for (const { meter_type, serial_number, guid, isSetWorkStatus } of this.availableByTypeMeters) {
			        if (!this.meters.find((meter) => meter.guid === guid) && !isSetWorkStatus) {
                        this.meters.push({
                            type: meter_type,
                            serialNumber: serial_number,
                            status: 0,
                            guid
                        })
                    }
                }

		        this.$emit('onMeterCountUpdate', this.meters.length)
            },

            checkMeterValid(meter) {
	        	const { isSetMaterials, isSetWorkStatus } = meter
	        	if (isSetMaterials || isSetMaterials) {
			        switch (this.currentTab) {
				        case 'materialInsertTab': return !isSetMaterials || !isSetWorkStatus
				        case 'meterWorkabilityTab': return isSetMaterials && !isSetWorkStatus
			        }
                }
                return this.currentTab === 'materialInsertTab'
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

    .round-button {
        border-top-right-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
    }

    .scanner-button-show {
        display: none;
    }
</style>