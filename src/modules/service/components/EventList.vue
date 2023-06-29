<template>
    <v-navigation-drawer
        v-model="eventListModel"
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
                <v-list-item-title>{{ owner }}</v-list-item-title>
                <v-list-item-subtitle>Исполнитель</v-list-item-subtitle>
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
                <div class="">
                    <span class="mb-1 event-type">
                        {{ getAssignmentEventTypeTitle(event.type) }}
                    </span>
                    <v-btn
                        x-small
                        icon
                        :color="colorRed"
                        v-if="event.type === AssignmentEventTypes.ACTION && currentAccountId === event.owner_id"
                        @click="openConfirmationDeleteEventDialog(event)"
                        class="transparent"
                    >
                        <v-icon>
                            mdi-close-box-outline
                        </v-icon>
                    </v-btn>
                    <p class="mb-0 event-close-reason" v-if="event.close_reason">
                        {{ getAssignmentCloseEventTypeTitle(event.close_reason) }}
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
                            @click="openDescriptionDialog(event)"
                            class="transparent"
                        >
                            <v-icon>
                                mdi-pencil-box-outline
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
            </v-timeline-item>
        </v-timeline>
        <v-speed-dial
            v-model="fab"
            absolute
            right
            direction="top"
            open-on-hover
            class="add-event-button"
            transition="slide-y-reverse-transition"
            v-show="lastEvent && currentAssignment && lastEvent.type !== AssignmentEventTypes.CLOSE && currentAccountId === currentAssignment.owner_id"
        >
            <template v-slot:activator>
                <v-btn
                    v-model="fab"
                    color="primary"
                    dark
                    fab
                >
                    <v-icon v-if="fab">
                        mdi-close
                    </v-icon>
                    <v-icon v-else>
                        mdi-clipboard-text-outline
                    </v-icon>
                </v-btn>
            </template>
            <v-tooltip left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        fab
                        small
                        @click="openDescriptionDialog()"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon color="primary">mdi-plus</v-icon>
                    </v-btn>
                </template>
                <span>Добавление события</span>
            </v-tooltip>
            <v-tooltip left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        fab
                        small
                        @click="openConfirmationCloseAssignmentDialog"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon color="primary">mdi-clipboard-check-outline</v-icon>
                    </v-btn>
                </template>
                <span>Закрыть поручение</span>
            </v-tooltip>
        </v-speed-dial>
        <v-dialog
            v-model="descriptionDialogModel"
            max-width="500px"
        >
            <v-card>
                <v-card-title>
                    <span class="mx-auto text-h5 text-center text-break">{{ addOrEditDialogTitle }}</span>
                </v-card-title>
                <v-card-text class="pt-2 pb-1">
                    <v-text-field v-model="description" label="Описание"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        color="primary"
                        @click="addOrEditDialogOnClick"
                    >
                        {{ addOrEditDialogButtonTitle }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="closeConfirmationDialogModel"
            max-width="500px"
        >
            <v-card>
                <v-card-title>
                    <span class="mx-auto text-h5 text-center text-break">Закрытие поручения</span>
                </v-card-title>
                <v-card-text class="pt-2 pb-1">
                    <v-select
                        v-model="closeReason"
                        :items="assignmentCloseReasonTypes"
                        item-text="title"
                        item-value="id"
                        label="Причина закрытия"
                    >
                    </v-select>
                    <v-text-field v-model="description" label="Описание"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        color="primary"
                        @click="closeCurrentAssignment"
                    >
                        Закрыть
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
    import { AssignmentEventTypes } from "../../../const"
    import SimpleDialog from "../../utils-components/SimpleDialog"

	export default {
		name: 'EventList',
        components: {
	        SimpleDialog
        },
		data: () => ({
			fab: false,
			eventListModel: false,
			descriptionDialogModel: false,
			description: '',
            currentAssignment: null,
            currentActionEvent: null,
			events: [],
			lastEvent: null,
            owner: '',
            ACTION_EVENT_TYPE: 4,
            photoUrl: '',
			closeReason: 1,
			currentAccountId: 1,
            deleteConfirmationDialogModel: false,
            closeConfirmationDialogModel: false,
            addOrEditDialogTitle: 'Добавление события',
            addOrEditDialogButtonTitle: 'Добавить',
			AssignmentEventTypes: {},
			assignmentCloseReasonTypes: []
		}),
        props: {
		    assignments: {
		    	type: Array,
                required: true
            }
        },
		inject: [
			'showNotification',
            'showNotificationError',
            'showNotificationStandardError',
            'formatDate',
            'getAssignmentEventTypeTitle',
            'getAccountFullName',
            'getAssignmentCloseEventTypeTitle',
            'getAccounts',
            'getAssignmentEventTypeColor',
        ],
        computed: {
	        ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue', 'colorGold' ]),
            ...mapGetters({
                dictionaries: 'getDictionaries'
            })
        },
        mounted() {
			this.AssignmentEventTypes = AssignmentEventTypes
			this.assignmentCloseReasonTypes = this.dictionaries.assignmentCloseReasonTypes
        },
		watch: {
	        currentActionEvent(newVal) {
		        this.addOrEditDialogTitle = newVal ? 'Редактирование события' : 'Добавление события'
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
			...mapActions('profile', [ 'getProfileData' ]),

			async open(assingment, currentAccountId) {
				this.owner = 'отсутствует'
				this.photoUrl = ''
				this.currentAssignment = assingment
				this.currentAccountId = currentAccountId
				const { id, owner_id } = assingment
				const account = this.getAccounts().find(({ id }) => owner_id === id)
				this.owner = this.getAccountFullName(owner_id)

				try {
					this.events = await this.fetchAssignmentEvents(id)
                    this.lastEvent = this.events.at(0)
                    if (this.owner) {
	                    this.photoUrl = this.$store.state.serverUrl + `/images/${ account?.photo }`
                    } else {
	                    this.owner = 'отсутствует'
	                    this.photoUrl = ''
                    }
					this.eventListModel = true
				} catch (e) {
					this.showNotificationStandardError(e)
				}
			},

			openConfirmationDeleteEventDialog(actionEvent) {
				this.deleteConfirmationDialogModel = true
                this.currentActionEvent = actionEvent
			},

			openConfirmationCloseAssignmentDialog() {
				this.closeConfirmationDialogModel = true
			},

			async openDescriptionDialog(actionEvent) {
				this.descriptionDialogModel = true
				this.currentActionEvent = actionEvent
				if (actionEvent) {
					this.description = actionEvent.description
				}
			},

			closeDescriptionDialog() {
				this.descriptionDialogModel = false
				this.deleteConfirmationDialogModel = false
				this.currentActionEvent = null
				this.description = ''
			},

			async deleteActionEvent() {
				try {
				    const deletedActionEvent = await this.removeActionEvent(this.currentActionEvent?.id)
					const event = this.events.find((event) => event.id === deletedActionEvent.id)
					this.events.splice(this.events.indexOf(event), 1)
				} catch (e) {
					this.showNotificationStandardError(e)
				} finally {
					this.closeDescriptionDialog()
				}
            },

			async closeCurrentAssignment() {
				try {
					const { assignment, assignmentEvent } = await this.closeAssignment({
						assignmentId: this.currentAssignment?.id,
						closeReason: this.closeReason,
						description: this.description
					})
					const oldAssignment = this.assignments.find((assign) => assign.id === assignment.id)
					Object.assign(oldAssignment, assignment)
					this.events.unshift(assignmentEvent)
				} catch (e) {
					this.showNotificationStandardError(e)
				} finally {
					this.closeConfirmationDialogModel = false
					this.description = ''
					this.closeReason = 1
				}
			},

			async addOrEditDialogOnClick() {
				try {
                    if (this.currentActionEvent) {
                        const changedActionEvent = await this.changeAssignmentActionEvent({
                            actionEventId: this.currentActionEvent.id,
                            description: this.description
                        })
                        const oldAssignmentEvent = this.events.find((event) => event.id === changedActionEvent.id)
                        Object.assign(oldAssignmentEvent, changedActionEvent)
                    } else {
                        const addedActionEvent = await this.addAssignmentActionEvent({
                            assignmentId: this.currentAssignment.id,
                            description: this.description
                        })
                        this.events.unshift(addedActionEvent)
                    }
				} catch (e) {
					this.showNotificationStandardError(e)
				} finally {
					this.closeDescriptionDialog()
				}
            },
		}
	}
</script>

<style scoped>
    .v-speed-dial {
        position: absolute;
    }

    .v-btn--floating {
        position: relative;
    }


    .add-event-button {
        bottom: 20px !important;
        right: 40px !important;
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
