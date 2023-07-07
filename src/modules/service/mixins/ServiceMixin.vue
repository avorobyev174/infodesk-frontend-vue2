<script>
	import { mapActions, mapGetters, mapState } from "vuex"
    import headers from "../js/assignments-table-headers"
    import menuActions from "../js/assignmets-menu"
    import { AssignmentEventType, AssignmentStatus } from "../../../const";

	export default {
		name: "ServiceMixin",
		data: () => ({
			headers,
			menuActions,
			selectedHeaders: [],
			declineDialogModel: false
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
            'showNotificationRequestError',
            'showNotificationInfo'
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
				'acceptOrDeclineAssignment',
				'declineAssignment',
			]),

			getAssignmentStatusColor(status) {
				switch (status) {
					case AssignmentStatus.REGISTERED:
					case AssignmentStatus.RE_REGISTERED: return this.colorGrey
					case AssignmentStatus.IN_WORK: return this.colorBlue
					case AssignmentStatus.CLOSED:
					case AssignmentStatus.CLOSED_AUTO: return this.colorGreen
				}
			},

			getAssignmentEventTypeColor(status) {
				switch (status) {
					case AssignmentEventType.REGISTERED:
					case AssignmentEventType.RE_REGISTRED: return this.colorGrey
					case AssignmentEventType.IN_WORK:
					case AssignmentEventType.DECLINE: return this.colorBlue
					case AssignmentEventType.CLOSE:
					case AssignmentEventType.CLOSE_AUTO: return this.colorGreen
					case AssignmentEventType.ACTION:
					case AssignmentEventType.SYSTEM_ACTION: return this.colorGold
				}
			},
		}
    }
</script>
