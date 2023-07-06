<script>
    import {
    	createServiceEmployeeArray,
        createBuildingArray,
        createServiceAddressesArray,
	    getFilteredAssignments,
    } from '../js/assignments-filter-values'

	export default {
		name: "ServiceFilterMixin",
		data: () => ({
			filteredAssignments: [],
			filterByOwnerColor: '',
			filterByStatusColor: '',
			filterByBuildingColor: '',
			filterByAddressColor: '',
			filterByOwner: [],
			filterByStatus: [],
			filterByBuilding: [],
			filterByAddress: [],
			filters: {},
			serviceEmployees: [],
			serviceStatuses: [],
			serviceBuildings: [],
			serviceAddresses: [],
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

			assignments(val) {
				this.filteredAssignments = val
				this.acceptFilters()
				this.createFiltersValues()
			}
		},
		methods: {
	        acceptFilters() {
		        this.checkAllFilters()

		        if (!Object.keys(this.filters).length) {
			        this.filteredAssignments = this.assignments
		        } else {
			        this.filteredAssignments = getFilteredAssignments(this.assignments, this.filters)
		        }
	        },

	        resetFilters() {
		        this.filterByOwner = []
		        this.filterByStatus = []
		        this.filterByBuilding = []
		        this.filterByAddress = []
	        },

	        checkAllFilters() {
		        this.filters = {
			        statuses: this.filterByStatus.map((status) => status.value),
			        owners: this.filterByOwner.map(({ accId }) => accId),
			        buildings: this.filterByBuilding,
			        addresses: this.filterByAddress,
		        }
	        },

	        createFiltersValues() {
		        this.serviceEmployees = createServiceEmployeeArray(this.assignments, this.getAccountFullName)
		        this.serviceBuildings = createBuildingArray(this.assignments)
		        this.serviceAddresses = createServiceAddressesArray(this.assignments)
	        },

            getFilterIconColor(val) {
	            return !val?.length ? this.colorGrey : this.colorBlue
            }
        },
	}
</script>
