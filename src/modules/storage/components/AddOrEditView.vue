<template>
    <div>
        <slot name="storage-select"></slot>
        <v-combobox
            :items="types"
            item-text="title"
            item-value="index"
            label="Тип"
            class="pl-1 pt-2 pb-0 pr-3"
            v-model="type"
            :disabled="formSubmit"
            v-show="isEdit && !isRouter"
        >
        </v-combobox>
        <v-text-field
            class="pt-2 pb-0 pr-3"
            type="text"
            label="Серийный номер"
            v-model="serialNumber"
            clearable
            :disabled="formSubmit"
            v-show="isEdit && !isRouter"
        ></v-text-field>
        <v-text-field
            class="pt-2 pb-0 pr-3"
            type="text"
            label="Номер паспорта"
            v-model="passportNumber"
            clearable
            :disabled="formSubmit"
            v-show="isEdit && !isRouter"
        ></v-text-field>
        <v-select
            v-model="accuracyClass"
            :items="accuracyClasses"
            item-text="text"
            item-value="value"
            label="Класс точности"
            :disabled="formSubmit"
            v-show="!isRouter"
        />
        <v-select
            v-model="condition"
            :items="conditions"
            item-text="text"
            item-value="value"
            label="Состояние"
            :disabled="formSubmit"
            v-show="!isRouter"
        />
        <v-text-field
            v-model="calibrationDate"
            label="Дата поверки"
            type="date"
            :disabled="formSubmit"
            v-show="!isRouter"
        ></v-text-field>
        <v-select
            v-model="interval"
            :items="intervals"
            item-text="text"
            item-value="value"
            label="Межповерочный интервал"
            :disabled="formSubmit"
            v-show="!isRouter"
        />
        <v-select
            v-model="owner"
            :items="owners"
            item-text="text"
            item-value="value"
            label="Собственник"
            :disabled="formSubmit"
            v-show="!isRouter"
        />
       <slot name="issuing-person-input"></slot>
        <v-text-field
            v-model="comment"
            label="Комментарий"
            :disabled="formSubmit"
        ></v-text-field>
    </div>
</template>

<script>
	import { mapGetters, mapState } from "vuex"

	export default {
		name: "AddOrEditView",
        data: () => ({
	        calibrationDate: null,
	        accuracyClass: 1,
	        condition: 0,
	        interval: 16,
	        owner: 0,
	        comment: '',
            type: {},
	        serialNumber: '',
            passportNumber: '',
        }),
		computed: {
			...mapGetters({
				locations: 'storage/getLocations',
				accuracyClasses: 'storage/getAccuracyClasses',
				conditions: 'storage/getConditions',
				intervals: 'storage/getIntervals',
				owners: 'storage/getOwners',
				types: 'storage/getMeterTypes',
			}),
		},
		inject: [
			'getMeterTypeTitle',
			'formatDate',
			'formatDateIso',
		],
        mounted() {
	        if (this.isEdit) {
		        this.setData()
	        }
        },
		watch: {
			parentDialogModel: function(newVal) {
		        if (newVal && this.isEdit) {
			        this.setData()
		        }
            },
        },
        props: {
	        isRouter: Boolean,
			isEdit: Boolean,
            formSubmit: Boolean,
	        parentDialogModel: Boolean,
	        typeTemp: Number,
            serialNumberTemp: String,
	        calibrationDateTemp: String,
	        accuracyClassTemp: Number,
	        conditionTemp: Number,
	        intervalTemp: Number,
	        ownerTemp: Number,
	        passportNumberTemp: Number,
	        commentTemp: String,
        },
        methods: {
	        clear() {
                this.comment = ''
                this.serialNumber = ''
                this.calibrationDate = null
                this.accuracyClass = 1
                this.condition = 0
                this.interval = 16
                this.owner = 0
                this.passportNumber = ''
	        },

            setData() {
	            this.type = { index: this.typeTemp, title: this.getMeterTypeTitle(this.typeTemp) }
	            this.serialNumber = this.serialNumberTemp
	            this.calibrationDate = this.calibrationDateTemp ? this.formatDateIso(this.calibrationDateTemp) : null
	            this.accuracyClass = this.accuracyClassTemp
	            this.condition = this.conditionTemp
	            this.interval = this.intervalTemp
	            this.owner = this.ownerTemp
	            this.comment = this.commentTemp
                this.passportNumber = this.passportNumberTemp === 0 ? '' : this.passportNumberTemp
            },

            getData() {
	        	if (this.isRouter) {
			        return {
			        	type: this.type.index,
				        serialNumber:  this.serialNumber,
				        accuracyClass: 0,
				        condition: 0,
				        interval: 0,
				        owner: 0,
				        calibration: null,
				        passportNumber: 0,
				        comment: this.comment,
				        isRouter: this.isRouter
			        }
                } else {
			        return {
				        type: this.type.index,
				        serialNumber:  this.serialNumber,
				        accuracyClass: this.accuracyClass,
				        condition: this.condition,
				        interval: this.interval,
				        owner: this.owner,
				        calibration: this.formatDate(this.calibrationDate) === 'отсутствует' ? null : this.formatDate(this.calibrationDate),
				        comment: this.comment,
				        passportNumber: this.passportNumber === '' ? 0 : this.passportNumber,
			        }
                }
            },
        }
	}
</script>

<style scoped>

</style>