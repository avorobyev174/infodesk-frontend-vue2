export default [
	{
		title: 'Обновить',
		onClick: 'refreshAssignments',
		icon: 'mdi-refresh',
		color: 'primary'
	},
	{
		title: 'Добавить',
		onClick: 'opendAssignmentAddDialog',
		icon: 'mdi-plus-box-outline',
		color: 'primary'
	},
	{
		title: 'Журнал обновления системы',
		onClick: 'openAssignmentsLogsDialog',
		icon: 'mdi-clipboard-text-search-outline',
		color: 'primary'
	},
	{
		title: 'Выгрузить активные поручения',
		onClick: 'saveAssignmentsToExcel',
		icon: 'mdi-file-upload',
		color: 'primary'
	},
	{
		title: 'Видимость колонок',
		onClick: 'showHideColumns',
		icon: 'mdi-eye',
		color: 'primary'
	},
]