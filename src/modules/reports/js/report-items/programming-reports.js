export const programmingReports = [
	{
		name: 'Текущее количество счетчиков на складе после программирования',
		download: true,
		description: 'Текущее количество счетчиков на складе принятых после программирования УИТ',
		executeFunction: 'showMeterFromRepairToStorageCountReport',
		loading: false,
		show: false,
	},
	{
		name: 'Информация по счетчикам Ротек',
		download: true,
		description: 'Список счетчиков Ротек из модуля Склад и дополнительная информация в формате csv',
		executeFunction: 'showRotecReport',
		loading: false,
		show: false,
	},
]

