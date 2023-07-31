<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="1200"
        @keydown.esc="dialogClose"
        @click:outside="dialogClose"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 text-break text-center py-3">{{ tableTitle }}</span>
            </v-card-title>
            <v-card-text>
            <v-data-table
                :headers="titles"
                :items="meters"
                :items-per-page="10"
                class="elevation-1"
                item-key="serial_number"
                :search="search"
                :footer-props="{
                    showFirstLastPage: true,
                    'items-per-page-text': 'счетчиков на странице',
                    'items-per-page-options': [ 10, 25, 50, 100 ]
                }"
                loading-text="Идет загрузка счетчиков..."
                fixed-header
                :loading="loading"
            >
                <template v-slot:top>
                    <v-toolbar flat height="75px">
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Поиск"
                            hide-details
                            clearable
                            class="search-text-input"
                        />
                        <v-spacer/>
                    </v-toolbar>
                </template>
                <template v-slot:no-results>
                    <span>Нет данных...</span>
                </template>
                <template v-slot:no-data>
                    <p class="pt-4">Нет данных...</p>
                </template>
                <template v-slot:item.created="{ item }">
                    {{ formatDate(item.created) }}
                </template>
                <template v-slot:item.acc_id="{ item }">
                    {{ getAccountFullName(item.acc_id) }}
                </template>
                <template v-slot:item.type="{ item }">
                    {{ getMeterTypeTitle(item.type) }}
                </template>
            </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialogClose">Закрыть</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions } from "vuex"
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "MeterTableInfo",
        data: () => ({
	        search: '',
            titles: [
	            { text: 'Дата', value: 'created', sortable: true, align: 'center' },
	            // { text: 'Тип', value: 'type', sortable: true, align: 'center' },
	            { text: 'Серийный номер', value: 'serial_number', sortable: false, align: 'center' },
	            { text: 'Сотрудник', value: 'acc_id', sortable: true, align: 'center' },
	            { text: 'ICC', value: 'icc', align: 'center', sortable: false },
	            { text: 'Номер сим карты', value: 'phone', sortable: false, align: 'center' },
	            { text: 'Комментарий', value: 'comment', sortable: false, align: 'center' },
            ],
            meters: [],
	        showDeleted: false,
	        loading: false
        }),
        mixins: [ DialogMixin ],
        inject: [
            'showNotificationInfo',
            'showNotificationRequestError',
            'getMeterTypeTitle',
            'formatDate',
            'getAccountFullName',
        ],
        computed: {
        	tableTitle() {
        		return this.showDeleted ? 'Удаленные счетчики' : 'Списанные счетчики'
            }
        },
        methods: {
            ...mapActions('programming', [
            	'fetchBrokenMeters',
                'fetchDeletedMeters'
            ]),

            async open(showDeleted) {
            	this.loading = true
                try {
                	this.showDeleted = showDeleted
                    let meters = []
                	if (showDeleted) {
		                meters = await this.fetchDeletedMeters()
                        this.meters = meters.map(({ state_before, author_acc_id, created }) => ({
	                        ...JSON.parse(state_before),
	                        acc_id: author_acc_id,
	                        created
                        }))
                    } else {
		                meters = await this.fetchBrokenMeters()
		                this.meters = meters.map(({ acc_id, created, data }) => ({
			                ...JSON.parse(data),
			                acc_id,
			                created
		                }))
                    }
                    if (this.meters.length) {
                        this.dialogOpen()
                    } else {
                        this.showNotificationWarning('Данных не найдено')
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                } finally {
	                this.loading = false
                }
            },
        }
    }
</script>

<style scoped>
    .search-text-input {
        max-width: 350px;
    }
</style>