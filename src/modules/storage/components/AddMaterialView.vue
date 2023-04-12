<template>
    <div class="pr-3">
        <div class="add-panel">
            <v-combobox
                :items="materialTypes"
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
            :items="storageMaterials"
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
	import { mapActions, mapGetters, mapState } from "vuex";

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
	        materialType: { id: 6, title: 'Батарейка 3V CR2032' },
	        selectedMaterialIndex: 0,
	        metersWithLetters: [  ],
        }),
        props: {
	        formSubmit: {
		        type: Boolean,
		        required: true
	        },
	        storageMaterials: {
		        type: Array,
                required: true
            },
        },
		inject: [
			'showNotification',
			'showNotificationStandardError',
			'getMaterialTypeTitle',
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
				materialTypes: 'storage/getMaterialTypes',
			}),
		},
        methods: {
	        ...mapActions('storage', [
		        'checkMeterInDB',
	        ]),

	        selectRow(item, row) {
		        this.selectedMaterialIndex = row.index
		        row.select(true)
	        },

	        materialAddButtonOnClick() {
		        if (!this.formSubmit) {
			        const usedMaterial = this.storageMaterials.find(material => material.materialType === this.materialType.id)
                    const count = parseInt(this.count)

		        	!usedMaterial && count > 0
				        ? this.storageMaterials.unshift({ materialType: this.materialType.id, count })
				        : usedMaterial.count += count

		        } else {
			        this.showNotification('Операция уже завершена, редактирование списка не доступно', this.colorBlue)
		        }
	        },

	        materialDeleteButtonOnClick() {
		        if (!this.formSubmit) {
			        this.storageMaterials.splice(this.selectedMaterialIndex, 1)
		        } else {
			        this.showNotification('Операция уже завершена, редактирование списка не доступно', this.colorBlue)
		        }
	        },

	        setLoading(loading) {
		        this.loading = loading
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