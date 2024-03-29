<template>
    <div>
        <v-dialog
            v-model="dialogModel"
            max-width="900"
            @click:outside="close"
            @keydown.esc="close"
        >
            <v-form
                ref="form"
                v-model="formValid"
                lazy-validation
                @submit.prevent
            >
                <v-tabs
                    background-color="colorGrey"
                    center-active
                    fixed-tabs
                    v-model="tabModel"
                >
                    <v-tab href="#materialInsertTab" class="p-2">Внесение материалов
                        <v-chip label small v-if="repairMeters.length" :color="resultColorMaterials" class="ml-2">
                            {{ meterRepairCount }}
                        </v-chip>
                    </v-tab>
                    <v-tab href="#materialStorageTab">Прием материалов</v-tab>
                    <v-tab href="#meterWorkabilityTab">Работоспособность
                        <v-chip label small v-if="repairWorkMeters.length" :color="resultColorWorkability" class="ml-2">
                            {{ meterWorkCount }}
                        </v-chip></v-tab>
                </v-tabs>
                <v-card>
                    <v-tabs-items v-model="tabModel">
                        <v-tab-item value="materialInsertTab">
                                <div class="d-flex flex-column pt-4 pl-2">
                                    <add-meter-view
                                        :form-submit="formSubmit"
                                        :meters="repairMeters"
                                        :new-location="1"
                                        ref="addMeterTable"
                                        :resultColor="resultColorMaterials"
                                        @onResetValidation="resetValidation"
                                        @onMeterCountUpdate="meterRepairCountUpdate"
                                        @metersClear="repairMeters = []"
                                        @meterTypeChanged="meterTypeChanged"
                                        is-repair
                                        current-tab="materialInsertTab"
                                    ></add-meter-view>
                                    <add-material-view
                                        :form-submit="formSubmit"
                                        ref="addMaterialTable"
                                        :materials="repairMaterials"
                                    >
                                    </add-material-view>
                                </div>
                        </v-tab-item>
                        <v-tab-item value="materialStorageTab">
                            <add-material-view
                                class="pl-2 pt-4"
                                :form-submit="formSubmit"
                                ref="addMaterialTableStorage"
                                :materials="storageMaterials"
                            ></add-material-view>
                        </v-tab-item>
                        <v-tab-item value="meterWorkabilityTab">
                            <add-meter-view
                                class="pl-2 pt-4"
                                :form-submit="formSubmit"
                                :meters="repairWorkMeters"
                                :new-location="1"
                                ref="addMeterTableWorkability"
                                :resultColor="resultColorWorkability"
                                @onResetValidation="resetValidation"
                                @onMeterCountUpdate="meterWorkCountUpdate"
                                @metersClear="repairWorkMeters = []"
                                is-repair
                                current-tab="meterWorkabilityTab"
                            ></add-meter-view>
                            <div class="p-2" >
                                <v-checkbox
                                    v-model="isWorkable"
                                    class="is-workable"
                                    label="Исправен"
                                ></v-checkbox>
                                <v-text-field
                                    class="pl-1 pr-1 mb-1"
                                    v-model="comment"
                                    label="Комментарий"
                                    :disabled="formSubmit"
                                ></v-text-field>
                            </div>
                        </v-tab-item>
                    </v-tabs-items>
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
                            color="primary"
                            text
                            @click="accept"
                            v-if="!formSubmit"
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
    </div>
</template>

<script>
	import { mapActions, mapGetters, mapState } from "vuex"
	import AddMeterView from "./AddMeterView"
    import AddMaterialView from "./AddMaterialView"

	export default {
		name: "RepairAndMaterialsDialog",
		components: {
			AddMeterView,
			AddMaterialView
		},
        data: () => ({
	        formSubmit: false,
	        dialogModel: false,
	        formValid: true,
	        repairMeters:  [],
	        repairWorkMeters:  [],
	        storageMaterials:  [],
	        repairMaterials:  [],
	        repairerStaffId: '',
	        meterRepairCount: '',
	        meterWorkCount: '',
	        resultColorMaterials: 'grey',
	        resultColorWorkability: 'grey',
            tabModel: null,
            comment: '',
            isWorkable: true,
        }),
		computed: {
			...mapState([ 'colorGreen', 'colorGrey' ]),
			...mapGetters({
                staffId: 'getStaffId',
				typesInRepair: 'storage/getMeterRepairTypes',
            }),
		},
		inject: [
			'showNotificationSuccess',
			'showNotificationWarning',
			'showNotificationError',
			'showNotificationRequestError',
            'getMaterialTypeTitle',
			'formatDate',
			'getMeters',
		],
		methods: {
			...mapActions('storage', [
                'insertMeterStorageMaterials',
                'insertMaterialToStorage',
                'insertMeterWorkStatus',
			]),

			resetValidation() {
				this.$refs.form.resetValidation()
			},

			meterRepairCountUpdate(count) {
				this.meterRepairCount = count
			},

			meterWorkCountUpdate(count) {
				this.meterWorkCount = count
			},

			open() {
				if (!this.typesInRepair.length) {
					this.showNotificationWarning('Не найдено счетчиков в ремонте')
                } else {
					this.dialogModel = true
                }
			},

			close() {
				this.dialogModel = false
				this.clear()
			},

			clear() {
				this.repairMeters = []
				this.storageMaterials = []
				this.repairMaterials = []
				this.repairWorkMeters = []
                this.isWorkable = true
				this.meterRepairCount = ''
				this.meterWorkCount = ''
				this.comment = ''
				this.formSubmit = false
				this.resultColorMaterials = this.colorGrey
				this.resultColorWorkability = this.colorGrey
				this.$refs.addMeterTable.serialNumberClear()
			},

            async insertMeterMaterials() {
	            if (!this.repairMeters.length) {
		            return this.showNotificationWarning('Для выполнения операции заполните таблицу счетчиков')
	            }
	            if (!this.repairMaterials.length) {
		            return this.showNotificationWarning('Для выполнения операции заполните таблицу материалов')
	            }

	            try {
		            this.formSubmit = true
                    this.$refs.addMeterTable.setLoading(true)
                    await this.insertMeterStorageMaterials({
                        meters: this.repairMeters,
                        materials : this.repairMaterials,
                    })
                    this.showNotificationSuccess('Внесение материалов выполнено успешно')
                    this.resultColorMaterials = this.colorGreen
		            await this.getMeters()
	            } catch (e) {
		            this.showNotificationRequestError(e)
		            this.formSubmit = false
	            } finally {
		            this.$refs.addMeterTable.setLoading(false)
	            }
            },

            async insertStorageMaterials() {
	            if (!this.storageMaterials.length) {
		            return this.showNotificationWarning('Для выполнения операции заполните таблицу материалов')
	            }
	            try {
		            this.formSubmit = true
		            this.$refs.addMaterialTableStorage.setLoading(true)
		            await this.insertMaterialToStorage(this.storageMaterials)
                    this.showNotificationSuccess('Внесение материалов выполнено успешно')
	            } catch (e) {
		            this.showNotificationRequestError(e)
		            this.formSubmit = false
	            } finally {
		            this.$refs.addMaterialTableStorage.setLoading(false)
	            }
            },

            async insertMeterWorkability() {
	            if (!this.repairWorkMeters.length) {
		            return this.showNotificationWarning('Для выполнения операции заполните таблицу счетчиков')
	            }
	            let updateStr = 'Статус ремонта: '
	            updateStr += this.isWorkable ? 'работает;' : 'не работает;'
	            updateStr += this.comment ? `Комментарий: ${ this.comment };` : ''
	            updateStr += 'Дата: ' + this.formatDate(new Date(), true) + ";"

	            try {
		            this.formSubmit = true
		            this.$refs.addMeterTableWorkability.setLoading(true)
		            await this.insertMeterWorkStatus({
			            meters: this.repairWorkMeters,
			            isWorkable : this.isWorkable,
			            comment : this.comment,
		            })
                    this.showNotificationSuccess('Установка признака работоспособности выполнена успешно')
                    this.resultColorWorkability = this.colorGreen
		            await this.getMeters()
	            } catch (e) {
		            this.showNotificationRequestError(e)
		            this.formSubmit = false
	            } finally {
		            this.$refs.addMeterTableWorkability.setLoading(false)
	            }
            },

			async accept() {
				switch (this.tabModel) {
					case 'materialInsertTab': return await this.insertMeterMaterials()
					case 'materialStorageTab': return await this.insertStorageMaterials()
					case 'meterWorkabilityTab': return await this.insertMeterWorkability()
				}
			},

            meterTypeChanged(meterType) {
				if (this.tabModel === 'materialInsertTab') {
					const { addMaterialTable } = this.$refs
                    addMaterialTable.changeAvailableMaterials(meterType)
				}
            }
		}
	}
</script>
<style>
    .is-workable .v-label {
        margin-bottom: 0 !important;
    }
</style>
<style scoped>
    ::v-deep .v-data-table__empty-wrapper {
        display: none;
    }
    .v-tab {
        text-decoration: none !important;
    }
</style>