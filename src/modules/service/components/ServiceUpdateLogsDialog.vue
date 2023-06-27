<template>
    <v-dialog
        v-model="dialogModel"
        max-width="1200"
        @keydown.enter="dialogClose"
        @keydown.esc="dialogClose"
        @click:outside="dialogClose"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 text-break text-center mb-2">Журнал обновления системы</span>
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :loading="loading"
                    sort-by="id"
                    class="elevation-1 meter-table"
                    height="50vh"
                    single-select
                    item-key="id"
                    :search="search"
                    :items-per-page="50"
                    :footer-props="{
                        showFirstLastPage: true,
                        'items-per-page-text': 'поручений на странице',
                        'items-per-page-options': [ 10, 25, 50, 100 ]
                    }"
                    loading-text="Идет загрузка поручений..."
                    fixed-header
                    :headers="headers"
                    :items="currentLogs"
                >
                    <template v-slot:no-results>
                        <span>Идет загрузка журнала...</span>
                    </template>

                    <template v-slot:no-data>
                        <p class="pt-4">Нет данных...</p>
                    </template>
                    <template v-slot:top>
                       <div style="display:flex; justify-content: space-between; gap: 10px; padding: 10px">
                            <v-select
                                v-model="currentLogsDate"
                                :items="logsDates"
                                item-text="text"
                                item-value="value"
                                label="Выберите дату"
                                required
                                @change="changeLogsByDate"
                                style="width: 150px"
                            />
                            <v-text-field
                                v-model="search"
                                append-icon="mdi-magnify"
                                label="Поиск по серийному номеру"
                                hide-details
                                clearable
                                class="searchTextInput"
                            />
                       </div>
                    </template>
                    <template v-slot:item.created="{ item }">
                        {{ currentLogsDate }}
                    </template>
                    <template v-slot:item.status="{ item }">
                        <v-chip :color="getAssignmentEventTypeColor(item.status)">
                            {{ getAssignmentEventTypeTitle(item.status) }}
                            <v-icon v-if="item.old_last_data_date">mdi-clipboard-alert-outline</v-icon>
                        </v-chip>
                    </template>
                    <template v-slot:item.owner_id="{ item }">
                        {{ item.owner_id ? getAccountFullName(item.owner_id) : 'отсутствует' }}
                    </template>
                    <template v-slot:item.last_data_date="{ item }" >
                        {{ formatDate(item.last_data_date) }}
                    </template>
                    <template v-slot:item.meter_type="{ item }" >
                        {{ getMeterTypeTitle(item.meter_type) }}
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
	import DialogMixin from "../../../utils-mixins/DialogMixin"
	import { mapActions, mapGetters, mapState } from "vuex"

	export default {
		name: "ServiceUpdateLogsDialog",
		components: {

		},
        mixins: [ DialogMixin ],
		inject: [
			'showNotification',
			'showNotificationError',
			'showNotificationStandardError',
			'formatDate',
			'getAssignmentEventTypeTitle',
			'getAccountFullName',
			'getAssignmentCloseEventTypeTitle',
            'getMeterTypeTitle',
            'getAssignmentEventTypeColor'
		],
        mounted() {
            this.logsDates = this.assignmentLogs.map((log) => this.formatDate(log.created))
	        console.log()
            this.currentLogsDate = this.logsDates[0]

	        this.changeLogsByDate()
        },
		data: () => ({
			headers: [
				{ text: 'Дата', align: 'center', value: 'created' },
				{ text: 'Исполнитель', align: 'center', value: 'owner_id', sortable: true },
				{ text: 'Статус', align: 'center', value: 'status', sortable: true },
				{ text: 'Тип', align: 'center', value: 'meter_type', sortable: true },
				{ text: 'Серийный номер', align: 'center', value: 'meter_serial_number', sortable: false },
				{ text: 'Дата последнего опроса', align: 'center', value: 'last_data_date', sortable: true },
            ],
			search: '',
			loading: false,
            currentLogsDate: null,
            currentLogs: [],
            logsDates: [],
		}),
        computed: {
	        ...mapGetters({ assignmentLogs: 'service/getAssignmentsLogs', }),
	        ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue', 'colorGold' ]),
        },
		methods: {
            changeLogsByDate() {
	            const [ logsByDate ] = this.assignmentLogs .filter(({ created }) => this.formatDate(created) === this.currentLogsDate)
	            if (logsByDate?.data) {
		            this.currentLogs = logsByDate.data.flat().map(({ assignment, status}) => ({
			            ...assignment,
			            action_status: status
		            }))
	            }
            },
        }
	}
</script>

<style scoped>
    .v-toolbar__content {
        flex-direction: column !important;
    }
</style>