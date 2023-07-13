export default [
	{
		text: 'ID',
		align: 'center',
		value: 'id',
		sortable: true,
		class: 'header-color',
		width: '80px'
	},
	{
		text: 'Дата операции',
		value: 'datetime',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		class: 'header-color'
	},
	{
		text: 'Тип операции',
		value: 'oper_type',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		class: 'header-color'
	},
	{
		text: 'Отдающий',
		value: 'issuing_person',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		class: 'header-color'
	},
	{
		text: 'Принимающий',
		value: 'accepted_person',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		class: 'header-color'
	},
	{
		text: 'Комментарий',
		value: 'comment_field',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		class: 'header-color',
		width: '15vw'
	},
	{
		text: 'Доп. информация',
		value: 'update_field',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		class: 'header-color',
		width: '30vw'
	},
]