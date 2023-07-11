<script>
    import {
    	createServiceEmployeeArray,
        createBuildingArray,
        createServiceAddressesArray,
	    createMeterTypesArray,
    } from '../js/assignments-filter-values'
    import { mapActions } from 'vuex'

	export default {
		name: "ServiceFilterMixin",
		data: () => ({
			filteredAssignments: [],
			filterByOwnerColor: '',
			filterByStatusColor: '',
			filterByBuildingColor: '',
			filterByAddressColor: '',
			filterByMeterTypeColor: '',
			filterBySerialNumberColor: '',
			filterByOwner: [],
			filterByStatus: [],
			filterByBuilding: [],
			filterByAddress: [],
			filterByMeterType: [],
			filterBySerialNumber: '',
			filters: {},
			serviceEmployees: [],
			serviceStatuses: [],
			serviceBuildings: [],
			serviceAddresses: [],
			serviceMeterTypes: [],
		}),
		watch: {
			filterByOwner(val) {
				this.filterByOwnerColor = this.getFilterIconColor(val)
			},
			filterByStatus(val) {
				this.filterByStatusColor = this.getFilterIconColor(val)
			},
			filterByBuilding(val) {
				this.filterByBuildingColor = this.getFilterIconColor(val)
			},
			filterByAddress(val) {
				this.filterByAddressColor = this.getFilterIconColor(val)
			},
			filterByMeterType(val) {
				this.filterByMeterTypeColor = this.getFilterIconColor(val)
			},
			filterBySerialNumber(val) {
				this.filterBySerialNumberColor = this.getFilterIconColor(val)
			},
		},
		methods: {
			...mapActions('service', [
				'assignmentsFilter',
			]),

			acceptSerialNumberFilter(serialNumberFilter) {
				this.filterBySerialNumber = serialNumberFilter
                this.acceptFilters()
            },

	        async acceptFilters() {
		        this.checkAllFilters()
		        try {
                    if (!this.isActiveFilters()) {
                        await this.getAssignments()
                    } else {
	                    this.totalAssignmentsCount = await this.assignmentsFilter({
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
		        this.filterByStatus = []
		        this.filterByBuilding = []
		        this.filterByAddress = []
		        this.filterByMeterType = []
		        this.filterBySerialNumber = ''
	        },

	        checkAllFilters() {
		        this.filters = {
			        statuses: this.filterByStatus.map(({ value }) => value),
			        owners: this.filterByOwner.map(({ value }) => value),
			        buildings: this.filterByBuilding,
			        addresses: this.filterByAddress,
			        meterTypes: this.filterByMeterType.map(({ value }) => value),
			        serialNumber: this.filterBySerialNumber,
		        }
	        },

	        createFiltersValues() {
		        this.serviceEmployees = createServiceEmployeeArray(this.assignments, this.getAccountFullName)
		        this.serviceBuildings = createBuildingArray(this.assignments)
		        this.serviceAddresses = createServiceAddressesArray(this.assignments)
		        this.serviceMeterTypes = createMeterTypesArray(this.assignments, this.getMeterTypeTitle)
	        },

            getFilterIconColor(val) {
	            return !val?.length ? this.colorGrey : this.colorBlue
            }
        },
	}
</script>
