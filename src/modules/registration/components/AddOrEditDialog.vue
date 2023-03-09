<template>
    <div>
        <!-- Диалог добавления/изменения -->
        <v-dialog
            v-model="dialogModel"
            max-width="450px"
        >
            <v-form
                ref="form"
                v-model="formValid"
                lazy-validation
                @submit.prevent="save"
            >
<!--                @keypress.enter.native.prevent-->
                <v-card>
                    <v-card-title>
                        <span class="m-auto text-h5">{{ formTitle }}</span>
                    </v-card-title>
                    <v-card-text class="m-auto">
                        <div class="add-dialog-type-and-parent-panel">
                            <v-select
                                v-model="editedItem.type"
                                :items="meterTypes"
                                item-text="text"
                                item-value="value"
                                label="Выберите тип"
                                required
                                @change="meterTypeChanged(editedItem.type)"
                            />
                            <v-checkbox
                                class="pl-2"
                                v-model="isChild"
                                v-show="isChildMirC04"
                            ></v-checkbox>
                        </div>
                        <div class="add-dialog-parse-panel">
                            <v-text-field
                                v-model="editedItem.serial_number"
                                label="Серийный номер"
                                :rules="serialNumberRules"
                                required
                                @input="meterSerialNumberOnInput(editedItem.serial_number)"
                                @keydown.enter="$refs.iccInput.focus()"
                                autofocus
                            ></v-text-field>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        color="primary"
                                        @click="parseSerialNumber(editedItem.serial_number)"
                                        class="ml-2"
                                        v-bind="attrs"
                                        v-on="on"
                                        :disabled="parseSerialNumberButtonDisabled"
                                        height="40px"
                                    >
                                        <v-icon size="30px">mdi-barcode-scan</v-icon>
                                    </v-btn>
                                </template>
                                <span>Парсинг серийного номера (> 10 символов)</span>
                            </v-tooltip>
                        </div>
                        <v-text-field
                            @keydown.space="$refs.portInput.focus()"
                            ref="iccInput"
                            v-model="editedItem.icc"
                            label="ICC"
                            type="text"
                            v-show="!isChild"
                            :rules="iccDynamicRules"
                            @keydown.enter="hasGateway ? $refs.gatewayInput.focus() : $refs.portInput.focus()"
                            :counter="20"
                            required
                        />
                        <v-select
                            v-model="editedItem.parent_id"
                            :items="parentMirC04GZB1Items"
                            v-show="isChild"
                            item-text="text"
                            item-value="value"
                            :rules="parentDynamicRules"
                            @change="meterParentChanged(editedItem.parent_id)"
                            label="Выберите родительский объект"
                            required
                        />
                        <v-select
                            v-model="editedItem.phase"
                            :items="phases"
                            item-text="text"
                            item-value="value"
                            label="Выберите фазность"
                            required
                        />
                        <v-combobox
                            v-model="editedItem.address"
                            label="Принадлежность ПУ"
                            :items="addresses"
                            disable-lookup
                            auto-select-first
                        />
                        <v-select
                            v-model="editedItem.ip_address"
                            item-text="text"
                            item-value="value"
                            :items="ipAddresses"
                            label="Выберите IP адрес"
                            required
                        />
                        <v-text-field
                            ref="gatewayInput"
                            v-model.number="editedItem.gateway"
                            label="Шлюз"
                            type="text"
                            v-show="hasGateway"
                            :rules="gatewayDynamicRules"
                            @keydown.enter="$refs.portInput.focus()"
                        />
                        <v-text-field
                            ref="portInput"
                            v-model="editedItem.port"
                            label="Порт"
                            type="text"
                            :rules="portRules"
                            required
                        />
                        <v-text-field
                            v-model="editedItem.contact"
                            label="Связной"
                            type="text"
                            :rules="contactRules"
                        />

                    </v-card-text>
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
        <!-- Диалог подтверждения удаления -->
        <simple-dialog
            :dialog-open="dialogDeleteModel"
            max-width="600px"
            title="Вы уверены что хотите удалить это счетчик?"
            @okButtonClickEvent="deleteConfirm"
            @cancelButtonClickEvent="closeDialogDeleteConfirm"
        />
    </div>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex";
    import SimpleDialog from "../../utils-components/SimpleDialog";

    export default {
        name: "AddOrEditDialog",
        components: {
            simpleDialog: SimpleDialog,
        },
        data: () => ({
            dialogModel: false,
            dialogDeleteModel: false,
            parseSerialNumberButtonDisabled: true,
            addresses: ['МЭК', 'ГЭС', 'УЭСК', 'Магнитострой', 'МСК'],
            meterTypes: [],
            formValid: true,
            editedIndex: -1,
            editedItem: {
                serial_number: '',
                type: 1,
                phase: 1,
                icc: '',
                address: 'МЭК',
                port: null,
                contact: null,
                ip_address: 1,
	            parent_id: null,
	            gateway: ''
            },
            defaultItem: {
                serialNumber: '',
                type: 1,
                phase: 1,
                icc: '',
                address: 'МЭК',
                port: null,
                contact: null,
                ip_address: 1,
	            parent_id: null,
                gateway: ''
            },
            componentTitle: 'Диалог добавления/редактирования',
            serialNumberRules: [
                v => !!v || 'Обязательно к заполнению',
                v => (v && v.length >= 8) || 'Должно быть не меньше 8 символов',
                /*v => (v && !(new RegExp('[^0-9]', 'g').test(String(v)))) || 'Должны присутствовать только цифры'*/
            ],
            iccDynamicRules: [],
            parentDynamicRules: [],
            iccRules: [
                v => !!v || 'Обязательно к заполнению',
                v => (v && (v == parseInt(v))) || 'Должно быть целым числом',
                v => (v && String(v).length <= 20) || 'Должно быть меньше 20 символов'
            ],
	        gatewayDynamicRules: [],
	        gateWayRules: [
		        v => !!v || 'Обязательно к заполнению',
		        v => (v && (v == parseInt(v))) || 'Должно быть целым числом',
		        v => (v && String(v).length >= 6) || 'Должно быть меньше 6 символов'
	        ],
            portRules: [
                v => !!v || 'Обязательно к заполнению',
                v => (v && (v == parseInt(v))) || 'Должно быть целым числом',
                v => (v && (v >= 0)) || 'Должно быть больше или равно нулю',
            ],
            contactRules: [
                v => v === null || v === '' ? true : (v && (v == parseInt(v))) || 'Должно быть целым числом'
            ],
	        parentRules: [
		        v => !!v || 'Должен быть выбран родитель',
	        ],
	        isChild: false,
	        isChildMirC04: false,
            parentMirC04GZB1Items: [],
            hasGateway: false
        }),
	    props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: ['showNotification', 'showNotificationComponentError', 'showNotificationStandardError'],
	    computed: {
            ...mapGetters({
                phases: 'registration/getPhases',
                types: 'registration/getTypes',
                status: 'registration/getStatus',
                smsStatus: 'registration/getSmsStatus',
                ipAddresses: 'registration/getIpAddress',
            }),
            formTitle() { return this.editedIndex === -1 ? 'Добавление' : 'Редактирование' },
            buttonTitle() { return this.editedIndex === -1 ? 'Добавить' : 'Сохранить' },
        },
        watch: {
        	isChild(val) {
		        this.iccDynamicRules = val ? [] : this.iccRules
		        this.parentDynamicRules =  val ? this.parentRules : []
            },
	        hasGateway(val) {
		        this.gatewayDynamicRules = val ? this.gateWayRules : []
            }
        },
        methods: {
            ...mapActions('registration', ['addMeter', 'deleteMeter', 'editMeter', 'getParentMirC04Meters']),

            parseSerialNumber(serialNumber) {
                if (serialNumber.length > 10) {
                    let type = 2

                    switch (serialNumber.substr(0, 3)) {
                        case '186': type = 1; break
                        case '174': type = 4; break
                        case '180': type = 3; break
                    }

                    //МИР
                    switch (serialNumber.substr(0, 4)) {
                        //case 'C-04': type = 5; break
                        case 'C-05': type = 6; break
                        case 'C-07': type = 7; break
                    }

                    switch(type) {
                        case 5: this.editedItem.serial_number = serialNumber.substr(28, 14); break
                        case 6:
	                    case 18: this.editedItem.serial_number = serialNumber.substr(25, 14); break
                        default: this.editedItem.serial_number = serialNumber.substr(3, 8)
                    }

                    this.editedItem.type = type
                    this.meterTypeChanged(type)
                    this.meterSerialNumberOnInput(this.editedItem.serial_number)
                    this.$refs.iccInput.focus()
                }
            },

            meterTypeChanged(type) {
	            //console.log(this.editedIndex)
                //Добавление
	            if (this.editedIndex === -1) {
                    [1, 2, 6, 16, 17, 18, 23, 26, 27, 30].includes(type) ? this.editedItem.phase = 1 : this.editedItem.phase = 3;
                    [5, 6, 7, 18, 20, 21, 22].includes(type) ? this.editedItem.ip_address = 2 : this.editedItem.ip_address = 1;
                    if ([16].includes(type)) {
                        this.editedItem.phase = 1
                        this.editedItem.ip_address = 1
                        this.editedItem.port = 1
                    }

		            if ([30].includes(type)) {
			            this.editedItem.ip_address = 3
		            }
	            }
	            this.isChildMirC04 = [20].includes(type)
	            this.hasGateway = [23, 31].includes(type)
            },

	        meterParentChanged(parentId) {
		        let parent = this.parentMirC04GZB1Items.find(meter => meter.value === parentId)
                if (parent) this.editedItem.port = parent.port
	        },

            meterSerialNumberOnInput(serialNumber) {
	            const length = serialNumber.length

                //рассчитывается связной номер
                if (length > 3) {
                    let contact = 0
                    switch (this.editedItem.type) {
                        case 2:
                        case 9:
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                        case 15:
                        case 17:
                            contact = parseInt(serialNumber.substr(-3));
                            if (contact < 17) {
                                while (contact < 17)
                                    contact += 10;
                            } else if (contact > 127) {
                                contact = parseInt(contact.toString().substr(1, 2))
                                if (contact < 17) {
                                    while (contact < 17)
                                        contact += 10
                                }
                            }
                            break;
                        case 5:
                        case 6:
                        case 7:
                        case 18:
                        case 20:
                        case 21:
                        case 22:
                        	contact = serialNumber.substr(-4)
                            if (contact.length < 4) contact = contact.padStart(5, '1000')
	                        break;
	                    case 25:
		                    contact = serialNumber.substr(-9)
		                    break;
                        case 16:
	                    case 27:
	                    case 28:
	                    case 29:
	                    case 32:
                        	contact = 16; break;
	                    case 23:
	                    case 31:
	                    	contact = serialNumber.substr(-5); break;
	                    case 30: contact = parseInt(serialNumber.substr(-4)) + 1000; break;
                        default:
                            contact = parseInt(serialNumber.substr(-3));
                            if (contact > 255) contact = contact.toString().substr(1, 2);
                            else if (contact === 0) contact = 1;
                    }

                    this.editedItem.contact = contact
                }

                this.parseSerialNumberButtonDisabled = length < 10 || this.editedItem.type === 16
            },

            async open() {
	            this.editedIndex = -1
	            this.isChild = false
	            this.isChildMirC04 = [20].includes(this.editedItem.type)
	            this.hasGateway = [23].includes(this.editedItem.type)

	            this.meterTypeChanged(this.editedItem.type)
	            this.meterTypes = this.types.sort((a, b) => {
		            return a.text.localeCompare(b.text)
	            })

	            await this.fillParentMirC04Meters()


	            this.dialogModel = true
            },

            async edit(item) {
	            await this.fillParentMirC04Meters()
                this.editedIndex = this.meters.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.editedItem.index = this.editedIndex

	            this.meterTypes = this.types.sort((a, b) => {
		            return a.text.localeCompare(b.text)
	            })

	            this.isChildMirC04 = [20].includes(this.editedItem.type)
	            this.hasGateway = [23].includes(this.editedItem.type)

	            this.isChild = !!this.editedItem.parent_id
	            this.dialogModel = true
            },

            delete(item) {
                this.editedIndex = this.meters.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialogDeleteModel = true
            },

            close() {
                this.dialogModel = false
                const type = this.editedItem.type
                this.$nextTick(() => {
                    this.$refs.form.resetValidation()
                    this.editedItem = Object.assign({}, this.defaultItem)
	                this.editedItem.type = type
                    this.editedIndex = -1
                })
            },

            save() {
                if (!this.$refs.form.validate()) {
                    return
                }

	            this.editedItem.parent_id = this.isChild ? this.editedItem.parent_id : ''
	            this.editedItem.icc = this.isChild ? '' : this.editedItem.icc
                //Редактирование
                if (this.editedIndex > -1) {
                    this.editMeter(this.editedItem).then(
                        result => {
                            const meter = result.data
                            const index = result.index
                            Object.assign(this.meters[index], meter)
                            this.showNotification(`Счетчик ${ meter.serial_number } успешно отредактирован`, 'success')
                        },
                        e => this.showNotificationComponentError(this.componentTitle, e)
                    )
                }
                //Добавление
                else {
                    this.addMeter(this.editedItem).then(
                        result => {
                            const meter = result[0]
                            this.meters.push(meter)
                            this.showNotification(`Счетчик ${ meter.serial_number } успешно добавлен`, 'success')
                        },
                        e => this.showNotificationComponentError(this.componentTitle, e)
                    )
                }
                this.close()
            },

            //Обработчик события удаления(подтверждено) счетчика
            deleteConfirm() {
                this.deleteMeter(this.editedItem.id).then(
                    result => {
                        const deletedMeterId = result[0].id
                        if (deletedMeterId === this.editedItem.id) {
                            this.meters.splice(this.editedIndex, 1)
                            this.closeDialogDeleteConfirm()
                            this.showNotification(`Счетчик ${ this.editedItem.serial_number } успешно удален`, 'success')
                        }
                    },
                    e => {
                        this.closeDialogDeleteConfirm()
                        this.showNotificationComponentError(this.componentTitle, e)
                    }
                )
            },

            //Обработчик события отмены удаления счетчика
            closeDialogDeleteConfirm() {
                this.dialogDeleteModel = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                })
            },

            async fillParentMirC04Meters() {
	            let response = await this.getParentMirC04Meters()
	            this.parentMirC04GZB1Items = response.map(meter => {
		            return { text: meter.serial_number, value: meter.id, port: meter.port }
	            })
            },
        }
    }
</script>

<style scoped>
    .add-dialog-parse-panel, .add-dialog-type-and-parent-panel {
        display: flex;
        align-items: center;
    }
</style>