export default [
	{
		id: 1,
		title: 'Регистрация',
		onClick: 'register',
		icon: 'mdi-plus-box',
		color: 'primary',
		isNotVisible: false
	},
	{
		id: 2,
		title: 'Прием/Выдача',
		onClick: 'acceptOrIssue',
		icon: 'mdi-swap-horizontal-bold',
		color: 'primary',
		isNotVisible: false
	},
	{
		id: 3,
		title: 'Регистрация маршрутизатора',
		onClick: 'routerRegister',
		icon: 'mdi-plus-box',
		color: 'primary',
		isNotVisible: false
	},
	{
		id: 4,
		title: 'Прием/Выдача маршрутизатора',
		onClick: 'routerAcceptOrIssue',
		icon: 'mdi-swap-horizontal-bold',
		color: 'primary',
		isNotVisible: false
	},
	{
		id: 5,
		title: 'Ремонт/Прием материалов',
		onClick: 'repairOrMaterialsAdd',
		icon: 'mdi-cog',
		color: 'primary',
		isNotVisible: false
	},
	{
		id: 6,
		title: 'Видимость колонок',
		onClick: 'showHideColumns',
		icon: 'mdi-eye',
		color: 'primary',
		isNotVisible: false
	},
	{
		id: 7,
		title: 'Показать все счетчики',
		localOnClick: 'showHideAllMeters',
		icon: 'mdi-eye-check',
		color: 'primary',
		isNotVisible: false,
		type: 'show'
	},
]