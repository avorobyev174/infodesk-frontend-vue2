<template>

</template>
<script>
    import { mapActions } from "vuex"
    import {formatDate} from "../../Utils";

    export default {
        name: 'ReportStorageMixin',
	    methods: {
		    ...mapActions('storage', [
			    'checkMeterInDB',
		    ]),
	        ...mapActions('storageReports',
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
			        'getMaterialSpentByMonthReport',
                    'getMetersLastLogsReport',
                    'getGroupByTypeAndEmpStorageReport',
                    'getInstallDataByPeriodStorageReport',
		        ]),

	        async showLocationStorageReport(item) {
		        item.loading = true
		        try {
			        const response = await this.getLocationReport()
			        const data = response
				        .map((row) => ({ ...row, meter_location: this.getLocationTitle(row.meter_location) }))
				        .sort((a, b) => b.count - a.count)

			        this.$refs.DataResultReportDialog.open({
				        headers: [ 'Местонахождение', 'Количество' ],
				        dialogTitle: item.description,
				        data
			        })
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        } finally {
			        item.loading = false
		        }
	        },

		    getCurrentOwner (owner)  {
			    switch (owner) {
				    case 999999 : return 'Ремонт(завод)'
				    case 999998: return 'Списан'
				    default: return this.getEmployeeTitleByStaffId(owner)
			    }
		    },

	        async showOwnerStorageReport(item) {
		        item.loading = true
		        try {
			        const response = await this.getOwnerReport()
			        const data = response
				        .map((row) => ({ ...row, current_owner: this.getCurrentOwner(row.current_owner) }))
				        .sort((a, b) => b.count - a.count)

			        this.$refs.DataResultReportDialog.open({
				        headers: [ 'Владелец', 'Количество' ],
				        dialogTitle: item.description,
				        data
			        })
		        } catch (e) {
			        this.showNotificationRequestError(e)
		        } finally {
			        item.loading = false
		        }
	        },

		    async showMeterStorageReport({ type, serialNumber, title }) {
			    try {
				    const meter = await this.checkMeterInDB({ type, serialNumber })
                    if (!meter.guid) {
	                    return this.showNotificationInfo('Счетчик отсутствует в базе данных')
                    }

				    const response = await this.getMeterReport({ type, serialNumber })
				    const data = response.map((row) => {
					    return {
                        	...row,
						    oper_type: this.getOperationTitle(row.oper_type),
						    issuing_person: this.getEmployeeTitleByStaffId(row.issuing_person),
						    accepted_person: this.getEmployeeTitleByStaffId(row.accepted_person),
                        }
				    })

				    this.$refs.DataResultReportDialog.open(
				    	{
                            headers: [ 'Дата', 'Операция', 'Отдающий', 'Принимающий', 'Комментарий' ],
                            dialogTitle: title,
                            data
                        },
                        500,
                        1200
                    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    } finally {
				    this.$refs.DataInputReportDialog.close()
			    }
            },

            async showStoragePeriodReport({ startDate, endDate, title }) {
	            try {
		            const response = await this.getStoragePeriodReport({ startDate, endDate })
		            this.$refs.DataInputReportDialog.close()

		            if (!response.length) {
			            return this.showNotificationInfo('Информация за этот период отсутствует')
		            }

		            const data = response.map((row) => {
			            return {
				            ...row,
				            oper_type: this.getOperationTitle(row.oper_type),
				            type: this.getMeterTypeTitle(row.type),
                            accepted_person: this.getEmployeeTitleByStaffId(row.accepted_person),
                            issuing_person: this.getEmployeeTitleByStaffId(row.issuing_person),
			            }
		            })

		            this.$refs.DataResultReportDialog.open(
			            {
				            headers: [ 'Дата', 'Операция', 'Тип', 'Серийный номер', 'Отдающий', 'Принимающий', 'Комментарий' ],
				            dialogTitle: title,
				            additionalTitle: `${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
				            data
			            },
			            500,
			            1500
		            )
	            } catch (e) {
		            this.showNotificationRequestError(e)
	            }
            },

		    async showLocationByPeriodStorageReport({ startDate, endDate, location, title }) {
			    try {
				    const response = await this.getInOutByPeriodAndLocationReport({ startDate, endDate, location })
				    this.$refs.DataInputReportDialog.close()

				    const countMap = new Map(Object.entries(response))
				    if (!countMap.size) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
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

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Тип ПУ', 'Количество на начало периода', 'Получено', 'Отдано', 'Количество на конец периода' ],
						    dialogTitle: title,
						    additionalTitle:  `${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    500,
					    1000
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
            },

		    async showEmployeeByPeriodStorageReport({ startDate, endDate, empStaffId, title }) {
			    try {
				    const response = await this.getInOutByPeriodAndEmployeeReport({ startDate, endDate, empStaffId })
				    this.$refs.DataInputReportDialog.close()
				    const countMap = new Map(Object.entries(response))

				    if (!countMap.size) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
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

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Тип ПУ', 'Количество на начало периода', 'Получено', 'Отдано', 'Количество на конец периода' ],
						    dialogTitle: title,
						    additionalTitle:  `${ this.getEmployeeTitleByStaffId(empStaffId) } ${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    500,
					    1000
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
		    },

		    async showLocationLogsByPeriodStorageReport({ startDate, endDate, location, title }) {
			    try {
				    const response = await this.getLogsByPeriodAndLocationReport({ startDate, endDate, location })
				    this.$refs.DataInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
				    }

				    const data = response.map((row) => {
					    return {
						    ...row,
						    type: this.getMeterTypeTitle(row.type),
						    oper_type: this.getOperationTitle(row.oper_type),
						    issuing_person: this.getEmployeeTitleByStaffId(row.issuing_person),
						    accepted_person: this.getEmployeeTitleByStaffId(row.accepted_person)
					    }
				    })

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Тип ПУ', 'Серийный номер', 'Дата', 'Тип операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additionalTitle: `${ this.getLocationTitle(location) } ${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
		    },

		    async showEmpLogsByPeriodStorageReport({ startDate, endDate, empStaffId, title }) {
			    try {
				    const response = await this.getLogsByPeriodAndEmpReport({ startDate, endDate, empStaffId })
				    this.$refs.DataInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
				    }

				    const data = response.map((row) => ({
						    ...row,
					        type: this.getMeterTypeTitle(row.type),
					        oper_type: this.getOperationTitle(row.oper_type),
                            issuing_person: this.getEmployeeTitleByStaffId(row.issuing_person),
                            accepted_person: this.getEmployeeTitleByStaffId(row.accepted_person)
					    }))

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Тип ПУ', 'Серийный номер', 'Дата', 'Тип операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additionalTitle:  `${ this.getEmployeeTitleByStaffId(empStaffId) } ${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
		    },

		    async showEmpGroupLogsByPeriodStorageReport({ startDate, endDate, empStaffId, title }) {
			    try {
				    const response = await this.getGroupLogsByPeriodAndEmpReport({ startDate, endDate, empStaffId })
				    this.$refs.DataInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
				    }

				    const data = response.map((row) => ({
					    ...row,
					    type: this.getMeterTypeTitle(row.type),
					    operationType: this.getOperationTitle(row.operationType),
					    issuingPerson: this.getEmployeeTitleByStaffId(row.issuingPerson),
					    acceptedPerson: this.getEmployeeTitleByStaffId(row.acceptedPerson)
				    }))

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Дата', 'Тип ПУ', 'Количество', 'Тип операции', 'Отдающий', 'Принимающий' ],
						    dialogTitle: title,
						    additionalTitle:  `${ this.getEmployeeTitleByStaffId(empStaffId) } ${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
		    },

		    async showCurrentCountByLocationStorageReport({ location, title }) {
			    try {
				    const response = await this.getCurrentCountByLocationReport({ location })
				    if (!response.length) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
				    }

				    const data = response.map((row) => ({
                        ...row,
					    type: this.getMeterTypeTitle(row.type),
					    issuingPerson: this.getEmployeeTitleByStaffId(row.issuingPerson),
					    acceptedPerson: this.getEmployeeTitleByStaffId(row.acceptedPerson),
				    }))

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Тип ПУ', 'Серийный номер', 'Дата операции', 'Отдающий', 'Принимающий', 'Комментарий' ],
						    dialogTitle: title,
						    additionalTitle: `${ this.getLocationTitle(location) }`,
						    data
					    },
					    600,
					    1200
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    } finally {
				    this.$refs.DataInputReportDialog.close()
			    }
            },

            async showRepairAndMaterialStorageReport() {
	            try {
		            const response = await this.getRepairCountAndMaterialReport()
		            const storageResponse = await this.getSpentByYearReport()

		            if (!response.length) {
			            return this.showNotificationInfo('Информация за этот период отсутствует')
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
	                        		const [ isRepaired, isBroken ] = col
			                        html += `<td>${ isRepaired }</td><td>${ isBroken }</td>`
		                        } else {
			                        html += `<td>${ col }</td>`
                                }
	                        })
                        } else {
	                        row.forEach((col, i) => {
		                        if (i === 0) {
			                        html += `<td>${  this.getMeterTypeTitle(col) }</td>`
		                        } else {
			                        if (typeof col === 'object') {
				                        const [ isRepaired, isBroken ] = col
				                        html += `<td>${ isRepaired }</td><td>${ isBroken }</td>`
			                        } else {
				                        html += `<td>${ col }</td>`
			                        }
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

		            this.$refs.DataResultReportDialog.print(repairTableHtml, materialTableHtml, `Отчет по ремонту приборов учета ${ this.formatDate(today) }`)
	            } catch (e) {
		            this.showNotificationRequestError(e)
	            }
            },

		    async showSpentMaterialsByMonthStorageReport({ startDate, endDate, title }) {
			    try {
				    const response = await this.getMaterialSpentByMonthReport({ startDate, endDate })
				    this.$refs.DataInputReportDialog.close()

				    if (!response.length) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
				    }

				    const data = response.map((row) => ({
					    ...row,
					    item_id: this.getMaterialTypeTitle(row.item_id),
				    }))

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Материал', 'Количество' ],
						    dialogTitle: title,
						    additionalTitle: `${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    500,
					    800
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
		    },

		    async showLastLogsStorageReport({ serialNumber, title }) {
			    try {
				    const reportData = await this.getMetersLastLogsReport({ serialNumber })
				    if (!reportData.length) {
					    return this.showNotificationInfo('Информация отсутствует')
				    }

				    const data = reportData.map(({ meter_type, serial_number, meter_location, lastLog }) => [
				    	this.getMeterTypeTitle(meter_type),
					    serial_number,
					    this.formatDate(lastLog.datetime, true),
                        this.getLocationTitle(meter_location),
					    lastLog.comment_field,
                    ])

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Тип', 'Серийный номер', 'Дата', 'Текущее местонахождение', 'Комментарий' ],
						    dialogTitle: title,
						    data
					    },
					    600,
					    800
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    } finally {
				    this.$refs.DataInputReportDialog.close()
			    }
		    },

		    async showGroupByTypeAndEmpStorageReport({ type, startDate, endDate, operType, empStaffId, title }) {
			    try {
				    const reportData = await this.getGroupByTypeAndEmpStorageReport({ type, startDate, endDate, empStaffId, operType })
				    if (!reportData.length) {
					    return this.showNotificationInfo('Информация отсутствует')
				    }
				    const data = reportData.map(({ date, type, count, operationType, issuingPerson, acceptedPerson }) => [
					    date,
					    this.getMeterTypeTitle(type),
					    count,
					    this.getOperationTitle(operationType),
					    this.getEmployeeTitleByStaffId(issuingPerson),
					    this.getEmployeeTitleByStaffId(acceptedPerson)
				    ])

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [ 'Дата', 'Тип', 'Количество', 'Тип операции', 'Отдающий', 'Принимающий' ],
						    dialogTitle: title,
						    data
					    },
					    600,
					    1000
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    } finally {
				    this.$refs.DataInputReportDialog.close()
			    }
		    },

		    async showLastInstallDataByPeriodStorageReport({ startDate, endDate, title }) {
			    try {
				    const meters = await this.getInstallDataByPeriodStorageReport({ startDate, endDate })
				    this.$refs.DataInputReportDialog.close()

				    if (!meters.length) {
					    return this.showNotificationInfo('Информация за этот период отсутствует')
				    }

				    let data = []
				    for (const meter of meters) {
					    let record = []
					    record.push(this.getMeterTypeTitle(meter.type))
					    record.push(meter.serialNumber)
					    record.push(this.formatDate(meter.installData, true))
					    record.push(this.getEmployeeTitleByStaffId(meter.issuingPerson))
                        record.push(this.getEmployeeTitleByStaffId(meter.acceptedPerson))
					    record.push(this.formatDate(meter.lastOperationData))
					    record.push(this.getOperationTitle(meter.lastOperation))
					    record.push(this.getLocationTitle(meter.location))
					    record.push(meter.address)
					    record.push(meter.comment)
					    data.push(record)
				    }

				    this.$refs.DataResultReportDialog.open(
					    {
						    headers: [
                                'Тип ПУ',
                                'Серийный номер',
							    'Дата выдачи в монтаж',
                                'Отдающий',
                                'Принимающий',
							    'Дата последней операции',
							    'Последняя операция',
                                'Текущее местоположение',
                                'Адрес',
                                'Комментарий'
                            ],
						    dialogTitle: title,
						    additionalTitle:  `${ this.formatDate(startDate) } - ${ this.formatDate(endDate) }`,
						    data
					    },
					    500,
					    1500
				    )
			    } catch (e) {
				    this.showNotificationRequestError(e)
			    }
		    },
        }
    }
</script>