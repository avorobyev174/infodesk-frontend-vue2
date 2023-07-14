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
            item-text="title"
            item-value="value"
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
	import { mapActions, mapGetters } from "vuex"
	import {
		createServiceEmployeeArray,
        createBuildingArray,
        createServiceAddressesArray,
		getFilteredAssignments,
	} from '../../../service/js/assignments-filter-values'
    import { groupAssignmentsByBuilding } from "./utils"

	export default {
		name: "AssignmentMapFilter",
        data: () => ({
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
			...mapGetters({
				assignments: 'service/getAssignments',
				assignmentStatuses: 'dictionary/getAssignmentStatuses',
				isLogin: 'getIsLogin',
				currentAccountId: 'getAccountId',
			}),
		},
		async mounted() {
			if (!this.isLogin) {
				return
			}
			try {
				await this.fetchAllAssignments(true)
				this.createFiltersValues()
			} catch (e) {
				this.showNotificationRequestError(e)
			}
		},
        methods: {
	        ...mapActions('service', [
		        'fetchAllAssignments',
	        ]),

	        createFiltersValues() {
		        this.serviceEmployees = createServiceEmployeeArray(this.assignments, this.getAccountFullName)
		        this.serviceBuildings = createBuildingArray(this.assignments)
		        this.serviceAddresses = createServiceAddressesArray(this.assignments)
	        },

	        getFilteredMarkers() {
	        	const filters = {
			        statuses: this.filterByStatus.map(({ value }) => value),
			        owners: this.filterByOwner.map(({ value }) => value),
			        buildings: this.filterByBuilding,
			        addresses: this.filterByAddress,
		        }
		        const filteredAssignments = getFilteredAssignments(this.assignments, filters)
		        return groupAssignmentsByBuilding(filteredAssignments, this.currentAccountId)
            }
        }
	}
</script>

<style scoped>

</style>