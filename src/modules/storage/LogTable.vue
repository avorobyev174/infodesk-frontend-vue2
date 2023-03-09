<template>
    <v-data-table
        sort-by="id"
        height="31vh"
        :loading="loading"
        class="elevation-1 log-table"
        :items-per-page="5"
        loading-text="Идет загрузка логов..."
        fixed-header
        :headers="headers"
        :items="logs"
        :footer-props="{
            showFirstLastPage: true,
            'items-per-page-text': 'логов на странице',
            'items-per-page-options': [5, 10, 20]
        }"
    >
        <template v-slot:no-results>
            <span>Идет загрузка логов...</span>
        </template>

        <!-- Подмена значений таблицы на лэйблы -->
        <template v-slot:item.DATETIME="{ item }">
            {{ formatDate(item.DATETIME) }}
        </template>
        <template v-slot:item.OPER_TYPE="{ item }">
            {{ getOperationTitle(item.OPER_TYPE) }}
        </template>
        <template v-slot:item.ISSUING_PERSON="{ item }">
            {{ getEmployeeTitle(item.ISSUING_PERSON) }}
        </template>
        <template v-slot:item.ACCEPTED_PERSON="{ item }">
            {{ getEmployeeTitle(item.ACCEPTED_PERSON) }}
        </template>
        <!-- Когда нет данных -->
        <template v-slot:no-data>
            <p class="pt-4">Нет данных...</p>
        </template>
    </v-data-table>
</template>

<script>
	import {mapActions, mapGetters, mapState} from "vuex";

	export default {
		name: "LogTable",
		data: () => ({
			headers: [
				{
					text: 'ID',
                    align: 'center',
                    value: 'ID',
                    sortable: true,
                    class: 'header-color',
					width: '80px'
                },
				{
					text: 'Дата операции',
					value: 'DATETIME',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
                    class: 'header-color'
				},
				{
					text: 'Тип операции',
					value: 'OPER_TYPE',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color'
				},
				{
					text: 'Отдающий',
					value: 'ISSUING_PERSON',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color'
				},
				{
					text: 'Принимающий',
					value: 'ACCEPTED_PERSON',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color'
				},
				{
					text: 'Комментарий',
					value: 'COMMENT_FIELD',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color',
					width: '20vw'
				},
				{
					text: 'Доп. информация',
					value: 'UPDATE_FIELD',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color',
					width: '20vw'
				},
			],
		}),
		mounted() {
			this.initializeLogs()
		},
		computed: {
			...mapState({
				loading: state => state.storage.logLoading,
				colorBlue: state => state.colorBlue,
				colorRed: state => state.colorRed,
				colorGreen: state => state.colorGreen,
				colorOrange: state => state.colorOrange,
				colorGrey: state => state.colorGrey,
				colorGold: state => state.colorGold,
			}),
			...mapGetters({
				logs: 'storage/getLogs',
				operations: 'storage/getOperations',
			}),
		},
        props: {
	        meterGuid: {
		        type: String
	        }
        },
		inject: ['showNotification', 'showNotificationStandardError', 'formatDate', 'getEmployeeTitle'],
		methods: {
			...mapActions('storage', [
				'fetchLogs'
			]),

			initializeLogs(row) {
				// if (!row)
				// 	return
                //
				// console.log(row)
                // this.fetchLogs(row.GUID)
            },

			getOperationTitle(operation) {
				return this.operations.find(oper => operation === oper.value).text
			},
		}
	}
</script>

<style>
    .header-color {
        background-color: #e0e0e0 !important;
    }
</style>