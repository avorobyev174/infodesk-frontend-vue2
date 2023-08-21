import { Report } from "../../const"
import { getReportObjectById } from "../../utils"
import { storageReports } from "../report-items/storage-reports"
import {programmingReports} from "../report-items/programming-reports";

export const getReportItemsKeeper = () => [
	{
		name: 'Склад',
		children: [
			getReportObjectById(Report.STORAGE_GROUP_BY_LOCATION, storageReports),
			getReportObjectById(Report.STORAGE_GROUP_BY_OWNER, storageReports),
			getReportObjectById(Report.STORAGE_METER_BY_SERIAL_NUMBER, storageReports),
			getReportObjectById(Report.STORAGE_SYSTEM_LOGS, storageReports),
			getReportObjectById(Report.STORAGE_LOGS_BY_LOCATION, storageReports),
			getReportObjectById(Report.STORAGE_IN_OUT_BY_LOCATION, storageReports),
			getReportObjectById(Report.STORAGE_COUNT_BY_LOCATION, storageReports),
			getReportObjectById(Report.STORAGE_LOGS_BY_OWNER, storageReports),
			getReportObjectById(Report.STORAGE_IN_OUT_BY_OWNER, storageReports),
			getReportObjectById(Report.STORAGE_GROUP_BY_OWNER_AND_TYPE, storageReports),
			getReportObjectById(Report.STORAGE_LAST_LOGS, storageReports),
			getReportObjectById(Report.STORAGE_BY_OWNER_AND_TYPE, storageReports),
		],
	},
	{
		name: 'Программирование',
		children: [ ...programmingReports ],
	},
]
