export default [
	{
		text: 'ID',
		align: 'center',
		value: 'id',
		sortable: true,
		width: '80px',
	},
	{
		text: 'Дата регистрации',
		value: 'created',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Статус',
		align: 'center',
		value: 'status',
		sortable: true,
		width: '80px',
	},
	{
		text: 'Исполнитель',
		value: 'owner_id',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
		width: '200px'
	},
	{
		text: 'Тип счетчика',
		value: 'meter_type',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
		width: '160px'
	},
	{
		text: 'Серийный номер',
		value: 'meter_serial_number',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
		width: '160px'
	},
	{
		text: 'Дата последнего опроса',
		value: 'last_data_date',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Принадлежность',
		value: 'meter_address',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
		width: '160px'
	},
	{
		text: 'IP адрес',
		value: 'meter_ip_address',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
		width: '160px'
	},
	{
		text: 'Порт',
		value: 'meter_port',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Связной',
		value: 'meter_contact',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Сим карта',
		value: 'meter_phone',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Статус сим карты',
		value: 'meter_sim_status',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Номер лицевого',
		value: 'customer_personal_account',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Адрес',
		value: 'customer_address',
		sortable: true,
		align: 'center',
		cellClass: 'table-small-cell',
	},
	{
		text: 'Контактные данные',
		value: 'customer_contacts',
		sortable: false,
		align: 'center',
		cellClass: 'table-small-cell',
	},
]