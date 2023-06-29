<script>
	import { mapActions, mapGetters, mapMutations, mapState } from "vuex"

	export default {
		name: "ServiceMixin",
		data: () => ({
			selectedHeaders: [],
			headers: [
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
					sortable: false,
					width: '80px',
				},
				{
					text: 'Исполнитель',
					value: 'owner_id',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
                    width: '150px'
				},
				{
					text: 'Тип',
					value: 'meter_type',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					width: '160px'
				},
				{
					text: 'Серийный номер',
					value: 'meter_serial_number',
					sortable: false,
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
					sortable: false,
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
			],
		}),
		computed: {
			...mapGetters({
				assignments: 'service/getAssignments',
				currentAccountId: 'getAccountId',
			}),
			...mapState('service', [ 'loading' ]),
			...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue', 'colorGold' ]),

			showHeaders () {
				return this.headers.filter((header) => this.selectedHeaders.includes(header))
			}
		},
		inject: [ 'showNotification', 'showNotificationStandardError', ],
		provide: function () {
			return {
				formatDate: this.formatDate,
				getAssignmentEventTypeTitle: this.getAssignmentEventTypeTitle,
				getAccountFullName: this.getAccountFullName,
				getAssignmentCloseEventTypeTitle: this.getAssignmentCloseEventTypeTitle,
				getAssignmentStatusColor: this.getAssignmentStatusColor,
				getAssignmentEventTypeColor: this.getAssignmentEventTypeColor,
				getMeterTypeTitle: this.getMeterTypeTitle,
				getAssignmentStatusTitle: this.getAssignmentStatusTitle,
			}
		},
		created() {
			this.headers = this.headers.map((header, i) => ({ ... header, index: i }))
			$cookies.get('meter_service_columns')
				? this.changeColumnsVisibility($cookies.get('meter_service_columns')
					.split(',')
					.map((column) => parseInt(column)))
				: this.selectedHeaders = this.headers

			this.setFavoriteModuleColor($cookies.get('common_favorite_module') === '/service' ? this.colorGold : '')
		},
		async mounted() {
			this.refreshAssignments()

	        document.onkeydown = (evt) => {
		        if (this.$route.name === 'Service' && evt.key === 'Alt') {
			        this.refreshAssignments()
		        }
	        }
        },
		methods: {
			...mapMutations(['setFavoriteModuleColor']),
			...mapActions('service', [
				'fetchAssignments',
				'acceptAssignment',
			]),

			changeColumnsVisibility(columns) {
				this.selectedHeaders = this.headers.filter(({ index }) => columns.includes(index))
			},

			getAssignmentStatusColor(status) {
				switch (status) {
					case 1:
					case 4: return this.colorGrey
					case 2: return this.colorBlue
					case 3:
					case 5: return this.colorGreen
				}
			},

			getAssignmentEventTypeColor(status) {
				switch (status) {
					case 1:
					case 5: return this.colorGrey
					case 2: return this.colorBlue
					case 3:
					case 7: return this.colorGreen
					case 4:
					case 6: return this.colorGold
				}
			},
		}
    }
</script>
