import { serviceReports } from "../report-items/service-reports"
import { storageReports } from "../report-items/storage-reports"
import { alphaReports } from "../report-items/alpha-reports"
import { pyramidReports } from "../report-items/pyramid-reports"
import { programmingReports } from "../report-items/programming-reports"

export const ReportItemsAdmin = [
	{
		name: 'Поручения',
		children: [ ...serviceReports ],
	},
	{
		name: 'Альфа Центр',
		children: [ ...alphaReports ],
	},
	{
		name: 'Пирамида',
		children: [ ...pyramidReports ],
	},
	{
		name: 'Программирование',
		children: [...programmingReports ],
	},
	{
		name: 'Склад',
		children: [ ...storageReports ],
	},
]
