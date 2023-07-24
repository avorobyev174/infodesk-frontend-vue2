<template>
    <v-navigation-drawer
        v-model="eventListDrawerModel"
        absolute
        temporary
        right
        width="450"
        class="event-list"
    >
        <v-list-item class="pt-3" style="display:flex; gap: 12px">
            <v-icon large color="black"> mdi-meter-electric-outline</v-icon>
            <v-list-item-content class="p-0">
                <v-list-item-title class="pb-1 font-weight-medium">Тип: {{ getMeterTypeTitle(meterType) }}</v-list-item-title>
                <v-list-item-subtitle class="font-weight-medium">Серийный номер: {{ serialNumber }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-timeline align-top dense>
            <v-timeline-item
                v-for="(log, i) in logs"
                :key="i"
                :color="colorGrey"
            >
                <template v-slot:icon>
                    <v-avatar>
                        <v-img :src="getAvatarIcon(log.accepted_person)" v-if="isAvatarExist(log.accepted_person)"/>
                        <v-icon v-else>mdi-account</v-icon>
                    </v-avatar>
                </template>
                <span v-if="log.oper_type !== Operation.EDIT" class="mb-1 event-type" style="text-decoration: underline">{{ getLocationTitle(log.new_location) }}</span>
                <span v-else class="mb-1 event-type" style="text-decoration: underline">{{ getOperationTitle(log.oper_type) }}</span>
                <p class="mb-2 event-date">
                    {{ formatDate(log.datetime, true) }}
                </p>
                <p class="mb-0 event-owner" >
                    <span v-if="![ Operation.EDIT, Operation.REGISTRATION, Operation.REGISTRATION_WITHOUT_SERIAL_NUMBER ].includes(log.oper_type)">{{ getEmployeeTitleByStaffId(log.issuing_person) }} </span>
                    <span v-if="![ Operation.EDIT, Operation.REGISTRATION, Operation.REGISTRATION_WITHOUT_SERIAL_NUMBER ].includes(log.oper_type)">&#10132;</span>
                     {{ getEmployeeTitleByStaffId(log.accepted_person) }}
                </p>
                <div class="d-flex">
                    <p class="event-text d-inline-block">{{ log.comment_field }}</p>
                    <v-btn
                        x-small
                        icon
                        :color="colorGrey"
                        class="transparent"
                        @click="editComment(log)"
                    >
                        <v-icon>mdi-pencil-box-outline</v-icon>
                    </v-btn>
                </div>
                <div v-if="log.oper_type === Operation.REPAIR || log.oper_type === Operation.CHECK || log.oper_type === Operation.OBJECT ">
                    <div v-for="(item, i) in parseUpdateCustomField(log.update_field)" :key="i" class="m-1">
                        <v-chip v-if="!item.color" small tag="span" :color="colorGrey">{{ item.value }}</v-chip>
                        <v-chip v-else-if="item.color === 1" small tag="span" :color="colorRed">{{ item.value }}</v-chip>
                        <v-chip v-else-if="item.color === 2" small tag="span" :color="colorGreen">{{ item.value }}</v-chip>
                        <v-chip v-else-if="item.color === 3" small tag="span" :color="colorOrange">{{ item.value }}</v-chip>
                    </div>
                </div>
                <div v-else>
                    <div v-for="(field, i) in parseUpdateField(log.update_field)" :key="i">
                        <span style="font-size: 12px">{{ field.name }} </span>
                        <v-chip small tag="span" :color="colorOrange">{{ field.oldValue }}</v-chip>
                        <span> &#10132; </span>
                        <v-chip small tag="span" :color="colorGreen">{{ field.newValue }}</v-chip>
                    </div>
                </div>
            </v-timeline-item>
        </v-timeline>
        <dialog-with-data-slot
            ref="EditCommentDialog"
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
    </v-navigation-drawer>
</template>

<script>
	import { mapActions, mapState, mapGetters } from 'vuex'
    import { Location, Operation } from "../const"
	import { parseUpdateCustomField, parseUpdateField } from "../js/log-list-parse"
    import DialogWithDataSlot from "../../utils-components/dialog/DialogWithDataSlot"

	export default {
		name: 'StorageLogList',
        components: {
	        DialogWithDataSlot
        },
		data: () => ({
			Location,
			Operation,
			eventListDrawerModel: false,
            meterType: null,
            serialNumber: '',
			comment: '',
			selectedLog: null,
		}),
		inject: [
			'showNotificationSuccess',
			'showNotificationRequestError',
			'formatDate',
			'getLVStateTitle',
			'getOperationTitle',
			'getLocationTitle',
			'getEmployeeTitleByStaffId',
			'getMeterTypeTitle'
		],
        computed: {
	        ...mapState([ 'colorGrey', 'colorRed', 'colorGreen', 'colorBlue', 'colorOrange', 'colorDarkGrey' ]),
	        ...mapGetters({
		        accounts: 'dictionary/getAccounts',
		        logs: 'storage/getLogs',
	        })
        },
		methods: {
			...mapActions('storage', [
				'fetchLogs',
			]),
			parseUpdateCustomField,
			parseUpdateField,

			async open({ meter_type, guid, serial_number }) {
				try {
					if (!guid) {
						this.showNotificationWarning('Событий не найдено')
					}
					this.meterType = meter_type
					this.serialNumber = serial_number
					await this.fetchLogs(guid)
					this.eventListDrawerModel = true
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			editComment(log) {
				this.$refs.EditCommentDialog.dialogOpen()
				this.selectedLog = log
				this.comment = log.comment_field
			},

			async saveComment() {
				try {
					const { id } = this.selectedLog
					if (!id) {
						this.showNotificationWarning('Не найден id события')
                    }
					await this.editLogComment({ comment: this.comment, logId: id })
					this.selectedLog.comment_field = this.comment
					this.showNotificationSuccess('Операция редактирования выполнена успешно')
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					this.$refs.EditCommentDialog.dialogClose()
				}
			},

			getAvatarIcon(accepted_person) {
				const account = this.accounts.find(({ staff_id }) => accepted_person === +staff_id)
				if (account) {
					const { photo } = account
					if (photo) {
						return this.$store.state.serverUrl + `/images/${ photo }`
					}
				}
            },

            isAvatarExist(accepted_person) {
	            const account = this.accounts.find(({ staff_id }) => accepted_person === +staff_id)
                if (account) {
	                const { photo } = account
	                return photo
                }
	            return false
            }
		}
	}
</script>

<style scoped>
    .event-date, .event-owner, .event-close-reason {
        font-size: 12px;
        color: #616161;
        font-style: italic;
    }

    .event-type {
        font-size: 14px;
        font-weight: 500;
    }

    .event-text {
        font-size: 14px;
        max-width: 200px;
    }

    .transparent {
        opacity: 0.8 !important;
        margin-bottom: 2px;
    }


</style>
