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
			filterByCustomerTypeColor: '',
			filterByStatusColor: '',
			filterByBuildingColor: '',
			filterByAddressColor: '',
			filterByMeterTypeColor: '',
			filterBySerialNumberColor: '',
			filterByCloseReasonColor: '',
			filterByOwner: [],
			filterByStatus: [],
			filterByBuilding: [],
			filterByAddress: [],
			filterByMeterType: [],
			filterByCloseReason: [],
			filterBySerialNumber: '',
			filterByCustomerType: [],
			filters: {},
			serviceEmployees: [],
			serviceStatuses: [],
			serviceBuildings: [],
			serviceAddresses: [],
			serviceMeterTypes: [],
			serviceCloseReasons: [],
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
			filterByCloseReason(val) {
				this.filterByCloseReasonColor = this.getFilterIconColor(val)
			},
			filterByCustomerType(val) {
				this.filterByCustomerTypeColor = this.getFilterIconColor(val)
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
		        this.filterByCloseReason = []
		        this.filterByCustomerType = []
		        this.filterBySerialNumber = ''
	        },

	        checkAllFilters() {
		        this.filters = {
			        statuses: this.filterByStatus.map(({ value }) => value),
			        owners: this.filterByOwner.map(({ value }) => value),
			        buildings: this.filterByBuilding,
			        closeReasons: this.filterByCloseReason.map(({ id }) => id),
			        addresses: this.filterByAddress,
			        meterTypes: this.filterByMeterType.map(({ value }) => value),
			        customerTypes: this.filterByCustomerType.map(({ value }) => value),
			        serialNumber: this.filterBySerialNumber,
		        }
	        },

	        createFiltersValues(allAssignments) {
		        this.serviceEmployees = createServiceEmployeeArray(allAssignments, this.getAccountFullName)
		        this.serviceBuildings = createBuildingArray(allAssignments)
		        this.serviceAddresses = createServiceAddressesArray(allAssignments)
		        this.serviceMeterTypes = createMeterTypesArray(allAssignments, this.getMeterTypeTitle)
	        },

            getFilterIconColor(val) {
	            return !val?.length ? this.colorGrey : this.colorBlue
            }
        },
	}
</script>
