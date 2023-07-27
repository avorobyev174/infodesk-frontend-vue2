<template>
    <v-navigation-drawer
        v-model="eventListDrawerModel"
        absolute
        temporary
        right
        width="500"
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
                v-for="event in events"
                :key="event.id"
                :color="colorGrey"
                large
            >
                <template v-slot:icon>
                    <v-avatar size="42">
                        <v-img :src="getAvatarIcon(event.account_id)" v-if="isAvatarExist(event.account_id)"/>
                        <v-icon v-else>{{ getTimelineIcon(event.type) }}</v-icon>
                    </v-avatar>
                </template>
                <span class="mb-1 event-type" style="text-decoration: underline" >{{ getProgrammingLogTypeTitle(event.type) }}</span>
                <p class="mb-0 event-date">
                    {{ formatDate(event.created, true) }}
                </p>
                <p style="font-size: 8px; font-style: italic; font-weight: bold" class="mb-1">
                    {{ event.id }}
                </p>
                <p v-if="event.comment" style="font-size: 12px; font-style: italic; font-weight: bold" class="mb-1">
                    Комментарий: {{ event.comment }}
                </p>
                <div v-if="[
                    ProgrammingLogType.EDITED,
                    ProgrammingLogType.REFRESHED,
                    ProgrammingLogType.BROKEN,
                    ProgrammingLogType.RTC_UPDATE,
                    ProgrammingLogType.STACK_UPDATE,
                    ProgrammingLogType.SIM_CARD_DATA_DELETED,
                ].includes(event.type)">
                     <v-chip
                        class="text-pre p-1 pr-3 pl-3"
                        style="height: fit-content; font-size: 12px; margin-left: -12px;"
                     >{{ showDifference(event.state_before, event.state_after) }}</v-chip>
                </div>
            </v-timeline-item>
        </v-timeline>
    </v-navigation-drawer>
</template>

<script>
	import { mapActions, mapState, mapGetters } from 'vuex'
	import { ProgrammingLogType } from "../const"
    import headers from '../js/programming-table-headers'

	export default {
		name: 'ProgrammingLogList',
		data: () => ({
			ProgrammingLogType,
			eventListDrawerModel: false,
			events: [],
            meterType: null,
            serialNumber: '',
		}),
		inject: [
			'showNotificationRequestError',
			'formatDate',
			'getMeterTypeTitle',
            'showNotificationWarning',
            'getProgrammingLogTypeTitle',
            'getPhaseTitle',
            'getIpAddressTitle',
            'getSimStatusTitle',
            'getSmsTitleByStatus',
		],
        computed: {
	        ...mapState([ 'colorGrey' ]),
	        ...mapGetters({
		        accounts: 'dictionary/getAccounts',
	        })
        },
		methods: {
			...mapActions('programming', [
				'fetchEvents',
			]),
			async open({ id, type, serial_number, created, author_acc_id }) {
				try {
					if (!id) {
						this.showNotificationWarning('Событий не найдено')
					}
					this.meterType = type
					this.serialNumber = serial_number
					this.events = await this.fetchEvents(id)
                    if (!this.events.find(({ type }) => type ===  ProgrammingLogType.ADDED)) {
	                    this.events.push({ type: ProgrammingLogType.ADDED, created, account_id: author_acc_id })
                    }
					//console.log(this.events)
					this.eventListDrawerModel = true
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			getAvatarIcon(account_id) {
				const account = this.accounts.find(({ id }) => account_id === +id)
				if (account) {
					const { photo } = account
					if (photo) {
						return this.$store.state.serverUrl + `/images/${ photo }`
					}
				}
            },

            isAvatarExist(account_id) {
	            const account = this.accounts.find(({ id }) => account_id === +id)
                if (account) {
	                const { photo } = account
	                return photo
                }
	            return false
            },

            compareState(stateBefore, stateAfter) {
				const before = JSON.parse(stateBefore)
				const after = JSON.parse(stateAfter)
				const diff = []
                const fields = Object.keys(before)
                for (const field of fields) {
                	if (before[field] !== after[field]) {
		                diff.push({ name: field, oldVal: before[field], newVal: after[field] })
                    }
                }
                return diff
            },

            showDifference(stateBefore, stateAfter) {
				const difference = this.compareState(stateBefore, stateAfter).map(({ name, oldVal, newVal }) => {
					switch (name) {
						case 'type': return `Тип: ${ oldVal ? this.getMeterTypeTitle(oldVal) : 'отсутствует' } ⇾ ${ newVal ? this.getMeterTypeTitle(newVal) : 'отсутствует' }`
						case 'phase': return `Фазность: ${ oldVal ? this.getPhaseTitle(oldVal) : 'отсутствует'  } ⇾ ${ newVal ? this.getPhaseTitle(newVal) : 'отсутствует'  }`
						case 'ip_address': return `IP адрес: ${ oldVal ? this.getIpAddressTitle(oldVal) : 'отсутствует' } ⇾ ${ newVal ? this.getIpAddressTitle(newVal) : 'отсутствует' }`
						case 'status': return `Статус сим карты: ${ oldVal ? this.getSimStatusTitle(oldVal) : 'отсутствует' } ⇾ ${ newVal ? this.getSimStatusTitle(newVal) : 'отсутствует' }`
						//case 'sms_status': return `Статус смс: ${ oldVal ? this.getSmsTitleByStatus(oldVal) : 'отсутствует' } ⇾ ${ newVal ? this.getSmsTitleByStatus(newVal) : 'отсутствует' }`
						case 'sms_status': return ''
                        default: return `${ this.getFieldName(name) }: ${ oldVal ? oldVal : 'отсутствует' } ⇾ ${ newVal ? newVal : 'отсутствует' }`
					}
                }).join('\n')
                return difference ? difference : 'информация отсутствует'
            },

            getFieldName(name) {
	            const header = headers.find(({ value }) => value === name)
                return header ? header.text : name
            },

			getTimelineIcon(eventType) {
				if (eventType === ProgrammingLogType.STACK_UPDATE || eventType === ProgrammingLogType.RTC_UPDATE) {
					return 'mdi-clipboard-pulse-outline'
				} else {
					return 'mdi-mdi-account'
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
