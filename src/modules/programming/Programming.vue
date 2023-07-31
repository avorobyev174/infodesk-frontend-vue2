<template>
    <v-card>
        <v-data-table
            :loading="loading"
            sort-by="id"
            height="80vh"
            class="elevation-1"
            @contextmenu:row="actionMenuOpen"
            :items-per-page="50"
            single-select
            item-key="id"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text': 'счетчиков на странице',
                'items-per-page-options': [ 50, 100, 200, 300 ]
            }"
            loading-text="Идет загрузка счетчиков..."
            fixed-header
            :headers="showHeaders"
            :items="meters"
            :options.sync="options"
            :server-items-length="totalMetersCount"
        >
            <template v-slot:no-results>
                <span>Нет данных...</span>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:top>
                <v-toolbar flat height="70px">
                    <v-spacer/>
                    <programming-menu
                        :menuActions="menuActions"
                        @update="getMeters"
                        @addOrEdit="$refs.AddOrEditDialog.open()"
                        @updateFromRTC="$refs.UpdateDataFromRTCDialog.open()"
                        @actualizeFromStek="$refs.UpdateDataFromSTEKDialog.open()"
                        @showHideColumns="$refs.ShowHideColumnsDialog.dialogOpen()"
                        @showBrokenMeters="$refs.MeterTableInfo.open()"
                        @showDeletedMeters="$refs.MeterTableInfo.open(true)"
                        @saveExcelDataToPyramid="$refs.SaveDataToExcelDialog.open()"
                        @saveExcelRefreshDataToPyramid="$refs.RefreshDataFromSTEKDialog.open()"
                    />
                </v-toolbar>
            </template>
            <template v-slot:header.type="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Тип счетчика"
                    v-model="filterByMeterType"
                    :filter-value="filterByMeterType"
                    :filterItems="meterProgrammingTypes"
                    :filter-color="filterByMeterTypeColor"
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
            <template v-slot:header.personal_account="{ header }">
                {{ header.text }}
                <input-filter
                    filterLabel="Номер лицевого"
                    v-model="filterByPersonalAccount"
                    :filter-value="filterByPersonalAccount"
                    :filter-color="filterByPersonalAccountColor"
                    @accept="acceptPersonalAccountFilter"
                />
            </template>
            <template v-slot:header.phone="{ header }">
                {{ header.text }}
                <input-filter
                    filterLabel="Сим карта"
                    v-model="filterBySim"
                    :filter-value="filterBySim"
                    :filter-color="filterBySimColor"
                    @accept="acceptSimFilter"
                />
            </template>
            <template v-slot:header.port="{ header }">
                {{ header.text }}
                <input-filter
                    filterLabel="Порт"
                    v-model="filterByPort"
                    :filter-value="filterByPort"
                    :filter-color="filterByPortColor"
                    @accept="acceptPortFilter"
                />
            </template>
            <template v-slot:header.icc="{ header }">
                {{ header.text }}
                <input-filter
                    filterLabel="ICC"
                    v-model="filterByICC"
                    :filter-value="filterByICC"
                    :filter-color="filterByICCColor"
                    @accept="acceptICCFilter"
                />
            </template>
            <template v-slot:header.ip_address="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Тип счетчика"
                    v-model="filterByIpAddress"
                    :filter-value="filterByIpAddress"
                    :filterItems="ipAddresses"
                    :filter-color="filterByIpAddressColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.address="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Принадлежность"
                    v-model="filterByAddress"
                    :filter-value="filterByAddress"
                    :filterItems="programmingAddresses"
                    :filter-color="filterByAddressColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:item.sms_status="{ item }">
                <v-chip
                    :color="getSmsColorByStatus(item.sms_status)"
                    dark
                >
                    {{ getSmsTitleByStatus(item.sms_status) }}
                </v-chip>
            </template>
            <template v-slot:item.created="{ item }">
                {{ formatDate(item.created) }}
            </template>
            <template v-slot:item.type="{ item }">
                {{ getMeterTypeTitle(item.type) }}
            </template>
            <template v-slot:item.phase="{ item }">
                {{ getPhaseTitle(item.phase) }}
            </template>
            <template v-slot:item.ip_address="{ item }">
                {{ getIpAddressTitle(item.ip_address) }}
            </template>
            <template v-slot:item.status="{ item }">
                {{ getSimStatusTitle(item.status) }}
            </template>
            <template v-slot:item.in_pyramid="{ item }">
                <v-chip v-if="item.in_pyramid === 0" :color="colorGrey">Не загружен</v-chip>
                <v-chip v-else :color="colorGreen">Загружен {{ item.loaded ? formatDate(item.loaded) : '' }}</v-chip>
            </template>
            <template v-slot:item.prog_value="{ item }">
                <v-tooltip bottom v-if="item.prog_value === 1">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            size="25"
                            class="ma-2"
                            v-bind="attrs"
                            v-on="on"
                            :color="colorBlue"
                            @click="$refs.MeterProgrammingDialog.dialogOpen()"
                        >
                            mdi-checkbox-marked-circle-outline
                        </v-icon>
                    </template>
                    <span>Подтвердить изменение данных</span>
                </v-tooltip>
                <v-icon
                    v-else-if="item.prog_value === 2"
                    size="25"
                    class="ma-2"
                    :color="colorGreen"
                >
                    mdi-checkbox-marked-circle-plus-outline
                </v-icon>
            </template>
        </v-data-table>
        <show-hide-columns-dialog
            ref="ShowHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
            module="programming"
        />
        <!-- Диалог добавления/изменения -->
        <add-or-edit-dialog
            :meters="meters"
            ref="AddOrEditDialog"
        />
        <!-- Диалог акутализации данных из ростелекома-->
        <update-data-from-r-t-c-dialog
            :meters="meters"
            ref="UpdateDataFromRTCDialog"
        />
        <!-- Диалог групповой отправки смс -->
        <update-data-from-s-t-e-k-dialog
            :meters="meters"
            ref="UpdateDataFromSTEKDialog"
        />
        <!-- Диалог сохранения данных в формате excel для пирамиды-->
        <save-data-to-excel-dialog
            :meters="meters"
            ref="SaveDataToExcelDialog"
        />
        <!-- Диалог обновления данных загруженных счетчиков из стэка-->
        <refresh-data-from-s-t-e-k-dialog
            :meters="meters"
            ref="RefreshDataFromSTEKDialog"
        />
        <!-- Диалог утилизации счетчика-->
        <mark-broken-dialog
            :meters="meters"
            ref="MarkBrokenDialog"
        />
        <meter-table-info
            ref="MeterTableInfo"
        />
        <dialog-custom
            ref="MeterRemovePyramidLoadValueDialog"
            :max-width="600"
            title="Вы уверены что хотите удалить признак загрузки в пирамиду?"
            @submit="addOrRemovePyramidLoadValue"
        />
        <dialog-custom
            ref="MeterAddPyramidLoadValueDialog"
            :max-width="600"
            title="Вы уверены что хотите установить признак загрузки в пирамиду?"
            @submit="addOrRemovePyramidLoadValue(true)"
        />
        <dialog-custom
            ref="MeterProgrammingDialog"
            :max-width="700"
            title="Вы уверены что хотите подтвердить изменение данных?"
            @submit="setIsProgrammed"
        />
        <action-menu
            ref="ActionMenu"
            :actions="actions"
            @edit="$refs.AddOrEditDialog.edit(selectedMeter)"
            @delete="$refs.MeterDeleteDialog.dialogOpen()"
            @markBroken="$refs.MarkBrokenDialog.open(selectedMeter)"
            @removePyramidLoadValue="$refs.MeterRemovePyramidLoadValueDialog.dialogOpen()"
            @addPyramidLoadValue="$refs.MeterAddPyramidLoadValueDialog.dialogOpen()"
            @actualizeDataFromStek="$refs.UpdateDataFromSTEKDialog.updateSingleData(selectedMeter)"
            @removeSimCardData="simCardDataRemove(selectedMeter)"
            @openEventList="$refs.LogList.open(selectedMeter)"
        />
        <dialog-custom
            ref="MeterDeleteDialog"
            :max-width="600"
            title="Вы уверены что хотите удалить это счетчик?"
            @submit="meterDelete"
        />
        <programming-log-list
            ref="LogList"
        />
    </v-card>
</template>
<script>
import SaveDataToExcelDialog from "./components/SaveDataToExcelDialog"
import ActionMenu from "../utils-components/menu/ActionMenu"
import MarkBrokenDialog from "./components/MarkBrokenDialog"
import UpdateDataFromSTEKDialog from "./components/UpdateDataFromSTEKDialog"
import AddOrEditDialog from "./components/AddOrEditDialog"
import UpdateDataFromRTCDialog from "./components/UpdateDataFromRTCDialog"
import Menu from "../utils-components/menu/Menu"
import ShowHideColumnsDialog from "../utils-components/show-hide-columns/ShowHideColumnsDialog"
import RefreshDataFromSTEKDialog from "./components/RefreshDataFromSTEKDialog"
import MeterTableInfo from "./components/MeterInfoTable"
import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin";
import ColumnVisibilityMixin from "../mixins/ColumnVisibilityMixin"
import DictionaryMixin from "../mixins/DictionaryMixin"
import ProgrammingMixin from "./mixins/ProgrammingMixin"
import ProgrammingFilterMixin from "./mixins/ProgrammingFilterMixin"
import ComboboxDataTableFilter from "../utils-components/filter/ComboboxDataTableFilter"
import InputDataTableFilter from "../utils-components/filter/InputDataTableFilter"
import DialogCustom from "../utils-components/dialog/DialogCustom"
import ProgrammingLogList from "./components/ProgrammingLogList"

export default {
    name: "Programming",
    components: {
	    DialogCustom,
	    RefreshDataFromSTEKDialog,
        SaveDataToExcelDialog,
	    ActionMenu,
	    MarkBrokenDialog,
	    UpdateDataFromSTEKDialog,
        AddOrEditDialog,
	    UpdateDataFromRTCDialog,
	    ProgrammingMenu: Menu,
        ShowHideColumnsDialog,
	    MeterTableInfo,
	    ComboboxFilter: ComboboxDataTableFilter,
	    InputFilter: InputDataTableFilter,
	    ProgrammingLogList
    },
    data: () => ({
	    module: 'programming',
	    totalMetersCount: 0,
	    selectedMeter: {},
	    actions: [],
	    options: {},
    }),
    inject: [
        'showNotificationSuccess',
        'showNotificationError',
        'showNotificationWarning',
        'showNotificationInfo',
        'showNotificationRequestError',
    ],
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
    mixins: [ ProgrammingMixin, ProgrammingFilterMixin, DictionaryMixin, FavoriteModuleMixin, ColumnVisibilityMixin ],
    methods: {
	    actionMenuOpen(e, { item }) {
		    e.preventDefault()
		    this.selectedMeter = item
		    this.actions = this.filterActions(item, this.currentAccountId)
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
    }
}
</script>

<style scoped>

</style>