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
        <non-active-in-pyramid-report
            ref="ReportActiveDialog"
            @okButtonClickEvent="getNonActiveInPyramidReport"
            title="Параметры отчета"
        />
        <meter-count-by-address-report
            ref="reportDialogCount"
            @okButtonClickEvent="getPyramidLoadedByAddressReport"
            title="Параметры отчета"
        />
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
	import { mapActions } from "vuex"
	import saveCountByAddressReportToExcel from "./js/saveCountByAddressReportToExcel"
	import saveLoadedInPyramidByCustomerAddressReportToExcel from "./js/saveLoadedInPyramidByCustomerAddressReportToExcel"
	import saveFromUitToStorageReportToExcel from "../reports/js/saveFromUitToStorageReportToExcel"
	import saveNotLoadedInPyramidReportToExcel from "../reports/js/saveNotLoadedInPyramidReportToExcel"
	import saveNonActivePyramidMetersToExcelFile from "../reports/js/saveNonActiveMetersDataToExcel"
	import saveLastTimeDataToExcelFile from "../reports/js/saveLastTimeDataToExcel"
	import saveRotecDataToExcelFile from "./js/saveRotecDataToExcel"
	import NonActiveInPyramidReport from "./components/NonActiveInPyramidReport"
	import MeterCountByAddressReport from "./components/MeterCountByAddressReport"
	import ReportItemsMixin from './mixins/ReportItemsMixin'
    import DataResultReportDialog from "./components/DataResultReportDialog"
	import StorageMixin from "../storage/mixins/StorageMixin"
	import ReportStorageMixin from "./mixins/ReportStorageMixin"
    import DataInputReportDialog from "./components/DataInputReportDialog"
    import { dateFormat } from "../Utils"
	import DictionaryMixin from "../mixins/DictionaryMixin"
	import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
	import ReportServiceMixin from "./mixins/ReportServiceMixin"

	export default {
		name: "Reports",
		components: {
			NonActiveInPyramidReport,
			MeterCountByAddressReport,
			DataResultReportDialog,
			DataInputReportDialog
        },
		data: () => ({
			moduleName: 'reports',
            expand: false,
            selectedItem: null,
            reportData: [],
            reportTitle: '',
            reportItems: [],
		}),
		mixins: [ ReportItemsMixin, StorageMixin, ReportStorageMixin, DictionaryMixin, FavoriteModuleMixin, ReportServiceMixin ],
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
		mounted() {
			this.setBackgroundImage(true)
            this.reportItems = this.getReportItems()
		},
		methods: {
			...mapActions('reports',
				[
					'getCountByAddress',
					'getMeterFromRepairToStorageCount',
					'getDataByNotInPyramid',
					'getNonActiveInPyramid',
					'getLoadedPyramidCountByCustomerAddress',
					'getAlphaLastTimeDataReport',
					'getRotecMetersInfo',
				]),

			localFuncCall(item) {
				this[ item.func ](item)
			},

			async getAlphaReport(item) {
				item.loading = true
				try {
                    const response = await this.getAlphaLastTimeDataReport()
                    saveLastTimeDataToExcelFile(response)
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					item.loading = false
				}
			},

			async getPyramidLoadedByCustomerAddressReport(item) {
				item.loading = true
				try {
					const response = await this.getLoadedPyramidCountByCustomerAddress()
					//console.log(response)
					let editedResponse = response.map((row, i) => {
						let finalRow = []
						finalRow.length = 14
						finalRow[0] = i + 1
						finalRow[1] = row.address
						if (row.data.length) {
							row.data.forEach(dataMonth => {
								const date = new Date(dataMonth.month_loaded)
								const month = date.getMonth() + 1
								finalRow[month + 1] = dataMonth.count
							})
						}
						return finalRow
					})
					//console.log(editedResponse)
					saveLoadedInPyramidByCustomerAddressReportToExcel(editedResponse)

				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					item.loading = false
				}
			},

			async getMeterFromRepairToStorageCountReport(item) {
				item.loading = true
				try {
					const response = await this.getMeterFromRepairToStorageCount()
					//console.log(response)
					let editedResponse = response.map(row => {
						return {
							serialNumber: row.serial_number,
                            type: row.meter_type,
                            typeTitle: row.type_name,
                            date: dateFormat(row.date)
						}
					})

					saveFromUitToStorageReportToExcel(editedResponse)
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					item.loading = false
				}
			},

			async getNotInPyramidReport(item) {
				item.loading = true
				try {
					const response = await this.getDataByNotInPyramid()
					//console.log(response)

					let editedResponse = response.map(row => {
						return [ row.serial_number, row.name, row.address, row.phone, new Date(row.created), row.inStorage ? 'да' : 'нет' ]
					})

					saveNotLoadedInPyramidReportToExcel(editedResponse)
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					item.loading = false
				}
			},

			async reportCountByAddressDialogOpen(item) {
				this.$refs.reportDialogCount.open()
				this.selectedItem = item
			},

			async getNonActiveInPyramidReport(days) {
				this.selectedItem.loading = true
                try {
                    const response = await this.getNonActiveInPyramid(days)
                    //console.log(response)
                    let nonActiveMetersArray = []

                    response.forEach(meter => {
                        let address = meter.customer_address

                        nonActiveMetersArray.push([
                            meter.serial_number,
                            this.ipAddresses.find(address => meter.ip_address === address.value).text,
                            meter.port,
                            meter.phone,
                            address,
							meter.last_date_time ? new Date(meter.last_date_time) : 'данные отсутствуют'
                        ])
                    })

                    saveNonActivePyramidMetersToExcelFile(nonActiveMetersArray)
                } catch (e) {
                    this.showNotificationRequestError(e)
                } finally {
					this.selectedItem.loading = false
                }
            },

			async getPyramidLoadedByAddressReport(created) {
				this.selectedItem.loading = true
				try {
					const response = await this.getCountByAddress(created)
					//console.log(response)
					let editedResponse = response.map((row, i) => {
						let finalRow = []
                        finalRow.length = 14
                        finalRow[0] = i + 1
                        finalRow[1] = row.address === '' ? 'отсутствует' : row.address
                        if (row.months.length) {
                            row.months.forEach((month) => {
								finalRow[month.month + 1] = month.count
                            })
                        }
						return finalRow
					})

                    let monthsSum = []
					for (let i = 0; i < 12; i++) {
						const sum = editedResponse.reduce((acc, cur) => {
							return acc += cur[i + 2] ? parseInt(cur[i + 2]) : 0
						}, 0)
						monthsSum.push(sum)
					}
					//console.log(monthsSum)
					monthsSum.unshift('Итого')
					monthsSum.unshift(editedResponse.length + 1)
					editedResponse = editedResponse.concat([monthsSum])
					saveCountByAddressReportToExcel(editedResponse)

				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					this.selectedItem.loading = false
				}
			},

			async getRotecReport(item) {
				item.loading = true
				try {
					const meters =  await this.getRotecMetersInfo()
                    saveRotecDataToExcelFile(meters, this.getIpAddressTitle)
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					item.loading = false
				}
			},

			async activePyramidDialogOpen(item) {
				this.$refs.ReportActiveDialog.open()
				this.selectedItem = item
			},

			async dataInputReportDialogOpen(item) {
                this.$refs.DataInputReportDialog.open(item)
			},

			async showReportData(reportItem) {
				switch (reportItem.id) {
					case 3: return this.showMeterStorageReport(reportItem)
					case 4: return this.showStoragePeriodReport(reportItem)
					case 5: return this.showLocationByPeriodStorageReport(reportItem)
					case 6: return this.showEmployeeByPeriodStorageReport(reportItem)
					case 7: return this.showLocationLogsByPeriodStorageReport(reportItem)
					case 8: return this.showEmpLogsByPeriodStorageReport(reportItem)
					case 9: return this.showEmpGroupLogsByPeriodStorageReport(reportItem)
					case 10: return this.showCurrentCountByLocationStorageReport(reportItem)
					case 11: return this.showRepairAndMaterialStorageReport(reportItem)
					case 12: return this.showSpentMaterialsByMonthStorageReport(reportItem)
					case 14: return this.showAssignmentEventsBySerialNumberReport(reportItem)
				}
			},

			async showDataResultReportDialog(dialogTitle, reportHeaders, getReportDataFunction) {
				const { DataInputReportDialog, DataResultReportDialog } = this.$refs
				DataInputReportDialog.setLoading(true)
				try {
					const data = await getReportDataFunction()
					if (!data.length) {
						return this.showNotificationInfo('Информация отсутствует')
					}
					DataResultReportDialog.open({
						headers: reportHeaders,
						dialogTitle,
						data
					})
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