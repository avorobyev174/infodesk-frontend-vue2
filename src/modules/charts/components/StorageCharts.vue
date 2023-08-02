<template>
    <div>
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2" style="max-width: 900px">
            Количество счетчиков выданных на программирование, монтаж и обратно принятых на склад с монтажа за одень день
        </h5>
        <div id="wrapper">
            <apex-chart ref="chart" type="bar" height="1550" :options="programmingChartOptions" :series="programmingChartSeries"></apex-chart>
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
		}),
		inject: [
			'showNotificationRequestError',
			'formatDate',
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
		},
		methods: {
			...mapActions('charts',
				[
					'getMeterStorageAfterProgrammingAndInstallChartData',
				]),

			async getMeterStorageAfterProgrammingAndInstallChartSeries() {
				try {
					const data = await this.getMeterStorageAfterProgrammingAndInstallChartData()
                    const storageAfterProgrammingSeries = []
                    const installAfterStorageSeries = []
                    const storageAfterInstallSeries = []

					for (const date in data) {
						const { storageAfterProgramming, storageAfterInstall, installAfterStorage } = data[ date ]
						storageAfterProgrammingSeries.push(storageAfterProgramming ? storageAfterProgramming : 0)
						installAfterStorageSeries.push(installAfterStorage ? installAfterStorage : 0)
						storageAfterInstallSeries.push(storageAfterInstall ? storageAfterInstall : 0)
                    }

                    const categories = Object.keys(data).map((date) => formatDate(date))

					this.programmingChartSeries = [
                        { name: 'Принято на склад после программирования', data: storageAfterProgrammingSeries },
						{ name: 'Выдано на монтаж', data: installAfterStorageSeries },
						{ name: 'Принято на склад после монтажа', data: storageAfterInstallSeries },
					]

					this.programmingChartOptions.xaxis.categories = categories
					this.$refs.chart?.updateOptions(this.programmingChartOptions)
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},
		}
	}
</script>

<style scoped>

</style>