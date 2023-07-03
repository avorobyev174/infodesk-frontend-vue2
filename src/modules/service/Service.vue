<template>
    <v-card>
        <v-data-table
            :loading="loading"
            sort-by="id"
            class="elevation-1 meter-table"
            height="80vh"
            @contextmenu:row="openActionMenu"
            single-select
            item-key="id"
            :search="search"
            :items-per-page="100"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text': 'поручений на странице',
                'items-per-page-options': [ 100, 250, 500, 1000 ]
            }"
            loading-text="Идет загрузка поручений..."
            fixed-header
            :headers="showHeaders"
            :items="defaultAssignments"
        >
            <template v-slot:no-results>
                <span>Идет загрузка поручений...</span>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:top>
                <v-toolbar
                    flat
                    height="70px"
                >
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Поиск"
                        hide-details
                        clearable
                        class="search-input"
                    />
                    <v-spacer/>
                    <main-menu
                        @refreshAssignments="refreshAssignments"
                        @openAssignmentsLogsDialog="$refs.serviceUpdateLogsDialog.dialogOpen()"
                        @showHideColumns="$refs.showHideColumnsDialog.open()"
                        @opendAssignmentAddDialog="$refs.addAssignmentDialog.dialogOpen()"
                    />
                </v-toolbar>
            </template>
            <template v-slot:header.owner_id="{ header }">
                {{ header.text }}
                <v-menu
                    nudge-bottom="10px"
                    nudge-left="150px"
                    offset-y
                    :close-on-content-click="false"
                    origin="center center"
                    transition="scale-transition"
                    ref="filterByOwnerMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterByOwnerColor" small>mdi-filter-plus</v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-location-wrapper p-1 pr-2">
                        <v-combobox
                            :items="serviceEmployees"
                            item-text="name"
                            item-value="accId"
                            label="Сотрудник"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByOwner"
                            clearable
                            multiple
                            @change="doFilter"
                        >
                        </v-combobox>
                    </div>
                </v-menu>
            </template>
            <template v-slot:header.status="{ header }">
                {{ header.text }}
                <v-menu
                    nudge-bottom="10px"
                    nudge-left="150px"
                    offset-y
                    :close-on-content-click="false"
                    origin="center center"
                    transition="scale-transition"
                    ref="filterByStatusMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterByStatusColor" small>mdi-filter-plus</v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-location-wrapper p-1 pr-2">
                        <v-combobox
                            :items="assignmentStatuses"
                            item-text="title"
                            item-value="value"
                            label="Статус"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByStatus"
                            clearable
                            multiple
                            @change="doFilter"
                        >
                        </v-combobox>
                    </div>
                </v-menu>
            </template>
            <template v-slot:header.customer_address="{ header }">
                {{ header.text }}
                <v-menu
                    nudge-bottom="10px"
                    nudge-left="150px"
                    offset-y
                    :close-on-content-click="false"
                    origin="center center"
                    transition="scale-transition"
                    ref="filterByStatusMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterByBuildingColor" small>mdi-filter-plus</v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-location-wrapper p-1 pr-2">
                        <v-combobox
                            :items="serviceBuildings"
                            item-text="title"
                            item-value="value"
                            label="Адрес"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByBuilding"
                            clearable
                            multiple
                            @change="doFilter"
                        >
                        </v-combobox>
                    </div>
                </v-menu>
            </template>
            <template v-slot:item.status="{ item }" >
                <v-chip :color="getAssignmentStatusColor(item.status)">
                    {{ getAssignmentStatusTitle(item.status) }}
                    <v-icon v-if="item.old_last_data_date">mdi-clipboard-pulse-outline</v-icon>
                </v-chip>
            </template>
            <template v-slot:item.meter_ip_address="{ item }" >
                {{ getIpAddressTitle(item.meter_ip_address) }}
            </template>}
            <template v-slot:item.last_data_date="{ item }" >
                {{ formatDate(item.last_data_date) }}
            </template>
            <template v-slot:item.created="{ item }" >
                {{ formatDate(item.created) }}
            </template>
            <template v-slot:item.meter_type="{ item }" >
                {{ getMeterTypeTitle(item.meter_type) }}
            </template>
            <template v-slot:item.meter_sim_status="{ item }">
                {{ getSimStatusTitle(item.meter_sim_status) }}
            </template>
            <template v-slot:item.owner_id="{ item }">
                {{ item.owner_id ? getAccountFullName(item.owner_id) : 'отсутствует' }}
            </template>
        </v-data-table>
        <event-list
            ref="eventList"
            :assignments="defaultAssignments"
        />
        <edit-contacts-dialog
            ref="editContactsDialog"
            :assignment="currentAssignment"
            @updateAssignment="updateAssignment"
        />
        <service-update-logs-dialog
            ref="serviceUpdateLogsDialog"
        />
        <add-assignment-dialog
            ref="addAssignmentDialog"
            @createAssignment="createAssignment"
        ></add-assignment-dialog>
        <show-hide-columns-dialog
            ref="showHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
            moduleName="service"
        />
        <action-menu
            ref="actionMenu"
            @openEventList="$refs.eventList.open(currentAssignment, currentAccountId)"
            @acceptAssignment="assignmentAccept"
            @editAssignmentContacts="$refs.editContactsDialog.dialogOpen()"
        />
    </v-card>
</template>

<script>
    import ActionMenu from "./components/ActionMenu"
    import EventList from "./components/EventList"
    import MainMenu from "./components/MainMenu"
    import ShowHideColumnsDialog from "../utils-components/ShowHideColumnsDialog"
    import ServiceUpdateLogsDialog from "./components/ServiceUpdateLogsDialog"
    import AddAssignmentDialog from "./components/AddAssignmentDialog"
    import ServiceMixin from "@/modules/service/ServiceMixin"
    import EditContactsDialog from "./components/EditContactsDialog"
    import DictionaryMixin from "../mixins/DictionaryMixin"

	export default {
		name: "Service",
        components: {
	        EventList,
			ActionMenu,
            MainMenu,
	        ShowHideColumnsDialog,
	        ServiceUpdateLogsDialog,
	        AddAssignmentDialog,
	        EditContactsDialog
        },
        data: () => ({
	        search: '',
            defaultAssignments: [],
            currentAssignment: null,
	        filterByOwnerColor: '',
	        filterByStatusColor: '',
	        filterByBuildingColor: '',
	        filterByOwner: [],
	        filterByStatus: [],
	        filterByBuilding: [],
	        filters: {},
	        serviceEmployees: [],
	        serviceStatuses: [],
	        serviceBuildings: [],
        }),
		mixins: [ DictionaryMixin, ServiceMixin ],
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
	        assignments(val) {
	        	this.defaultAssignments = val
		        this.doFilter()
		        this.createFiltersValues()
            }
        },
		async mounted() {
	        if (!this.isLogin) {
		        return
	        }
	        await this.refreshAssignments()

	        this.createFiltersValues()
            this.filterByStatus = this.assignmentStatuses?.filter((status) => [ 1, 2, 4 ].includes(status.value))

	        document.onkeydown = (evt) => {
		        if (this.$route.name === 'Service' && evt.key === 'Alt') {
			        this.refreshAssignments()
		        }
	        }
        },
		methods: {
	        openActionMenu(e, { item }) {
		        e.preventDefault()
		        this.currentAssignment = item
		        const { actionMenu } = this.$refs
		        actionMenu.open(item, this.currentAccountId, e.clientX, e.clientY)
	        },

	        async assignmentAccept({ id }) {
                try {
	                this.resetFilters()
	                const updatedAssignment = await this.acceptAssignment(id)
	                this.updateAssignment(updatedAssignment)
	                this.showNotificationSuccess('Поручение успешно принято')
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },

	        async refreshAssignments() {
		        try {
			        this.resetFilters()
			        await this.fetchAssignments()
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        }
            },

	        updateAssignment(updatedAssignment) {
		        this.resetFilters()
                const oldAssignment = this.defaultAssignments.find((assignment) => assignment.id === updatedAssignment.id)
                Object.assign(oldAssignment, updatedAssignment)
	        },

	        createAssignment(createdAssignment) {
	        	this.resetFilters()
		        this.defaultAssignments.push(createdAssignment)
            },

	        //Обработка фильтров
	        async doFilter() {
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
		        }
	        },

	        resetFilters() {
		        this.filterByOwner = []
		        this.filterByStatus = []
                this.filterByBuilding = []
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
	        },

            createFiltersValues() {
	        	this.createServiceEmployeeArray()
	        	this.createBuildingArray()
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
            }
        }
	}
</script>

<style scoped>
    .search-input {
        max-width: 350px;
    }

    .header-filter-wrapper {
        background-color: white;
        display: flex;
        align-items: center;
    }
</style>