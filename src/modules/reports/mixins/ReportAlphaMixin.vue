<script>
	import { mapActions } from "vuex"

	export default {
		name: "ReportAlphaMixin",
        methods: {
	        ...mapActions('reports', [ 'getAlphaLastTimeDataReport' ]),
	        async showAlphaReport(item) {
	        	const executeAndSaveFunction = async () => {
			        const reportData = await this.getAlphaLastTimeDataReport()
			        const dataArray = this.prepareAlphaReportData(reportData)
			        dataArray.unshift([ 'Серийный номер', 'Тип', 'Объект', 'Фидер', 'Дата' ])
			        this.saveDataArrayToExcelFile(
				        dataArray,
				        'Данные',
				        [ { width: 20 }, { width: 15 }, { width: 20 }, { width: 30 }, { width: 30 } ],
				        'alpha-center-last-time-data-report'
			        )
                }

		        await this.executeAndSaveReport(
	        		item,
			        executeAndSaveFunction,
			        this.showNotificationRequestError
                )
	        },

             prepareAlphaReportData(data) {
	             return data.map((row) => {
		             delete row.SYB_RNK
		             delete row.UNITID
		             delete row.DEVID
		             row.DAT = this.formatDate(row.DAT)
		             return Object.values(row)
	             })
             }
        }
	}
</script>
