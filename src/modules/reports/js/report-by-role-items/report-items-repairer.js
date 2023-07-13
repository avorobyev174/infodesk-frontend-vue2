import { Report } from "../../const"
import { getReportObjectById } from "../../utils"
import { storageReports } from "../report-items/storage-reports"

export const getReportItemsRepairer = () => [
	{
		name: 'Склад',
		children: [
			getReportObjectById(Report.REPAIR_AND_MATERIALS, storageReports),
			getReportObjectById(Report.SPENT_MATERIALS, storageReports),
		],
	},
]
