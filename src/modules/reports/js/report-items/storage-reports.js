export const storageReports = [
	 {
		id: 1,
		name: 'Местонахождение приборов учета',
		download: false,
		description: 'Текущее количество счетчиков сгруппированных по местонахождению',
		func: 'showLocationStorageReport',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 2,
		name: 'Владелец приборов учета',
		download: false,
		description: 'Текущее количество счетчиков сгруппированных по сотруднику',
		func: 'showOwnerStorageReport',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 3,
		name: 'Движение выбранного прибора учета',
		download: false,
		description: 'Список всех логов текущего счетчика',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 4,
		name: 'Информация за период',
		download: false,
		description: 'Информация по всему комплексу за выбранный период',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 5,
		name: 'Движение приборов учета за период по местонахождению (общее количество)',
		download: false,
		description: 'Информация по количеству полученных и отданных приборов учета за выбранный период по местонахождению',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 6,
		name: 'Движение приборов учета за период по сотруднику (общее количество)',
		download: false,
		description: 'Информация по количеству полученных и отданных приборов учета за выбранный период по сотруднику',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 7,
		name: 'Движение приборов учета за период по местонахождению',
		download: false,
		description: 'Информация по логам приборов учета за выбранный период по местонахождению',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 8,
		name: 'Движение приборов учета за период по сотруднику',
		download: false,
		description: 'Информация по логам приборов учета за выбранный период по сотруднику',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 9,
		name: 'Движение приборов учета за период по сотруднику (сгруппированный)',
		download: false,
		description: 'Информация по логам приборов учета сгруппированным по типу и дате за выбранный период по сотруднику',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 10,
		name: 'Текущее количество приборов учета по местонахождению',
		download: false,
		description: 'Текущее количество приборов учета находящихся в выбранном месте',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 11,
		name: 'Ремонт и количество материалов за текущий год',
		download: false,
		description: 'Количество отремонтированных приборов учета и расходников',
		func: 'showRepairAndMaterialStorageReport',
		loading: false,
		show: false,
		open: false,
		print: true,
	},
	{
		id: 12,
		name: 'Количество использованных материалов за период',
		download: false,
		description: 'Количество использованных расходников за период',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
	{
		id: 13,
		name: 'Проверка счетчиков выданных на поверку',
		download: false,
		description: 'Проверка счетчиков выданных на поверку по серийному номеру',
		func: 'dataInputReportDialogOpen',
		loading: false,
		show: false,
		open: true,
	},
]