import { Reports } from "../../const"
import { getReportObjectById } from "../../utils"
import { storageReports } from "../report-items/storage-reports"

export const getReportItemsRepairer = () => [
	{
		name: 'Склад',
		children: [
			getReportObjectById(Reports.REPAIR_AND_MATERIALS, storageReports),
			getReportObjectById(Reports.SPENT_MATERIALS, storageReports),
		],
	},
]
