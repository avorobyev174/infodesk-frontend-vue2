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
                <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
                <v-list-item-title>Алексей В.</v-list-item-title>
                <v-list-item-subtitle>Исполнитель</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-timeline align-top dense>
            <v-timeline-item
                v-for="(year, i) in events"
                :key="i"
                :color="colorGrey"
                small
            >
                <div class="">
                    <p :class="`mb-4 ${year.color}--text`">
                        Lorem ipsum
                    </p>
                    <div class="event-text">
                        Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.
                    </div>
                </div>
            </v-timeline-item>
        </v-timeline>
        <v-btn
            absolute
            bottom
            color="primary"
            right
            fab
            class="add-event-button"
        >
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-navigation-drawer>
</template>

<script>
	import { mapActions, mapState } from "vuex"

	export default {
		name: "EventList",
		data: () => ({
			eventListModel: null,
            item: {},
			events: [],
		}),
        computed: {
	        ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue', 'colorGold' ]),
        },
		methods: {
			...mapActions('service', [
				'fetchAssignmentEvents',
			]),

			async open({ item }, accId) {
				this.item = item
                this.events = await this.fetchAssignmentEvents(item.id)
				this.eventListModel = true
			}
		}
	}
</script>

<style scoped>
    .add-event-button {
        bottom: 20px !important;
        right: 40px !important;
    }

    .event-text {
        font-size: 14px;
    }
</style>