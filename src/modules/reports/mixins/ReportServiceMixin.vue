<script>
	import { mapActions } from "vuex"

	export default {
		name: "ReportServiceMixin",
        methods: {
	        ...mapActions('serviceReports', [
                'getAssignmentEventsBySerialNumberReport',
                'getAssignmentEventsByCustomerAddressReport',
            ]),

	        async showAssignmentEventsBySerialNumberReport({ title, type, serialNumber }) {
	        	const headers = [ 'Дата', 'Тип события', 'Автор', 'Описание', 'Причина закрытия' ]
                const getServiceReportData = async () => {
	                const assignmentEvents = await this.getAssignmentEventsBySerialNumberReport({ type, serialNumber })
	                return this.prepareAssignmentEventsReportData(assignmentEvents)
                }
	        	await this.showDataResultReportDialog({
			        dialogTitle: title,
			        additionalTitle: `${ serialNumber }`,
			        headers,
			        getReportDataFunction: getServiceReportData
		        })
	        },

	        async showAssignmentEventsByCustomerAddress({ title, customerAddress }) {
		        const headers = [ 'Дата', 'Тип события', 'Автор', 'Описание', 'Причина закрытия' ]
		        const getServiceReportData = async () => {
			        const assignmentEvents = await this.getAssignmentEventsByCustomerAddressReport({ customerAddress })
			        return this.prepareAssignmentEventsReportData(assignmentEvents)
		        }
		        await this.showDataResultReportDialog({
			        dialogTitle: title,
			        additionalTitle: `${ customerAddress }`,
			        headers,
			        getReportDataFunction: getServiceReportData
                })
	        },

	        prepareAssignmentEventsReportData(assignmentEvents) {
		        return assignmentEvents.map(({ created, type, owner_id, description, close_reason }) => {
			        return [
				        this.formatDate(created, true),
				        this.getAssignmentEventTypeTitle(type),
				        this.getAccountFullName(owner_id),
				        description,
				        this.getAssignmentEventCloseReasonTitle(close_reason)
			        ]
		        })
	        }
        },
	}
</script>
