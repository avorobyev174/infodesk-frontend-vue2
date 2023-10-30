import { Report } from "../../const"
import { getReportObjectById } from "../../utils"
import { storageReports } from "../report-items/storage-reports"

export const getReportItemsDataCollector = () => [
	{
		name: 'Склад',
		children: [
			getReportObjectById(Report.STORAGE_BY_INSTALL_DATA, storageReports),
		],
	},
]
