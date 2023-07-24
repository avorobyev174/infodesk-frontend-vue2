<template>
    <v-navigation-drawer
        v-model="eventListDrawerModel"
        absolute
        temporary
        right
        width="475"
        class="event-list"
    >
        <v-list-item class="pt-3" style="display:flex; gap: 12px">
            <v-icon large color="black"> mdi-meter-electric-outline</v-icon>
            <v-list-item-content class="p-0">
                <v-list-item-title class="pb-1 font-weight-medium">Тип: {{ getMeterTypeTitle(meterType) }}</v-list-item-title>
                <v-list-item-subtitle class="font-weight-medium">Серийный номер: {{ serialNumber }}</v-list-item-subtitle>
                <v-list-item-subtitle class="font-weight-medium">Дата последнего опроса: {{ formatDate(lastDataDate) }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-timeline align-top dense>
            <v-timeline-item
                v-for="(event, i) in events"
                :key="event.id"
                :color="getAssignmentEventTypeColor(event.type)"
                large
            >
                <template v-slot:icon>
                    <v-avatar size="42">
                        <v-img :src="getAvatarIcon(event.owner_id)" v-if="isAvatarExist(event.owner_id)"/>
                        <v-icon v-else>{{ getTimelineIcon(event.type) }}</v-icon>
                    </v-avatar>
                </template>
                <p class="mb-0 event-type">
                    {{ getAssignmentEventTypeTitle(event.type) }}
                </p>
                <p class="mb-1 event-close-reason">
                    {{ getAssignmentEventCloseReasonTitle(event.close_reason) }}
                </p>
                <v-btn
                    x-small
                    icon
                    :color="colorRed"
                    v-if="event.type === AssignmentEventType.ACTION && currentAccountId === event.owner_id"
                    @click="openConfirmationDeleteEventDialog(event)"
                    class="transparent"
                >
                    <v-icon>mdi-close-box-outline</v-icon>
                </v-btn>
                <p class="mb-0 event-owner" v-if="event.owner_id">
                    {{ getAccountFullName(event.owner_id) }}
                </p>
                <p class="mb-2 event-date">
                    {{ formatDate(event.created, true) }}
                </p>
                <div class="d-flex">
                    <p class="event-text d-inline-block">
                        {{ event.description }}
                    </p>
                    <v-btn
                        x-small
                        icon
                        :color="colorGrey"
                        v-if="event.type === AssignmentEventType.ACTION && currentAccountId === event.owner_id"
                        @click="openEditDescriptionDialog(event)"
                        class="transparent"
                    >
                        <v-icon>mdi-pencil-box-outline</v-icon>
                    </v-btn>
                </div>
            </v-timeline-item>
        </v-timeline>
        <v-tooltip top v-if="isButtonVisible">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    class="add-event-button"
                    fab
                    absolute
                    @click="$refs.AddOrEditAssignmentEventDialog.dialogOpen()"
                    v-bind="attrs"
                    v-on="on"
                    :color="colorGreen"
                    small
                >
                    <v-icon :color="colorSuperGrey">mdi-plus</v-icon>
                </v-btn>
            </template>
            <span>Добавить событие</span>
        </v-tooltip>
        <v-tooltip top v-if="isButtonVisible">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    class="close-event-button"
                    fab
                    absolute
                    @click="$refs.closeAssignmentDialog.dialogOpen()"
                    v-bind="attrs"
                    v-on="on"
                    :color="colorBlue"
                    small
                >
                    <v-icon :color="colorSuperGrey">mdi-clipboard-check-outline</v-icon>
                </v-btn>
            </template>
            <span>Закрыть поручение</span>
        </v-tooltip>
        <dialog-with-data-slot-only-close
            :title="addOrEditDialogTitle"
            ref="AddOrEditAssignmentEventDialog"
            @close="addOrEditAssignmentEventDialogClick"
            :close-button-title="addOrEditDialogButtonTitle"
        >
            <template v-slot:fields>
                <v-text-field v-model="description" label="Описание"></v-text-field>
            </template>
        </dialog-with-data-slot-only-close>
        <dialog-with-data-slot-only-close
            title="Закрыть поручение"
            ref="closeAssignmentDialog"
            @close="assignmentClose"
        >
            <template v-slot:fields>
                <v-select
                    v-model="closeReason"
                    :items="assignmentCloseReasonTypes"
                    item-text="title"
                    item-value="id"
                    label="Причина закрытия"
                />
                <v-text-field v-model="description" label="Описание"></v-text-field>
            </template>
        </dialog-with-data-slot-only-close>
        <dialog-custom
            ref="AssignmentEventRemoveDialog"
            :max-width="700"
            title="Вы уверены что хотите удалить событие?"
            @submit="deleteActionEvent"           
        ></dialog-custom>
    </v-navigation-drawer>
</template>

<script>
	import { mapActions, mapState, mapGetters } from 'vuex'
    import { AssignmentEventType, AssignmentStatus } from "../../../const"
    import DialogCustom from "../../utils-components/dialog/DialogCustom"
    import DialogWithDataSlotOnlyClose from "../../utils-components/dialog/DialogWithDataSlotOnlyClose"

	export default {
		name: 'ServiceEventList',
        components: {
	        DialogWithDataSlotOnlyClose,
	        DialogCustom
        },
		data: () => ({
			AssignmentStatus,
			AssignmentEventType,
            isButtonVisible: true,
			eventListDrawerModel: false,
			description: '',
            selectedAssignment: null,
            selectedActionEvent: null,
			events: [],
			lastEvent: null,
			lastDataDate: '',
            owner: '',
            photoUrl: '',
			closeReason: 1,
			currentAccountId: 1,
            addOrEditDialogTitle: 'Добавить событие',
            addOrEditDialogButtonTitle: 'Добавить',
			meterType: null,
			serialNumber: '',
		}),
        props: {
		    assignments: {
		    	type: Array,
                required: true
            }
        },
		inject: [
			'showNotificationSuccess',
            'showNotificationError',
            'showNotificationWarning',
            'showNotificationRequestError',
            'formatDate',
            'getAssignmentEventTypeTitle',
            'getAccountFullName',
            'getAssignmentEventCloseReasonTitle',
            'getAssignmentEventTypeColor',
            'getMeterTypeTitle',
        ],
        computed: {
	        ...mapState([ 'colorGrey', 'colorRed', 'colorGreen', 'colorBlue', 'colorSuperGrey' ]),
	        ...mapGetters({
		        accounts: 'dictionary/getAccounts',
		        assignmentCloseReasonTypes: 'dictionary/getAssignmentCloseReasonTypes',
	        })
        },
		watch: {
			selectedActionEvent(newVal) {
		        this.addOrEditDialogTitle = newVal ? 'Редактирование события' : 'Добавить событие'
		        this.addOrEditDialogButtonTitle = newVal ? 'Сохранить' : 'Добавить'
	        },
        },
		methods: {
			...mapActions('service', [
				'fetchAssignmentEvents',
				'addAssignmentActionEvent',
				'changeAssignmentActionEvent',
				'removeActionEvent',
				'closeAssignment',
			]),

			async open(assignment, currentAccountId) {
				this.selectedAssignment = assignment
				this.currentAccountId = currentAccountId
				const { id, owner_id, status, meter_type, meter_serial_number, last_data_date } = assignment
				this.meterType = meter_type
				this.serialNumber = meter_serial_number
				this.lastDataDate = last_data_date
                this.isButtonVisible =
                    ![ AssignmentStatus.CLOSED, AssignmentStatus.CLOSED_AUTO ].includes(status) && currentAccountId === owner_id

				try {
					this.events = await this.fetchAssignmentEvents(id)
                    this.lastEvent = this.events.at(0)
                    if (this.owner && this.owner !== 'отсутствует') {
	                    this.photoUrl = this.$store.state.serverUrl + `/images/${ account?.photo }`
                    } else {
	                    this.owner = 'отсутствует'
	                    this.photoUrl = ''
                    }
					this.eventListDrawerModel = true
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			openConfirmationDeleteEventDialog(actionEvent) {
				this.$refs.AssignmentEventRemoveDialog.dialogOpen()
                this.selectedActionEvent = actionEvent
			},

			async openEditDescriptionDialog(actionEvent) {
				this.$refs.AddOrEditAssignmentEventDialog.dialogOpen()
				this.selectedActionEvent = actionEvent
				if (actionEvent) {
					this.description = actionEvent.description
				}
			},

			closeEditDescriptionDialog() {
				this.$refs.AddOrEditAssignmentEventDialog.dialogClose()
				this.selectedActionEvent = null
				this.description = ''
			},

			async deleteActionEvent() {
				try {
				    const deletedActionEvent = await this.removeActionEvent(this.selectedActionEvent?.id)
					const event = this.events.find((event) => event.id === deletedActionEvent.id)
					this.events.splice(this.events.indexOf(event), 1)
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					this.closeEditDescriptionDialog()
				}
            },

			async assignmentClose() {
				try {
					const { assignment, assignmentEvent } = await this.closeAssignment({
						assignmentId: this.selectedAssignment?.id,
						closeReason: this.closeReason,
						description: this.description
					})
					const oldAssignment = this.assignments.find((assign) => assign.id === assignment.id)
					Object.assign(oldAssignment, assignment)
					this.events.unshift(assignmentEvent)
				} catch (e) {
					if (e?.response?.data === 'поручение уже закрыто') {
						return this.showNotificationWarning('Поручение уже закрыто')
                    }
					this.showNotificationRequestError(e)
				} finally {
					this.description = ''
					this.closeReason = 1
                    this.eventListDrawerModel = false
				}
			},

			async addOrEditAssignmentEventDialogClick() {
				try {
                    if (this.selectedActionEvent) {
                        const changedActionEvent = await this.changeAssignmentActionEvent({
                            actionEventId: this.selectedActionEvent.id,
                            description: this.description
                        })
                        const oldAssignmentEvent = this.events.find((event) => event.id === changedActionEvent.id)
                        Object.assign(oldAssignmentEvent, changedActionEvent)
                    } else {
                        const addedActionEvent = await this.addAssignmentActionEvent({
                            assignmentId: this.selectedAssignment.id,
                            description: this.description
                        })
                        this.events.unshift(addedActionEvent)
                    }
				} catch (e) {
					this.showNotificationRequestError(e)
				} finally {
					this.closeEditDescriptionDialog()
				}
            },

			getAvatarIcon(ownerId) {
				const account = this.accounts.find(({ id }) => ownerId === id)
				if (account) {
					const { photo } = account
					if (photo) {
						return this.$store.state.serverUrl + `/images/${ photo }`
					}
				}
			},

			getTimelineIcon(eventType) {
				if (eventType === AssignmentEventType.CLOSED || eventType === AssignmentEventType.CLOSED_AUTO) {
					return 'mdi-clipboard-check-outline'
				} else if (eventType === AssignmentEventType.SYSTEM_ACTION) {
					return 'mdi-clipboard-pulse-outline'
				} else {
					return 'mdi-clipboard-plus-outline'
				}
			},

			isAvatarExist(ownerId) {
				const account = this.accounts.find(({ id }) => ownerId === id)
				if (account) {
					const { photo } = account
					return photo
				}
				return false
			},
		}
	}
</script>

<style scoped>
    .add-event-button {
        position: absolute !important;
        top: 20px !important;
        right: 70px !important;
    }

    .close-event-button {
        top: 20px !important;
        right: 20px !important;
    }

    .event-date, .event-owner, .event-close-reason {
        font-size: 12px;
        color: #616161;
        font-style: italic;
    }

    .event-close-reason {
        text-decoration: underline;
    }

    .event-type {
        font-size: 14px;
        font-weight: 500;
        text-decoration: underline;
    }

    .event-text {
        font-size: 14px;
        max-width: 200px;
    }

    .transparent {
        opacity: 0.8 !important;
        margin-bottom: 2px;
    }

    .event {
        width: 250px;
    }
</style>
