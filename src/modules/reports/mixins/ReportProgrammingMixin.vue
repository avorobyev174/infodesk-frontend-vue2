<script>
	import { mapActions } from "vuex"

	export default {
		name: "ReportProgrammingMixin",
        methods: {
	        ...mapActions('reports', [
		        'getMeterFromRepairToStorageCountReport',
		        'getRotecMeterReport',
            ]),

	        async showRotecReport(item) {
		        const executeAndSaveFunction = async () => {
			        const reportData = await this.getRotecMeterReport()
			        const dataArray = this.prepareRotecReportData(reportData)

			        this.saveDataArrayToExcelFile(
				        dataArray,
				        'Счетчики РОТЕК',
				        [ { width: 100 } ],
				        'rotec-data-report'
			        )
		        }

		        await this.executeAndSaveReport(
			        item,
			        executeAndSaveFunction,
			        this.showNotificationRequestError
		        )
	        },

	        async showMeterFromRepairToStorageCountReport(item) {
		        const executeAndSaveFunction = async () => {
			        const reportData = await this.getMeterFromRepairToStorageCountReport()
			        const { dataArray, workSheetCols } = this.prepareMeterFromRepairToStorageCountReportData(reportData)

			        this.saveDataArrayToExcelFile(
				        dataArray,
				        'Отчет по движению уит - склад',
				        workSheetCols,
				        'uit-from-storage-report'
			        )
		        }

		        await this.executeAndSaveReport(
			        item,
			        executeAndSaveFunction,
			        this.showNotificationRequestError
		        )
	        },

	        prepareRotecReportData(data) {
		        return data.sort((a, b) => a.port - b.port)
			        .map(({ serial_number, ip_address, port }) => [
			        	`${ serial_number }, ${ this.getIpAddressTitle(ip_address) }, ${ port }`
                    ])
	        },

	        prepareMeterFromRepairToStorageCountReportData(data) {
		        const modifiedData = data.map(({ serial_number, meter_type, type_name, date }) => {
			        return {
				        serialNumber: serial_number,
				        type: meter_type,
				        typeTitle: type_name,
				        date: this.formatDate(date)
			        }
		        })

                const dataArray = []
		        const groupMeterMap = new Map()
		        modifiedData.forEach((meter) => {
			        groupMeterMap.get(meter.typeTitle)
				        ? groupMeterMap.set(meter.typeTitle, groupMeterMap.get(meter.typeTitle) + 1)
				        : groupMeterMap.set(meter.typeTitle, 1)
		        })

		        dataArray.push([ 'Тип счетчика', 'Количество на складе в данный момент' ]);
                [ ...groupMeterMap.entries() ].forEach((entry) => {
	                dataArray.push([ entry[0], entry[1] ])
		        })
		        dataArray.push(['Всего', [ ...groupMeterMap.values() ].reduce((prev, curr) => prev + curr, 0)])
		        dataArray.push([])
		        dataArray.push([])

		        const typeHeaders = [];
		        [ ...groupMeterMap.keys() ].forEach((key) => typeHeaders.push(key))

		        const headers = [ ...typeHeaders ]
		        headers.unshift('Дата')
		        headers.push('Всего')

		        let dateMeterMap = new Map()
		        modifiedData.forEach((meter) => {
			        if (dateMeterMap.get(meter.date)) {
				        const typeMap = dateMeterMap.get(meter.date)
				        typeMap.get(meter.typeTitle)
					        ? typeMap.set(meter.typeTitle, typeMap.get(meter.typeTitle) + 1)
					        : typeMap.set(meter.typeTitle, 1)
			        } else dateMeterMap.set(meter.date, new Map([[ meter.typeTitle, 1]]))
		        })

		        //сортировка
		        let dateMapEntries = [ ...dateMeterMap.entries() ].sort(this.sortDates)

		        dataArray.push(headers)

		        dateMapEntries.forEach((entry) => {
			        const dayReturnByTypeArr = []

			        typeHeaders.forEach(h => {
				        const typeMap = entry[1]

				        if (typeMap.has(h)) dayReturnByTypeArr.push(typeMap.get(h))
				        else dayReturnByTypeArr.push('')
			        })

			        dataArray.push([ entry[0], ...dayReturnByTypeArr, dayReturnByTypeArr.reduce((prev, curr) => {
				        return typeof curr === "number"
					        ? prev + curr
					        : prev
			        }, 0)])
		        })

		        const workSheetCols = [ { width: 20 }, { width: 40 } ]
		        for (let i = 0; i < typeHeaders.length - 1; i++) {
			        workSheetCols.push({ width: 15 })
		        }
		        workSheetCols.push({ width: 15 })

                return { dataArray, workSheetCols }
	        },

	        sortDates(a, b) {
                const aDateArr =  a[0].split('.').map(v => parseInt(v))
                const bDateArr =  b[0].split('.').map(v => parseInt(v))
                const aDate = new Date(aDateArr[2], aDateArr[1] - 1, aDateArr[0])
                const bDate = new Date(bDateArr[2], bDateArr[1] - 1, bDateArr[0])
                return bDate - aDate
            }
        }
	}
</script>
