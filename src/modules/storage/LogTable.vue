<template>
    <v-data-table
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
        <template v-slot:item.datetime="{ item }">
            {{ formatDate(item.datetime, true) }}
        </template>
        <template v-slot:item.oper_type="{ item }">
            {{ getOperationTitle(item.oper_type) }}
        </template>
        <template v-slot:item.issuing_person="{ item }">
            {{ getEmployeeTitleByStaffId(item.issuing_person) }}
        </template>
        <template v-slot:item.accepted_person="{ item }">
            {{ getEmployeeTitleByStaffId(item.accepted_person) }}
        </template>
        <template v-slot:item.update_field="{ item }">
            <div v-if="item.oper_type === 1 || item.oper_type === 2 || item.oper_type === 10 ">
                <div
                    v-for="(item, i) in parseUpdateCustomField(item.update_field)"
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
                    v-for="(field, i) in parseUpdateField(item.update_field)"
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
	import { mapActions, mapGetters, mapState } from "vuex"
	import LogTableMixin from "./mixins/LogTableMixin"

	export default {
		name: "LogTable",
		data: () => ({
			headers: [
				{
					text: 'ID',
                    align: 'center',
                    value: 'id',
                    sortable: true,
                    class: 'header-color',
					width: '80px'
                },
				{
					text: 'Дата операции',
					value: 'datetime',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
                    class: 'header-color'
				},
				{
					text: 'Тип операции',
					value: 'oper_type',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color'
				},
				{
					text: 'Отдающий',
					value: 'issuing_person',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color'
				},
				{
					text: 'Принимающий',
					value: 'accepted_person',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color'
				},
				{
					text: 'Комментарий',
					value: 'comment_field',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color',
					width: '15vw'
				},
				{
					text: 'Доп. информация',
					value: 'update_field',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					class: 'header-color',
					width: '30vw'
				},
			]
		}),
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
			}),
		},
	}
</script>

<style>
    .header-color {
        background-color: #e0e0e0 !important;
    }
</style>