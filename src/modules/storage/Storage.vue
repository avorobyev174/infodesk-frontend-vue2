<template>
    <v-card>
        <v-data-table
            :loading="loading"
            @contextmenu:row="actionMenuOpen"
            height="80vh"
            class="elevation-1"
            single-select
            item-key="id"
            :items-per-page="100"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text':'счетчиков на странице',
                'items-per-page-options': [ 100, 250, 500, 1000 ]
            }"
            loading-text="Идет загрузка счетчиков..."
            fixed-header
            :headers="selectedHeaders"
            :items="meters"
            :options.sync="options"
            :server-items-length="totalMetersCount"
            @click:row="initializeEventList"
        >
            <template v-slot:no-results>
                <span>Нет данных...</span>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
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
            <template v-slot:header.meter_type="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Тип счетчика"
                    v-model="filterByMeterType"
                    :filter-value="filterByMeterType"
                    :filterItems="meterTypes"
                    :filter-color="filterByMeterTypeColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.meter_location="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Местонахождение"
                    v-model="filterByLocation"
                    :filter-value="filterByLocation"
                    :filterItems="locations"
                    :filter-color="filterByLocationColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.current_owner="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Владелец"
                    v-model="filterByOwner"
                    :filter-value="filterByOwner"
                    :filterItems="storageEmployeesModified"
                    :filter-color="filterByOwnerColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:top>
                <v-toolbar
                    flat
                    height="70px"
                >
                    <v-spacer></v-spacer>
                    <main-menu
                        v-if="!isObserver"
                        class="pr-2"
                        @acceptOrIssue="$refs.AcceptOrIssueDialog.open(false)"
                        @register="$refs.RegisterDialog.open(false)"
                        @showHideColumns="$refs.ShowHideColumnsDialog.dialogOpen()"
                        @showHideAllMeters="showHideAllMeters"
                        @routerRegister="$refs.RegisterDialog.open(true)"
                        @routerAcceptOrIssue="$refs.AcceptOrIssueDialog.open(true)"
                        @repairOrMaterialsAdd="$refs.RepairAndMaterialsDialog.open()"
                    ></main-menu>
                </v-toolbar>
            </template>
            <template v-slot:item.meter_type="{ item }">
                {{ getMeterTypeTitle(item.meter_type) }}
            </template>
            <template v-slot:item.serial_number="{ item }">
                <v-chip
                    v-if="item.isSetWorkStatus || item.isSetMaterials"
                    :color="item.isSetWorkStatus ? colorGreen : item.isSetMaterials ? colorOrange : '' ">
                    {{ item.serial_number }}
                </v-chip>
                <span v-else>
                    {{ item.serial_number }}
                </span>
            </template>
            <template v-slot:item.accuracy_class="{ item }">
                {{ getAccuracyClassTitle(item.accuracy_class) }}
            </template>
            <template v-slot:item.condition="{ item }">
                {{ getConditionTitle(item.condition) }}
            </template>
            <template v-slot:item.property="{ item }">
                {{ getOwnerTitle(item.property) }}
            </template>
            <template v-slot:item.meter_location="{ item }">
                {{ getLocationTitle(item.meter_location) }}
            </template>
            <template v-slot:item.calibration_date="{ item }">
                {{ formatDate(item.calibration_date) }}
            </template>
            <template v-slot:item.current_owner="{ item }">
                {{ getEmployeeTitleByStaffId(item.current_owner) }}
            </template>
        </v-data-table>
        <accept-or-issue-dialog
            ref="AcceptOrIssueDialog"
        />
        <register-dialog
            ref="RegisterDialog"
            :meters="meters"
        />
        <edit-dialog
            ref="EditDialog"
            :meters="meters"
        />
        <show-hide-columns-dialog
            ref="ShowHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
            module="storage"
        >
        </show-hide-columns-dialog>
        <repair-and-materials-dialog
            ref="RepairAndMaterialsDialog"
        />
        <action-menu
            ref="ActionMenu"
            :actions="actions"
            @edit="$refs.EditDialog.edit(selectedMeter)"
            @remove="$refs.EditDialog.remove(selectedMeter)"
            @openEventList="$refs.LogList.open(selectedMeter)"
        />
        <storage-log-list
            ref="LogList"
        />
    </v-card>
</template>

<script>
    import { filterActions } from "./js/storage-actions"
	import MainMenu from "./components/MainMenu"
    import AcceptOrIssueDialog from "./components/AcceptOrIssueDialog"
    import ActionMenu from "../utils-components/menu/ActionMenu"
	import RegisterDialog from "./components/RegisterDialog"
	import ShowHideColumnsDialog from "../utils-components/show-hide-columns/ShowHideColumnsDialog"
    import EditDialog from "./components/EditDialog"
    import StorageMixin from "./mixins/StorageMixin"
    import RepairAndMaterialsDialog from "./components/RepairAndMaterialsDialog"
    import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin";
    import ColumnVisibilityMixin from "../mixins/ColumnVisibilityMixin"
    import ComboboxDataTableFilter from "../utils-components/filter/ComboboxDataTableFilter"
    import InputDataTableFilter from "../utils-components/filter/InputDataTableFilter"
    import StorageFilterMixin from "./mixins/StorageFilterMixin"
    import DictionaryMixin from "../mixins/DictionaryMixin"
    import StorageLogList from "./components/StorageLogList"

	export default {
		name: "Storage",
		components: {
			StorageLogList,
			RegisterDialog,
			MainMenu,
            AcceptOrIssueDialog,
			ShowHideColumnsDialog,
			EditDialog,
			RepairAndMaterialsDialog,
			ComboboxFilter: ComboboxDataTableFilter,
			InputFilter: InputDataTableFilter,
			ActionMenu
		},
		data: () => ({
			options: {},
			module: 'storage',
			totalMetersCount: 0,
			actions: [],
			logs: [],
            isObserver: false,
            isShowAllMeters: false,
			selectedMeter: {},
		}),
		mixins: [ StorageMixin, StorageFilterMixin, DictionaryMixin, FavoriteModuleMixin, ColumnVisibilityMixin ],
		inject: [ 'showNotificationRequestError' ],
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
		methods: {
			async initializeEventList(item, row) {
				row.select(true)
                this.$refs.LogList.open(item)
			},

			actionMenuOpen(e, { item }) {
				e.preventDefault()
				this.selectedMeter = item
				this.actions = filterActions(this.currentAccountId)
				this.$refs.ActionMenu.open(e.clientX, e.clientY)
			},

            async getMeters() {
                try {
	                this.resetFilters()
	                if (this.roles?.storage_module === 'repairer') {
		                this.options.role = this.isShowAllMeters ? 'keeper' : 'repairer'
	                }

	                this.totalMetersCount = await this.fetchMeters(this.options)
	                await this.getMeterTypesInRepair()
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },

			async showHideAllMeters(actionType) {
                if (actionType === 'show') {
                    this.isShowAllMeters = true
                } else {
                    this.options.page = 1
	                this.isShowAllMeters = false
                    this.resetFilters()
                }
                await this.getMeters()
            },
		},
	}
</script>
<style scoped>
    .v-overlay {
        border-radius: 0 !important;
    }
</style>