<template>
    <div>
        <v-data-table
            height="31vh"
            :loading="logLoading"
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
            <template v-slot:item.comment_field="{ item }">
                {{ item.comment_field }}
                <v-icon @click="editComment(item)" size="20px">mdi-pencil-box</v-icon>
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
        <dialog-with-data-slot
            ref="DialogWithDataSlot"
            title="Редактирование"
            @submit="saveComment"
        >
            <template v-slot:fields>
                <v-text-field
                    v-model="comment"
                    label="Комментарий"
                    type="text"
                ></v-text-field>
            </template>
        </dialog-with-data-slot>
    </div>
</template>

<script>
	import { mapActions, mapGetters, mapState } from "vuex"
	import LogTableMixin from "./mixins/LogTableMixin"
	import DialogWithDataSlot from "../utils-components/dialog/DialogWithDataSlot"
	import headers from "./js/log-table-headers"

	export default {
		name: "LogTable",
		components: {
			DialogWithDataSlot
        },
		data: () => ({
			headers,
            comment: '',
            item: null,
		}),
		inject: [ 'showNotificationSuccess', 'showNotificationRequestError' ],
        mixins: [ LogTableMixin ],
		computed: {
			...mapState([ 'logLoading', 'colorGreen', 'colorRed', 'colorOrange', 'colorGrey' ]),
			...mapGetters({
				logs: 'storage/getLogs',
			}),
		},
        methods: {
	        ...mapActions('storage', [
		        'editLogComment',
	        ]),

			editComment(item) {
                this.$refs.DialogWithDataSlot.dialogOpen()
                this.item = item
                this.comment = item.comment_field
            },

            async saveComment() {
	        	try {
                    await this.editLogComment({ comment: this.comment, logId: this.item?.id })
			        this.item.comment_field = this.comment
			        this.showNotificationSuccess('Операция редактирования выполнена успешно')
		        } catch (e) {
                    this.showNotificationRequestError(e)
		        } finally {
			        this.$refs.DialogWithDataSlot.dialogClose()
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