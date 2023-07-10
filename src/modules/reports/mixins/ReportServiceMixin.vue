<script>
	import { mapActions } from "vuex"
	import DictionaryMixin from "../../mixins/DictionaryMixin"

	export default {
		name: "ReportServiceMixin",
        methods: {
	        ...mapActions('serviceReports', [
                'getAssignmentEventsBySerialNumberReport',
            ]),

	        async showAssignmentEventsBySerialNumberReport({ id, title, type, serialNumber }) {
	        	const reportHeaders = [ 'Дата', 'Тип события', 'Автор', 'Описание', 'Причина закрытия' ]
                const getServiceReportData = async () => {
	                const assignmentEvents = await this.getAssignmentEventsBySerialNumberReport({ type, serialNumber })
	                let data = []
	                for (const { created, type, owner_id, description, close_reason } of assignmentEvents) {
		                const record = []
		                record.push(this.formatDate(created, true))
		                record.push(this.getAssignmentEventTypeTitle(type))
		                record.push(this.getAccountFullName(owner_id))
		                record.push(description)
		                record.push(this.getAssignmentEventCloseReasonTitle(close_reason))
		                data.push(record)
	                }
	                return data
                }
	        	await this.showDataResultReportDialog(title, reportHeaders, getServiceReportData)
	        },
        }
	}
</script>
