<script>
	import { mapActions } from "vuex"
	import {AssignmentEventType} from "../../../const";

	export default {
		name: "ReportServiceMixin",
        methods: {
	        ...mapActions('serviceReports', [
                'getAssignmentEventsBySerialNumberReport',
                'getAssignmentEventsByCustomerAddressReport',
                'getAssignmentGroupByStatusReport',
                'getAssignmentGroupByStatusAndOwnerReport',
                'getAssignmentEventsGroupByCloseReasonReport',
            ]),

	        async showAssignmentEventsBySerialNumberReport({ title, type, serialNumber }) {
	        	const headers = [ 'Дата', 'Тип события', 'Автор', 'Описание', 'Причина закрытия', 'Адрес' ]
                const getServiceReportData = async () => {
	                const assignmentEvents = await this.getAssignmentEventsBySerialNumberReport({ serialNumber })
	                return this.prepareAssignmentEventsBySerialNumberReportData(assignmentEvents)
                }
	        	await this.showDataResultReportDialog({
			        dialogTitle: title,
			        additionalTitle: `${ this.getMeterTypeTitle(type) } №${ serialNumber }`,
			        headers,
			        getReportDataFunction: getServiceReportData
		        }, null, 1200)
	        },

	        async showAssignmentEventsByCustomerAddressReport({ title, customerAddress }) {
		        const headers = [ 'Дата', 'Тип события', 'Автор', 'Описание', 'Причина закрытия' ]
		        const getServiceReportData = async () => {
			        const assignmentEvents = await this.getAssignmentEventsByCustomerAddressReport({ customerAddress })
			        return this.prepareAssignmentEventsByCustomerAddressReportData(assignmentEvents)
		        }
		        await this.showDataResultReportDialog({
			        dialogTitle: title,
			        additionalTitle: `${ customerAddress }`,
			        headers,
			        getReportDataFunction: getServiceReportData
		        },null, 1200)
	        },

	        async showAssignmentGroupByStatusReport({ title, startDate, endDate }) {
		        const assignmentEvents = await this.getAssignmentGroupByStatusReport({ startDate, endDate })
		        const { modifiedEventsData, closeReasonsData } = this.prepareAssignmentGroupByStatusData(assignmentEvents)
		        this.$refs.DataInputReportDialog.close()
		        const { assignmentEventsTableHtml, closeReasonsTableHtml } = this.createAssignmentGroupReportTables(modifiedEventsData, closeReasonsData)

		        this.$refs.DataResultReportDialog.print(
		        	assignmentEventsTableHtml,
                    closeReasonsTableHtml,
                    `${ title }\n${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`
                )
	        },

	        async showAssignmentGroupByStatusAndOwnerReport({ title, startDate, endDate, employee }) {
		        const assignmentEvents = await this.getAssignmentGroupByStatusAndOwnerReport({ startDate, endDate, accId: employee.value })
		        const { modifiedEventsData, closeReasonsData } = this.prepareAssignmentGroupByStatusData(assignmentEvents)
		        this.$refs.DataInputReportDialog.close()
		        const { assignmentEventsTableHtml, closeReasonsTableHtml } = this.createAssignmentGroupReportTables(modifiedEventsData, closeReasonsData)

		        this.$refs.DataResultReportDialog.print(
			        assignmentEventsTableHtml,
			        closeReasonsTableHtml,
			        `${ title }\n${ employee.title }\n${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`
		        )
	        },

	        async showAssignmentEventsGroupByCloseReasonReport(item) {

		        item.loading = true
		        try {
			        const reportData = await this.getAssignmentEventsGroupByCloseReasonReport()
			        const data = reportData.map(({ close_reason, count}) => [
			            this.getAssignmentEventCloseReasonTitle(close_reason),
                        count
			        ])

			        this.$refs.DataResultReportDialog.open({
				        headers: [ 'Причина закрытия', 'Количество' ],
				        dialogTitle: item.description,
				        data
			        })
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        } finally {
			        item.loading = false
		        }
	        },

	        prepareAssignmentEventsBySerialNumberReportData(assignmentEvents) {
		        return assignmentEvents.map(({ created, type, owner_id, description, close_reason, customer_address }) => [
                    this.formatDate(created, true),
                    this.getAssignmentEventTypeTitle(type),
                    this.getAccountFullName(owner_id),
                    description,
                    this.getAssignmentEventCloseReasonTitle(close_reason),
                    customer_address?.slice(16)
                ])
	        },

	        prepareAssignmentEventsByCustomerAddressReportData(assignmentEvents) {
		        return assignmentEvents.map(({ created, type, owner_id, description, close_reason }) => {
			        return [
				        this.formatDate(created, true),
				        this.getAssignmentEventTypeTitle(type),
				        this.getAccountFullName(owner_id),
				        description,
				        this.getAssignmentEventCloseReasonTitle(close_reason)
			        ]
		        })
	        },

	        prepareAssignmentGroupByStatusData(data) {
	        	const closedAssignmentEvents = data.filter((assignmentEvent) => assignmentEvent.type === AssignmentEventType.CLOSED)
	        	const otherAssignmentEvents = data.filter((assignmentEvent) => assignmentEvent.type !== AssignmentEventType.CLOSED)

		        const modifiedEventsData = otherAssignmentEvents
                    .map(({ type, count }) => [
                        this.getAssignmentEventTypeTitle(type),
                        count
                    ])
                const totalClosedEvents = closedAssignmentEvents.reduce((totalCount, { count }) => totalCount += +count, 0)
		        modifiedEventsData.push([ this.getAssignmentEventTypeTitle(AssignmentEventType.CLOSED), totalClosedEvents ])

		        const closeReasonsData = closedAssignmentEvents
			        .sort((a, b) => b.count - a.count)
                    .map(({ close_reason, count }) => [
                        this.getAssignmentEventCloseReasonTitle(close_reason),
                        count,
                        ((count / totalClosedEvents) * 100).toFixed(2)
                    ])


		        console.log(closeReasonsData)

                return { modifiedEventsData, closeReasonsData }
	        },

	        createAssignmentGroupReportTables(modifiedEventsData, closeReasonsData) {
		        let assignmentEventsTableHtml = '<table style="margin-top: 20px"><thead><tr><th width="220px" rowspan="2">Тип события</th>' +
			        '<th>Количество</th></tr></thead><tbody>'

		        assignmentEventsTableHtml += modifiedEventsData.reduce((html, row) => {
			        html += '<tr>'
			        row.forEach((col, i) => html += `<td>${ col }</td>`)
			        html += '</tr>'
			        return html
		        }, '')
		        assignmentEventsTableHtml += '</tbody>'

		        let closeReasonsTableHtml = '<table style="margin-top: 20px"><thead><tr><th width="220px" rowspan="2">Причина закрытия</th>' +
			        '<th>Количество</th><th>%</th></tr></thead><tbody>'

		        closeReasonsTableHtml += closeReasonsData.reduce((html, row) => {
			        html += '<tr>'
			        row.forEach((col, i) => html += `<td>${ col }</td>`)
			        html += '</tr>'
			        return html
		        }, '')
		        closeReasonsTableHtml += '</tbody>'

                return { assignmentEventsTableHtml, closeReasonsTableHtml }
            }
        },
	}
</script>
