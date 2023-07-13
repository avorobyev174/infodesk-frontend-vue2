<template>
    <v-card class="m-3 px-4 pb-6" max-width="900px">
        <v-card-text class="pb-0">
            <p class="text-h6 text-secondary search-card-title">Отчеты по комплексам</p>
            <p class="search-card-info">списки содержат отчеты по комплексам с описанием данных</p>
        </v-card-text>
        <v-treeview
            open-all
            class="px-1"
            hoverable
            :items="reportItems"
            item-key="name"
            open-on-click
            :transition="true"
            selection-type="independent"
        >
            <template v-slot:label="{ item, open, leaf }">
                <div class="report-body">
                    <v-icon large v-if="item.description">
                        {{ 'mdi-circle-small' }}
                    </v-icon>
                    <p
                        v-if="item.description"
                        class="report-name"
                    >{{ item.name }}</p>
                    <p
                        v-else
                        class="report-title"
                    >{{ item.name }}</p>
                    <v-expand-transition>
                        <div v-show="item.show" class="report-description">
                            <p class="report-description-main">{{ item.description }}</p>
                            <p class="report-description-columns">{{ item.columns }}</p>
                            <p class="report-description-params">{{ item.params }}</p>
                        </div>
                    </v-expand-transition>
                </div>
            </template>
            <template v-slot:append="{ item, open }">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
						v-show="item.description"
                        @click="item.show = !item.show"
                    >
						<v-icon large color="grey">
                            mdi-information
                        </v-icon>
                    </v-btn>
                </template>
                <span>Показать описание</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        @click="localFuncCall(item)"
                        :loading="item.loading"
                        v-bind="attrs"
                        v-on="on"
                        class="px-2"
						v-show="item.download"
                    >
                        <v-icon large color="green">
                            mdi-download-circle
                        </v-icon>
                    </v-btn>
                </template>
                <span>Скачать</span>
            </v-tooltip>
			<v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        @click="localFuncCall(item)"
                        :loading="item.loading"
                        v-bind="attrs"
                        v-on="on"
                        class="px-2"
						v-show="item.open || item.print"
                    >
                        <v-icon large :color="item.open ? 'green' : 'blue'">
                            mdi-play-circle
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{ item.open ? 'Сформировать' : 'Распечатать' }}</span>
            </v-tooltip>
        </template>
        </v-treeview>
        <data-input-report-dialog
            @submit="showReportData"
            ref="DataInputReportDialog"
        ></data-input-report-dialog>
        <data-result-report-dialog
            ref="DataResultReportDialog"
            :report-data="reportData"
            :title="reportTitle"
        ></data-result-report-dialog>
    </v-card>
</template>

<script>
	import { mapGetters } from "vuex"
    import DataResultReportDialog from "./components/DataResultReportDialog"
	import DataInputReportDialog from "./components/DataInputReportDialog"
	import StorageMixin from "../storage/mixins/StorageMixin"
	import ReportStorageMixin from "./mixins/ReportStorageMixin"
	import ReportPyramidMixin from "./mixins/ReportPyramidMixin"
	import ReportAlphaMixin from "./mixins/ReportAlphaMixin"
	import DictionaryMixin from "../mixins/DictionaryMixin"
	import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
	import ReportServiceMixin from "./mixins/ReportServiceMixin"
	import ReportProgrammingMixin from "./mixins/ReportProgrammingMixin"
    import { getReportItemsByRole, executeAndSaveReport } from "./utils"
	import { saveDataArrayToExcelFile } from "../Utils"
    import { Report } from "./const"

	export default {
		name: "Reports",
		components: {
			DataResultReportDialog,
			DataInputReportDialog,
        },
		data: () => ({
			module: 'reports',
            expand: false,
            reportData: [],
            reportTitle: '',
            reportItems: [],
		}),
		mixins: [
			StorageMixin,
			ReportAlphaMixin,
			ReportPyramidMixin,
			ReportServiceMixin,
			ReportProgrammingMixin,
            ReportStorageMixin,
            DictionaryMixin,
            FavoriteModuleMixin,
        ],
		inject: [
            'showNotificationRequestError',
            'showNotificationInfo',
            'setBackgroundImage'
        ],
        provide: function () {
	        return {
		        formatDate: this.formatDate,
	        }
        },
		computed: {
			...mapGetters({
				roles: 'getRoles',
			}),
		},
		mounted() {
			this.setBackgroundImage(true)
            this.reportItems = getReportItemsByRole(this.roles.report_module)
		},
		methods: {
			saveDataArrayToExcelFile,
			executeAndSaveReport,

			localFuncCall(item) {
				this[ item.executeFunction ](item)
			},

			async dataInputReportDialogOpen(item) {
                this.$refs.DataInputReportDialog.open(item)
			},

			async showReportData(reportItem) {
				switch (reportItem.id) {
					case Report.STORAGE_METER_BY_SERIAL_NUMBER: return this.showMeterStorageReport(reportItem)
					case Report.STORAGE_SYSTEM_LOGS: return this.showStoragePeriodReport(reportItem)
					case Report.STORAGE_LOGS_BY_LOCATION: return this.showLocationByPeriodStorageReport(reportItem)
					case Report.STORAGE_IN_OUT_BY_LOCATION: return this.showEmployeeByPeriodStorageReport(reportItem)
					case Report.STORAGE_COUNT_BY_LOCATION: return this.showLocationLogsByPeriodStorageReport(reportItem)
					case Report.STORAGE_LOGS_BY_OWNER: return this.showEmpLogsByPeriodStorageReport(reportItem)
					case Report.STORAGE_IN_OUT_BY_OWNER: return this.showEmpGroupLogsByPeriodStorageReport(reportItem)
					case Report.STORAGE_GROUP_BY_OWNER_AND_TYPE: return this.showCurrentCountByLocationStorageReport(reportItem)
					case Report.REPAIR_AND_MATERIALS: return this.showRepairAndMaterialStorageReport(reportItem)
					case Report.SPENT_MATERIALS: return this.showSpentMaterialsByMonthStorageReport(reportItem)
					case Report.STORAGE_LAST_LOGS: return this.showLastLogsStorageReport(reportItem)
					case Report.ASSIGNMENT_EVENTS_BY_SERIAL_NUMBER: return this.showAssignmentEventsBySerialNumberReport(reportItem)
					case Report.ASSIGNMENT_EVENTS_BY_CUSTOMER_ADDRESS: return this.showAssignmentEventsByCustomerAddressReport(reportItem)
					case Report.NOT_ACTIVE_IN_PYRAMID: return this.showNonActiveInPyramidReport(reportItem)
					case Report.PYRAMID_LOADED_BY_CUSTOMER_ADDRESS: return this.showPyramidLoadedByAddressReport(reportItem)
					case Report.ASSIGNMENT_GROUP_BY_STATUS: return this.showAssignmentGroupByStatusReport(reportItem)
					case Report.ASSIGNMENT_GROUP_BY_STATUS_AND_OWNER: return this.showAssignmentGroupByStatusAndOwnerReport(reportItem)
					case Report.ASSIGNMENT_EVENTS_GROUP_BY_CLOSE_REASON: return this.showAssignmentEventsGroupByCloseReasonReport(reportItem)
				}
			},

			async showDataResultReportDialog({ dialogTitle, additionalTitle, headers, getReportDataFunction, data }, height, width) {
				const { DataInputReportDialog, DataResultReportDialog } = this.$refs
				DataInputReportDialog.setLoading(true)
				try {
					const data = await getReportDataFunction()
					if (!data.length) {
						return this.showNotificationInfo('Информация отсутствует')
					}
					console.log({ dialogTitle, additionalTitle, headers, getReportDataFunction })
					DataResultReportDialog.open({ dialogTitle, additionalTitle, headers, data }, height, width)
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					DataInputReportDialog.close()
				}
			},
		}
	}
</script>

<style scoped>
    .report-body {
        display: grid;
        grid-template-areas: "i name"
                            "i desc"
                            "i columns";
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto;
    }

    .report-title {
        font-weight: bold;
        color: rgba(0, 0, 0, 0.87);
        padding: 0;
        margin: 0;
        font-size: 1rem;
    }

    .report-name {
        grid-area: name;
        font-size: 15px;
        margin-top: auto;
        margin-bottom: auto;
    }

    .report-description {
        grid-area: desc;
        white-space: pre;
        font-size: 12px;
        color: darkgrey;
        width: 100%;
    }

    .report-description-main {
        margin-bottom: 5px;
    }

    .report-description-columns {
        padding-left: 10px;
        margin-bottom: 5px;
    }
</style>
<style>
    .v-treeview-node__level {
        width: 5px !important;
    }

    .v-treeview-node__content {
        align-items: baseline !important;
    }
</style>