<template>
    <v-card class="m-3 px-4 pb-6" max-width="800px">
        <v-card-text class="pb-0">
            <p class="text-h6 text-secondary search-card-title">Отчеты по комплексам</p>
            <p class="search-card-info">списки содержат отчеты по комплексам с описанием данных</p>
        </v-card-text>
        <v-treeview
            class="px-1"
            hoverable
            :items="items"
            item-key="name"
            open-on-click
            open-all
            :transition="true"
            selection-type="independent"
        >
            <template v-slot:label="{ item, open }">
                <div class="report-body">
                    <v-icon large v-if="item.description">
                        {{ 'mdi-circle-small' }}
                    </v-icon>
                    <p v-if="item.description" class="report-name">{{ item.name }}</p>
                    <p v-else class="report-title" >{{ item.name }}</p>
                    <v-expand-transition>
                        <div v-show="item.show" class="report-description">
                            <p class="report-description-main">{{ item.description }}</p>
                            <p class="report-description-columns">{{ item.columns }}</p>
                            <p class="report-description-params">{{ item.params }}</p>
                        </div>
                    </v-expand-transition>
                </div>
            </template>
            <template v-slot:append="{ item, open }">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="item.show = !item.show"
                    >
						<v-icon large v-if="item.description" color="grey">
                            mdi-information
                        </v-icon>
                    </v-btn>
                </template>
                <span>Показать описание</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        @click="localFuncCall(item)"
                        :loading="item.loading"
                        v-bind="attrs"
                        v-on="on"
                        class="px-2"
                    >
                        <v-icon large v-if="item.download" color="green">
                            mdi-download-circle
                        </v-icon>
                    </v-btn>
                </template>
                <span>Скачать</span>
            </v-tooltip>
        </template>
        </v-treeview>
        <non-active-in-pyramid-report
            ref="reportDialogActive"
            @okButtonClickEvent="getNonActiveInPyramidReport"
            title="Параметры отчета"
        />
        <meter-count-by-address-report
            ref="reportDialogCount"
            @okButtonClickEvent="getPyramidLoadedByAddressReport"
            title="Параметры отчета"
        />
    </v-card>
</template>

<script>
	import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
	import saveCountByAddressReportToExcel from "./js/saveCountByAddressReportToExcel"
	import saveLoadedInPyramidByCustomerAddressReportToExcel from "./js/saveLoadedInPyramidByCustomerAddressReportToExcel"
	import saveFromUitToStorageReportToExcel from "../reports/js/saveFromUitToStorageReportToExcel"
	import saveNotLoadedInPyramidReportToExcel from "../reports/js/saveNotLoadedInPyramidReportToExcel"
	import saveNonActivePyramidMetersToExcelFile from "../reports/js/saveNonActiveMetersDataToExcel"
	import nonActiveInPyramidReport from "./components/NonActiveInPyramidReport"
	import saveLastTimeDataToExcelFile from "../reports/js/saveLastTimeDataToExcel"
	import meterCountByAddressReport from "./components/MeterCountByAddressReport"
    import saveRotecDataToExcelFile from "./js/saveRotecDataToExcel"

	export default {
		name: "Reports",
		components: {
			nonActiveInPyramidReport,
			meterCountByAddressReport
        },
		data: () => ({
            expand: false,
            selecteditem: null,
            items: [
				{
					name: 'Альфа Центр',
					children: [
						{
                            name: 'Последний опрос',
                            download: true,
                            description: 'Последний опрос комплекса Альфа Центр',
                            func: 'getAlphaReport',
							loading: false,
							show: false
                        },
					],
				},
				{
					name: 'Пирамида',
					children: [
						{
                            name: 'Выполнение плана установки по месяцам (дома)',
                            download: true,
							description: 'Количество загруженных в пирамиду счетчиков сгруппированных по адресам входящих в план',
							func: 'getPyramidLoadedByCustomerAddressReport',
                            loading: false,
							show: false
                        },
						{
                            name: 'Счетчики не загруженные в пирамиду',
                            download: true,
                            description: `Отчет содержит информацию по не загруженным в пирамиду счетчикам:`,
                            columns: `- серийный номер\n- тип\n- принадлежность\n- номер сим карты\n- дата регистрации в модуле "регистрация счетчиков"\n- признак наличия счетчика в данный момент на складе`,
                            func: 'getNotInPyramidReport',
							loading: false,
                            show: false
                        },
						{
							name:  'Не активные счетчики',
							download: true,
							description: 'Отчет содержит информацию по счетчикам которые не передают данные за определенный\nпериод времени:',
							columns: `- серийный номер\n- ip\n- порт\n- номер сим карты\n- адрес`,
							params: `Параметры:\n   0 - счетчики вообще не имеющие данных\n   n - количество дней без передачи данных`,
							func: 'reportDialogOpen',
							loading: false,
							show: false
						},
						{
							name:  'Выполнение плана по месяцам (принадлежность)',
							download: true,
							description: 'Количество созданных / загруженных в пирамиду счетчиков сгруппированных по принадлежности',
							func: 'reportCountByAddressDialogOpen',
							loading: false,
							show: false
						},
					],
				},
				{
					name: 'Программирование',
					children: [
						{
							name: 'Текущее количество счетчиков на складе после программирования',
							download: true,
							description: 'Текущее количество счетчиков на складе принятых после программирования УИТ',
							func: 'getMeterFromRepairToStorageCountReport',
							loading: false,
							show: false
						},
						{
							name: 'Информация по счетчикам Ротек',
							download: true,
							description: 'Список счетчиков Ротек из модуля Склад и дополнительная информация в формате csv',
							func: 'getRotecReport',
							loading: false,
							show: false
						},
					],
				},
				{
					name: 'Склад',
					children: [
						{
							name: 'По местоположению ПУ',
							download: false,
							description: 'Текущее количество счетчиков сгруппированных по местоположению',
							func: 'getMeterFromRepairToStorageCountReport',
							loading: false,
							show: false
						},
					],
				},
            ],
		}),
		inject: ['showNotification', 'showNotificationError', 'checkAuth', 'setBackgroundImage'],
		computed: {
			...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue']),
			...mapGetters({
				ipAddresses: 'registration/getIpAddress'
			}),
		},
		created() {
			const isFavorite = $cookies.get('common_favorite_module')
			if (isFavorite === '/reports') {
				this.setFavoriteModuleColor(this.colorGold)
			} else {
				this.setFavoriteModuleColor('')
			}
		},
		mounted() {
			if (!this.checkAuth()) {
				return
			}

			if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length) {
				this.$router.push('/')
			}

			this.setBackgroundImage(true)
		},
		methods: {
			...mapActions('reports',
				[
					'getCountByAddress',
					'getMeterFromRepairToStorageCount',
					'getDataByNotInPyramid',
					'getNonActiveInPyramid',
					'getLoadedPyramidCountByCustomerAddress',
					'getAlphaLastTimeDataReport',
					'getRotecMetersInfo',
				]),
			...mapMutations(['setFavoriteModuleColor']),

			localFuncCall(item) {
				this[ item.func ](item);
			},

			getIpAddressTitle(ipAddress) {
				const ipAddr = this.ipAddresses.find(address => ipAddress === address.value)
				return ipAddr ? ipAddr.text : ipAddress
			},

			async getAlphaReport(item) {
				item.loading = true
				try {
                    const response = await this.getAlphaLastTimeDataReport()
                    //console.log(response)
                    saveLastTimeDataToExcelFile(response)
				} catch (e) {
					console.log(e)
					this.showNotification('Ошибка при выполнении отчета', this.colorRed)
				} finally {
					item.loading = false
				}
			},

			async getPyramidLoadedByCustomerAddressReport(item) {
				item.loading = true
				try {
					const response = await this.getLoadedPyramidCountByCustomerAddress()
					//console.log(response)
					let editedResponse = response.map((row, i) => {
						let finalRow = []
						finalRow.length = 14
						finalRow[0] = i + 1
						finalRow[1] = row.address
						if (row.data.length) {
							row.data.forEach(dataMonth => {
								const date = new Date(dataMonth.month_loaded)
								const month = date.getMonth() + 1
								finalRow[month + 1] = dataMonth.count
							})
						}
						return finalRow
					})
					//console.log(editedResponse)
					saveLoadedInPyramidByCustomerAddressReportToExcel(editedResponse)

				} catch (e) {
					console.log(e)
					this.showNotification('Ошибка при выполнении отчета', this.colorRed)
				} finally {
					item.loading = false
				}
			},

			async getMeterFromRepairToStorageCountReport(item) {
				item.loading = true
				try {
					const response = await this.getMeterFromRepairToStorageCount()
					//console.log(response)
					let editedResponse = response.map(row => {
						return {
							serialNumber: row.SERIAL_NUMBER,
                            type: row.METER_TYPE,
                            typeTitle: row.TYPE_NAME,
                            date: this.dateFormat(row.date)
						}
					})
					//console.log(editedResponse)
					saveFromUitToStorageReportToExcel(editedResponse)

				} catch (e) {
					console.log(e)
					this.showNotification('Ошибка при выполнении отчета', this.colorRed)
				} finally {
					item.loading = false
				}
			},

			async getNotInPyramidReport(item) {
				item.loading = true
				try {
					const response = await this.getDataByNotInPyramid()
					//console.log(response)

					let editedResponse = response.map(row => {
						return [ row.serial_number, row.name, row.address, row.phone, new Date(row.created), row.inStorage ? 'да' : 'нет' ]
					})

					saveNotLoadedInPyramidReportToExcel(editedResponse)
				} catch (e) {
					//console.log(e)
					this.showNotification('Ошибка при выполнении отчета', this.colorRed)
				} finally {
					item.loading = false
				}
			},

			async reportDialogOpen(item) {
				this.$refs.reportDialogActive.open()
                this.selecteditem = item
            },

			async reportCountByAddressDialogOpen(item) {
				this.$refs.reportDialogCount.open()
				this.selecteditem = item
			},

			async getNonActiveInPyramidReport(days) {
				this.selecteditem.loading = true
                try {
                    const response = await this.getNonActiveInPyramid(days)
                    //console.log(response)
                    let nonActiveMetersArray = []

                    response.forEach(meter => {
                        let address = meter.customer_address

                        nonActiveMetersArray.push([
                            meter.serial_number,
                            this.ipAddresses.find(address => meter.ip_address === address.value).text,
                            meter.port,
                            meter.phone,
                            address,
							meter.last_date_time ? new Date(meter.last_date_time) : 'данные отсутствуют'
                        ])
                    })

                    saveNonActivePyramidMetersToExcelFile(nonActiveMetersArray)
                } catch (e) {
                    console.log(e)
                    this.showNotification('Ошибка при выполнении отчета', this.colorRed)
                } finally {
					this.selecteditem.loading = false
                }
            },

			async getPyramidLoadedByAddressReport(created) {
				this.selecteditem.loading = true
				try {
					const response = await this.getCountByAddress(created)
					//console.log(response)
					let editedResponse = response.map((row, i) => {
						let finalRow = []
                        finalRow.length = 14
                        finalRow[0] = i + 1
                        finalRow[1] = row.address === '' ? 'отсутствует' : row.address
                        if (row.months.length) {
                            row.months.forEach((month) => {
								finalRow[month.month + 1] = month.count
                            })
                        }
						return finalRow
					})

                    let monthsSum = []
					for (let i = 0; i < 12; i++) {
						const sum = editedResponse.reduce((acc, cur) => {
							return acc += cur[i + 2] ? parseInt(cur[i + 2]) : 0
						}, 0)
						monthsSum.push(sum)
					}
					//console.log(monthsSum)
					monthsSum.unshift('Итого')
					monthsSum.unshift(editedResponse.length + 1)
					editedResponse = editedResponse.concat([monthsSum])
					saveCountByAddressReportToExcel(editedResponse)

				} catch (e) {
					console.log(e)
					this.showNotification('Ошибка при выполнении отчета', this.colorRed)
				} finally {
					this.selecteditem.loading = false
				}
			},

			async getRotecReport(item) {
				item.loading = true
				try {
					const meters =  await this.getRotecMetersInfo()
                    saveRotecDataToExcelFile(meters, this.getIpAddressTitle)
				} catch ({ message }) {
					this.showNotification(`Ошибка при выполнении отчета: ${ message }`, this.colorRed)
				} finally {
					item.loading = false
				}
			},

			dateFormat(dateToFormat) {
				const date = new Date(dateToFormat)
				let day = String(date.getDate())
				let month = String(date.getMonth() + 1)
				const year = date.getFullYear()

				day = day.length < 2 ? day.padStart(2, '0') : day
				month = month.length < 2 ? month.padStart(2, '0') : month

				return `${ day }.${ month }.${ year }`
			},


		}
	}
</script>

<style scoped>
    .report-body {
        display: grid;
        grid-template-areas: "i name"
                            "i desc"
                            "i columns";
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto;
    }

    .report-title {
        font-weight: bold;
        color: rgba(0, 0, 0, 0.87);
        padding: 0;
        margin: 0;
        font-size: 1rem;
    }

    .report-name {
        grid-area: name;
        font-size: 15px;
        margin-top: auto;
        margin-bottom: auto;
    }

    .report-description {
        grid-area: desc;
        white-space: pre;
        font-size: 12px;
        color: darkgrey;
        width: 100%;
    }

    .report-description-main {
        margin-bottom: 5px;
    }

    .report-description-columns {
        padding-left: 10px;
        margin-bottom: 5px;
    }
</style>
<style>
    .v-treeview-node__level {
        width: 5px !important;
    }

    .v-treeview-node__content {
        align-items: baseline !important;
    }
</style>