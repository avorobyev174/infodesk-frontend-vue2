<script>
    import {
    	createServiceEmployeeArray,
        createBuildingArray,
	    createProgrammingAddressesArray,
	    createMeterTypesArray,
    } from '../js/meters-filter-values'
    import { mapActions } from 'vuex'

	export default {
		name: "ProgrammingFilterMixin",
		data: () => ({
			filterByICCColor: '',
			filterByPortColor: '',
			filterByIpAddressColor: '',
			filterByAddressColor: '',
			filterByMeterTypeColor: '',
			filterBySerialNumberColor: '',
			filterBySimColor: '',
			filterByPersonalAccountColor: '',
			filterByIpAddress: [],
			filterByPort: '',
			filterByPersonalAccount: '',
			filterByAddress: [],
			filterByMeterType: [],
			filterBySerialNumber: '',
			filterBySim: '',
			filterByICC: '',
			filters: {},
			programmingAddresses: [],
		}),
		watch: {
			filterByIpAddress(val) {
				this.filterByIpAddressColor = this.getFilterIconColor(val)
			},
			filterByICCColor(val) {
				this.filterByICCColor = this.getFilterIconColor(val)
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
			filterBySim(val) {
				this.filterBySimColor = this.getFilterIconColor(val)
			},
			filterByPort(val) {
				this.filterByPortColor = this.getFilterIconColor(val)
			},
			filterByPersonalAccount(val) {
				this.filterByPersonalAccountColor = this.getFilterIconColor(val)
			},
		},
		methods: {
			...mapActions('programming', [
				'metersFilter',
			]),

			acceptSerialNumberFilter(serialNumberFilter) {
				this.filterBySerialNumber = serialNumberFilter
                this.acceptFilters()
            },

			acceptSimFilter(simFilter) {
				this.filterBySim = simFilter
				this.acceptFilters()
			},

			acceptICCFilter(iccFilter) {
				this.filterByICC = iccFilter
				this.acceptFilters()
			},

			acceptPortFilter(portFilter) {
				this.filterByPort = portFilter
				this.acceptFilters()
			},

			acceptPersonalAccountFilter(personalAccountFilter) {
				this.filterByPersonalAccount = personalAccountFilter
				this.acceptFilters()
			},

	        async acceptFilters() {
		        this.checkAllFilters()
		        try {
                    if (!this.isActiveFilters()) {
                        await this.getMeters()
                    } else {
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
		        this.filterByPersonalAccount = ''
		        this.filterByIpAddress = []
		        this.filterByICC = ''
		        this.filterByPort = ''
		        this.filterByAddress = []
		        this.filterByMeterType = []
		        this.filterBySerialNumber = ''
		        this.filterBySim = ''
	        },

	        checkAllFilters() {
		        this.filters = {
			        ipAddresses: this.filterByIpAddress.map(({ value }) => value),
			        icc: this.filterByICC,
			        port: this.filterByPort,
			        addresses: this.filterByAddress,
			        meterTypes: this.filterByMeterType.map(({ value }) => value),
			        serialNumber: this.filterBySerialNumber,
			        sim: this.filterBySim,
			        personalAccount: this.filterByPersonalAccount,
		        }
	        },

	        createFiltersValues(allAMeters) {
		        // this.serviceEmployees = createServiceEmployeeArray(allAssignments, this.getAccountFullName)
		        // this.serviceBuildings = createBuildingArray(allAssignments)
		        this.programmingAddresses = createProgrammingAddressesArray(allAMeters)
	        },

            getFilterIconColor(val) {
	            return !val?.length ? this.colorGrey : this.colorBlue
            }
        },
	}
</script>
