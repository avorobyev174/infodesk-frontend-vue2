export default [
	{
		text: 'ID',
		align: 'center',
		value: 'id'
	},
	{
		text: 'Дата создания',
		align: 'center',
		value: 'created'
	},
	{
		text: 'Тип',
		value: 'type',
		sortable: false,
		align: 'center',
		width: '150px'
	},
	{
		text: 'Серийный номер',
		value: 'serial_number',
		sortable: false,
		align: 'center',
	},
	{
		text: 'Фазность',
		value: 'phase',
		sortable: false,
		align: 'center',
	},
	{
		text: 'Сим карта',
		value: 'phone',
		sortable: false,
		align: 'center',
	},
	{
		text: 'IP адрес',
		value: 'ip_address',
		sortable: true,
		align: 'center',
	},
	{ text: 'Порт', value: 'port', align: 'center', cellClass: 'table-small-cell' },
	{ text: 'ICC', value: 'icc', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'IMEI', value: 'imei', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Статус', value: 'status', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Связной', value: 'contact', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Принадлежность ПУ', value: 'address', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Пирамида', value: 'in_pyramid', align: 'center', sortable: false },
	{ text: 'Номер лицевого', value: 'personal_account', sortable: true, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Потребитель', value: 'customer', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Тип потребителя', value: 'customer_type', sortable: true, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Адрес', value: 'customer_address', sortable: true, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Номер телефона', value: 'customer_phone', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Почта', value: 'customer_email', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Смс', value: 'sms_status', align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Шлюз', value: 'gateway', sortable: false, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Коэффциент трансформации', value: 'kftt', sortable: true, align: 'center', cellClass: 'table-small-cell' },
	{ text: 'Настройка данных', value: 'prog_value', sortable: true, align: 'center', cellClass: 'table-small-cell' },
]