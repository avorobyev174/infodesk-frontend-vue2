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
            @keypress.enter.native.prevent
        >
            <v-card class="p-2">
                <v-card-title>
                    <span class="m-auto text-h5 pb-2">Диалог приема/выдачи
                        <v-chip label v-if="meters.length" :color="resultColor">
                            {{ meterCount }}
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
                    <add-meter-view
                        :form-submit="formSubmit"
                        :meters="meters"
                        :new-location="newLocation"
                        ref="addMeterTable"
                        @onResetValidation="resetValidation"
                        @onMeterCountUpdate="meterCountUpdate"
                        :resultColor="resultColor"
                        :oldLocationColor="oldLocationColor"
                    ></add-meter-view>
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
                        @click="clear"
                    >
                        Очистить
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
    import { mapActions, mapGetters, mapState } from "vuex"
    import AddMeterView from "./AddMeterView";

    export default {
        name: "AcceptOrIssueDialog",
        components: {
	        AddMeterView
        },
        data: () => ({
	        oldLocationColor: 'green',
	        resultColor: 'grey',
            meterCount: '',
            dialogOperations: [],
            dialogModel: false,
	        issuingPerson: '',
	        issuingPersonStaffId: '',
	        issuingPersonLabel: 'Отдающий сотрудник',
	        needAcceptedPerson: true,
	        acceptedPerson: '',
	        acceptedPersonStaffId: '',
	        acceptedPersonLabel: 'Принимающий сотрудник',
            comment: '',
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
	        currentOperation: 9,
	        newLocation: 0
        }),
        mounted() {
            this.dialogOperations = this.operations.filter(operation => !operation.notAcceptOrIssueOperation)
        },
        created() {

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
	            operations: 'storage/getOperations',
            }),
        },
        provide: function () {
	        return {
		        checkIfMeterLocationValid: this.checkIfMeterLocationValid
	        }
        },
	    watch: {
	        currentOperation(operation) {
		        this.newLocation = operation
		        switch (operation) {
			        case 5: this.needAcceptedPerson = false; break;
			        case 9:  this.newLocation = 0; break;
			        case 11:  this.newLocation = 8; break;
			        case 12:  this.newLocation = 9; break;
		        }
            }
        },
        methods: {
	        ...mapActions('storage', [
                'createLog',
	        ]),

	        //события формы
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

	        checkIfMeterLocationValid(meter) {
		       	return meter.oldLocation !== 0 || this.newLocation !== 0
	        },

	        meterCountUpdate(count) {
	            this.meterCount = count
            },

            open() {
	            this.dialogModel = true
            },

            close() {
                this.dialogModel = false
                this.clear()
            },

	        clear() {
	        	this.meterCount = ''
		        this.currentOperation = 9
		        this.newLocation = 0
		        this.needAcceptedPerson = true
		        this.issuingPerson = ''
		        this.acceptedPerson = ''
		        this.comment = ''
                this.resultColor = this.colorGrey
                this.oldLocationColor = this.colorGreen
		        this.meters = []
		        this.formSubmit = false
		        this.acceptedPersonLabel = 'Принимающий сотрудник'
		        this.issuingPersonLabel = 'Отдающий сотрудник'
		        this.resetValidation()
		        this.$refs.addMeterTable.serialNumberClear()
            },

            resetValidation() {
	            this.$refs.form.resetValidation()
            },

	        async accept() {
                if (!this.$refs.form.validate()) {
                    return
                }

		        if (!this.meters.length) {
			        return this.showNotification(
				        `Для выполнения операции заполните таблицу счетчиков`, this.colorOrange)
		        }

		        this.issuingPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.issuingPerson))
		        if (this.needAcceptedPerson) {
			        this.acceptedPersonStaffId = parseInt(this.getEmployeeStaffIdByCard(this.acceptedPerson))
		        } else {
			        this.acceptedPersonStaffId = 999999999999999
		        }

		        if (isNaN(this.issuingPersonStaffId) || isNaN(this.acceptedPersonStaffId)) {
			        return this.showNotification(
				        'Операция с неизвестным сотрудником не возможна', this.colorOrange)
		        }

                if (!this.meters.every(meter => this.checkIfMeterLocationValid(meter))) {
	                return this.showNotification(
		                'Не возможно произвести операцию, в таблице выбрана запрещенная схема смены местоположения',
                        this.colorOrange)
                }

	            try {
		            this.formSubmit = true
		            this.$refs.addMeterTable.setLoading(true)

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
                            this.resultColor = this.colorGreen
                        } else {
	                        this.showNotification('Операция выполнена с ошибками', this.colorOrange)
	                        this.resultColor = this.colorOrange
                        }

	                    this.oldLocationColor = this.colorGrey
	                    this.meterCount = `${ successCount }/${ totalCount }`
                    }
                } catch (e) {
		            console.log(e)
		            this.showNotificationStandardError(e)
	            } finally {
		            this.$refs.addMeterTable.setLoading(false)
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
</style>
