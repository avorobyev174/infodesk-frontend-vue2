<template>
    <div>
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение зарегистрированных счетчиков по типу</h5>
                    <apex-chart
                        v-show="typeSeries"
                        type="donut"
                        ref="pieTypesChart"
                        :options="programmingTypesOptions"
                        :series="typeSeries"
                        height="350"
                    />
                </div>
            </div>
        </div>
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение не загруженных в пирамиду счетчиков по типу</h5>
                    <apex-chart
                        v-show="notInPyramidTypeSeries"
                        type="pie"
                        ref="pieNotInPyramidTypeChart"
                        :options="programmingNotInPyramidTypesOptions"
                        :series="notInPyramidTypeSeries"
                        height="350"
                    />
                </div>
            </div>
        </div>
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение счетчиков по загрузке в пирамиду</h5>
                    <apex-chart
                            v-show="inPyramidCountSeries"
                            type="pie"
                            ref="pieInPyramidCountChart"
                            :options="programmingInPyramidCountOptions"
                            :series="inPyramidCountSeries"
                            height="350"
                    />
                </div>
               <div class="col">
                   <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение счетчиков по активности в пирамиде</h5>
                   <apex-chart
                           v-show="activeInPyramidCountSeries"
                           type="pie"
                           ref="pieActiveInPyramidCountChart"
                           :options="programmingActiveInPyramidCountOptions"
                           :series="activeInPyramidCountSeries"
                           height="350"
                   />
               </div>
            </div>
        </div>
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Динамика регистрации новых счетчиков</h5>
        <apex-chart
            v-show="programmingRegistrationSeries"
            type="area"
            height="350"
            ref="chart"
            :options="programmingAreaOptions"
            :series="programmingRegistrationSeries"
            class="mr-7"
        />
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Динамика загрузки счетчиков в пирамиду</h5>
        <apex-chart
            v-show="addInPyramidSeries"
            type="area"
            height="350"
            ref="registrationInPyramidArea"
            :options="programmingInPyramidAreaOptions"
            :series="addInPyramidSeries"
            class="mr-7"
        />
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение загруженных в пирамиду счетчиков по адресам</h5>
        <span class="mx-auto text-sm-h7 text-center mt-2" style="display: block">{{ planProgress }}</span>
        <apex-chart
            v-show="buildingsSeries"
            type="bar"
            ref="barStreetsChart"
            :options="programmingPyramidBuildingsOptions"
            :series="buildingsSeries"
            width="98%"
            :height="buildingsChartHeight"
        />
    </div>
</template>

<script>
    import VueApexCharts from 'vue-apexcharts'
    import { mapActions, mapGetters } from "vuex"
    import DictionaryMixin from "../mixins/DictionaryMixin"
    import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
    import { spliceCustomerAddress } from "../programming/js/meters-filter-values"
    import programmingAreaOptions from "./js/programming-area-options"
    import programmingInPyramidAreaOptions from "./js/programming-in-pyramid-options"
    import programmingTypesOptions from "./js/programming-types-options"
    import programmingPyramidBuildingsOptions from "./js/programming-in-pyramid-buildings-options"
    import programmingInPyramidCountOptions from "./js/programming-in-pyramid-count-options"
    import programmingActiveInPyramidCountOptions from "./js/programming-active-in-pyramid-count-options"
    import programmingNotInPyramidTypesOptions from "./js/programming-not-in-pyramid-types-options"
    import plan from './js/plan'

    export default {
    name: 'General',
    components: {
        apexChart: VueApexCharts
    },
    data: () => ({
	    plan,
        programmingAreaOptions,
        programmingInPyramidAreaOptions,
        programmingCustomerTypesOptions: {},
        programmingTypesOptions,
        programmingPyramidBuildingsOptions,
        programmingInPyramidCountOptions,
        programmingActiveInPyramidCountOptions,
        programmingNotInPyramidTypesOptions,
        typeSeries: [],
        inPyramidCountSeries: [],
        activeInPyramidCountSeries: [],
        notInPyramidTypeSeries: [],
        customerTypeSeries: [],
        programmingRegistrationSeries: [],
        buildingsSeries: [],
        buildingsChartHeight: 30000,
        addInPyramidSeries: [],
        windowWidth: 0,
        donutHeight: 350,
        planProgress: ''
    }),
    inject: [
    	'showNotificationRequestError',
        'setBackgroundImage'
    ],
    mixins: [ DictionaryMixin, FavoriteModuleMixin ],
    computed: {
        ...mapGetters({
	        isLogin: 'getIsLogin',
        }),
    },
    watch: {
        windowWidth(newVal) {
            this.programmingCustomerTypesOptions.legend.position = newVal < 1000 ? 'top' : 'left'
            this.$refs.pieTypesChart.updateOptions(this.programmingTypesOptions)
        }
    },
    created() {
        window.addEventListener("resize", this.resize)
    },
    mounted() {
        if (!this.isLogin) {
	        return
        }

	    this.setBackgroundImage(false)
        this.programmingCustomerTypesOptions = { ...this.programmingTypesOptions }
        this.getMeterRegistrationChartSeries()
        this.getMeterInPyramidChartSeries()
        this.getMeterRegistrationTypesChartSeries()
        this.getMeterRegistrationStreetsChartSeries()
        this.getMeterRegistrationNotInPyramidTypeChartSeries()
        this.getMeterRegistrationInPyramidCountChartSeries()
        this.getMeterRegistrationActiveInPyramidChartSeries()

        this.windowWidth = window.innerWidth
    },
    methods: {
        ...mapActions('charts',
            [
                'getMeterRegistrationChartData',
                'getMeterInPyramidChartData',
                'getMeterRegistrationTypesChartData',
                'getMeterRegistrationBuildingsChartData',
                'getMeterRegistrationCustomerTypeChartData',
                'getMeterRegistrationNotInPyramidTypeChartData',
                'getMeterRegistrationInPyramidCountChartData',
                'getMeterRegistrationActiveInPyramidChartData'
            ]),

        resize() {
            this.windowWidth = window.innerWidth
        },

        getDataSeries(data) {
	        const series = []
	        const seriesTotal = []
	        let total = 0
	        data.forEach(({ count, day }) => {
		        total += parseInt(count)
		        series.push([ new Date(day), count ])
		        seriesTotal.push([ new Date(day), total ])
	        })

            return { series, seriesTotal }
        },

	    getDataChartSeries(data) {
		    const series = []
		    const labels = []
		    data.forEach(({ count, type }) => {
			    series.push(+count)
			    labels.push(this.getMeterTypeTitle(type))
		    })

		    return { series, labels }
	    },

        async getMeterRegistrationChartSeries() {
            try {
                const data = await this.getMeterRegistrationChartData()
                const { series, seriesTotal } = this.getDataSeries(data)

                this.programmingRegistrationSeries = [
                    { name: 'Зарегистрировано за день', data: series },
                    { name: 'Всего зарегистрировано', data: seriesTotal }
                ]
            } catch (e) {
                this.showNotificationRequestError(e)
            }
        },

        async getMeterInPyramidChartSeries() {
            try {
                const data = await this.getMeterInPyramidChartData()
	            const { series, seriesTotal } = this.getDataSeries(data)

                this.addInPyramidSeries =  [
                    { name: 'Добавлено за день', data: series },
                    { name: 'Всего добавлено', data: seriesTotal },
                ]
            } catch (e) {
                this.showNotificationRequestError(e)
            }
        },

        async getMeterRegistrationTypesChartSeries() {
            try {
                const data = await this.getMeterRegistrationTypesChartData()
                const { series, labels } = this.getDataChartSeries(data)
                this.typeSeries = series
                this.$refs.pieTypesChart.updateOptions({ labels: labels })
            } catch (e) {
                this.showNotificationRequestError(e)
            }
        },

        async getMeterRegistrationStreetsChartSeries() {
            try {
                const meters = await this.getMeterRegistrationBuildingsChartData()
                const buildingMap = new Map()

                for (const { customer_address } of meters) {
                	const building = spliceCustomerAddress(customer_address, true, true)
	                buildingMap.has(building)
		                ? buildingMap.set(building, buildingMap.get(building) + 1)
		                : buildingMap.set(building, 1)
                }

                const buildingMapSorted = new Map([ ...buildingMap ].sort(([ , count1 ], [ , count2 ]) => count2 - count1))

                const data = []
	            let totalNow = 0, totalPlan = 0;

                [ ...buildingMapSorted.keys() ].forEach((building) => {
                    const countNow = buildingMap.get(building)

                    const planBuilding = this.plan.find(({ address }) => building === address)
                    if (planBuilding) {
	                    totalNow += countNow
	                    totalPlan += planBuilding.count
	                    data.push({
		                    x: building,
		                    y: countNow,
		                    goals: [
			                    {
				                    name: 'В плане',
				                    value: planBuilding.count,
				                    strokeWidth: 6,
				                    strokeHeight: 4,
				                    strokeColor: '#ff6f00'
			                    }
		                    ]
	                    })
                    } else {
	                    data.push({
		                    x: building,
		                    y: countNow,
	                    })
                    }
                })

                this.planProgress = `Выполнение плана: ${ totalNow }/${ totalPlan }`
                this.buildingsSeries = [{ data }]
            } catch (e) {
                this.showNotificationRequestError(e)
            }
        },

        async getMeterRegistrationNotInPyramidTypeChartSeries() {
            try {
                const data = await this.getMeterRegistrationNotInPyramidTypeChartData()
	            const { series, labels } = this.getDataChartSeries(data)
	            this.notInPyramidTypeSeries = series
                this.$refs.pieNotInPyramidTypeChart.updateOptions({ labels })
            } catch (e) {
	            console.log(e)
                this.showNotificationRequestError(e)
            }
        },

        async getMeterRegistrationInPyramidCountChartSeries() {
            try {
                const data = await this.getMeterRegistrationInPyramidCountChartData()
                let series = []
                let labels = [ 'Не загружено', 'Загружено']
                data.forEach(({ count }) => series.push(+count))
                this.inPyramidCountSeries = series
                this.$refs.pieInPyramidCountChart.updateOptions({ labels })
            } catch (e) {
                this.showNotificationRequestError(e)
            }
        },

        async getMeterRegistrationActiveInPyramidChartSeries() {
            try {
                const { withDataCount, totalCount } = await this.getMeterRegistrationActiveInPyramidChartData()
                const labels = [ 'Есть показания', 'Нет показаний' ]
                this.activeInPyramidCountSeries = [ withDataCount, totalCount - withDataCount ]
                this.$refs.pieActiveInPyramidCountChart.updateOptions({ labels })
            } catch (e) {
                this.showNotificationRequestError(e)
            }
        },
    }
  }
</script>
