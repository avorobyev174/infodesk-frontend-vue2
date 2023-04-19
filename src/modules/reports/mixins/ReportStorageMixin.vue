<template>

</template>
<script>
    import { mapActions } from "vuex"
    import LogTableMixin from "../../storage/components/LogTableMixin"

    export default {
        name: 'ReportStorageMixin',
	    mixins: [ LogTableMixin ],
        mounted() {
	        this.fetchMeterTypes()
	        this.fetchStorageEmployees()
        },
	    methods: {
		    ...mapActions('storage', [
			    'fetchStorageEmployees',
			    'fetchMeterTypes',
                'checkMeterInDB'
		    ]),
	        ...mapActions('reports',
		        [
			        'getLocationReport',
			        'getOwnerReport',
			        'getMeterReport',
			        'getStoragePeriodReport',
			        'getInOutByPeriodAndLocationReport',
			        'getInOutByPeriodAndEmployeeReport',
			        'getLogsByPeriodAndLocationReport',
			        'getLogsByPeriodAndEmpReport',
		        ]),

		    async showStorageReport(report) {
			    console.log(report)
			    switch (report.id) {
				    case 3: return this.showMeterStorageReport(report)
				    case 4: return this.showStoragePeriodReport(report)
				    case 5: return this.showLocationByPeriodStorageReport(report)
				    case 6: return this.showEmployeeByPeriodStorageReport(report)
				    case 7: return this.showLocationLogsByPeriodStorageReport(report)
				    case 8: return this.showEmpLogsByPeriodStorageReport(report)
			    }
		    },

	        async showLocationStorageReport(item) {
		        item.loading = true
		        try {
			        const response = await this.getLocationReport()
			        const data = response
				        .map((row) => ({ ...row, METER_LOCATION: this.getLocationTitle(row.METER_LOCATION) }))
				        .sort((a, b) => b.COUNT - a.COUNT)

			        this.$refs.resultShowReportDialog.open({
				        titles: ['Местонахождение', 'Количество'],
				        dialogTitle: item.description,
				        data
			        })
		        } catch (e) {
			        this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
		        } finally {
			        item.loading = false
		        }
	        },

		    getCurrentOwner (owner)  {
			    switch (owner) {
				    case 999999999999999 : return 'Ремонт(завод)'
				    case 999999999999998: return 'Списан'
				    default: return this.getEmployeeTitleByStaffId(owner)
			    }
		    },

	        async showOwnerStorageReport(item) {
		        item.loading = true
		        try {
			        const response = await this.getOwnerReport()
			        const data = response
				        .map((row) => ({ ...row, CURRENT_OWNER: this.getCurrentOwner(row.CURRENT_OWNER) }))
				        .sort((a, b) => b.COUNT - a.COUNT)

			        this.$refs.resultShowReportDialog.open({
				        titles: ['Владелец', 'Количество'],
				        dialogTitle: item.description,
				        data
			        })
		        } catch ({ message }) {
			        this.showNotificationError(`Ошибка при выполнении отчета: ${ message }`)
		        } finally {
			        item.loading = false
		        }
	        },

		    async showMeterStorageReport({ type, serialNumber, title }) {
			    try {
				    const meter = await this.checkMeterInDB({ type, serialNumber })
                    if (!meter.length) {
	                    return this.showNotification(`Счетчик отсутсвтвует в базе данных`, this.colorBlue)
                    }

				    const response = await this.getMeterReport({ type, serialNumber })
				    const data = response.map((row) => {
                        let updateField = ''
                        if ([1, 2, 10].includes(row.OPER_TYPE)) {
	                        const updFields = this.parseUpdateCustomField(row.UPDATE_FIELD)
                            if (updFields.length) {
	                            updateField = updFields.map((field) => field.value).join(' ')
                            }
                        } else {
	                        updateField = this.parseUpdateField(row.UPDATE_FIELD)
                        }
					    return {
                        	...row,
                            OPER_TYPE: this.getOperationTitle(row.OPER_TYPE),
						    UPDATE_FIELD: updateField
                        }
				    })

				    this.$refs.resultShowReportDialog.open(
				    	{
                            titles: [ 'Дата', 'Операция', 'Отдающий', 'Принимающий', 'Комментарий', 'Доп. информация' ],
                            dialogTitle: title,
                            data
                        },
                        500,
                        1000
                    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
            },

            async showStoragePeriodReport({ startDate, endDate, title }) {
	            try {
		            const response = await this.getStoragePeriodReport({ startDate, endDate })

		            if (!response.length) {
			            return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
		            }

		            const data = response.map((row) => {
			            return {
				            ...row,
				            OPER_TYPE: this.getOperationTitle(row.OPER_TYPE),
                            ACCEPTED_PERSON: this.getEmployeeTitleByStaffId(row.ACCEPTED_PERSON),
                            ISSUING_PERSON: this.getEmployeeTitleByStaffId(row.ISSUING_PERSON),
			            }
		            })

		            console.log(data)
		            this.$refs.resultShowReportDialog.open(
			            {
				            titles: [ 'Дата', 'Операция', 'Серийный номер', 'Отдающий', 'Принимающий', 'Комментарий' ],
				            dialogTitle: title,
				            data
			            },
			            500,
			            1000
		            )
	            } catch (e) {
		            this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
	            }
            },

		    async showLocationByPeriodStorageReport({ startDate, endDate, location, title }) {
			    try {
				    const response = await this.getInOutByPeriodAndLocationReport({ startDate, endDate, location })

				    const countMap = new Map(Object.entries(response))
				    if (!countMap.size) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    let data = []
				    for (const entry of countMap.entries()) {
					    let record = []
					    const [ type, count ] = entry
					    record.push(this.getMeterTypeTitle(type))
					    record.push(count.startDateCount ? count.startDateCount : 0)
					    record.push(count.comingCount ? count.comingCount : 0)
					    record.push(count.leaveCount ? count.leaveCount : 0)
					    record.push(count.endDateCount ? count.endDateCount : 0)
					    data.push(record)
				    }

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Количество на начало периода', 'Получено', 'Отдано', 'Количество на конец периода' ],
						    dialogTitle: title,
						    additional:  `${ startDate } - ${ endDate }`,
						    data
					    },
					    500,
					    1000
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
            },

		    async showEmployeeByPeriodStorageReport({ startDate, endDate, empStaffId, title }) {
			    try {
				    const response = await this.getInOutByPeriodAndEmployeeReport({ startDate, endDate, empStaffId })

				    const countMap = new Map(Object.entries(response))
				    if (!countMap.size) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    let data = []
				    for (const entry of countMap.entries()) {
					    let record = []
					    const [ type, count ] = entry
					    record.push(this.getMeterTypeTitle(type))
					    record.push(count.startDateCount ? count.startDateCount : 0)
					    record.push(count.comingCount ? count.comingCount : 0)
					    record.push(count.leaveCount ? count.leaveCount : 0)
					    record.push(count.endDateCount ? count.endDateCount : 0)
					    data.push(record)
				    }

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Количество на начало периода', 'Получено', 'Отдано', 'Количество на конец периода' ],
						    dialogTitle: title,
						    additional:  `${ this.getEmployeeTitleByStaffId(empStaffId) } ${ startDate } - ${ endDate }`,
						    data
					    },
					    500,
					    1000
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
		    },

		    async showLocationLogsByPeriodStorageReport({ startDate, endDate, location, title }) {
			    try {
				    const response = await this.getLogsByPeriodAndLocationReport({ startDate, endDate, location })

				    if (!response.length) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    const data = response.map((row) => {
					    return {
						    ...row,
						    TYPE: this.getMeterTypeTitle(row.TYPE),
						    OPER_TYPE: this.getOperationTitle(row.OPER_TYPE),
						    ISSUING_PERSON: this.getEmployeeTitleByStaffId(row.ISSUING_PERSON),
						    ACCEPTED_PERSON: this.getEmployeeTitleByStaffId(row.ACCEPTED_PERSON)
					    }
				    })

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Серийный номер', 'Дата', 'Тип операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additional:  `${ startDate } - ${ endDate }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
		    },

		    async showEmpLogsByPeriodStorageReport({ startDate, endDate, empStaffId, title }) {
			    try {
				    const response = await this.getLogsByPeriodAndEmpReport({ startDate, endDate, empStaffId })

				    if (!response.length) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    const data = response.map((row) =>
                        ({
						    ...row,
						    TYPE: this.getMeterTypeTitle(row.TYPE),
						    OPER_TYPE: this.getOperationTitle(row.OPER_TYPE),
						    ISSUING_PERSON: this.getEmployeeTitleByStaffId(row.ISSUING_PERSON),
						    ACCEPTED_PERSON: this.getEmployeeTitleByStaffId(row.ACCEPTED_PERSON)
					    }))


				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Серийный номер', 'Дата', 'Тип операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additional:  `${ startDate } - ${ endDate }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
		    },
        }
    }
</script>