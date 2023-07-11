import { Reports } from "../../const"
import { getReportObjectById } from "../../utils"
import { storageReports } from "../report-items/storage-reports"

export const getReportItemsKeeper = () => [
	{
		name: 'Склад',
		children: [
			getReportObjectById(Reports.STORAGE_GROUP_BY_LOCATION, storageReports),
			getReportObjectById(Reports.STORAGE_GROUP_BY_OWNER, storageReports),
			getReportObjectById(Reports.STORAGE_METER_BY_SERIAL_NUMBER, storageReports),
			getReportObjectById(Reports.STORAGE_SYSTEM_LOGS, storageReports),
			getReportObjectById(Reports.STORAGE_LOGS_BY_LOCATION, storageReports),
			getReportObjectById(Reports.STORAGE_IN_OUT_BY_LOCATION, storageReports),
			getReportObjectById(Reports.STORAGE_COUNT_BY_LOCATION, storageReports),
			getReportObjectById(Reports.STORAGE_LOGS_BY_OWNER, storageReports),
			getReportObjectById(Reports.STORAGE_IN_OUT_BY_OWNER, storageReports),
			getReportObjectById(Reports.STORAGE_GROUP_BY_OWNER_AND_TYPE, storageReports),
			getReportObjectById(Reports.CHECK_VERIFICATION, storageReports),
		],
	},
]
