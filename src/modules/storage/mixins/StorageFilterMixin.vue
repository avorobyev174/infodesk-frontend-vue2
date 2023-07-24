<script>
    import { mapActions } from 'vuex'

	export default {
		name: "StorageFilterMixin",
		data: () => ({
			filterByOwnerColor: '',
			filterByLocationColor: '',
			filterByMeterTypeColor: '',
			filterBySerialNumberColor: '',
			filterByOwner: [],
			filterByLocation: [],
			filterByMeterType: [],
			filterBySerialNumber: '',
			filters: {},
		}),
		watch: {
			filterByOwner(val) {
				this.filterByOwnerColor = this.getFilterIconColor(val)
			},
			filterByLocation(val) {
				this.filterByLocationColor = this.getFilterIconColor(val)
			},
			filterByMeterType(val) {
				this.filterByMeterTypeColor = this.getFilterIconColor(val)
			},
			filterBySerialNumber(val) {
				this.filterBySerialNumberColor = this.getFilterIconColor(val)
			},
		},
		methods: {
			...mapActions('storage', [
				'metersFilter',
			]),

			acceptSerialNumberFilter(serialNumberFilter) {
				this.filterBySerialNumber = serialNumberFilter
                this.acceptFilters()
            },

	        async acceptFilters() {
		        this.checkAllFilters()
		        try {
                    if (!this.isActiveFilters()) {
                        await this.getMeters()
                    } else {
	                    if (this.roles?.storage_module === 'repairer') {
		                    this.options.role = this.isShowAllMeters ? 'keeper' : 'repairer'
	                    }
	                    this.totalMetersCount = await this.metersFilter({
                            filters: this.filters,
                            options: this.options
                        })
                    }
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        }
	        },

            isActiveFilters() {
				return Object.values(this.filters).reduce((totalFilterCount, filter) => totalFilterCount += filter?.length, 0)
            },

	        resetFilters() {
		        this.filterByOwner = []
		        this.filterByLocation = []
		        this.filterByMeterType = []
		        this.filterBySerialNumber = ''
	        },

	        checkAllFilters() {
		        this.filters = {
			        locations: this.filterByLocation.map(({ value }) => value),
			        owners: this.filterByOwner.map(({ value }) => value),
			        meterTypes: this.filterByMeterType.map(({ value }) => value),
			        serialNumber: this.filterBySerialNumber,
		        }
	        },

	        createFiltersValues(allAssignments) {
		        // this.serviceEmployees = createServiceEmployeeArray(allAssignments, this.getAccountFullName)
	        },

            getFilterIconColor(val) {
	            return !val?.length ? this.colorGrey : this.colorBlue
            }
        },
	}
</script>
