const defaultStorageActions = [
	// {
	// 	id: 1,
	// 	title: 'Открыть список событий',
	// 	onClick: 'openEventList',
	// 	icon: 'mdi-list-box',
	// 	color: 'primary'
	// },
	{
		id: 2,
		title: 'Редактировать',
		onClick: 'edit',
		icon: 'mdi-pencil',
		color: 'primary'
	},
	{
		id: 3,
		title: 'Удалить',
		onClick: 'remove',
		icon: 'mdi-delete',
		color: 'primary'
	},
]

const filterActions = (currentAccountId) => {
	 return defaultStorageActions.map((action) => {
	 	if (currentAccountId !== 1 && [ 3 ].includes(action.id)) {
		    return { ...action, disabled: true }
	    }
	 	return { ...action }
	 })
}

export {
	defaultStorageActions,
	filterActions,
}