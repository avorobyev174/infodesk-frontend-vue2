<template>

</template>
<script>
    import { mapActions } from "vuex"
    import LogTableMixin from "../../storage/mixins/LogTableMixin"

    export default {
        name: 'ReportStorageMixin',
	    mixins: [ LogTableMixin ],
        mounted() {
	        this.fetchMeterTypes()
	        this.fetchStorageEmployees()
	        this.fetchMaterialsTypes()
        },
	    methods: {
		    ...mapActions('storage', [
			    'fetchStorageEmployees',
			    'fetchMeterTypes',
                'checkMeterInDB',
                'fetchMaterialsTypes',
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
			        'getGroupLogsByPeriodAndEmpReport',
			        'getCurrentCountByLocationReport',
			        'getRepairCountAndMaterialReport',
			        'getSpentByYearReport',
		        ]),

		    async showStorageReport(report) {
			    switch (report.id) {
				    case 3: return this.showMeterStorageReport(report)
				    case 4: return this.showStoragePeriodReport(report)
				    case 5: return this.showLocationByPeriodStorageReport(report)
				    case 6: return this.showEmployeeByPeriodStorageReport(report)
				    case 7: return this.showLocationLogsByPeriodStorageReport(report)
				    case 8: return this.showEmpLogsByPeriodStorageReport(report)
				    case 9: return this.showEmpGroupLogsByPeriodStorageReport(report)
				    case 10: return this.showCurrentCountByLocationStorageReport(report)
				    case 11: return this.showRepairAndMaterialStorageReport(report)
			    }
		    },

	        async showLocationStorageReport(item) {
		        item.loading = true
		        try {
			        const response = await this.getLocationReport()
			        this.$refs.storageInputReportDialog.close()
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
			        this.$refs.storageInputReportDialog.close()
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
				    this.$refs.storageInputReportDialog.close()

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
		            this.$refs.storageInputReportDialog.close()

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

		            this.$refs.resultShowReportDialog.open(
			            {
				            titles: [ 'Дата', 'Операция', 'Серийный номер', 'Отдающий', 'Принимающий', 'Комментарий' ],
				            dialogTitle: title,
				            additional: `${ startDate } - ${ endDate }`,
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
				    this.$refs.storageInputReportDialog.close()

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
				    this.$refs.storageInputReportDialog.close()
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

				    this.$refs.storageInputReportDialog.close()

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
				    this.$refs.storageInputReportDialog.close()

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

				    this.$refs.storageInputReportDialog.close()

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Серийный номер', 'Дата', 'Тип операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additional: `${ this.getLocationTitle(location) } ${ startDate } - ${ endDate }`,
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
				    this.$refs.storageInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    const data = response.map((row) => ({
						    ...row,
						    TYPE: this.getMeterTypeTitle(row.TYPE),
						    OPER_TYPE: this.getOperationTitle(row.OPER_TYPE),
						    ISSUING_PERSON: this.getEmployeeTitleByStaffId(row.ISSUING_PERSON),
						    ACCEPTED_PERSON: this.getEmployeeTitleByStaffId(row.ACCEPTED_PERSON)
					    }))

				    this.$refs.storageInputReportDialog.close()

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Серийный номер', 'Дата', 'Тип операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additional:  `${ this.getEmployeeTitleByStaffId(empStaffId) } ${ startDate } - ${ endDate }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
		    },

		    async showEmpGroupLogsByPeriodStorageReport({ startDate, endDate, empStaffId, title }) {
			    try {
				    const response = await this.getGroupLogsByPeriodAndEmpReport({ startDate, endDate, empStaffId })
				    this.$refs.storageInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    const data = response.map((row) => ({
					    ...row,
					    type: this.getMeterTypeTitle(row.type),
					    operationType: this.getOperationTitle(row.operationType),
					    issuingPerson: this.getEmployeeTitleByStaffId(row.issuingPerson),
					    acceptedPerson: this.getEmployeeTitleByStaffId(row.acceptedPerson)
				    }))

				    this.$refs.storageInputReportDialog.close()

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Дата', 'Тип ПУ', 'Количество', 'Тип операции', 'Отдающий', 'Принимающий' ],
						    dialogTitle: title,
						    additional:  `${ this.getEmployeeTitleByStaffId(empStaffId) } ${ startDate } - ${ endDate }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
		    },

		    async showCurrentCountByLocationStorageReport({ startDate, endDate, location, title }) {
			    try {
				    const response = await this.getCurrentCountByLocationReport({ startDate, endDate, location })
				    this.$refs.storageInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
				    }

				    const data = response.map((row) => ({
					    ...row,
					    type: this.getMeterTypeTitle(row.type),
					    issuingPerson: this.getEmployeeTitleByStaffId(row.issuingPerson),
					    acceptedPerson: this.getEmployeeTitleByStaffId(row.acceptedPerson)
				    }))

				    console.log(data[0])

				    this.$refs.storageInputReportDialog.close()

				    this.$refs.resultShowReportDialog.open(
					    {
						    titles: [ 'Тип ПУ', 'Серийный номер', 'Дата прихода', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additional: `${ this.getLocationTitle(location) } ${ startDate } - ${ endDate }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
			    }
            },

            async showRepairAndMaterialStorageReport() {
	            try {
		            const response = await this.getRepairCountAndMaterialReport()
		            const storageResponse = await this.getSpentByYearReport()

		            if (!response.length) {
			            return this.showNotification(`Информация за этот период отсутствует`, this.colorBlue)
		            }

		            let months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                                                "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]

                    const today = new Date()
		            const currentMonth = today.getMonth() + 1
		            months = months.slice(0, currentMonth)

                    let repairTableHtml = '<table><thead><tr><th width="220px" rowspan="2">Типы</th>'

		            months.forEach((month) => repairTableHtml += '<th colspan="2">' + month + '</th>')
                    repairTableHtml += '<th colspan="2" >Всего</th>' +
	                         '<th width="50px" rowspan="2">%</th></tr><tr>'
		            months.forEach((month) => repairTableHtml += '<th width="90px">отремонти<br>ровано</th><th width="30px">нет</th>')
		            repairTableHtml += '<th width="90px">отремонти<br>ровано</th><th width="30px">нет</th></tr></thead><tbody>'

		            repairTableHtml += response.reduce((html, row, i, arr) => {
			            html += '<tr>'
                        if (i === arr.length - 1) {
	                        html += `<td>Итого</td>`
	                        row.forEach((col) => {
	                        	if (typeof col === 'object') {
			                        html += `<td>${col[0]}</td><td>${col[1]}</td>`
		                        } else {
			                        html += `<td>${ col }</td>`
                                }
	                        })
                        } else {
	                        row.forEach((col, i) => {
		                        if (i === 0) {
			                        html += `<td>${  this.getMeterTypeTitle(col) }</td>`
		                        } else {
		                        	typeof col === 'object'
			                            ? html += `<td>${ col[0] }</td><td>${ col[1] }</td>`
                                        : html += `<td>${ col }</td>`
		                        }
	                        })
                        }

			            html += '</tr>'
                        return html
		            }, '')
		            repairTableHtml += '</tbody>'

		            let materialTableHtml = '<table style="margin-top: 20px"><thead><tr><th width="220px" rowspan="2">Использованные материалы</th>' +
			            '<th>Количество за ' + today.getFullYear() + ' год</th>' +
			            '<th>Склад материалов</th></tr></thead><tbody>'

		            materialTableHtml += storageResponse.reduce((html, row) => {
			            html += '<tr>'
			            row.forEach((col, i) => {
				            if (i === 0) {
					            html += `<td>${  this.getMaterialTypeTitle(col) }</td>`
				            } else {
                               html += `<td>${ col }</td>`
				            }
			            })
			            html += '</tr>'
			            return html
                    }, '')
		            materialTableHtml += '</tbody>'

		            this.$refs.resultShowReportDialog.print(repairTableHtml, materialTableHtml, `Отчет по ремонту приборов учета ${ this.dateFormat(today) }`)

	            } catch (e) {
		            this.showNotificationError(`Ошибка при выполнении отчета: ${ e.message }`, e)
	            }
            }
        }
    }
</script>