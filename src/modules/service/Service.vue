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
            :items="assignments"
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
                        class="searchTextInput"
                    />
                    <v-spacer/>
                    <main-menu
                        @refresh="refreshAssignments"
                        @showHideColumns="$refs.showHideColumnsDialog.open()"
                    />
                    <action-menu
                       ref="actionMenu"
                       @openEventList="openEventList"
                       @refreshAssignments="refreshAssignments"
                       @acceptAssignment="assignmentAccept"
                       @editAssignmentContacts="openEditContactsDialog"
                    />
                    <show-hide-columns-dialog
                        ref="showHideColumnsDialog"
                        :headers="headers"
                        :selectedHeaders="selectedHeaders"
                        @changeColumns="changeColumnsVisibility"
                        moduleName="service"
                    />
                </v-toolbar>
            </template>
            <template v-slot:item.status="{ item }" >
                <v-chip v-if="item.status === 1" :color="colorGrey">Зарегистрировано</v-chip>
                <v-chip v-else-if="item.status === 2" :color="colorBlue">В работе</v-chip>
                <v-chip v-else-if="item.status === 3" :color="colorGreen">Закрыто</v-chip>
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
                {{ getStatusTitle(item.meter_sim_status) }}
            </template>
            <template v-slot:item.emp_id="{ item }">
                {{ item.owner_id ? getAccountFullName(item.owner_id) : 'отсутствует' }}
            </template>
        </v-data-table>
        <event-list
            ref="eventList"
            :assignments="assignments"
        />
        <v-dialog
            v-model="editContactsDialogModel"
            max-width="500px"
        >
            <v-card>
                <v-card-title>
                    <span class="mx-auto text-h5 text-center text-break">Редактирование контактных данных</span>
                </v-card-title>
                <v-card-text class="pt-2 pb-1">
                    <v-text-field v-model="contacts" label="Контактные данные"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        color="primary"
                        @click="saveContacts"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
	import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
	import RegistrationMixin from "../registration/mixins/RegistrationMixin"
    import ActionMenu from "./components/ActionMenu"
    import EventList from "./components/EventList"
    import MainMenu from "./components/MainMenu"
    import ShowHideColumnsDialog from "../utils-components/ShowHideColumnsDialog"
	import CommonMixin from "../common/CommonMixin"

	export default {
		name: "Service",
        components: {
	        EventList,
			ActionMenu,
            MainMenu,
	        ShowHideColumnsDialog
        },
        data: () => ({
	        search: '',
	        editContactsDialogModel: false,
            contacts: '',
	        selectedHeaders: [],
	        headers: [
		        {
			        text: 'ID',
			        align: 'center',
			        value: 'id',
			        sortable: true,
			        index: 0,
			        width: '80px',
		        },
		        {
			        text: 'Дата регистрации',
			        value: 'created',
			        sortable: true,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 8
		        },
		        {
			        text: 'Статус',
			        align: 'center',
			        value: 'status',
			        sortable: true,
			        index: 0,
			        width: '80px',
		        },
		        {
			        text: 'Исполнитель',
			        value: 'emp_id',
			        sortable: true,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 8
		        },
		        {
			        text: 'Тип',
			        value: 'meter_type',
			        sortable: true,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 1,
			        width: '160px'
		        },
		        {
			        text: 'Серийный номер',
			        value: 'meter_serial_number',
			        sortable: false,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 2,
			        width: '160px'
		        },
		        {
			        text: 'Дата последнего опроса',
			        value: 'last_data_date',
			        sortable: true,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 8
		        },
		        {
		        	text: 'IP адрес',
                    value: 'meter_ip_address',
                    sortable: true,
                    align: 'center',
                    cellClass: 'table-small-cell',
			        index: 3,
			        width: '160px'
                },
		        {
			        text: 'Сим карта',
			        value: 'meter_phone',
			        sortable: false,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 4
		        },
		        {
		        	text: 'Статус сим карты',
                    value: 'meter_sim_status',
                    sortable: true,
                    align: 'center',
                    cellClass: 'table-small-cell'
                },
		        {
			        text: 'Номер лицевого',
			        value: 'customer_personal_account',
			        sortable: false,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 5,
		        },
		        {
			        text: 'Адрес',
			        value: 'customer_address',
			        sortable: true,
			        align: 'center',
			        cellClass: 'table-small-cell',
			        index: 6,
		        },
		        {
		        	text: 'Контактные данные',
                    value: 'customer_contacts',
                    sortable: false,
                    align: 'center',
                    cellClass: 'table-small-cell',
			        index: 7,
                },
	        ],
            currentItem: null,
        }),
		mixins: [ RegistrationMixin, CommonMixin ],
		inject: [ 'showNotification', 'showNotificationError', 'showNotificationStandardError', 'checkAuth' ],
        provide: function () {
	        return {
		        formatDate: this.formatDate,
		        getAssignmentEventTypeTitle: this.getAssignmentEventTypeTitle,
		        getAssignmentEventTypeValue: this.getAssignmentEventTypeValue,
		        getAccountFullName: this.getAccountFullName,
		        getAssignmentCloseEventTypeTitle: this.getAssignmentCloseEventTypeTitle,
	        }
        },
        created() {
	        this.headers = this.headers.map((header, i) => ({ ... header, index: i }))
	        $cookies.get('meter_service_columns')
		        ? this.changeColumnsVisibility($cookies.get('meter_service_columns')
                    .split(',')
                    .map((column) => parseInt(column)))
		        : this.selectedHeaders = this.headers

            this.setFavoriteModuleColor($cookies.get('common_favorite_module') === '/service' ? this.colorGold : '')
        },
		async mounted() {
			if (!this.checkAuth()) {
				return
			}

			if (!this.activeModules.filter((module) => module.name === this.$route.name.toLowerCase()).length) {
				this.$router.push('/')
			}

			try {
				await this.fetchTypes()
				await this.fetchAssignments()
            } catch (e) {
			    this.showNotificationStandardError(e)
			}

			document.onkeydown = (evt) => {
				if (this.$route.name === 'Service' && evt.key === 'Alt') {
					this.refreshAssignments()
				}
			}
		},
        computed: {
	        ...mapGetters({
		        assignments: 'service/getAssignments',
		        types: 'registration/getTypes',
		        currentAccountId: 'getAccountId',
		        dictionaries: 'getDictionaries',
		        activeModules: 'getActiveModules',
	        }),
	        ...mapState('service', [
	        	'loading'
            ]),
	        ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue', 'colorGold' ]),
	        showHeaders () {
		        return this.headers.filter((header) => this.selectedHeaders.includes(header))
	        }
        },
        methods: {
	        ...mapMutations([ 'setFavoriteModuleColor' ]),
			...mapActions('service', [
				'fetchAssignments',
				'acceptAssignment',
				'saveAssignmentContacts',
            ]),
	        ...mapActions('registration', [
		        'fetchTypes',
	        ]),

	        changeColumnsVisibility(columns) {
		        this.selectedHeaders = this.headers.filter(({ index }) => columns.includes(index))
	        },

	        async assignmentAccept({ id }) {
                try {
	                const updatedAssignment = await this.acceptAssignment(id)
                    const oldAssignment = this.assignments.find((assignment) => assignment.id === updatedAssignment.id)
                    Object.assign(oldAssignment, updatedAssignment)
	                this.showNotification(`Поручение успешно принято`, this.colorGreen)
                } catch (e) {
	                this.showNotificationStandardError(e)
                }
            },

            openActionMenu(e, { item }) {
	            e.preventDefault()
                this.currentItem = item
                const { actionMenu } = this.$refs
	            actionMenu.open(item, this.currentAccountId, e.clientX, e.clientY)
            },

            openEventList() {
	            this.$refs.eventList.open(this.currentItem, this.currentAccountId)
            },

	        refreshAssignments() {
		        try {
			        this.fetchAssignments()
		        } catch (e) {
			        this.showNotificationStandardError(e)
		        }
            },

	        async openEditContactsDialog() {
		        this.editContactsDialogModel = true
                const { customer_contacts } = this.currentItem
		        this.contacts = customer_contacts
	        },

	        async saveContacts() {
		        try {
			        const assignment = await this.saveAssignmentContacts({
				        assignmentId: this.currentItem?.id,
				        contacts: this.contacts
			        })
			        const oldAssignment = this.assignments.find((assign) => assign.id === assignment.id)
			        Object.assign(oldAssignment, assignment)
		        } catch (e) {
			        this.showNotificationStandardError(e)
		        } finally {
			        this.editContactsDialogModel = false
		        }
	        },
        }
	}
</script>

<style scoped>
    .searchTextInput {
        max-width: 350px;
    }
</style>