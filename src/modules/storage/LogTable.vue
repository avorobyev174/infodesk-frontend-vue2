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
            'items-per-page-text': 'записей на странице',
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
            {{ getEmployeeTitleByStaffId(item.ISSUING_PERSON) }}
        </template>
        <template v-slot:item.ACCEPTED_PERSON="{ item }">
            {{ getEmployeeTitleByStaffId(item.ACCEPTED_PERSON) }}
        </template>
        <template v-slot:item.UPDATE_FIELD="{ item }">
            <div v-if="item.OPER_TYPE === 1 || item.OPER_TYPE === 2 || item.OPER_TYPE === 10 ">
                <div
                    v-for="(item, i) in parseUpdateCustomField(item.UPDATE_FIELD)"
                    :key="i"
                    class="m-2"
                >
                    <v-chip v-if="!item.color" small tag="span" :color="colorGrey">{{ item.value }}</v-chip>
                    <v-chip v-else-if="item.color === 1" small tag="span" :color="colorRed">{{ item.value }}</v-chip>
                    <v-chip v-else-if="item.color === 2" small tag="span" :color="colorGreen">{{ item.value }}</v-chip>
                    <v-chip v-else-if="item.color === 3" small tag="span" :color="colorOrange">{{ item.value }}</v-chip>
                </div>
            </div>
            <div v-else>
                <div
                    v-for="(field, i) in parseUpdateField(item.UPDATE_FIELD)"
                    :key="i"
                    class="m-2"
                >
                    <span>{{ field.name }} </span>
                    <v-chip small tag="span" :color="colorOrange">{{ field.oldValue }}</v-chip>
                    <span> &#10132; </span>
                    <v-chip small tag="span" :color="colorGreen">{{ field.newValue }}</v-chip>
                </div>
            </div>
        </template>
        <!-- Когда нет данных -->
        <template v-slot:no-data>
            <p class="pt-4">Нет данных...</p>
        </template>
    </v-data-table>
</template>

<script>
	import {mapActions, mapGetters, mapState} from "vuex"
	import LogTableMixin from "./components/LogTableMixin"

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
					width: '15vw'
				},
				{
					text: 'Доп. информация',
					value: 'UPDATE_FIELD',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color',
					width: '30vw'
				},
			]
		}),
		mounted() {},
        mixins: [ LogTableMixin ],
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
				roles: 'getRoles',
				staffId: 'getStaffId',
			}),
		},
		inject: ['showNotification', 'showNotificationStandardError'],
		methods: {
			...mapActions('storage', [
				'fetchLogs'
			]),

			formatDate(dateToFormat, withoutTime) {
				if (!dateToFormat)
					return 'отсутствует'

				const date = new Date(dateToFormat)
				let day = String(date.getDate())
				let month = String(date.getMonth() + 1)
				const year = date.getFullYear()
				const hours = date.getHours()
				const minutes = date.getMinutes()
				const seconds = date.getSeconds()

				day = day.length < 2 ? day.padStart(2, '0') : day
				month = month.length < 2 ? month.padStart(2, '0') : month

                if (withoutTime) {
	                return `${ day }.${ month }.${ year }`
                } else {
	                return `${ day }.${ month }.${ year } ${ hours }:${ minutes }:${ seconds }`
                }
			},
		}
	}
</script>

<style>
    .header-color {
        background-color: #e0e0e0 !important;
    }
</style>