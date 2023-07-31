const defaultMeterActions = [
	{
		id: 8,
		title: 'Открыть список событий',
		onClick: 'openEventList',
		icon: 'mdi-format-list-bulleted',
		color: 'primary'
	},
	{
		id: 1,
		title: 'Изменить',
		onClick: 'edit',
		icon: 'mdi-pencil',
		color: 'primary'
	},
	{
		id: 2,
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
		id: 3,
		title: 'Получить данные из СТЕКа',
		onClick: 'actualizeDataFromStek',
		icon: 'mdi-database-import',
		color: 'primary'
	},
	{
		id: 4,
		title: 'Списать',
		onClick: 'markBroken',
		icon: 'mdi-database-remove',
		color: 'primary'
	},
	{
		id: 5,
		title: 'Установить признак загрузки в пирамиду', 
		onClick: 'addPyramidLoadValue', 
		icon: 'mdi-pyramid',
		color: 'primary'
	},
	{
		id: 6,
		title: 'Убрать признак загрузки в пирамиду', 
		onClick: 'removePyramidLoadValue', 
		icon: 'mdi-pyramid-off',
		color: 'primary'
	},
	{
		id: 7,
		title: 'Удалить данные сим карты',
		onClick: 'removeSimCardData',
		icon: 'mdi-close-box',
		color: 'primary'
	},
]

const filterActions = ({ in_pyramid, phone, personal_account }, currentAccountId) => {
	return defaultMeterActions.map((action) => {
		if ((in_pyramid === 1 || !personal_account) && [ 5 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		if (in_pyramid === 0 && [ 6 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		if (personal_account && [ 7 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		if (currentAccountId !== 1 && [ 2 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		if (personal_account && [ 3 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		if (!personal_account && [ 4 ].includes(action.id)) {
			return { ...action, disabled: true }
		}
		return { ...action }
	})
}


export {
	defaultMeterActions,
	filterActions
}