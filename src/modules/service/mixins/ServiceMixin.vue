<script>
	import { mapActions, mapGetters, mapState } from "vuex"
    import headers from "../js/assignments-table-headers"
    import menuActions from "../js/assignmets-menu"

	export default {
		name: "ServiceMixin",
		data: () => ({
			headers,
			menuActions,
			selectedHeaders: [],
		}),
		computed: {
			...mapGetters({
				assignments: 'service/getAssignments',
				currentAccountId: 'getAccountId',
				isLogin: 'getIsLogin',
				meterTypes: 'getMeterTypes',
			}),
			...mapState('service', [ 'loading' ]),
			...mapState([ 'colorGreen', 'colorGrey', 'colorBlue', 'colorGold' ]),
		},
		inject: [
			'showNotificationSuccess',
            'showNotificationRequestError'
        ],
		provide: function () {
			return {
				formatDate: this.formatDate,
				getAssignmentEventTypeTitle: this.getAssignmentEventTypeTitle,
				getAccountFullName: this.getAccountFullName,
				getAssignmentCloseEventTypeTitle: this.getAssignmentCloseEventTypeTitle,
				getAssignmentStatusColor: this.getAssignmentStatusColor,
				getAssignmentEventTypeColor: this.getAssignmentEventTypeColor,
				getMeterTypeTitle: this.getMeterTypeTitle,
				getAssignmentStatusTitle: this.getAssignmentStatusTitle,
			}
		},
		mounted() {
			document.onkeydown = (evt) => {
				if (this.$route.name === 'Service' && evt.key === 'Alt') {
					this.getAssignments()
				}
			}
		},
		methods: {
			...mapActions('service', [
				'fetchAssignments',
				'acceptAssignment',
			]),

			getAssignmentStatusColor(status) {
				switch (status) {
					case 1:
					case 4: return this.colorGrey
					case 2: return this.colorBlue
					case 3:
					case 5: return this.colorGreen
				}
			},

			getAssignmentEventTypeColor(status) {
				switch (status) {
					case 1:
					case 5: return this.colorGrey
					case 2: return this.colorBlue
					case 3:
					case 7: return this.colorGreen
					case 4:
					case 6: return this.colorGold
				}
			},
		}
    }
</script>
