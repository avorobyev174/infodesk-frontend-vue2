<script>
	export default {
		name: "ServiceFilterMixin",
		data: () => ({
			defaultAssignments: [],
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
				this.filterByOwnerColor = !val?.length ? this.colorGrey : this.colorBlue
			},

			filterByStatus(val) {
				this.filterByStatusColor = !val?.length ? this.colorGrey : this.colorBlue
			},

			filterByBuilding(val) {
				this.filterByBuildingColor = !val?.length ? this.colorGrey : this.colorBlue
			},

			filterByAddress(val) {
				this.filterByAddressColor = !val?.length ? this.colorGrey : this.colorBlue
			},

			assignments(val) {
				this.defaultAssignments = val
				this.acceptFilters()
				this.createFiltersValues()
			}
		},
		methods: {
	        //Обработка фильтров
	        async acceptFilters() {
		        this.checkAllFilters()

		        if (!Object.keys(this.filters).length) {
			        this.defaultAssignments = this.assignments
		        } else {
			        this.defaultAssignments =
				        this.assignments
					        .filter((assignment) => {
						        if (this.filters.owners) {
							        return this.filters.owners.includes(assignment.owner_id)
						        }
						        return true
					        })
					        .filter((assignment) => {
						        if (this.filters.statuses) {
							        return this.filters.statuses.includes(assignment.status)
						        }
						        return true
					        })
					        .filter((assignment) => {
						        if (this.filters.buildings) {
							        return this.filters.buildings
								        .some((building) => assignment.customer_address?.includes(building))
						        }
						        return true
					        })
                            .filter((assignment) => {
                                if (this.filters.addresses) {
	                                return this.filters.addresses.includes(assignment.meter_address)
                                }
                                return true
				        })
		        }
	        },

	        resetFilters() {
		        this.filterByOwner = []
		        this.filterByStatus = []
		        this.filterByBuilding = []
		        this.filterByAddress = []
	        },

	        checkAllFilters() {
		        this.filterByOwner.length
			        ? this.filters['owners'] = this.filterByOwner.map(({ accId }) => accId)
			        : delete this.filters['owners']

		        this.filterByStatus.length
			        ? this.filters['statuses'] = this.filterByStatus.map((status) => status.value)
			        : delete this.filters['statuses']

		        this.filterByBuilding.length
			        ? this.filters['buildings'] = this.filterByBuilding
			        : delete this.filters['buildings']

		        this.filterByAddress.length
			        ? this.filters['addresses'] = this.filterByAddress
			        : delete this.filters['addresses']
	        },

	        createFiltersValues() {
		        this.createServiceEmployeeArray()
		        this.createBuildingArray()
                this.createServiceAddressesArray()
	        },

	        createServiceEmployeeArray() {
		        const employeesAccIdSet = new Set(
			        this.assignments
				        .filter(({ owner_id }) => owner_id)
				        .map(({ owner_id }) => owner_id)
		        )
		        this.serviceEmployees = Array.from(employeesAccIdSet).map((accId) => ({
			        name: this.getAccountFullName(accId),
			        accId
		        }))
	        },

	        createBuildingArray() {
		        const buildingsSet = new Set(
			        this.assignments
				        .filter(({ customer_address }) => customer_address)
				        .map(({ customer_address }) => {
					        const addressArray = customer_address.split(',')
					        const index = addressArray.indexOf(addressArray.find((str) => str.includes('кв')))
					        if (index !== -1) {
						        addressArray.splice(index, 1)
					        }
					        return addressArray.join(',')
				        })
		        )
		        this.serviceBuildings = Array.from(buildingsSet)
	        },

			createServiceAddressesArray() {
				const addressesSet = new Set(
					this.assignments
						.filter(({ meter_address }) => meter_address)
						.map(({ meter_address }) => meter_address)
				)
				this.serviceAddresses = Array.from(addressesSet)
			},
        },
	}
</script>
