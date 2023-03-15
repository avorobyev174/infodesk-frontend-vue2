<template>
    <!-- Диалог приема/выдачи -->
    <v-dialog
        v-model="dialogModel"
        max-width="900px"
    >
        <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
            @submit.prevent="accept"
        >
            <v-card class="p-2">
                <v-card-title>
                    <span class="m-auto text-h5 pb-2">{{ dialogTitle }}</span>
                </v-card-title>
                <div class="dialog-wrapper">
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="currentTypeDirection"
                            :items="operationTypeDirection"
                            item-text="text"
                            item-value="value"
                            label="Тип операции"
                            required
                        />
                        <v-select
                            v-model="currentLocation"
                            :items="locations"
                            item-text="text"
                            item-value="value"
                            label="Направление"
                        />
                        <v-text-field
                            v-model="issuingPerson"
                            label="Отдающий сотрудник"
                            required
                            :rules="personRules"
                        ></v-text-field>
                        <v-text-field
                            v-model="acceptedPerson"
                            label="Принимающий сотрудник"
                            required
                            :rules="personRules"
                        ></v-text-field>
                        <v-text-field
                            v-model="comment"
                            label="Комментарий"
                        ></v-text-field>
                    </v-card-text>
                    <v-divider vertical></v-divider>
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
                            >
                            </v-combobox>
                            <v-text-field
                                class="pt-2 pb-0 pr-3"
                                type="text"
                                label="Серийный номер"
                                v-model="serialNumber"
                                clearable
                                outlined
                            >
                            </v-text-field>
                            <v-btn-toggle
                            >
                                <v-btn @click="meterAddButtonOnClick">
                                    <v-icon :color="colorGreen" large>mdi-plus-thick</v-icon>
                                </v-btn>
                                <v-btn @click="meterCloseButtonOnClick">
                                    <v-icon :color="colorRed" large>mdi-minus-thick</v-icon>
                                </v-btn>
                                <v-btn @click="scannerActiveOnClick">
                                    <v-icon :color="scannerButtonColor" large>mdi-barcode-scan</v-icon>
                                </v-btn>
                            </v-btn-toggle>
                        </div>
                        <v-data-table
                            fixed-header
                            height="300px"
                            class="meter-table pl-1"
                            :items="meters"
                            single-select
                            item-key="serialNumber"
                            :headers="headers"
                            hide-default-footer
                        >
                            <template v-slot:no-data>
                                <p class="pt-4">Пока нет данных...</p>
                            </template>
                            <template v-slot:item.status="{ item }">
                                <v-icon
                                    size="25"
                                    class="ma-2"
                                    :color="colorGrey"
                                >
                                    mdi-checkbox-blank-circle-outline
                                </v-icon>
                            </template>
                        </v-data-table>
                        <p class="meter-count">Количество счетчиков в таблице: {{ meters.length }}</p>
                    </div>
                </div>
                <v-card-actions class="pt-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="close"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        type="submit"
                    >
                        {{ buttonTitle }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex";

    export default {
        name: "AcceptOrIssueDialog",
        components: {

        },
        data: () => ({
            headers: [
	            {
		            text: 'Тип',
		            align: 'center',
		            value: 'type',
		            sortable: false,
		            cellClass: 'table-header-size',
                    width: '200px'
	            },
	            {
		            text: 'Серийный номер',
		            align: 'center',
		            value: 'serialNumber',
		            sortable: false,
		            cellClass: 'table-header-size',
	            },
	            {
		            text: 'Статус',
		            align: 'center',
		            value: 'status',
		            sortable: false,
		            cellClass: 'table-header-size',
		            width: '180px'
	            },
            ],
            metersWithLetters: [66, 111, 119, 120],
            scannerButtonColor: '',
            scannerActive: false,
            dialogModel: false,
            activateScanner: true,
            currentLocation: 0,
            currentLocationTitle: '',
            needAcceptedPerson: true,
	        issuingPerson: '',
	        issuingPersonStaffId: '',
	        acceptedPerson: '',
	        acceptedPersonStaffId: '',
            comment: '',
            locations: [],
            buttonTitle: 'Принять',
            dialogTitle: 'Диалог приема',
            formValid: true,
            operationTypeDirection: [{ text: 'Прием', value: 0 }, { text: 'Выдача', value: 1 }],
            currentTypeDirection: 0,
            contactRules: [
                v => v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом'
            ],
	        personRules: [
		        v => !!v || 'Обязательно к заполнению',
		        v => v && !v.match('[^0-9]') || 'Должны присутствовать только цифры'
	        ],
	        selected: 0,
            meters:  [],
            type: { index: 12, title: 'NP71L.1-1-3' },
            serialNumber: ''
        }),
        mounted() {
            this.scannerButtonColor = this.colorGrey
	        this.locations = this.defaultLocations.slice(0, 1)
        },
	    inject: [
	    	'showNotification',
            'showNotificationComponentError',
            'showNotificationStandardError',
            'getMeterTypeTitle',
            'getEmployeeTitle',
        ],
	    computed: {
		    ...mapState({
			    loading: state => state.storage.meterLoading,
			    colorBlue: state => state.colorBlue,
			    colorRed: state => state.colorRed,
			    colorGreen: state => state.colorGreen,
			    colorOrange: state => state.colorOrange,
			    colorGrey: state => state.colorGrey,
			    colorGold: state => state.colorGold,
		    }),
            ...mapGetters({
                defaultLocations: 'storage/getLocations',
                types: 'storage/getMeterTypes',
            }),
        },
        watch: {
	        currentTypeDirection(newVal) {
                this.buttonTitle = newVal === 0 ? 'Принять' : 'Выдать'
                this.dialogTitle = newVal === 0 ? 'Диалог приема' : 'Диалог выдачи'

		        this.locations = !newVal
                    ? this.defaultLocations.slice(0, 1)
                    : this.locations = this.defaultLocations.slice(1)

		        this.currentLocation = newVal
            },

	        scannerActive(newVal) {
	        	this.scannerButtonColor = newVal ? this.colorBlue : this.colorGrey
            },

	        currentLocation(newLocation) {
		        switch (newLocation) {
			        case 5: this.needIssuingPerson = false; break;
			        case 9:  this.newLocation = 0; break;
			        case 11:  this.newLocation = 8; break;
			        case 12:  this.newLocation = 9; break;
			        default: this.newLocation = newLocation
		        }

		        this.currentLocationTitle = this.getMeterLocationTitle(this.newLocation)
            }
        },
        methods: {
	        ...mapActions('storage', [
		        'checkMeterInDB',
                'createLog'
	        ]),

	        getMeterLocationTitle(location) {
		        return this.locations.find(loc => location === loc.value).text
	        },

	        operationTypeDirectionOnChange() {

            },

	        meterAddButtonOnClick() {
	            this.checkMeterAndInsert()
            },

	        meterCloseButtonOnClick() {
                this.meters.splice(this.selected, 1)
            },

            async checkMeterAndInsert() {
	        	if (!this.serialNumber) {
			        this.showNotification(`Серийный номер не должен быть пустым`, this.colorOrange)
                    return
                }

	            if (!this.metersWithLetters.includes(this.type.index)) {
		            this.serialNumber = parseInt(this.serialNumber).toString()
	            } else if (this.serialNumber.indexOf('-') !== -1) {
		            this.serialNumber = this.serialNumber.slice(1)
	            }

	            if (this.meters.find(meter => meter.serialNumber === this.serialNumber && meter.type === this.type)) {
	            	this.showNotification(`Счетчик с типом ${ this.getMeterTypeTitle(this.type.index) }
                                                    и серийным номером ${ this.serialNumber } уже добавлен в таблицу`)
		            //$("#wrong").trigger('play');
                    return
                }

	            try {
		            const res = await this.checkMeterInDB({ type: this.type.index, serialNumber: this.serialNumber })

		            if (!res.length) {
			            return this.showNotification(
			            	        `Счетчик с типом ${ this.getMeterTypeTitle(this.type.index) }
                                          и серийным номером ${ this.serialNumber } не найден в базе данных`,
                                          this.colorRed)
		            }

                    this.meters.push({ type: this.type.title, serialNumber: this.serialNumber, status: 0 })

                    this.serialNumber = ''
                    this.$refs.form.resetValidation()

                } catch (e) {
                    this.showNotificationStandardError(e)
	            }
            },

	        meterTableRowOnClick(i) {
		        if (this.selected !== i) {
			        this.selected = i
		        }
	        },

	        scannerActiveOnClick() {
		        this.scannerActive = !this.scannerActive
	        },

            open() {
	            this.dialogModel = true
            },

            close() {
                this.dialogModel = false
	            this.serialNumber = ''
	            this.currentLocation = ''
                this.needAcceptedPerson = true
                this.issuingPerson = ''
                this.acceptedPerson = ''
                this.comment = ''
            },

            async accept() {
                if (!this.$refs.form.validate()) {
                    return
                }

	            this.issuingPersonStaffId = this.getEmployeeTitle(this.issuingPerson)
                if (this.needAcceptedPerson) {
	                this.acceptedPersonStaffId = this.getEmployeeTitle(this.acceptedPerson)
                } else {
	                this.acceptedPersonStaffId = 999999999999999
                }

	            if (!this.meters.length) {
		            return this.showNotification(
		            	`Для выполнения операции укажите заполните таблицу счетчиков`, this.colorBlue)
	            }

	            try {
		            this.close()

		            const res = await this.createLog({
                        meters: this.meters,
                        location: this.currentLocation,
                        newLocation: this.newLocation,
                        issuingPersonStaffId: this.issuingPersonStaffId,
			            acceptedPersonStaffId: this.acceptedPersonStaffId,
                        comment: this.comment
		            })

                } catch (e) {
		            this.showNotificationStandardError(e)
	            }
            }
        }
    }
</script>

<style scoped>
    .dialog-wrapper {
        display: grid;
        grid-template-columns: 250px 10px 1fr;
        grid-template-rows: 1fr;
        justify-content: start;
    }

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

    .meter-count {
        font-size: 12px !important;
        text-align: right;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.7);
    }

    .v-data-table::v-deep th {
        font-size: 14px !important;
    }
</style>
