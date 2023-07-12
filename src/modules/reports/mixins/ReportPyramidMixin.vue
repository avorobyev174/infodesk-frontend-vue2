<script>
	import { mapActions } from "vuex"

	export default {
		name: "ReportAlphaMixin",
        methods: {
	        ...mapActions('reports', [
		        'getCountByAddressReport',
		        'getDataByNotInPyramidReport',
		        'getNonActiveInPyramidReport',
		        'getLoadedPyramidCountByCustomerAddressReport',
            ]),

	        async showPyramidLoadedByCustomerAddressReport(item) {
		        const executeAndSaveFunction = async () => {
			        const reportData = await this.getLoadedPyramidCountByCustomerAddressReport()
			        const dataArray = this.preparePyramidLoadedByCustomerAddressReportData(reportData)
			        dataArray.unshift( [ '', '', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция',
				        'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция', 'интеграция' ])
			        dataArray.unshift([ 'п/п', 'Адрес МКД', 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август',
				        'сентябрь',	'октябрь', 'ноябрь', 'декабрь' ])

			        this.saveDataArrayToExcelFile(
				        dataArray,
				        'Интеграция',
				        [ { width: 10 }, { width: 40 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
                          { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
                          { width: 15 }, { width: 15 } ],
				        'pyramid-loaded-group-by-customer-address-report'
			        )
		        }

		        await this.executeAndSaveReport(
			        item,
			        executeAndSaveFunction,
			        this.showNotificationRequestError
		        )
	        },

	        async showNotInPyramidReport(item) {
		        const executeAndSaveFunction = async () => {
			        const reportData = await this.getDataByNotInPyramidReport()
			        const dataArray = this.prepareNotInPyramidReportData(reportData)
			        dataArray.unshift( [ 'Серийный номер', 'Тип', 'Принадлежность', 'Сим карта', 'Дата регистрации', 'На складе' ])

			        this.saveDataArrayToExcelFile(
				        dataArray,
				        'Не загруженные',
				        [ { width: 20 }, { width: 35 }, { width: 20 }, { width: 15 }, { width: 20 }, { width: 10 } ],
				        'pyramid-not-loaded-report'
			        )
		        }

		        await this.executeAndSaveReport(
			        item,
			        executeAndSaveFunction,
			        this.showNotificationRequestError
		        )
	        },

	        async showNonActiveInPyramidReport({ title, days }) {
		        const headers = [ 'Серийный номер', 'IP', 'Порт', 'Сим карта', 'Адрес', 'Дата последнего опроса' ]
		        const getPyramidReportData = async () => {
			        const reportData = await this.getNonActiveInPyramidReport(days)
			        return this.prepareNonActiveInPyramidReportData(reportData)
		        }
		        await this.showDataResultReportDialog({
			        dialogTitle: title,
			        additionalTitle: `количество дней без ответа - ${ days }`,
			        headers,
			        getReportDataFunction: getPyramidReportData
		        })
	        },

	        async showPyramidLoadedByAddressReport({ title, sort }) {
		        const headers = [ 'п/п', 'Принадлежность', 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
                                    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ]

		        const getPyramidReportData = async () => {
			        const reportData = await this.getCountByAddressReport(sort?.value)
			        return this.preparePyramidLoadedByAddressReportData(reportData)
		        }
		        await this.showDataResultReportDialog({
			        dialogTitle: title,
			        additionalTitle: `выборка по - ${ sort?.title?.toLowerCase() }`,
			        headers,
			        getReportDataFunction: getPyramidReportData
		        },
                1000,
                1400)
	        },

	        preparePyramidLoadedByCustomerAddressReportData(data) {
		        return data.map((meter, i) => {
			        const row = []
			        row.length = 14
			        row[0] = i + 1
			        row[1] = meter.address
			        if (meter.data.length) {
				        meter.data.forEach((dataMonth) => {
					        const date = new Date(dataMonth.month_loaded)
					        const month = date.getMonth() + 1
					        row[ month + 1 ] = dataMonth.count
				        })
			        }
			        return row
		        })
	        },

	        prepareNotInPyramidReportData(data) {
		        return data.map(({ serial_number, name, address, phone, created, inStorage }) => {
			        return [
				        serial_number,
				        name,
				        address,
				        phone,
				        this.formatDate(created),
				        inStorage ? 'да' : 'нет'
			        ]
		        })
	        },

	        prepareNonActiveInPyramidReportData(data) {
		        return data.map(({ serial_number, ip_address, port, phone, address, last_date_time }) => {
			        return [
				        serial_number,
				        this.getIpAddressTitle(ip_address),
				        port,
				        phone,
				        address,
				        this.formatDate(last_date_time)
			        ]
		        })
	        },

	        preparePyramidLoadedByAddressReportData(data) {
		        const modifiedData = data.map(({ address, months }, i) => {
			        const row = []
			        row.length = 14
			        row[0] = i + 1
			        row[1] = address ? address : 'отсутствует'
			        if (months.length) {
				        months.forEach((month) => {
					        row[ month.month + 1 ] = month.count
				        })
			        }
			        return row
		        })

		        const monthTotal = []
		        for (let i = 0; i < 12; i++) {
			        const sum = modifiedData.reduce((acc, cur) => {
				        return acc += cur[ i + 2 ] ? parseInt(cur[ i + 2 ]) : 0
			        }, 0)
			        monthTotal.push(sum)
		        }
		        monthTotal.unshift('Итого')
		        monthTotal.unshift(modifiedData.length + 1)
		        return modifiedData.concat([ monthTotal ])
	        },
        }
	}
</script>
