<template>
    <div>
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2" style="max-width: 900px">
            Количество счетчиков выданных на программирование, монтаж и обратно принятых на склад с монтажа за один день
        </h5>
        <div>
            <apex-chart ref="CountChart" type="bar" height="750" :options="programmingChartOptions" :series="programmingChartSeries"></apex-chart>
        </div>
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2" style="max-width: 900px">
            Количество запрограммированных счетчиков на складе готовых к выдаче на монтаж сгруппированных по типу в конце дня
        </h5>
        <div id="chart">
            <apex-chart ref="TypesCountChart" type="bar" height="150" :options="chartOptions" :series="afterProgrammingTypesCountChartSeries"></apex-chart>
        </div>
    </div>
</template>

<script>
	import VueApexCharts from "vue-apexcharts"
	import { mapActions, mapGetters } from "vuex"
	import programmingChartOptions from "../js/programming-stackbar-storage-options"
	import { formatDate } from "../../Utils"
	export default {
		name: "StorageCharts",
		components: {
			apexChart: VueApexCharts
		},
		data: () => ({
			programmingChartOptions,
			programmingChartSeries: [],
			afterProgrammingTypesCountChartSeries: [],
			chartOptions: {
				chart: {
					type: 'bar',
					height: 150,
				},
				stroke: {
					width: 1,
					colors: ['#fff']
				},
				dataLabels: {
					enabled: true
				},
				plotOptions: {
					bar: {
						horizontal: true
					}
				},
				xaxis: {
					categories: [],
					labels: {
						formatter: (val) => {
							return val + " шт."
						}
					}
				},
				fill: {
					opacity: 1,
				},
				legend: {
					position: 'top',
					horizontalAlign: 'left'
				}
			},
		}),
		inject: [
			'showNotificationRequestError',
			'formatDate',
			'getMeterTypeTitle',
		],
		computed: {
			...mapGetters({
				isLogin: 'getIsLogin',
			}),
		},
		async mounted() {
			if (!this.isLogin) {
				return
			}

			await this.getMeterStorageAfterProgrammingAndInstallChartSeries()
			await this.getMeterStorageAfterProgrammingTypeCountChartSeries()
		},
		methods: {
			...mapActions('charts',
				[
					'getMeterStorageAfterProgrammingAndInstallChartData',
					'getMeterStorageAfterProgrammingTypeCountChartData',
				]),

			async getMeterStorageAfterProgrammingAndInstallChartSeries() {
				try {
					const data = await this.getMeterStorageAfterProgrammingAndInstallChartData()
                    const storageAfterProgrammingSeries = []
                    const installAfterStorageSeries = []
                    const storageAfterInstallSeries = []
                    const afterProgrammingReadyToInstallSeries = []
                    const afterInstallReadyToInstallSeries = []

					for (const date in data) {
						const {
							storageAfterProgramming,
                            storageAfterInstall,
                            installAfterStorage,
                            afterProgrammingReadyToInstall,
							afterInstallReadyToInstall
						} = data[ date ]

						storageAfterProgrammingSeries.push(storageAfterProgramming ? storageAfterProgramming : 0)
						installAfterStorageSeries.push(installAfterStorage ? installAfterStorage : 0)
						storageAfterInstallSeries.push(storageAfterInstall ? storageAfterInstall : 0)
                        afterProgrammingReadyToInstallSeries.push(afterProgrammingReadyToInstall ? afterProgrammingReadyToInstall : 0)
                        afterInstallReadyToInstallSeries.push(afterInstallReadyToInstall ? afterInstallReadyToInstall : 0)
                    }

                    const categories = Object.keys(data).map((date) => formatDate(date))

					this.programmingChartSeries = [
                        { name: 'Принято на склад после программирования', data: storageAfterProgrammingSeries },
						{ name: 'Выдано на монтаж', data: installAfterStorageSeries },
						{ name: 'Принято на склад после монтажа', data: storageAfterInstallSeries },
						{ name: 'Готовые к выдаче на конец дня(запрограммированы)', data: afterProgrammingReadyToInstallSeries },
						{ name: 'Готовые к выдаче на конец дня(возвращенны после монтажа)', data: afterInstallReadyToInstallSeries },
					]

					this.programmingChartOptions.xaxis.categories = categories
					this.$refs.CountChart?.updateOptions(this.programmingChartOptions)
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			async getMeterStorageAfterProgrammingTypeCountChartSeries() {
				try {
					const data = await this.getMeterStorageAfterProgrammingTypeCountChartData()
					const categories = data.map(({ date }) => formatDate(date))
					const types = [ ...new Set(data.map(({ typesCount }) =>
                        typesCount.map(({ meter_type }) => meter_type)).flat()) ]

					this.afterProgrammingTypesCountChartSeries = types.map((type) => {
                    	const typeDateCount = []
	                    for (const { typesCount } of data) {
	                    	const typeCount = typesCount.find(({ meter_type }) => meter_type === type)
		                    typeDateCount.push(+typeCount?.count ?? 0)
	                    }
	                    return { name: this.getMeterTypeTitle(type), data: typeDateCount }
                    })

					//console.log(this.afterProgrammingTypesCountChartSeries)
					this.chartOptions.xaxis.categories = categories
					this.chartOptions.chart.height = categories.length * 350
					console.log(this.chartOptions.chart.height)
					this.$refs.TypesCountChart?.updateOptions(this.chartOptions)
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			}
		}
	}
</script>

<style scoped>

</style>