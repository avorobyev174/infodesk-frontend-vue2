<template>
    <!-- Диалог приема/выдачи -->
    <v-dialog
        v-model="dialogModel"
        max-width="1100px"
        @click:outside="close"
        @keydown.esc="close"
    >
        <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
            @submit.prevent="accept"
        >
            <v-card class="p-2">
                <v-card-title>
                    <span class="m-auto text-h5 pb-2">Диалог приема/выдачи
                        <v-chip label v-if="meters.length" :color="resultSuccessCountColor">
                            {{ meterTotalSuccess }}
                        </v-chip>
                    </span>
                </v-card-title>
                <div class="dialog-wrapper">
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="currentOperation"
                            :items="dialogOperations"
                            item-text="text"
                            item-value="value"
                            label="Тип операции"
                            :disabled="formSubmit"
                        />
                        <v-text-field
                            v-model="issuingPerson"
                            :label="issuingPersonLabel"
                            required
                            :rules="personRules"
                            @focusout="issuingPersonOnFocusOut"
                            @keypress="personOnKeyPress"
                            @keydown="personOnKeyDown"
                            type="number"
                            hide-spin-buttons
                            :disabled="formSubmit"
                        ></v-text-field>
                        <v-text-field
                            v-model="acceptedPerson"
                            :label="acceptedPersonLabel"
                            required
                            :rules="personRules"
                            @focusout="acceptedPersonOnFocusOut"
                            @keypress="personOnKeyPress"
                            @keydown="personOnKeyDown"
                            type="number"
                            hide-spin-buttons
                            :disabled="formSubmit"
                        ></v-text-field>
                        <v-text-field
                            v-model="comment"
                            label="Комментарий"
                            :disabled="formSubmit"
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
                            class="meter-table pl-1"
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
                                <p class="pt-4">Пока нет данных...</p>
                            </template>
                            <template v-slot:item.status="{ item }">
                                <v-icon
                                    size="25"
                                    class="ma-2"
                                    :color="colorGrey"
                                    v-if="!item.status"
                                >
                                    mdi-checkbox-blank-circle-outline
                                </v-icon>
                                <v-icon
                                    size="25"
                                    class="ma-2"
                                    :color="colorGreen"
                                    v-else-if="item.status === 1"
                                >
                                    mdi-checkbox-marked-circle-outline
                                </v-icon>
                                <v-icon
                                    size="25"
                                    class="ma-2"
                                    :color="colorRed"
                                    v-else-if="item.status === 2"
                                >
                                    mdi-close-circle-outline
                                </v-icon>
                            </template>
                            <template v-slot:item.type="{ item }">
                               {{ getMeterTypeTitle(item.type) }}
                            </template>
                            <template v-slot:item.oldLocation="{ item }">
                                <v-chip small tag="span" :color="resultOldLocationColor"> {{ getMeterLocationTitle(item.oldLocation) }}</v-chip>
                                <span> &#10132; </span>
                                <v-chip small tag="span" :color="resultSuccessCountColor"> {{ getMeterLocationTitle(newLocation) }}</v-chip>
                            </template>
                        </v-data-table>
                    </div>
                </div>
                <v-card-actions class="pt-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="close"
                        v-if="!formSubmit"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        v-if="!formSubmit"
                        color="primary"
                        text
                        type="submit"
                    >
                       ОК
                    </v-btn>
                    <v-btn
                        v-if="formSubmit"
                        color="primary"
                        text
                        @click="close"
                    >
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex"

    export default {
        name: "AcceptOrIssueDialog",
        components: {

        },
        data: () => ({
	        loading: false,
            meterTotalSuccess: '',
	        resultSuccessCountColor: 'grey',
	        resultOldLocationColor: 'green',
            headers: [
	            {
		            text: 'Тип',
		            align: 'center',
		            value: 'type',
		            sortable: false,
		            cellClass: 'table-header-size',
	            },
	            {
		            text: 'Серийный номер',
		            align: 'center',
		            value: 'serialNumber',
		            sortable: false,
		            cellClass: 'table-header-size',
	            },
	            {
		            text: 'Местоположение',
		            align: 'center',
		            value: 'oldLocation',
		            sortable: false,
		            cellClass: 'table-header-size',
	            },
	            {
		            text: 'Статус',
		            align: 'center',
		            value: 'status',
		            sortable: false,
		            cellClass: 'table-header-size',
	            },
            ],
            metersWithLetters: [ 66, 111, 119, 120 ],
            scannerButtonColor: 'grey',
            dialogOperations: [],
            scannerActive: false,
            dialogModel: false,
            activateScanner: true,
            currentOperation: 1,
	        issuingPerson: '',
	        issuingPersonStaffId: '',
	        issuingPersonLabel: 'Отдающий сотрудник',
	        needAcceptedPerson: true,
	        acceptedPerson: '',
	        acceptedPersonStaffId: '',
	        acceptedPersonLabel: 'Принимающий сотрудник',
            comment: '',
	        selectedMeterIndex: 0,
            buttonTitle: 'Принять',
            dialogTitle: 'Диалог приема',
            formValid: true,
            formSubmit: false,
            cardActive: false,
            contactRules: [
                v => v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом'
            ],
	        personRules: [
		        v => !!v || 'Обязательно к заполнению',
		        v => v && !String(v).match('[^0-9]') || 'Должны присутствовать только цифры'
	        ],
            meters:  [],
            type: { index: 12, title: 'NP71L.1-1-3' },
            serialNumber: ''
        }),
        mounted() {
            this.dialogOperations = this.operations.filter(oper => !oper.notAcceptOrIssueOperation)
        },
        created() {
	        this.meters = [
		        { type: 0, serialNumber: '99999999', status: 0, oldLocation: 0, guid: 'd5139944-7943-438a-d761-ea12ebc5dad0' },
		        { type: 0, serialNumber: '88888888', status: 0, oldLocation: 0, guid: 'a0b693ea-3aca-d91b-47c6-114838363d55' }
	        ]
	        this.issuingPerson = 7556760
	        this.acceptedPerson = 7556760
            this.newLocation = 1
	        this.comment = '123'
	        this.meterTotalSuccess =  this.meters.length
        },
	    inject: [
	    	'showNotification',
            'showNotificationComponentError',
            'showNotificationStandardError',
            'showNotificationError',
            'getMeterTypeTitle',
            'getEmployeeTitleByStaffId',
            'getEmployeeStaffIdByCard',
            'getEmployeeTitleByCard'
        ],
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
                locations: 'storage/getLocations',
                types: 'storage/getMeterTypes',
	            operations: 'storage/getOperations',
            }),
        },
	    watch: {
	        scannerActive(newVal) {
	        	this.scannerButtonColor = newVal ? this.colorBlue : this.colorGrey
            },

	        currentOperation(operation) {
		        this.newLocation = operation
		        switch (operation) {
			        case 5: this.needAcceptedPerson = false; break;
			        case 9:  this.newLocation = 0; break;
			        case 11:  this.newLocation = 8; break;
			        case 12:  this.newLocation = 9; break;
		        }
		        console.log(this.newLocation)
                this.meters = this.meters.slice()
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

	        issuingPersonOnFocusOut() {
		        this.issuingPersonLabel= this.getEmployeeTitleByCard(parseInt(this.issuingPerson))
	        },

	        acceptedPersonOnFocusOut() {
		        this.acceptedPersonLabel= this.getEmployeeTitleByCard(parseInt(this.acceptedPerson))
	        },

	        personOnKeyDown(evt) {
		        if (evt.keyCode === 231) {
			        this.cardActive = true
		        }
            },

	        personOnKeyPress() {
                this.cardActive = !this.cardActive
		        return !this.cardActive
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
			        this.meterTotalSuccess = this.meters.length
		        } else {
			        this.showNotification(
				        'Операция уже завершена, редактирование списка не доступно',
				        this.colorBlue)
                }
            },

            async checkMeterAndInsert() {
	        	if (!this.serialNumber) {
			        this.showNotification(`Серийный номер не должен быть пустым`, this.colorOrange)
                    return
                }

	        	//Проверка на счетчики с буквами в серийных номерах и минусом в начале
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
	            	this.loading = true
		            const res = await this.checkMeterInDB({ type: this.type.index, serialNumber: this.serialNumber })

		            if (!res.length) {
			            return this.showNotification(
			            	        `Счетчик с типом ${ this.getMeterTypeTitle(this.type.index) }
                                          и серийным номером ${ this.serialNumber } не найден в базе данных`,
                                          this.colorRed)
		            }


                    const oldLocation = res[0].METER_LOCATION
                    const guid = res[0].GUID

                    if (oldLocation === 0 && this.newLocation === 0 || this.newLocation !== 0 && this.oldLocation !== 0) {
	                    return this.showNotification(
		                    `Счетчик с типом ${ this.getMeterTypeTitle(this.type.index) }
                                          и серийным номером ${ this.serialNumber } не возможно сменить местоположение на
                                          ${ this.getMeterLocationTitle(this.newLocation) },
                                          проверьте правильность выбора операции`,
		                    this.colorOrange)
                    }

                    this.meters.push({
                        type: this.type.index,
                        serialNumber: this.serialNumber,
                        status: 0,
                        oldLocation,
	                    guid,
                    })
                    this.meterTotalSuccess = this.meters.length

                    this.serialNumber = ''
                    this.$refs.form.resetValidation()

                } catch (e) {
                    this.showNotificationStandardError(e)
	            } finally {
		            this.loading = false
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
	            this.currentOperation = 1
                this.needAcceptedPerson = true
                this.issuingPerson = ''
                this.acceptedPerson = ''
                this.comment = ''
                this.meters = []
                this.formSubmit = false
                this.acceptedPersonLabel = 'Принимающий сотрудник'
                this.issuingPersonLabel = 'Отдающий сотрудник'
	            this.$refs.form.resetValidation()
            },

	        selectRow(item, row) {
	        	this.selectedMeterIndex = row.index
		        row.select(true)
	        },

	        async accept() {
                if (!this.$refs.form.validate()) {
                    return
                }

	            this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
                if (this.needAcceptedPerson) {
	                this.acceptedPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.acceptedPerson))
                } else {
	                this.acceptedPersonStaffId = 999999999999999
                }

		        if (isNaN(this.issuingPersonStaffId) || isNaN(this.acceptedPersonStaffId)) {
			        return this.showNotification(
			        	'Операция не возможна с неизвестным сотрудником', this.colorOrange)
		        }

	            if (!this.meters.length) {
		            return this.showNotification(
		            	`Для выполнения операции заполните таблицу счетчиков`, this.colorOrange)
	            }

	            switch (this.currentOperation) {
		            case 5: this.needAcceptedPerson = false; break;
		            case 9:  this.newLocation = 0; break;
		            case 11:  this.newLocation = 8; break;
		            case 12:  this.newLocation = 9; break;
		            default: this.newLocation = this.currentOperation
	            }

	            try {
		            this.formSubmit = true
		            this.loading = true

		            const res = await this.createLog({
                        meters: this.meters,
                        operationType: this.currentOperation,
                        newLocation: this.newLocation,
                        issuingPersonStaffId: this.issuingPersonStaffId,
			            acceptedPersonStaffId: this.acceptedPersonStaffId,
                        comment: this.comment
		            })


                    if (!res) {
	                    this.showNotificationStandardError('Что то пошло не так при приеме/выдаче')
                    } else {
                    	this.meters.map(meter => {
		                    meter.status = res.find(updMeter => updMeter.guid === meter.guid).success ? 1 : 2
	                    })
                        const successCount = this.meters.filter(meter => meter.status === 1).length
                        const totalCount = this.meters.length

                        if (this.meters.every(meter => meter.status === 1)) {
	                        this.showNotification('Операция выполнена успешно', this.colorGreen)
                            this.resultSuccessCountColor = this.colorGreen
                        } else {
	                        this.showNotification('Операция выполнена с ошибками', this.colorOrange)
	                        this.resultSuccessCountColor = this.colorOrange
                        }
	                    this.resultOldLocationColor = this.colorGrey
	                    this.meterTotalSuccess = `${ successCount }/${ totalCount }`
                    }
                } catch (e) {
		            this.showNotificationStandardError(e)
	            } finally {
		            this.loading = false
	            }
            }
        }
    }
</script>

<style scoped>
    .dialog-wrapper {
        display: grid;
        grid-template-columns: 350px 10px 1fr;
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
        font-weight: 500;
        color: rgba(0, 0, 0, 0.7);
    }

    .v-data-table::v-deep th {
        font-size: 14px !important;
    }
</style>
