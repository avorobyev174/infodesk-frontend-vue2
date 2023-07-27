<template>
    <v-card>
        <v-data-table
            :loading="loading"
            @contextmenu:row="actionMenuOpen"
            height="85vh"
            class="elevation-1"
            single-select
            item-key="id"
            :items-per-page="100"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text': 'счетчиков на странице',
                'items-per-page-options': [ 100, 500, 1000 ]
            }"
            loading-text="Идет загрузка счетчиков..."
            fixed-header
            :headers="headers"
            :items="meters"
            :options.sync="options"
            :server-items-length="totalMetersCount"
        >
            <template v-slot:no-results>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:header.type="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Тип счетчика"
                    v-model="filterByMeterType"
                    :filter-value="filterByMeterType"
                    :filterItems="reapirMeterTypes"
                    :filter-color="filterByMeterTypeColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.prog_value="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Перепрограммирование"
                    v-model="filterByProgValue"
                    :filter-value="filterByProgValue"
                    :filterItems="programmingValues"
                    :filter-color="filterByProgValueColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.serial_number="{ header }">
                {{ header.text }}
                <input-filter
                    filterLabel="Серийный номер"
                    v-model="filterBySerialNumber"
                    :filter-value="filterBySerialNumber"
                    :filter-color="filterBySerialNumberColor"
                    @accept="acceptSerialNumberFilter"
                />
            </template>
            <!-- Подмена значений таблицы на лэйблы -->
            <template v-slot:item.type="{ item }">
                {{ getMeterTypeTitle(item.type) }}
            </template>
            <template v-slot:item.ip_address="{ item }">
                {{ getIpAddressTitle(item.ip_address) }}
            </template>
            <template v-slot:item.calibration_date="{ item }">
                {{ formatDate(item.calibration_date) }}
            </template>
            <template v-slot:item.prog_value="{ item }">
                <v-icon v-if="item.prog_value === 0" size="25" class="ma-2" :color="colorGrey">
                    mdi-checkbox-blank-circle-outline
                </v-icon>
                <v-icon v-else-if="item.prog_value === 1" size="25" class="ma-2" :color="colorBlue">
                    mdi-checkbox-marked-circle-outline
                </v-icon>
                <v-icon v-else size="25" class="ma-2" :color="colorGreen">
                    mdi-checkbox-marked-circle-plus-outline
                </v-icon>
            </template>
        </v-data-table>
        <dialog-custom
            ref="ProgrammingValueDialog"
            :max-width="700"
            title="Вы уверены что хотите подтвердить изменение данных?"
            @submit="setProgrammingOption"
        />
        <action-menu
            ref="ActionMenu"
            :actions="defaultRepairActions"
            @setProgrammingOption="$refs.ProgrammingValueDialog.dialogOpen()"
        />
    </v-card>
</template>

<script>
	import { mapActions, mapGetters, mapState} from "vuex"
	import DialogCustom from "../utils-components/dialog/DialogCustom"
	import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
	import DictionaryMixin from "../mixins/DictionaryMixin"
	import RepairFilterMixin from "./RepairFilterMixin"
	import { defaultRepairActions } from "./js/repair-actions"
    import ActionMenu from "../utils-components/menu/ActionMenu"
    import ComboboxDataTableFilter from "../utils-components/filter/ComboboxDataTableFilter"
    import InputDataTableFilter from "../utils-components/filter/InputDataTableFilter"
    import { ProgrammingState } from "../../const"

	export default {
		name: "Repair",
		components: {
			DialogCustom,
			ActionMenu,
			ComboboxFilter: ComboboxDataTableFilter,
			InputFilter: InputDataTableFilter,
		},
		data: () => ({
			defaultRepairActions,
			search: '',
			selectedMeter: {},
			totalMetersCount: 0,
			module: 'repair',
			options: {},
			headers: [
				{ text: 'ID', sortable: true, align: 'center', value: 'id' },
				{ text: 'Тип', value: 'type', sortable: true, align: 'center' },
				{ text: 'Серийный номер', value: 'serial_number', sortable: false, align: 'center' },
				{ text: 'Дата поверки', value: 'calibration_date', sortable: true, align: 'center' },
				{ text: 'IP адрес', value: 'ip_address', sortable: true, align: 'center' },
				{ text: 'Порт', value: 'port', sortable: true, align: 'center' },
				{ text: 'Связной', value: 'contact', sortable: false, align: 'center' },
				{ text: 'Перепрограммирование', value: 'prog_value', sortable: true, align: 'center' },
			],
		}),
		mixins: [ DictionaryMixin, FavoriteModuleMixin, RepairFilterMixin ],
		inject: [
			'showNotificationSuccess',
			'showNotificationRequestError',
		],
		computed: {
			...mapGetters({
				meters: 'repair/getMeters',
                isLogin: 'getIsLogin',
				programmingValues: 'repair/getProgrammingValues',
			}),
			...mapState([ 'colorGreen', 'colorGrey', 'colorBlue']),
			...mapState('repair', [ 'loading', ])
        },
		watch: {
			options: {
				async handler () {
					!this.isActiveFilters()
						? await this.getMeters()
						: await this.acceptFilters()
				},
				deep: true,
			},
		},
        mounted() {
	        document.onkeydown = (evt) => {
		        if (this.$route.name === 'Repair' && evt.key === 'Alt') {
			        this.getMeters()
		        }
	        }
        },
		methods: {
	        ...mapActions('repair', [
		        'fetchMeters',
		        'fetchAllMeters',
                'setProgrammingValue'
	        ]),

			actionMenuOpen(e, { item }) {
				e.preventDefault()
				this.selectedMeter = item
				this.$refs.ActionMenu.open(e.clientX, e.clientY)
			},

	        async getMeters() {
				try {
					this.resetFilters()
					this.totalMetersCount = await this.fetchMeters(this.options)
					const allMeters = await this.fetchAllMeters(false)
					this.createFiltersValues(allMeters)
                } catch (e) {
					this.showNotificationRequestError(e)
				}
	        },

            async setProgrammingOption() {
	            this.$refs.ProgrammingValueDialog.dialogClose()
                try {
	                const updatedMeter = await this.setProgrammingValue({ id: this.selectedMeter.id, value: ProgrammingState.PROGRAMMED })
	                this.updateMeterData(updatedMeter, 'Информация успешно обновлена')
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },

			updateMeterData(updatedMeter, messageSuccess) {
				const meter = this.meters.find(({ id }) => id ===  updatedMeter.id)
				Object.assign(meter, updatedMeter)
				this.showNotificationSuccess(messageSuccess)
			}
		}
	}
</script>

<style scoped>
    .search-text-input {
        max-width: 350px;
    }
</style>