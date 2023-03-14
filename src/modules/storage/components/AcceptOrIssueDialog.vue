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
                    <span class="m-auto text-h5">Диалог приема/выдачи</span>
                </v-card-title>
                <div class="dialog-wrapper">
                    <v-card-text class="pt-4">
                        <v-select
                            v-model="currentTypeDirection"
                            :items="operationTypeDirection"
                            item-text="text"
                            item-value="value"
                            @change="locationDirectionChanged()"
                            label="Тип операции"
                            required
                        />
                        <v-select
                            v-model="currentLocation"
                            :items="locations"
                            item-text="text"
                            item-value="value"
                            label="Направление"
                            :rules="directionRules"
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
                                @change="locationDirectionChanged"
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
                                <v-btn>
                                    <v-icon @click="meterAddButtonOnClick" :color="colorGreen" large>mdi-plus-thick</v-icon>
                                </v-btn>
                                <v-btn>
                                    <v-icon @click="meterCloseButtonOnClick" :color="colorRed" large>mdi-minus-thick</v-icon>
                                </v-btn>
                                <v-btn>
                                    <v-icon @click="scannerActiveOnClick" :color="scannerButtonColor" large>mdi-barcode-scan</v-icon>
                                </v-btn>
                            </v-btn-toggle>
                        </div>
                        <v-simple-table
                            fixed-header
                            height="300px"
                            class="meter-table pl-1"
                        >
                            <template v-slot:default>
                                <thead>
                                <tr>
                                    <th class="text-center type-column">Тип</th>
                                    <th class="text-center">Серийный номер</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr
                                    v-for="(item, i) in meters"
                                    :key="item.serial_number"
                                    @click="meterTableRowOnClick(i)"
                                    :class="{ selected: selected === i }"
                                >
                                    <td>{{ item.type }}</td>
                                    <td>{{ item.serialNumber }}</td>
                                </tr>
                                </tbody>
                            </template>
                        </v-simple-table>

                    </div>
                </div>
                <v-card-actions>
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
            scannerButtonColor: '',
            scannerActive: false,
            dialogModel: false,
            activateScanner: true,
            currentLocation: '',
            needIssuingPerson: true,
	        issuingPerson: '',
	        acceptedPerson: '',
            comment: '',
            buttonTitle: 'Принять',
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
            directionRules: [ v => !!v || 'Обязательно к заполнению' ],
	        /*serialNumberRules: [
		        v => v && String(v).length >= 6 || 'Должно быть не меньше 6 символов',
		        v => v && parseFloat(v) % 1 === 0 || 'Должно быть целым числом'
	        ],*/
	        selected: 0,
            meters:  [],
            type: { index: 12, title: 'NP71L.1-1-3' },
            serialNumber: ''
        }),
        mounted() {
            this.scannerButtonColor = this.colorGrey
        },
	    inject: ['showNotification', 'showNotificationComponentError', 'showNotificationStandardError', 'getMeterTypeTitle'],
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
                locations: 'storage/getLocations',
                types: 'storage/getMeterTypes',
            }),
        },
        watch: {
	        currentTypeDirection(newVal) {
                this.buttonTitle = newVal === 0 ? 'Принять' : 'Выдать'
            },
	        scannerActive(newVal) {
	        	this.scannerButtonColor = newVal ? this.colorBlue : this.colorGrey
            }
        },
        methods: {
	        ...mapActions('storage', [
		        'checkMeterInDB',
	        ]),
        	locationDirectionChanged() {
		        //console.log(this.type)
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

	            if (![111, 66].includes(this.type.index)) {
		            this.serialNumber = parseInt(this.serialNumber) //удаление нулей в начале для всех типов}
	            } else if (this.serialNumber.indexOf('-') !== -1) {
		            this.serialNumber = this.serialNumber.slice(1)
	            }

	            if (this.meters.find(meter => meter.serialNumber === this.serialNumber && meter.type === this.type)) {
	            	this.showNotification(`Счетчик с типом ${ this.getMeterTypeTitle(this.type.index) }
                                                    и серийным номером ${ this.serialNumber } уже добавлен в таблицу`)
		            //$("#wrong").trigger('play');
                    return
                }

	            const res = await this.checkMeterInDB({ type: this.type.index, serialNumber: this.serialNumber })
	            console.log(res)
                if (!res.length) {
	                this.showNotification(`Счетчик с типом ${ this.getMeterTypeTitle(this.type.index) }
                                                    и серийным номером ${ this.serialNumber } не найден в базе данных,
                                                    выбрать пустой счетчик и присвоить ему серийный номер`,
                                                    this.colorBlue)



                } else {
                	this.meters.push({ type: this.type.title, serialNumber: this.serialNumber })
                    this.needIssuingPerson = res.METER_LOCATION !== 3 //Списание(завод)
                    this.serialNumber = ''
	                this.$refs.form.resetValidation()
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
            },

            accept() {
                if (!this.$refs.form.validate()) {
                    return
                }

                this.close()
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

    .selected {
        background-color: #f5f5f5;
    }

    .meter-table th {
        font-size: 14px !important;
    }

    /*.type-column {
        width: 36%;
    }*/
</style>