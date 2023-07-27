export default [
	{ title: 'Обновить', onClick: 'update', icon: 'mdi-refresh', color: 'primary' },
	{ title: 'Добавить', onClick: 'addOrEdit', icon: 'mdi-plus-box', color: 'primary' },
	// { title: 'Отправить смс группой', onClick: 'groupSmsSend', icon: 'mdi-email-arrow-right', color: 'primary' },
	// { title: 'Получить статусы смс', onClick: 'groupSmsStatusCheck', icon: 'mdi-email-check', color: 'primary' },
	{ title: 'Получить данные из Ростелекома', onClick: 'updateFromRTC', icon: 'mdi-database-import', color: 'primary' },
	{ title: 'Получить данные из СТЭКа', onClick: 'actualizeFromStek', icon: 'mdi-database-import', color: 'primary' },
	{ title: 'Показать списанные', onClick: 'showBrokenMeters', icon: 'mdi-database-eye', color: 'primary' },
	{ title: 'Показать удаленные', onClick: 'showDeletedMeters', icon: 'mdi-database-remove', color: 'primary' },
	{ title: 'Загрузить данные в Пирамиду', onClick: 'saveExcelDataToPyramid', icon: 'mdi-file-upload', color: 'rgba(102, 187, 106)' },
	{ title: 'Обновить данные из СТЭКа', onClick: 'saveExcelRefreshDataToPyramid', icon: 'mdi-database-refresh', color: 'rgba(102, 187, 106)' },
	{ title: 'Видимость колонок', onClick: 'showHideColumns', icon: 'mdi-eye', color: 'primary' },
]
