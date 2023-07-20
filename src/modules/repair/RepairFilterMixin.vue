<script>
    import { createMeterTypesArray } from '../Utils'
    import { mapActions } from 'vuex'

	export default {
		name: "RepairFilterMixin",
		data: () => ({
			filteredAssignments: [],
			filterByMeterTypeColor: '',
			filterBySerialNumberColor: '',
			filterByMeterType: [],
			filterBySerialNumber: '',
			filters: {},
			reapirMeterTypes: [],
		}),
		watch: {
			filterByMeterType(val) {
				this.filterByMeterTypeColor = this.getFilterIconColor(val)
			},
			filterBySerialNumber(val) {
				this.filterBySerialNumberColor = this.getFilterIconColor(val)
			},
		},
		methods: {
			...mapActions('repair', [
				'repairFilter',
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
	                    this.totalMetersCount = await this.repairFilter({
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
		        this.filterByMeterType = []
		        this.filterBySerialNumber = ''
	        },

	        checkAllFilters() {
		        this.filters = {
			        meterTypes: this.filterByMeterType.map(({ value }) => value),
			        serialNumber: this.filterBySerialNumber,
		        }
	        },

	        createFiltersValues(allMeters) {
		        this.reapirMeterTypes = createMeterTypesArray(allMeters, this.getMeterTypeTitle)
	        },

            getFilterIconColor(val) {
	            return !val?.length ? this.colorGrey : this.colorBlue
            }
        },
	}
</script>
