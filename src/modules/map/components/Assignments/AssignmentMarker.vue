<template>
    <v-menu
        top
        transition="slide-y-transition"
        offset-y
        :nudge-width="180"
        :nudge-left="120"
        content-class="marker-menu"
        :close-on-content-click="false"
    >
        <template v-slot:activator="{ on, attrs }">
            <div
                class="assignment-marker"
                v-bind="attrs"
                v-on="on"
            >
                <v-icon
                    large
                    :color="marker.color"
                >
                    mdi-clipboard-text
                </v-icon>
                <span
                    class="count"
                    v-if="marker.count > 1"
                    :class="markerCountClass"
                >{{ marker.count }}</span>
            </div>
        </template>
        <div class="marker-container">
            <div
                v-for="({
                    address,
                    owner_id,
                    status,
                    id,
                    isShowAcceptButton,
                    isShowDeclineButton,
                    created,
                    meter_serial_number
                }, index) in marker.apartments"
                :key="index"
                class="marker"
                :style="`background-color: ${ getAssignmentStatusColor(status) }`"
            >
                <div>
                    <span class="maker-info">{{ `Адрес: ${ address }` }}</span>
                    <span class="maker-info">{{ `Серийный номер: ${ meter_serial_number }` }}</span>
                    <span class="maker-info">{{ `Исполнитель: ${ getAccountFullName(owner_id) }` }}</span>
                    <span class="maker-info">{{ `Статус: ${ getAssignmentStatusTitle(status) }` }}</span>
                    <span class="maker-info">{{ `Дата регистрации: ${ formatDate(created) }` }}</span>
                </div>
                <div style="display:flex; gap: 5px">
                    <button-with-tooltip
                        v-if="isShowAcceptButton"
                        color="black"
                        title="Принять поручение"
                        icon="mdi-clipboard-account-outline"
                        :is-icon="true"
                        icon-size="40px"
                        @click="assignmentAcceptOrDecline(id, false)"
                    />
                    <button-with-tooltip
                        v-if="isShowDeclineButton"
                        color="black"
                        title="Отклонить поручение"
                        icon="mdi-clipboard-minus-outline"
                        :is-icon="true"
                        icon-size="40px"
                        @click="assignmentAcceptOrDecline(id, true)"
                    />
                </div>
            </div>
        </div>
    </v-menu>
</template>

<script>
	import {mapActions, mapGetters, mapState} from "vuex"
	import { AssignmentStatus } from "../../../../const"
    import ButtonWithTooltip from "../../../utils-components/button/ButtonWithTooltip"
    import { getMarkerColor, isShowAccept, isShowDecline } from "./utils"

	export default {
		name: "AssignmentMarker",
        components: {
	        ButtonWithTooltip
        },
        data: () => ({
	        AssignmentStatus
        }),
		inject: [
			'getAssignmentStatusTitle',
            'showNotificationSuccess',
            'showNotificationInfo',
            'showNotificationRequestError',
            'getAccountFullName',
            'formatDate'
        ],
		props: {
			marker: {
				type: Object,
				required: true
			},
		},
		computed: {
			...mapState([ 'colorGrey', 'colorBlue', 'colorGreen', 'colorRed' ]),
			...mapGetters({
				currentAccountId: 'getAccountId',
			}),
            markerCountClass() {
				return this.marker?.count >= 10 ? 'count-more-10' : 'count-less-10'
            },
		},
        methods: {
	        ...mapActions('service', [
		        'acceptOrDeclineAssignment',
	        ]),

	        getAssignmentStatusColor(status) {
		        switch (status) {
			        case AssignmentStatus.REGISTERED:
			        case AssignmentStatus.RE_REGISTERED: return 'rgba(189, 189, 189, 0.8)'
			        case AssignmentStatus.IN_WORK: return 'rgba(66, 165, 245, 0.8)'
			        case AssignmentStatus.CLOSED:
			        case AssignmentStatus.CLOSED_AUTO: return 'rgba(102, 187, 106, 0.8)'
		        }
	        },

	        async assignmentAcceptOrDecline(id, isDecline) {
		        try {
			        const updatedAssignment = isDecline
				        ? await this.acceptOrDeclineAssignment({ id, isDecline })
				        : await this.acceptOrDeclineAssignment({ id })
			        this.updateAssignment(updatedAssignment)
			        isDecline
                        ? this.showNotificationInfo('Поручение успешно отклонено')
                        : this.showNotificationSuccess('Поручение успешно принято')
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        }
	        },

	        updateAssignment({ id, status, owner_id }) {
	        	const oldAssignmentApartment = this.marker.apartments.find((apartment) => apartment.id === id)
		        Object.assign(oldAssignmentApartment, {
		        	...oldAssignmentApartment,
                    owner: this.getAccountFullName(owner_id),
			        owner_id,
                    status,
			        isShowAcceptButton: isShowDecline(status, owner_id, this.currentAccountId),
			        isShowDeclineButton: isShowAccept(status, owner_id, this.currentAccountId)
                })
		        this.marker.color = getMarkerColor(this.marker.apartments)
	        },
        }
	}
</script>

<style scoped>
    .assignment-marker {
        position: relative;
    }

    .marker {
        font-size: 12px;
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.4);
        text-align: left;
        padding: 5px;
        margin: 5px;
        border-radius: 3px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
    }

    .count {
        font-weight: bold;
        font-size: 16px;
        position: absolute;
        color: rgba(0, 0, 0, 0.8);
        top: 8px;
    }

    .count-less-10 {
        left: 13px;
    }

    .count-more-10 {
        left: 9px;
    }

    .maker-info {
        display: block;
        color: rgba(0, 0, 0, 0.8);
        font-weight: 600;
    }

    .marker-menu {
        background-color: rgba(255, 255, 255, 0.6);
    }
</style>