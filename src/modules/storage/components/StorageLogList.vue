<template>
    <v-navigation-drawer
        v-model="eventListDrawerModel"
        absolute
        temporary
        right
        width="400"
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
                v-for="log in events"
                :key="log.id"
                :color="colorGrey"
                large
            >
                <template v-slot:icon>
                    <v-avatar size="42">
                        <v-img :src="getAvatarIcon(log.accepted_person)" v-if="isAvatarExist(log.accepted_person)"/>
                        <v-icon v-else>mdi-account</v-icon>
                    </v-avatar>
                </template>
                <span v-if="log.oper_type !== Operation.EDIT" class="mb-1 event-type" style="text-decoration: underline">{{ getLocationTitle(log.new_location) }}</span>
                <span v-else class="mb-1 event-type" style="text-decoration: underline">{{ getOperationTitle(log.oper_type) }}</span>
                <p class="mb-0 event-date">
                    {{ formatDate(log.datetime, true) }}
                </p>
                <p v-if="log.install_date" class="mb-0 event-date">
                    {{ `Дата установки: ${ formatDate(log.install_date) }` }}
                </p>
                <p style="font-size: 8px; font-style: italic; font-weight: bold" class="mb-2">
                    {{ log.id }}
                </p>
                <p class="mb-0 event-owner" >
                    <span v-if="![ Operation.EDIT, Operation.REGISTRATION, Operation.REGISTRATION_WITHOUT_SERIAL_NUMBER ].includes(log.oper_type)">{{ getEmployeeTitleByStaffId(log.issuing_person) }} </span>
                    <span v-if="![ Operation.EDIT, Operation.REGISTRATION, Operation.REGISTRATION_WITHOUT_SERIAL_NUMBER ].includes(log.oper_type)">&#10132;</span>
                    {{ getEmployeeTitleByStaffId(log.accepted_person) }}
                </p>
                <div class="d-flex">
                    <p class="event-text d-inline-block mb-0">{{ log.comment_field }}</p>
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
               <div v-if="log.oper_type === Operation.REPAIR">
                   <v-chip
                       v-if="log.workStatus"
                       class="text-pre p-1 pr-3 pl-3 mt-1 mb-1"
                       style="height: fit-content; display: block; width: fit-content; font-size: 12px; margin-left: -9px;"
                       :color="log.workStatus.status === 0 ? colorRed : colorGreen"
                   >{{ log.workStatus.workStatusStr }}</v-chip>
                   <v-chip
                       v-if="log.spentItems"
                       class="text-pre p-1 pr-3 pl-3"
                       style="height: fit-content; font-size: 12px; margin-left: -9px;"
                   >{{ log.spentItems }}</v-chip>
               </div>
               <div v-else-if="log.update_field_new">
                   <v-chip
                       class="text-pre p-1 pr-3 pl-3 mt-1 mb-1"
                       style="height: fit-content; display: block; width: fit-content; font-size: 12px; margin-left: -9px;"
                   >{{ parseEditField(log.update_field_new) }}</v-chip>
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
			events: [],
            meterType: null,
            serialNumber: '',
			comment: '',
			selectedLog: null,
			repairData: null,
		}),
		inject: [
			'showNotificationSuccess',
			'showNotificationError',
			'showNotificationRequestError',
			'formatDate',
			'getLVStateTitle',
			'getOperationTitle',
			'getLocationTitle',
			'getEmployeeTitleByStaffId',
			'getMeterTypeTitle',
            'showNotificationWarning',
            'getAccuracyClassTitle',
            'getConditionTitle',
            'getOwnerTitle',
		],
        computed: {
	        ...mapState([ 'colorGrey', 'colorRed', 'colorGreen', 'colorBlue', 'colorOrange', 'colorDarkGrey' ]),
	        ...mapGetters({
		        accounts: 'dictionary/getAccounts',
	        })
        },
		methods: {
			...mapActions('storage', [
				'fetchEvents',
				'fetchMeterRepairData',
				'editLogComment'
			]),
			async open({ meter_type, guid, serial_number }) {
				try {
					if (!guid) {
						this.showNotificationWarning('Событий не найдено')
					}
					this.meterType = meter_type
					this.serialNumber = serial_number
					this.events = await this.fetchEvents(guid)
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
						return this.showNotificationWarning('Не найден id события')
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
            },

			parseEditField(updateField) {
				try {
					const editFields = JSON.parse(updateField)
					return Object.entries(editFields).map(([ key, value ]) => {
						switch (key) {
							case 'meter_type': return { ...value, old: this.getMeterTypeTitle(+value.old), new: this.getMeterTypeTitle(+value.new) }
							case 'accuracy_class': return { ...value, old: this.getAccuracyClassTitle(value.old), new: this.getAccuracyClassTitle(value.new) }
							case 'condition': return { ...value, old: this.getConditionTitle(+value.old), new: this.getConditionTitle(+value.new) }
							case 'property': return { ...value, old: this.getOwnerTitle(value.old), new: this.getOwnerTitle(value.new) }
							case 'calibration_date': return {
								...value,
                                old: value.old ? value.old : 'отсутствует',
                                new: value.new ? value.new : 'отсутствует',
							}
							case 'passport_number': return {
								...value,
                                old: +value.old ? value.old : 'отсутствует',
								new: +value.new ? value.new : 'отсутствует',
							}
							case 'serial_number': return { ...value, old: +value.old ? value.old: 'отсутствует' }
						}
						return value
					}).map((field) => `${ field.title }: ${ field.old } ⇾ ${ field.new }`).join('\n')
				} catch (e) {
					this.showNotificationError('Ошибка при парсинге лога редактирования')
				}
			},
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
