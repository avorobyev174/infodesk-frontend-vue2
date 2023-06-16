<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="1200"
        @keydown.enter="close"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 text-break text-center py-3">Утилизированные счетчики</span>
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
                 'items-per-page-text':'счетчиков на странице',
                 'items-per-page-options': [10, 20, 40, 100]
                }"
                loading-text="Идет загрузка счетчиков..."
                fixed-header
            >
                <template v-slot:top>
                    <v-toolbar
                            flat
                            height="75px"
                    >
                        <!-- Поиск -->
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
                    <span>Данные не найдены</span>
                </template>
                <template v-slot:item.created="{ item }">
                    {{ formatDate(item.created) }}
                </template>
                <template v-slot:item.acc_id="{ item }">
                    {{ getAccountTitle(item.acc_id) }}
                </template>
                <template v-slot:item.data.type="{ item }">
                    {{ getMeterTypeTitle(item.data.type) }}
                </template>
                <template v-slot:item.reason="{ item }">
                    <v-chip v-if="item.reason === 1" :color="colorOrange">{{ getBrokenMeterReason(item.reason) }}</v-chip>
                    <v-chip v-else :color="colorBlue">{{ getBrokenMeterReason(item.reason) }}</v-chip>
                </template>
            </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                    ОК
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions, mapState } from "vuex"

    export default {
        name: "BrokenMetersDialog",
        data: () => ({
	        search: '',
            dialogModel: false,
            titles: [
	            { text: 'Причина', align: 'center', sortable: true, value: 'reason', index: 0},
	            { text: 'Дата', value: 'created', sortable: true, align: 'center', index: 1 },
	            { text: 'Сотрудник', value: 'acc_id', sortable: true, align: 'center', index: 2 },
	            { text: 'Комментарий', value: 'comment', sortable: false, align: 'center', index: 3 },
	            { text: 'Тип', value: 'data.type', sortable: true, align: 'center', index: 4 },
	            { text: 'Серийный номер', value: 'data.serial_number', sortable: false, align: 'center', index: 5 },
	            { text: 'ICC', value: 'data.icc', align: 'center', sortable: false,  index: 6 },
	            { text: 'Номер телефона', value: 'data.phone', sortable: false, align: 'center', index: 7 },
            ],
            meters: [],
            accounts: []
        }),
        inject: [
        	'showNotification',
            'showNotificationComponentError',
            'showNotificationStandardError',
            'getMeterTypeTitle',
            'formatDate',
        ],
        computed: {
            ...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue'])
        },
        methods: {
            ...mapActions('registration', [ 'fetchBrokenMeters' ]),
            //Обработчик открытия диалога актуализации из ростелекома
            async open() {
                try {
                    let response = await this.fetchBrokenMeters()
                    this.meters = response.meters.map((row) => ({ ...row, data: JSON.parse(row.data) }))
                    this.accounts = response.accounts

                    if (this.meters.length) {
                        this.dialogModel = true
                    } else {
                        this.showNotification('В базе не найдено списанных счетчиков', this.colorOrange)
                    }
                } catch (e) {
                    this.showNotificationComponentError(this.componentTitle, e)
                }
            },

            getBrokenMeterReason(reason) {
                switch (reason) {
                    case 1: return 'Списан'
                    case 2: return 'Обновлен'
                }
            },

            getAccountTitle(accountId) {
                const fullName = this.accounts.find((acc) => acc.id === accountId).full_name
                const fullNameArr = fullName.split(' ')
                return `${ fullNameArr[0] } ${ fullNameArr[1].slice(0, 1) }. ${ fullNameArr[2].slice(0, 1) }.`
            },

            //Обработчик закрытия диалога актуализации
            close() {
                this.dialogModel = false
            },
        }
    }
</script>

<style scoped>

</style>