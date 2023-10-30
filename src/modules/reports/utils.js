import { ReportItemsAdmin } from "./js/report-by-role-items/report-items-admin"
import { getReportItemsKeeper } from "./js/report-by-role-items/report-items-keeper"
import { getReportItemsRepairer } from "./js/report-by-role-items/report-items-repairer"
import { getReportItemsDataCollector} from "./js/report-by-role-items/report-items-data-collector"

const getReportObjectById = (id, reports) => {
	return reports.find((report) => report.id === id)
}
const getReportItemsByRole = (role) => {
	switch (role) {
		case 'admin': return ReportItemsAdmin
		case 'keeper': return getReportItemsKeeper()
		case 'repairer': return getReportItemsRepairer()
		case 'data_collector': return getReportItemsDataCollector()
		default: return []
	}
}

const executeAndSaveReport = async (reportContainer, executeAndSaveReportFunction, showRequestErrorFunction) => {
	reportContainer.loading = true
	try {
		await executeAndSaveReportFunction()
	} catch (e) {
		showRequestErrorFunction(e)
	} finally {
		reportContainer.loading = false
	}
}
export {
	getReportObjectById,
	getReportItemsByRole,
	executeAndSaveReport,
}

