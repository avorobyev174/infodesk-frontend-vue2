<template>
    <div>
        <v-combobox
            v-model="filterByStatus"
            :items="assignmentStatuses"
            item-text="title"
            item-value="value"
            label="Фильтр по статусу"
            clearable
            multiple
        />
        <v-combobox
            v-model="filterByOwner"
            :items="serviceEmployees"
            item-text="name"
            item-value="accId"
            label="Фильтр по сотруднику"
            clearable
            multiple
        />
        <v-combobox
            v-model="filterByBuilding"
            :items="serviceBuildings"
            item-text="title"
            item-value="value"
            label="Фильтр по адресу"
            clearable
            multiple
        >
        </v-combobox>
        <v-combobox
            v-model="filterByAddress"
            :items="serviceAddresses"
            item-text="title"
            item-value="value"
            label="Фильтр по принадлежности"
            clearable
            multiple
        />
    </div>
</template>

<script>
	import { mapActions, mapGetters, mapState } from "vuex"
	import {
		createServiceEmployeeArray,
        createBuildingArray,
        createServiceAddressesArray,
		getFilteredAssignments,
		spliceCustomerAddress
	} from '../../../service/js/assignments-filter-values'
    import { AssignmentEventTypes } from '../../../../const'

	export default {
		name: "AssignmentMapFilter",
        data: ()=> ({
	        filterByOwner: [],
	        filterByStatus: [],
	        filterByBuilding: [],
	        filterByAddress: [],
	        serviceEmployees: [],
	        serviceStatuses: [],
	        serviceBuildings: [],
	        serviceAddresses: [],
        }),
        inject: [ 'getAccountFullName' ],
		computed: {
			...mapState([ 'colorGreen', 'colorGrey', 'colorBlue' ]),
			...mapGetters({
				assignments: 'service/getAssignments',
				assignmentStatuses: 'getAssignmentStatuses',
				isLogin: 'getIsLogin',
			}),
		},
		async mounted() {
			if (!this.isLogin) {
				return
			}
			try {
				await this.fetchAssignments()
				this.createFiltersValues()
			} catch (e) {
				this.showNotificationRequestError(e)
			}
		},
        methods: {
	        ...mapActions('service', [
		        'fetchAssignments',
	        ]),

	        createFiltersValues() {
		        this.serviceEmployees = createServiceEmployeeArray(this.assignments, this.getAccountFullName)
		        this.serviceBuildings = createBuildingArray(this.assignments)
		        this.serviceAddresses = createServiceAddressesArray(this.assignments)
	        },

	        getAssignmentMarkerColor(status) {
		        switch (status) {
			        case 1:
			        case 4: return this.colorGrey
			        case 2: return this.colorBlue
			        case 3:
			        case 5: return this.colorGreen
		        }
	        },

	        getFilteredMarkers() {
	        	const filters = {
			        statuses: this.filterByStatus.map((status) => status.value),
			        owners: this.filterByOwner.map(({ accId }) => accId),
			        buildings: this.filterByBuilding,
			        addresses: this.filterByAddress,
		        }
		        const filteredAssignments = getFilteredAssignments(this.assignments, filters)
		        const filteredAndClusteredAssignments = filteredAssignments
                    .map(({ lat, lng, customer_address, owner_id, status }) => ({
                        addressSpliced: customer_address ? spliceCustomerAddress(customer_address, true, true) : 'неизвестно',
                        address: customer_address ? spliceCustomerAddress(customer_address, true, false) : 'неизвестно',
                        position: { lat, lng },
                        owner: owner_id ? this.getAccountFullName(owner_id) : 'отсутствует',
	                    status
                    }))
                    .reduce((assignments, currentAssignment) => {
                    	const foundAddress = assignments.find(({ addressSpliced }) => addressSpliced === currentAssignment.addressSpliced)
                        if (foundAddress) {
	                        foundAddress.count += 1
	                        foundAddress.apartments.push({
		                        address: currentAssignment.address,
		                        owner: currentAssignment.owner,
		                        status: currentAssignment.status,
	                        })
                        } else {
                            currentAssignment.count = 1
                            currentAssignment.apartments = [{
	                            address: currentAssignment.address,
                                owner: currentAssignment.owner,
                                status: currentAssignment.status,
                            }]
                            assignments.push(currentAssignment)
                        }
                        return assignments
                    }, [])
                    .map((assignment) => {
                    	let color = this.colorGrey
	                    if (assignment.apartments.some((apartment) => apartment.status === AssignmentEventTypes.IN_WORK)) {
	                    	color = this.colorBlue
                        }
	                    if (assignment.apartments.every((apartment) => apartment.status === AssignmentEventTypes.CLOSE ||
		                        assignment.apartments.every((apartment) => apartment.status === AssignmentEventTypes.CLOSE_AUTO))) {
		                    color = this.colorGreen
	                    }
                    	return {
                    		...assignment,
                            color
                        }
                    })

                return filteredAndClusteredAssignments
            }
        }
	}
</script>

<style scoped>

</style>