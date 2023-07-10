<template>
    <div class="pr-3">
        <div class="add-panel">
            <v-combobox
                :items="availableMaterialTypes"
                item-text="title"
                item-value="id"
                label="Тип"
                class="pl-1 pt-2 pb-0 pr-3"
                v-model="materialType"
                outlined
                :disabled="formSubmit"
            >
            </v-combobox>
            <v-text-field
                class="pt-2 pb-0 pr-3"
                type="text"
                label="Количество"
                v-model="count"
                clearable
                outlined
                :disabled="formSubmit"
                @keypress.enter="materialAddButtonOnClick"
            >
            </v-text-field>
            <v-btn-toggle
            >
                <v-btn @click="materialAddButtonOnClick" :disabled="formSubmit">
                    <v-icon :color="colorGreen" large>mdi-plus-thick</v-icon>
                </v-btn>
                <v-btn @click="materialDeleteButtonOnClick" :disabled="formSubmit">
                    <v-icon :color="colorRed" large>mdi-minus-thick</v-icon>
                </v-btn>
            </v-btn-toggle>
        </div>
        <v-data-table
            fixed-header
            class="pl-1"
            :items="materials"
            single-select
            :headers="headers"
            item-key="materialType"
            hide-default-footer
            @click:row="selectRow"
            :items-per-page="100"
            :loading="loading"
            :height="200"
        >
            <template v-slot:no-data>
                <p class="pt-4">Нет данных</p>
            </template>
            <template v-slot:no-results>
                <p class="pt-4">Нет данных</p>
            </template>
            <template v-slot:item.materialType="{ item }">
                {{ getMaterialTypeTitle(item.materialType) }}
            </template>
        </v-data-table>
    </div>
</template>

<script>
	import { mapActions, mapGetters, mapState } from "vuex"

	export default {
		name: "AddMaterialView",
        data: () => ({
	        loading: false,
	        headers: [
		        {
			        text: 'Материал',
			        align: 'center',
			        value: 'materialType',
			        sortable: false,
			        cellClass: 'table-header-size',
		        },
		        {
			        text: 'Количество',
			        align: 'center',
			        value: 'count',
			        sortable: false,
			        cellClass: 'table-header-size',
		        },
	        ],
	        count: '',
	        materialType: null,
	        selectedMaterialIndex: 0,
	        availableMaterialTypes: [],
	        commonMaterials: [ 8, 9, 10, 13 ],
	        specificMaterials: {
		        3 : [ 2, 6 ],
		        4 : [ 2 ],
		        6 : [ 2 ],
		        7 : [ 2 ],
		        12 : [ 1, 5 ],
		        16 : [ 1, 5 ],
		        29 : [ 1, 5 ],
		        33 : [ 1, 5 ],
		        35 : [ 1, 5, 6, 14 ],
		        46 : [ 4, 6, 7, 12 ],
		        47 : [ 1, 5, 14 ],
	        },
        }),
        props: {
	        formSubmit: {
		        type: Boolean,
		        required: true
	        },
	        materials: {
		        type: Array,
                required: true
            },
        },
		inject: [
			'showNotificationInfo',
			'getMaterialTypeTitle',
		],
		computed: {
			...mapState([ 'colorGreen', 'colorRed', 'colorBlue' ]),
			...mapGetters({ materialTypes: 'storage/getMaterialTypes', }),
		},
        mounted() {
			this.availableMaterialTypes = this.materialTypes.slice(0)
	        this.materialType = this.availableMaterialTypes[0]
        },
		methods: {
	        ...mapActions('storage', [ 'checkMeterInDB', ]),

	        selectRow(item, row) {
		        this.selectedMaterialIndex = row.index
		        row.select(true)
	        },

	        materialAddButtonOnClick() {
		        if (!this.formSubmit) {
			        const usedMaterial = this.materials.find(({ materialType }) => materialType === this.materialType.id)
                    const count = parseInt(this.count)

		        	!usedMaterial && count > 0
				        ? this.materials.unshift({ materialType: this.materialType.id, count })
				        : usedMaterial.count += count
		        } else {
			        this.showNotificationInfo('Операция уже завершена, редактирование списка не доступно')
		        }
	        },

	        materialDeleteButtonOnClick() {
		        if (!this.formSubmit) {
			        this.materials.splice(this.selectedMaterialIndex, 1)
		        } else {
			        this.showNotificationInfo('Операция уже завершена, редактирование списка не доступно')
		        }
	        },

	        setLoading(loading) {
		        this.loading = loading
	        },

	        changeAvailableMaterials(meterType) {
	        	if (this.specificMaterials[ meterType ]) {
			        this.availableMaterialTypes = this.materialTypes.filter((materialType) => {
				        const specificMaterials = this.specificMaterials[ meterType ]
				        return (specificMaterials?.includes(materialType.id)) || this.commonMaterials.includes(materialType.id)
			        })
                } else {
			        this.availableMaterialTypes = this.materialTypes.slice(0)
                }

                this.materialType = this.availableMaterialTypes.at(0)
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

    .minus-button-repair {
        border-top-right-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
    }

    .scanner-button-show {
        display: none;
    }
</style>