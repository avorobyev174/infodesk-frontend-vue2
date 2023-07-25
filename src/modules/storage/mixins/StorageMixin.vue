<script>
	import {mapActions, mapGetters, mapState} from "vuex"
    import headers from '../js/storage-table-headers'

	export default {
		name: "StorageMixin",
        data: () => ({
	        headers,
	        selectedHeaders: [],
        }),
		provide: function () {
			return {
				formatDate: this.formatDate,
				formatDateIso: this.formatDateIso,
				formatDateIfNotNull: this.formatDateIfNotNull,
				getEmployeeTitleByStaffId: this.getEmployeeTitleByStaffId,
				getMeterTypeTitle: this.getMeterTypeTitle,
				getMaterialTypeTitle: this.getMaterialTypeTitle,
				getOwnerTitle: this.getOwnerTitle,
				getAccuracyClassTitle: this.getAccuracyClassTitle,
				getConditionTitle: this.getConditionTitle,
				getEmployeeStaffIdByCard: this.getEmployeeStaffIdByCard,
				getEmployeeTitleByCard: this.getEmployeeTitleByCard,
				getLocationTitle: this.getLocationTitle,
				getEmployeeCardByStaffId: this.getEmployeeCardByStaffId,
				getMeters: this.getMeters,
				getLVStateTitle: this.getLVStateTitle,
				getOperationTitle: this.getOperationTitle,
			}
		},
        computed: {
	        ...mapState('storage', [ 'loading' ]),
	        ...mapState([ 'colorGreen' , 'colorOrange', 'colorGrey', 'colorBlue' ]),
			...mapGetters({
				meters: 'storage/getMeters',
				roles: 'getRoles',
				staffId: 'getStaffId',
				isLogin: 'getIsLogin',
				currentAccountId: 'getAccountId',
            })
        },
		mounted() {
			document.onkeydown = (evt) => {
				if (evt.key === 'Alt' && this.$route.name === 'Storage') {
					this.getMeters()
				}
			}

			if (this.roles?.storage_module === 'observer') {
				this.isObserver = true
			}
		},
        methods: {
	        ...mapActions('storage', [
		        'fetchMeters',
		        'getMeterTypesInRepair',
	        ]),
        }
	}
</script>
