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
                                        @metersClear="metersRepairClear"
                                        is-repair
                                        current-tab="materialInsertTab"
                                    ></add-meter-view>
                                    <add-material-view
                                        :form-submit="formSubmit"
                                        ref="addMaterialTable"
                                        :storage-materials="repairMaterials"
                                    >
                                    </add-material-view>
                                </div>
                        </v-tab-item>
                        <v-tab-item value="materialStorageTab">
                            <add-material-view
                                class="pl-2 pt-4"
                                :form-submit="formSubmit"
                                ref="addMaterialTableStorage"
                                :storage-materials="storageMaterials"
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
                                @metersClear="metersWorkClear"
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
			...mapState({
				colorBlue: state => state.colorBlue,
				colorRed: state => state.colorRed,
				colorGreen: state => state.colorGreen,
				colorOrange: state => state.colorOrange,
				colorGrey: state => state.colorGrey,
				colorGold: state => state.colorGold,
			}),
			...mapGetters({
				staffId: 'getStaffId',
			}),
		},
		inject: [
			'showNotification',
			'showNotificationStandardError',
            'getMaterialTypeTitle',
			'formatDate',
			'initializeMeters',
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
				this.dialogModel = true
			},

			close() {
				this.dialogModel = false
				this.clear()
			},

			metersRepairClear() {
				this.repairMeters = []
            },
			metersWorkClear() {
				this.repairWorkMeters = []
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
		            return this.showNotification(`Для выполнения операции заполните таблицу счетчиков`, this.colorOrange)
	            }
	            if (!this.repairMaterials.length) {
		            return this.showNotification(`Для выполнения операции заполните таблицу материалов`, this.colorOrange)
	            }

	            let updateStr = 'Используемые материалы:;'
	            this.repairMaterials.forEach(material => {
		            updateStr += `${ this.getMaterialTypeTitle(material.materialType) } ${ material.count }шт.;`
	            })

	            try {
		            this.formSubmit = true
                    this.$refs.addMeterTable.setLoading(true)
                    const result = await this.insertMeterStorageMaterials({
                        meters: this.repairMeters,
                        materials : this.repairMaterials,
                        updateStr
                    })
                    console.log(result)
                    if (result?.success) {
                        this.showNotification(`Операция выполнена успешно`, this.colorGreen)
                        this.resultColorMaterials = this.colorGreen
                    } else {
	                    this.formSubmit = false
                        this.showNotification(`Что то пошло не так при внесении материалов`, this.colorRed)
                    }
		            this.initializeMeters()
	            } catch (e) {
		            this.showNotificationStandardError(e)
		            this.formSubmit = false
	            } finally {
		            this.$refs.addMeterTable.setLoading(false)
	            }
            },

            async insertStorageMaterials() {
	            if (!this.storageMaterials.length) {
		            return this.showNotification(
			            `Для выполнения операции заполните таблицу материалов`, this.colorOrange)
	            }
	            try {
		            this.formSubmit = true
		            this.$refs.addMaterialTableStorage.setLoading(true)
                    const result = await this.insertMaterialToStorage(this.storageMaterials)
                    console.log(result)
                    if (result?.success) {
                        this.showNotification(`Операция выполнена успешно`, this.colorGreen)
                    } else {
                        this.formSubmit = false
                        this.showNotification(`Что то пошло не так при внесении материалов на склад`, this.colorRed)
                    }
	            } catch (e) {
		            this.showNotificationStandardError(e)
		            this.formSubmit = false
	            } finally {
		            this.$refs.addMaterialTableStorage.setLoading(false)
	            }
            },

            async insertMeterWorkability() {
	            if (!this.repairWorkMeters.length) {
		            return this.showNotification(`Для выполнения операции заполните таблицу счетчиков`, this.colorOrange)
	            }
	            let updateStr = 'Статус ремонта: '
	            updateStr += this.isWorkable ? 'работает;' : 'не работает;'
	            updateStr += this.comment ? `Комментарий: ${ this.comment };` : ''
	            updateStr += 'Дата: ' + this.formatDate(new Date(), true) + ";"

	            try {
		            this.formSubmit = true
		            this.$refs.addMeterTableWorkability.setLoading(true)
		            const result = await this.insertMeterWorkStatus({
			            meters: this.repairWorkMeters,
			            isWorkable : this.isWorkable,
			            comment : this.comment,
			            updateStr
		            })
		            console.log(result)
		            if (result?.success) {
			            this.showNotification(`Операция выполнена успешно`, this.colorGreen)
			            this.resultColorWorkability = this.colorGreen
		            } else {
			            this.formSubmit = false
			            this.showNotification(`Что то пошло не так при внесении материалов`, this.colorRed)
		            }
		            this.initializeMeters()
	            } catch (e) {
		            this.showNotificationStandardError(e)
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