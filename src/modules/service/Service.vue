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
            :items-per-page="50"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text': 'поручений на странице',
                'items-per-page-options': [ 50, 100, 200, 300 ]
            }"
            loading-text="Идет загрузка поручений..."
            fixed-header
            :headers="showHeaders"
            :items="assignments"
            :options.sync="options"
            :server-items-length="totalAssignmentsCount"
            @click:row="initializeEventList"
        >
            <template v-slot:no-results>
                <span>Нет данных...</span>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:top>
                <v-toolbar flat height="70px">
                    <v-spacer/>
                    <service-menu
                        :menuActions="menuActions"
                        @refreshAssignments="getAssignments"
                        @openAssignmentsLogsDialog="$refs.ServiceUpdateLogsDialog.dialogOpen()"
                        @showHideColumns="$refs.ShowHideColumnsDialog.dialogOpen()"
                        @opendAssignmentAddDialog="$refs.AddAssignmentDialog.dialogOpen()"
                        @saveAssignmentsToExcel="saveAssignmentsToExcel"
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
                    filterLabel="Адрес"
                    v-model="filterByBuilding"
                    :filter-value="filterByBuilding"
                    :filterItems="serviceBuildings"
                    :filter-color="filterByBuildingColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.lastEvents="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Причина закрытия"
                    v-model="filterByCloseReason"
                    :filter-value="filterByCloseReason"
                    :filterItems="assignmentCloseReasonTypes"
                    :filter-color="filterByCloseReasonColor"
                    @input="acceptFilters"
                />
            </template>
            <template v-slot:header.customer_type="{ header }">
                {{ header.text }}
                <combobox-filter
                    filterLabel="Тип потребителя"
                    v-model="filterByCustomerType"
                    :filter-value="filterByCustomerType"
                    :filterItems="customerTypes"
                    :filter-color="filterByCustomerTypeColor"
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
            <template v-slot:item.meter_serial_number="{ item }" >
                <v-chip :color="colorOrange" v-if="item.is_problem === 1">
                    {{ item.meter_serial_number }}
                </v-chip>
                <span v-else>{{ item.meter_serial_number }}</span>
            </template>}
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
            <template v-slot:item.customer_type="{ item }">
                {{ item.customer_type ? item.customer_type : 'отсутствует' }}
            </template>
            <template v-slot:item.work_in_date="{ item }">
                {{ formatDate(item.work_in_date) }}
            </template>
            <template v-slot:item.lastEvents="{ item }">
                <div v-if="item.status !== AssignmentStatus.RE_REGISTERED" class="last-event">
                    <span
                        v-if="item.lastEvents && item.lastEvents.lastEvent && item.lastEvents.lastEvent.close_reason"
                        class="last-event-close-reason"
                    >
                        {{ `${ getAssignmentEventCloseReasonTitle(item.lastEvents.lastEvent.close_reason) }` }}
                    </span>
                    <span
                        v-if="item.lastEvents && item.lastEvents.lastEvent && item.status !== AssignmentStatus.REGISTERED"
                    >
                        {{ item.lastEvents.lastEvent.description}}
                    </span>
                </div>
                <div v-else class="last-event">
                    <span
                        v-if="item.lastEvents && item.lastEvents.secondToLastEvent && item.lastEvents.secondToLastEvent.close_reason"
                        class="last-event-close-reason"
                    >
                        {{ `${ getAssignmentEventCloseReasonTitle(item.lastEvents.secondToLastEvent.close_reason) }` }}
                    </span>
                    <span v-if="item.lastEvents&& item.lastEvents.secondToLastEvent">
                        {{ item.lastEvents.secondToLastEvent.description }}
                    </span>
                </div>
            </template>
        </v-data-table>
        <service-event-list
            ref="ServiceEventList"
            :assignments="assignments"
        />
        <edit-contacts-dialog
            ref="EditContactsDialog"
            :assignment="selectedAssignment"
            @updateAssignment="updateAssignment"
        />
        <service-update-logs-dialog
            ref="ServiceUpdateLogsDialog"
        />
        <add-assignment-dialog
            ref="AddAssignmentDialog"
            @createAssignment="createAssignment"
        ></add-assignment-dialog>
        <show-hide-columns-dialog
            ref="ShowHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
            module="service"
        />
        <action-menu
            ref="ActionMenu"
            :actions="assignmentActions"
            @openEventList="$refs.ServiceEventList.open(selectedAssignment, currentAccountId)"
            @acceptAssignment="assignmentAccept(selectedAssignment)"
            @editAssignmentContacts="$refs.EditContactsDialog.dialogOpen()"
            @declineAssignment="$refs.AssignmentDeclineDialog.dialogOpen()"
            @markProblem="markProblem"
        />
        <dialog-custom
            ref="AssignmentDeclineDialog"
            :max-width="700"
            title="Вы уверены что хотите отклонить поручение?"
            @submit="assignmentDecline(selectedAssignment)"
        ></dialog-custom>
    </v-card>
</template>

<script>
    import ActionMenu from "../utils-components/menu/ActionMenu"
    import ServiceEventList from "./components/ServiceEventList"
    import Menu from "../utils-components/menu/Menu"
    import ShowHideColumnsDialog from "../utils-components/show-hide-columns/ShowHideColumnsDialog"
    import ServiceUpdateLogsDialog from "./components/ServiceUpdateLogsDialog"
    import AddAssignmentDialog from "./components/AddAssignmentDialog"
    import ServiceMixin from "./mixins/ServiceMixin"
    import EditContactsDialog from "./components/EditContactsDialog"
    import DictionaryMixin from "../mixins/DictionaryMixin"
    import ColumnVisibilityMixin from "../mixins/ColumnVisibilityMixin"
    import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
    import ServiceFilterMixin from "./mixins/ServiceFilterMixin"
    import ComboboxDataTableFilter from "../utils-components/filter/ComboboxDataTableFilter"
    import InputDataTableFilter from "../utils-components/filter/InputDataTableFilter"
    import { defaultAssignmentActions, filterAssignmentActions }from "./js/assignment-actions"
    import DialogCustom from "../utils-components/dialog/DialogCustom"
    import { AssignmentStatus } from "../../const"
    import saveAssignmentsByOwnerToExcelFile from "./excel/saveAssignmentsDataToExcel"

	export default {
		name: "Service",
        components: {
	        ServiceEventList,
			ActionMenu,
	        ServiceMenu: Menu,
	        ShowHideColumnsDialog,
	        ServiceUpdateLogsDialog,
	        AddAssignmentDialog,
	        EditContactsDialog,
	        ComboboxFilter: ComboboxDataTableFilter,
	        InputFilter: InputDataTableFilter,
	        DialogCustom
        },
        data: () => ({
            module: 'service',
	        selectedAssignment: null,
	        assignmentActions: [],
	        totalAssignmentsCount: 0,
	        defaultAssignmentActions,
	        options: {},
	        AssignmentStatus,
            customerTypes: [
                { title: 'ФЛ', value: 'ФЛ' },
                { title: 'ЮЛ', value: 'ЮЛ' },
                { title: 'отсутствует', value: null },
            ]
        }),
		mixins: [ DictionaryMixin, ColumnVisibilityMixin, FavoriteModuleMixin, ServiceMixin, ServiceFilterMixin ],
        watch: {
	        options: {
		        async handler () {
			        !this.isActiveFilters()
				        ? await this.getAssignments()
				        : await this.acceptFilters()
		        },
		        deep: true,
	        },
        },
		methods: {
			filterAssignmentActions,
			saveAssignmentsByOwnerToExcelFile,

			async initializeEventList(item, row) {
				row.select(true)
				this.$refs.ServiceEventList.open(item, this.currentAccountId)
			},

	        actionMenuOpen(e, { item }) {
		        e.preventDefault()
                this.selectedAssignment = item
		        this.assignmentActions = this.filterAssignmentActions(item, this.currentAccountId)
                this.$refs.ActionMenu.open(e.clientX, e.clientY)
	        },

			async getAssignments() {
				try {
					this.resetFilters()
					this.totalAssignmentsCount = await this.fetchAssignments(this.options)
					const allAssignments = await this.fetchAllAssignments(false)
					this.createFiltersValues(allAssignments)
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
	                const updatedAssignment = await this.acceptOrDeclineAssignment({ id })
	                this.updateAssignment(updatedAssignment)
	                this.showNotificationSuccess('Поручение успешно принято')
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },

            async assignmentDecline({ id }) {
	            try {
		            const updatedAssignment = await this.acceptOrDeclineAssignment({ id, isDecline: true })
		            this.updateAssignment(updatedAssignment)
		            this.showNotificationInfo('Поручение успешно отклонено')
	            } catch (e) {
		            this.showNotificationRequestError(e)
	            } finally {
		            this.$refs.AssignmentDeclineDialog.dialogClose()
	            }
            },

            async saveAssignmentsToExcel() {
				try {
					const currentUserAssignments = await this.getAssignmentsAndEventsInWorkByUser()
					this.saveAssignmentsByOwnerToExcelFile(
						currentUserAssignments,
						this.currentAccountId,
						this.getAssignmentStatusTitle,
						this.getAssignmentEventCloseReasonTitle,
						this.getAssignmentEventTypeTitle,
						this.getAccountFullName,
					)
                } catch (e) {
					this.showNotificationRequestError(e)
				}
            },

			async markProblem() {
				try {
					const updatedAssignment = await this.markAssignmentProblem({
                        assignmentId: this.selectedAssignment.id,
                        isProblem: this.selectedAssignment.is_problem === 0 ? 1: 0
					})
					this.updateAssignment(updatedAssignment)
					this.showNotificationSuccess('Поручение отредактировано')
				} catch (e) {
					this.showNotificationRequestError(e)
				}
            }
        }
	}
</script>

<style>
    .last-event {
        font-size: 10px !important;
        display: flex;
        flex-direction: column !important;
    }

    .last-event-close-reason {
        text-decoration: underline;
        font-style: italic;
    }
</style>