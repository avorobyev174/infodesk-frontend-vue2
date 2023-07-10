<template>
    <v-navigation-drawer
        v-model="eventListDrawerModel"
        absolute
        temporary
        right
        width="400"
        class="event-list"
    >
        <v-list-item class="pt-3">
            <v-list-item-avatar>
                <v-img :src="photoUrl" lazy-src="@/assets/no-user-image.png"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title>Исполнитель</v-list-item-title>
                <v-list-item-subtitle>{{ owner }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-timeline
            align-top
            dense
        >
            <v-timeline-item
                v-for="(event, i) in events"
                :key="i"
                :color="getAssignmentEventTypeColor(event.type)"
            >
                <span class="mb-1 event-type">{{ getAssignmentEventTypeTitle(event.type) }}</span>
                <v-btn
                    x-small
                    icon
                    :color="colorRed"
                    v-if="event.type === AssignmentEventTypes.ACTION && currentAccountId === event.owner_id"
                    @click="openConfirmationDeleteEventDialog(event)"
                    class="transparent"
                >
                    <v-icon>mdi-close-box-outline</v-icon>
                </v-btn>
                <p class="mb-0 event-close-reason" v-if="event.close_reason">
                    {{ getAssignmentEventCloseReasonTitle(event.close_reason) }}
                </p>
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
                        v-if="event.type === AssignmentEventTypes.ACTION && currentAccountId === event.owner_id"
                        @click="openEditDescriptionDialog(event)"
                        class="transparent"
                    >
                        <v-icon>mdi-pencil-box-outline</v-icon>
                    </v-btn>
                </div>
            </v-timeline-item>
        </v-timeline>
        <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    class="add-event-button"
                    fab
                    absolute
                    @click="$refs.addOrEditAssignmentEventDialog.dialogOpen()"
                    v-bind="attrs"
                    v-on="on"
                    dark
                    :color="colorGreen"

                >
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </template>
            <span>Добавить событие</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    class="close-event-button"
                    fab
                    absolute
                    @click="$refs.closeAssignmentDialog.dialogOpen()"
                    v-bind="attrs"
                    v-on="on"
                    dark
                    :color="colorBlue"
                >
                    <v-icon>mdi-clipboard-check-outline</v-icon>
                </v-btn>
            </template>
            <span>Закрыть поручение</span>
        </v-tooltip>
        <dialog-with-data-slot-only-close
            :title="addOrEditDialogTitle"
            ref="addOrEditAssignmentEventDialog"
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
        <simple-dialog
            :dialog-open="deleteConfirmationDialogModel"
            max-width="700px"
            title="Вы уверены что хотите удалить событие?"
            @okButtonClickEvent="deleteActionEvent"
            @cancelButtonClickEvent="deleteConfirmationDialogModel = false"
        ></simple-dialog>
    </v-navigation-drawer>
</template>

<script>
	import { mapActions, mapState, mapGetters } from 'vuex'
    import { AssignmentEventType } from "../../../const"
    import SimpleDialog from "../../utils-components/SimpleDialog"
    import DialogWithDataSlotOnlyClose from "../../utils-components/dialog/DialogWithDataSlotOnlyClose"

	export default {
		name: 'EventList',
        components: {
	        DialogWithDataSlotOnlyClose,
	        SimpleDialog
        },
		data: () => ({
			eventListDrawerModel: false,
			description: '',
            selectedAssignment: null,
            selectedActionEvent: null,
			events: [],
			lastEvent: null,
            owner: '',
            photoUrl: '',
			closeReason: 1,
			currentAccountId: 1,
            deleteConfirmationDialogModel: false,
            addOrEditDialogTitle: 'Добавить событие',
            addOrEditDialogButtonTitle: 'Добавить',
			AssignmentEventTypes: AssignmentEventType,
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
            'showNotificationRequestError',
            'formatDate',
            'getAssignmentEventTypeTitle',
            'getAccountFullName',
            'getAssignmentEventCloseReasonTitle',
            'getAssignmentEventTypeColor',
        ],
        computed: {
	        ...mapState([ 'colorGrey', 'colorRed', 'colorGreen', 'colorBlue' ]),
	        ...mapGetters({
		        accounts: 'getAccounts',
		        assignmentCloseReasonTypes: 'getAssignmentCloseReasonTypes',
	        })
        },
		watch: {
			selectedActionEvent(newVal) {
		        this.addOrEditDialogTitle = newVal ? 'Редактирование события' : 'Добавить событие'
		        this.addOrEditDialogButtonTitle = newVal ? 'Сохранить' : 'Добавить'
	        }
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
				this.owner = 'отсутствует'
				this.photoUrl = ''
				this.selectedAssignment = assignment
				this.currentAccountId = currentAccountId
				const { id, owner_id } = assignment
				const account = this.accounts.find(({ id }) => owner_id === id)
				this.owner = this.getAccountFullName(owner_id)
				try {
					this.events = await this.fetchAssignmentEvents(id)
                    this.lastEvent = this.events.at(0)
                    if (this.owner) {
	                    this.photoUrl = this.$store.state.serverUrl + `/images/${ account?.photo }`
                    } else {
	                    this.owner = 'отсутствует'
	                    this.photoUrl = this.$store.state.serverUrl + '/images/no-user-image.png'
                    }
					this.eventListDrawerModel = true
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			openConfirmationDeleteEventDialog(actionEvent) {
				this.deleteConfirmationDialogModel = true
                this.selectedActionEvent = actionEvent
			},

			async openEditDescriptionDialog(actionEvent) {
				this.$refs.addOrEditAssignmentEventDialog.dialogOpen()
				this.selectedActionEvent = actionEvent
				if (actionEvent) {
					this.description = actionEvent.description
				}
			},

			closeEditDescriptionDialog() {
				this.$refs.addOrEditAssignmentEventDialog.dialogClose()
				this.deleteConfirmationDialogModel = false
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
		}
	}
</script>

<style scoped>
    .add-event-button {
        position: absolute !important;
        bottom: 20px !important;
        right: 90px !important;
    }

    .close-event-button {
        bottom: 20px !important;
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
</style>mec2022
