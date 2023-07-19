const defaultMeterActions = [
	{ 
		title: 'Изменить',
		onClick: 'edit',
		icon: 'mdi-pencil',
		color: 'primary'
	},
	{ 
		title: 'Удалить',
		onClick: 'delete', 
		icon: 'mdi-delete',
		color: 'primary'
	},
	// {
	// 	title: 'Отправить смс',
	// 	onClick: 'smsSend',
	// 	icon: 'mdi-email-arrow-right',
	// 	color: 'primary'
	// },
	// {
	// 	title: 'Получить статус смс',
	// 	onClick: 'smsCheckStatus',
	// 	icon: 'mdi-email-check',
	// 	color: 'primary'
	// },
	{
		title: 'Получить данные из СТЕКа',
		onClick: 'actualizeDataFromStek',
		icon: 'mdi-database-import',
		color: 'primary'
	},
	{ 
		title: 'Списать',
		onClick: 'markBroken',
		icon: 'mdi-database-remove',
		color: 'primary'
	},
	{ 
		title: 'Установить признак загрузки в пирамиду', 
		onClick: 'addPyramidLoadValue', 
		icon: 'mdi-pyramid',
		color: 'primary'
	},
	{ 
		title: 'Убрать признак загрузки в пирамиду', 
		onClick: 'removePyramidLoadValue', 
		icon: 'mdi-pyramid-off',
		color: 'primary'
	},
]

export {
	defaultMeterActions,
}