<template>
    <v-card>
        <v-data-table
            :loading="loading"
            sort-by="id"
            class="elevation-1"
            height="80vh"
            @contextmenu:row="actionMenuOpen"
            single-select
            item-key="id"
            :items-per-page="100"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text': 'поручений на странице',
                'items-per-page-options': [ 100, 250, 500, 1000 ]
            }"
            loading-text="Идет загрузка поручений..."
            fixed-header
            :headers="showHeaders"
            :items="assignments"
            :options.sync="options"
            :server-items-length="totalAssignmentsCount"
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
                    <v-spacer/>
                    <service-menu
                        :menuActions="menuActions"
                        @refreshAssignments="getAssignments"
                        @openAssignmentsLogsDialog="$refs.serviceUpdateLogsDialog.dialogOpen()"
                        @showHideColumns="$refs.showHideColumnsDialog.open()"
                        @opendAssignmentAddDialog="$refs.addAssignmentDialog.dialogOpen()"
                    />
                </v-toolbar>
            </template>
            <template v-slot:header.owner_id="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Сотрудник"
                    v-model="filterByOwner"
                    :filter-value="filterByOwner"
                    :filterItems="serviceEmployees"
                    :filter-color="filterByOwnerColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.status="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Статус"
                    v-model="filterByStatus"
                    :filter-value="filterByStatus"
                    :filterItems="assignmentStatuses"
                    :filter-color="filterByStatusColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.meter_type="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Тип счетчика"
                    v-model="filterByMeterType"
                    :filter-value="filterByMeterType"
                    :filterItems="serviceMeterTypes"
                    :filter-color="filterByMeterTypeColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.meter_address="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Принадлежность"
                    v-model="filterByAddress"
                    :filter-value="filterByAddress"
                    :filterItems="serviceAddresses"
                    :filter-color="filterByAddressColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.customer_address="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Принадлежность"
                    v-model="filterByBuilding"
                    :filter-value="filterByBuilding"
                    :filterItems="serviceBuildings"
                    :filter-color="filterByBuildingColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.meter_serial_number="{ header }">
                {{ header.text }}
                <input-filter
                    filterLabel="Серийный номер"
                    v-model="filterBySerialNumber"
                    :filter-value="filterBySerialNumber"
                    :filter-color="filterBySerialNumberColor"
                    @accept="acceptSerialNumberFilter"
                />
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
            :assignments="assignments"
        />
        <edit-contacts-dialog
            ref="editContactsDialog"
            :assignment="selectedAssignment"
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
            :actions="assignmentActions"
            @openEventList="$refs.eventList.open(selectedAssignment, currentAccountId)"
            @acceptAssignment="assignmentAccept(selectedAssignment)"
            @editAssignmentContacts="$refs.editContactsDialog.dialogOpen()"
        />
    </v-card>
</template>

<script>
    import ActionMenu from "../utils-components/menu/ActionMenu"
    import EventList from "./components/EventList"
    import Menu from "../utils-components/menu/Menu"
    import ShowHideColumnsDialog from "../utils-components/ShowHideColumnsDialog"
    import ServiceUpdateLogsDialog from "./components/ServiceUpdateLogsDialog"
    import AddAssignmentDialog from "./components/AddAssignmentDialog"
    import ServiceMixin from "./mixins/ServiceMixin"
    import EditContactsDialog from "./components/EditContactsDialog"
    import DictionaryMixin from "../mixins/DictionaryMixin"
    import ColumnVisibilityMixin from "../mixins/ColumnVisibilityMixin"
    import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
    import DataTableHeaderFilter from "../utils-components/filter/DataTableHeaderFilter"
    import ServiceFilterMixin from "./mixins/ServiceFilterMixin"
    import ComboboxDataTableFilter from "../utils-components/filter/ComboboxDataTableFilter"
    import InputDataTableFilter from "../utils-components/filter/InputDataTableFilter"
    import defaultAssignmentActions from "./js/assignment-actions"
    import {mapGetters} from "vuex";

	export default {
		name: "Service",
        components: {
	        EventList,
			ActionMenu,
	        ServiceMenu: Menu,
	        ShowHideColumnsDialog,
	        ServiceUpdateLogsDialog,
	        AddAssignmentDialog,
	        EditContactsDialog,
	        HeaderFilter: DataTableHeaderFilter,
	        ComboboxFilter: ComboboxDataTableFilter,
	        InputFilter: InputDataTableFilter,

        },
        data: () => ({
            moduleName: 'service',
	        selectedAssignment: null,
	        assignmentActions: [],
	        totalAssignmentsCount: 0,
	        defaultAssignmentActions,
	        options: {},
        }),
		mixins: [ DictionaryMixin, ColumnVisibilityMixin, FavoriteModuleMixin, ServiceMixin, ServiceFilterMixin ],
        computed: {
	        ...mapGetters({
		        assignments: 'service/getAssignments',
	        }),
        },
        watch: {
	        options: {
		        async handler () {
			        !this.isFilters()
				        ? await this.getAssignments()
				        : await this.acceptFilters()
		        },
		        deep: true,
	        },
        },

		methods: {
	        actionMenuOpen(e, { item }) {
		        e.preventDefault()
                this.selectedAssignment = item
		        this.assignmentActions = defaultAssignmentActions.map((action) => {
			        // зарегистрировано - нельзя просматривать список событий и редактировать
			        if (item.status === 1 && !item.owner_id && [ 1, 3 ].includes(action.id)) {
				        return { ...action, disabled: true }
				        // в работе - нельзя редактировать, если не исполнитель
			        } else if (item.status === 2 &&
				        item.owner_id &&
				        [ 3 ].includes(action.id) &&
				        item.owner_id !== this.currentAccountId)	{
				        return { ...action, disabled: true }
				        // в работе - нельзя принять, если уже принято тем жеисполнителем
			        } else if (item.status === 2 &&
				        item.owner_id &&
				        [ 2 ].includes(action.id) &&
				        item.owner_id === this.currentAccountId)	{
				        return { ...action, disabled: true }
				        // закрыто - нельзя редактировать и принять
			        } else if (item.status === 3 && [ 2, 3 ].includes(action.id)) {
				        return { ...action, disabled: true }
			        }
			        return { ...action }
		        })

		        const { actionMenu } = this.$refs
		        actionMenu.open(e.clientX, e.clientY)
	        },

			async getAssignments() {
				try {
					this.resetFilters()
					this.totalAssignmentsCount = await this.fetchAssignments(this.options)
					this.createFiltersValues()
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			updateAssignment(updatedAssignment) {
				this.resetFilters()
				const oldAssignment = this.assignments.find((assignment) => assignment.id === updatedAssignment.id)
				Object.assign(oldAssignment, updatedAssignment)
			},

			createAssignment(createdAssignment) {
				this.resetFilters()
				this.assignments.push(createdAssignment)
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
        }
	}
</script>

<style scoped>

</style>