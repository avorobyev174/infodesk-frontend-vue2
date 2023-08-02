<template>
    <div>
        <dialog-with-data-slot
            ref="DataDialog"
            :title="formTitle"
            @submit="save"
            @close="close"
        >
            <template v-slot:fields>
                <div class="add-dialog-type-and-parent-panel">
                    <v-select
                        v-model="editedItem.type"
                        :items="meterSortedTypes"
                        item-text="title"
                        item-value="value"
                        label="Тип"
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
                    label="Родительский объект"
                    required
                />
                <v-select
                    v-model="editedItem.phase"
                    :items="phases"
                    item-text="title"
                    item-value="value"
                    label="Фазность"
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
                    item-text="title"
                    item-value="value"
                    :items="ipAddresses"
                    label="IP адрес"
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
                />
                <v-text-field
                    v-model="editedItem.contact"
                    label="Связной"
                    type="text"
                    :rules="contactRules"
                />
            </template>
        </dialog-with-data-slot>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex"
    import DialogWithDataSlot from "../../utils-components/dialog/DialogWithDataSlot"
    const DEFAULT_TYPE = 133
    const DEFAULT_SERIAL_NUMBER_LEN = 10
    const PHASE_1_TYPES = [ 132, 133, 143, 107, 138, 144, 111, 131, 113, 117 ]
    const IP_ADDRESSES_TYPES = [ 105, 139, 140, 141, 142, 143, 144, 146, 147 ]
    const MIRTEK_TYPES = [ 111, 119, 120 ]
    import {
	    editedItem,
	    defaultItem,
	    serialNumberRules,
	    iccRules,
	    gateWayRules,
	    portRules,
	    contactRules,
	    parentRules,
	    getContactBySerialNumber,
    } from '../js/add-or-edit-dialog'

    export default {
        name: "AddOrEditDialog",
        components: {
	        DialogWithDataSlot
        },
        data: () => ({
	        editedItem,
	        defaultItem,
	        serialNumberRules,
	        iccRules,
	        gateWayRules,
	        portRules,
	        contactRules,
	        parentRules,
            parseSerialNumberButtonDisabled: true,
            addresses: [ 'МЭК', 'ГЭС', 'УЭСК', 'Магнитострой', 'МСК' ],
            meterSortedTypes: [],
            editedIndex: -1,
            iccDynamicRules: [],
            parentDynamicRules: [],
	        gatewayDynamicRules: [],
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
        inject: [
        	'showNotificationSuccess',
            'showNotificationError',
            'showNotificationRequestError',
            'getMeters',
            'updateMeterData',
        ],
	    computed: {
            ...mapGetters({
                phases: 'dictionary/getPhases',
                meterTypes: 'dictionary/getMeterProgrammingTypes',
                ipAddresses: 'dictionary/getIpAddresses',
            }),
            formTitle() { return this.editedIndex === -1 ? 'Добавить' : 'Редактировать' },
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
            ...mapActions('programming', [ 'addMeter', 'editMeter', 'getParentMirC04Meters' ]),

            parseSerialNumber(serialNumber) {
                if (serialNumber.length > DEFAULT_SERIAL_NUMBER_LEN) {
                    let type = DEFAULT_TYPE

                    switch (serialNumber.substr(0, 3)) {
                        case '186': type = 132; break
                        case '174': type = 125; break
                        case '180': type = 124; break
                    }

                    //МИР
                    switch (serialNumber.substr(0, 4)) {
                        case 'C-05': type = 143; break
                        case 'C-07': type = 105; break
                    }

                    switch(type) {
                        case 139: this.editedItem.serial_number = serialNumber.substr(28, 14); break
                        case 143:
	                    case 144: this.editedItem.serial_number = serialNumber.substr(25, 14); break
                        default: this.editedItem.serial_number = serialNumber.substr(3, 8)
                    }

                    this.editedItem.type = type
                    this.meterTypeChanged(type)
                    this.meterSerialNumberOnInput(this.editedItem.serial_number)
                    this.$refs.iccInput.focus()
                }
            },

            meterTypeChanged(type) {
	            if (this.editedIndex === -1) {
		            PHASE_1_TYPES.includes(type) ? this.editedItem.phase = 1 : this.editedItem.phase = 3
		            IP_ADDRESSES_TYPES.includes(type) ? this.editedItem.ip_address = 5 : this.editedItem.ip_address = 1
                    if ([ 107 ].includes(type)) {
                        this.editedItem.phase = 1
                        this.editedItem.ip_address = 1
                        this.editedItem.port = 1
                    }

		            if ([ 117 ].includes(type)) {
			            this.editedItem.ip_address = 3
		            }
	            }
	            this.isChildMirC04 = [ 140 ].includes(type)
	            this.hasGateway = MIRTEK_TYPES.includes(type)
            },

	        meterParentChanged(parentId) {
		        let parent = this.parentMirC04GZB1Items.find((meter) => meter.value === parentId)
                if (parent) {
	                this.editedItem.port = parent.port
                }
	        },

            meterSerialNumberOnInput(serialNumber) {
	            const length = serialNumber.length
                if (length > 3) {
                    this.editedItem.contact = getContactBySerialNumber(serialNumber, this.editedItem.type)
                }

                this.parseSerialNumberButtonDisabled = length < 10 || this.editedItem.type === 16
            },

            async open() {
	            this.editedIndex = -1
	            this.isChild = false
	            this.isChildMirC04 = [ 140 ].includes(this.editedItem.type)
	            this.hasGateway = MIRTEK_TYPES.includes(this.editedItem.type)

	            this.meterTypeChanged(this.editedItem.type)
	            this.meterSortedTypes = this.meterTypes.sort(this.meterTypeSort)

	            await this.fillParentMirC04Meters()
	            this.$refs.DataDialog.dialogOpen()
            },

            async edit(item) {
	            await this.fillParentMirC04Meters()
                this.editedIndex = this.meters.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.editedItem.index = this.editedIndex

	            this.meterSortedTypes = this.meterTypes.sort(this.meterTypeSort)

	            this.isChildMirC04 = [ 140 ].includes(this.editedItem.type)
	            this.hasGateway = MIRTEK_TYPES.includes(this.editedItem.type)

	            this.isChild = !!this.editedItem.parent_id
	            this.$refs.DataDialog.dialogOpen()
            },

            meterTypeSort(a, b) {
            	return a.title.localeCompare(b.title)
            },

            close() {
                const type = this.editedItem.type
	            this.editedItem = Object.assign({}, this.defaultItem)
	            this.editedItem.type = type
	            this.editedIndex = -1
            },

            async save() {
	            this.editedItem.parent_id = this.isChild ? this.editedItem.parent_id : ''
	            this.editedItem.icc = this.isChild ? '' : this.editedItem.icc
                if (this.editedIndex > -1) {
                    try {
	                    this.$refs.DataDialog.setLoading(true)
                        const [ editedMeter ] = await this.editMeter(this.editedItem)
                        this.updateMeterData(editedMeter, `Счетчик ${ editedMeter.serial_number } успешно отредактирован`)
                        this.$refs.DataDialog.dialogClose()
                    } catch (e) {
                    	this.$refs.DataDialog.setLoading(false)
                        this.showNotificationRequestError(e)
                    }
                } else {
                    try {
                        const [ addedMeter ] = await this.addMeter(this.editedItem)
                        this.showNotificationSuccess(`Счетчик ${ addedMeter.serial_number } успешно добавлен`)
                    } catch (e) {
                        this.showNotificationRequestError(e)
                    } finally {
                        this.$refs.DataDialog.dialogClose()
	                    await this.getMeters()
                    }
                }
            },

            async fillParentMirC04Meters() {
	            const meters = await this.getParentMirC04Meters()
	            this.parentMirC04GZB1Items = meters.map(({ id, serial_number, port }) => ({
                    text: serial_number,
                    value: id,
                    port: port
	            }))
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