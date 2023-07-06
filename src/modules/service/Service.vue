<template>
    <v-card>
        <v-data-table
            :loading="loading"
            sort-by="id"
            class="elevation-1 meter-table"
            height="80vh"
            @contextmenu:row="actionMenuOpen"
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
            :items="filteredAssignments"
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
                <header-filter
                    :filter-select-color="filterByOwnerColor"
                >
                    <template v-slot:filterItem>
                        <v-combobox
                            :items="serviceEmployees"
                            item-text="name"
                            item-value="accId"
                            label="Сотрудник"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByOwner"
                            clearable
                            multiple
                            @change="acceptFilters"
                        >
                        </v-combobox>
                    </template>
                </header-filter>
            </template>
            <template v-slot:header.status="{ header }">
                {{ header.text }}
                <combobox-filter
                    :filterSelectColor="filterByStatusColor"
                    filterLabel="Статус"
                    v-model="filterByStatus"
                    :filter-value="filterByStatus"
                    :filterItems="assignmentStatuses"
                    :filter-color="filterByStatusColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.meter_address="{ header }">
                {{ header.text }}
                <combobox-filter
                    :filterSelectColor="filterByAddressColor"
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
                <header-filter
                    :filter-select-color="filterByBuildingColor"
                >
                    <template v-slot:filterItem>
                        <v-combobox
                            :items="serviceBuildings"
                            item-text="title"
                            item-value="value"
                            label="Адрес"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByBuilding"
                            clearable
                            multiple
                            @change="acceptFilters"
                        >
                        </v-combobox>
                    </template>
                </header-filter>
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
            :assignments="filteredAssignments"
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
    import defaultAssignmentActions from "./js/assignment-actions"

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
	        ComboboxFilter: ComboboxDataTableFilter
        },
        data: () => ({
            moduleName: 'service',
	        search: '',
	        selectedAssignment: null,
	        assignmentActions: [],
	        defaultAssignmentActions,
        }),
		mixins: [ DictionaryMixin, ColumnVisibilityMixin, FavoriteModuleMixin, ServiceMixin, ServiceFilterMixin ],
		async mounted() {
	        if (!this.isLogin) {
		        return
	        }

	        await this.getAssignments()
			this.filterByStatus = this.assignmentStatuses?.filter((status) => [ 1, 2, 4 ].includes(status.value))
            this.acceptFilters()

	        document.onkeydown = (evt) => {
		        if (this.$route.name === 'Service' && evt.key === 'Alt') {
			        this.getAssignments()
		        }
	        }
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
					await this.fetchAssignments()
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			updateAssignment(updatedAssignment) {
				this.resetFilters()
				const oldAssignment = this.filteredAssignments.find((assignment) => assignment.id === updatedAssignment.id)
				Object.assign(oldAssignment, updatedAssignment)
			},

			createAssignment(createdAssignment) {
				this.resetFilters()
				this.filteredAssignments.push(createdAssignment)
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
    .search-input {
        max-width: 350px;
    }

    .header-filter-wrapper {
        background-color: white;
        display: flex;
        align-items: center;
    }
</style>