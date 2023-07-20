<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="1200"
        @keydown.esc="dialogClose"
        @click:outside="dialogClose"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 text-break text-center py-3">Списанные счетчики</span>
            </v-card-title>
            <v-card-text>
            <v-data-table
                :headers="titles"
                :items="meters"
                :items-per-page="10"
                class="elevation-1"
                :search="search"
                :footer-props="{
                    showFirstLastPage: true,
                    'items-per-page-text': 'счетчиков на странице',
                    'items-per-page-options': [ 10, 25, 50, 100 ]
                }"
                loading-text="Идет загрузка счетчиков..."
                fixed-header
            >
                <template v-slot:top>
                    <v-toolbar flat height="75px">
                        <v-text-field
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Поиск по серийному номеру"
                            hide-details
                            clearable
                            class="searchTextInput"
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
                <template v-slot:item.data.type="{ item }">
                    {{ getMeterTypeTitle(item.data.type) }}
                </template>
            </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialogClose">Закрыть</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions } from "vuex"
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "BrokenMetersDialog",
        data: () => ({
	        search: '',
            titles: [
	            { text: 'Дата', value: 'created', sortable: true, align: 'center' },
	            { text: 'Сотрудник', value: 'acc_id', sortable: true, align: 'center' },
	            { text: 'Комментарий', value: 'comment', sortable: false, align: 'center' },
	            { text: 'Тип', value: 'data.type', sortable: true, align: 'center' },
	            { text: 'Серийный номер', value: 'data.serial_number', sortable: false, align: 'center' },
	            { text: 'ICC', value: 'data.icc', align: 'center', sortable: false },
	            { text: 'Номер телефона', value: 'data.phone', sortable: false, align: 'center' },
            ],
            meters: [],
        }),
        mixins: [ DialogMixin ],
        inject: [
            'showNotificationInfo',
            'showNotificationRequestError',
            'getMeterTypeTitle',
            'formatDate',
            'getAccountFullName',
        ],
        methods: {
            ...mapActions('programming', [ 'fetchBrokenMeters' ]),

            async open() {
                try {
                    const brokenMeters = await this.fetchBrokenMeters()
	                this.meters = brokenMeters.map((meter) => ({ ...meter, data: JSON.parse(meter.data) }))
                    if (this.meters.length) {
                        this.dialogOpen()
                    } else {
                        this.showNotificationWarning('Не найдено списанных счетчиков')
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },
        }
    }
</script>

<style scoped>

</style>