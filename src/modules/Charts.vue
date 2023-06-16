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
                        :options="registrationTypesOptions"
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
                        :options="registrationNotInPyramidTypesOptions"
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
                            :options="registrationInPyramidCountOptions"
                            :series="inPyramidCountSeries"
                            height="350"
                    />
                </div>
               <div class="col">
                   <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение загруженных в пирамиду счетчиков по типу лица</h5>
                   <apex-chart
                       v-show="customerTypeSeries"
                       type="donut"
                       ref="pieCustomerTypesChart"
                       :options="registrationCustomerTypesOptions"
                       :series="customerTypeSeries"
                       height="350"
                   />
               </div>
            </div>
        </div>
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение счетчиков по активности в пирамиде</h5>
                    <apex-chart
                        v-show="activeInPyramidCountSeries"
                        type="pie"
                        ref="pieActiveInPyramidCountChart"
                        :options="registrationActiveInPyramidCountOptions"
                        :series="activeInPyramidCountSeries"
                        height="350"
                    />
                </div>
            </div>
        </div>
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Динамика регистрации новых счетчиков</h5>
        <apex-chart
            v-show="regSeries"
            type="area"
            height="350"
            ref="chart"
            :options="registrationAreaOptions"
            :series="regSeries"
            class="mr-7"
        />
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Динамика загрузки счетчиков в пирамиду</h5>
        <apex-chart
            v-show="addInPyramidSeries"
            type="area"
            height="350"
            ref="registrationInPyramidArea"
            :options="registrationInPyramidAreaOptions"
            :series="addInPyramidSeries"
            class="mr-7"
        />
        <h5 class="mx-auto text-sm-h6 text-wrap text-center mt-2">Разделение загруженных в пирамиду счетчиков по адресам</h5>
        <span class="mx-auto text-sm-h7 text-center mt-2" style="display: block">{{ planProgress }}</span>
        <apex-chart
            v-show="streetSeries"
            type="bar"
            ref="barStreetsChart"
            :options="registrationInPyramidStreetsOptions"
            :series="streetSeries"
            width="98%"
            :height="streetsChartHeight"
        />
    </div>
</template>

<script>
    import VueApexCharts from 'vue-apexcharts'
    import {mapActions, mapGetters, mapMutations} from "vuex"

    export default {
    name: 'General',
    components: {
        apexChart: VueApexCharts
    },
    data: () => ({
        registrationAreaOptions: {
            chart: {
                locales: [{
                    name: 'en',
                    options: {
                        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Май', 'Июнь', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        toolbar: {
                            download: 'Download SVG'
                        }
                    }
                }],
                type: 'area',
                height: 350,
                foreColor: "#000000",
                stacked: true,
                dropShadow: {
                    enabled: true,
                    enabledSeries: [0],
                    top: -2,
                    left: 2,
                    blur: 5,
                    opacity: 0.06
                },
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false,
                }
            },
            colors: ['#005bac', '#0090FF'],
            stroke: {
                curve: "smooth",
                width: 3
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                strokeColor: "#fff",
                strokeWidth: 3,
                strokeOpacity: 1,
                fillOpacity: 1,
                hover: {
                    size: 6
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center'
            },
            fill: {
                type: "solid",
                fillOpacity: 0.7
            },
            yaxis: {
                labels: {
                    offsetX: 14,
                    offsetY: -5
                },
                tooltip: {
                    enabled: true
                }
            },
            xaxis: {
                type: "datetime",
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                tooltip: {
                    enabled: false
                }
            },
            tooltip: {
                x: {
                    // format: "d MMM yyyy",
                    formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                        const date = new Date(value)
                        return date.toLocaleDateString()
                    }
                },

            },
            grid: {
                padding: {
                    left: -5,
                    right: 5
                }
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            }
        },
        registrationInPyramidAreaOptions: {
            chart: {
                locales: [{
                    name: 'en',
                    options: {
                        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Май', 'Июнь', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        toolbar: {
                            download: 'Download SVG'
                        }
                    }
                }],
                type: 'area',
                height: 350,
                foreColor: "#000000",
                stacked: true,
                dropShadow: {
                    enabled: true,
                    enabledSeries: [0],
                    top: -2,
                    left: 2,
                    blur: 5,
                    opacity: 0.06
                },
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false,
                }
            },
            colors: ['#72d074', '#31c241'],
            stroke: {
                curve: "smooth",
                width: 3
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                strokeColor: "#fff",
                strokeWidth: 3,
                strokeOpacity: 1,
                fillOpacity: 1,
                hover: {
                    size: 6
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center'
            },
            fill: {
                type: "solid",
                fillOpacity: 0.7
            },
            yaxis: {
                labels: {
                    offsetX: 14,
                    offsetY: -5
                },
                tooltip: {
                    enabled: true
                }
            },
            xaxis: {
                type: "datetime",
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                tooltip: {
                    enabled: false
                }
            },
            tooltip: {
                x: {
                    // format: "d MMM yyyy",
                    formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                        const date = new Date(value)
                        return date.toLocaleDateString()
                    }
                },

            },
            grid: {
                padding: {
                    left: -5,
                    right: 5
                }
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            }
        },
        registrationCustomerTypesOptions: {},
        registrationTypesOptions: {
            chart: {
                type: 'pie',
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: "solid",
                fillOpacity: 0.7
            },
            legend: {
                position: 'left',
                horizontalAlign: 'center',
                formatter: function(val, opts) {
                    return val + " - " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            }
        },
        registrationInPyramidStreetsOptions: {
            chart: {
                type: 'bar',
                toolbar: {
                    show: false
                },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                }
            },
            dataLabels: {
                enabled: false,
	            // formatter: function(val, opt) {
		        //     const goals = opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex].goals
		        //     if (goals && goals.length) {
			    //         return `${val} / ${goals[0].value}`
		        //     }
		        //     return val
	            // },
	            // style: {
		        //     fontSize: '6px',
		        //     fontFamily: 'Arial, sans-serif',
		        //     fontWeight: 'bold'
	            // },
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '10'
                    },
                },
            },
            xaxis: {
                labels: {
                    style: {
                        fontSize: '10'
                    }
                },
            },
            legend: {
                show: false
            },
            tooltip: {
                y: {
                    title: {
                        formatter: (seriesName) => 'Количество счетчиков:',
                    },
                },
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'top',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            },
	        colors: ['#229efd'],
        },
        registrationInPyramidCountOptions: {
            chart: {
                type: 'pie',
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: "solid",
                fillOpacity: 0.7
            },
            legend: {
                position: 'left',
                horizontalAlign: 'center',
                formatter: function(val, opts) {
                    return val + " - " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            }
        },
        registrationActiveInPyramidCountOptions: {
            chart: {
                type: 'pie',
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: "solid",
                fillOpacity: 0.7
            },
            legend: {
                position: 'left',
                horizontalAlign: 'center',
                formatter: function(val, opts) {
                    return val + " - " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            }
        },
        registrationNotInPyramidTypesOptions: {
            chart: {
                type: 'pie',
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: "solid",
                fillOpacity: 0.7
            },
            legend: {
                position: 'left',
                horizontalAlign: 'center',
                formatter: function(val, opts) {
                    return val + " - " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            noData: {
                text: "Загрузка...",
                align: 'top',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#000000",
                    fontSize: '18px',
                    fontFamily: "Helvetica"
                }
            }
        },
        typeSeries: [],
        inPyramidCountSeries: [],
        activeInPyramidCountSeries: [],
        notInPyramidTypeSeries: [],
        customerTypeSeries: [],
        regSeries: [],
        streetSeries: [],
        streetsChartHeight: 30000,
        addInPyramidSeries: [],
        componentTitle: 'Графики данных',
        windowWidth: 0,
        donutHeight: 350,
        planProgress: ''
    }),
    inject: ['showNotificationStandardError', 'checkAuth', 'showNotificationComponentError', 'setBackgroundImage'],
    created() {
        window.addEventListener("resize", this.resize);
        //const isFavorite = $cookies.get('common_favorite_module')
	    $cookies.get('common_favorite_module') === '/charts' ? this.setFavoriteModuleColor(this.colorGold) : this.setFavoriteModuleColor('')
    },
    mounted() {
        if (!this.checkAuth()) {
	        return
        }

	    if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length) {
		    this.$router.push('/')
	    }

	    this.setBackgroundImage(false)

        this.registrationCustomerTypesOptions = { ...this.registrationTypesOptions }
	    this.fetchTypes().then(
		    result => {
			    setTimeout(()=> {
				    this.getMeterRegistrationChartSeries()
				    this.getMeterInPyramidChartSeries()
				    this.getMeterRegistrationTypesChartSeries()
				    this.getMeterRegistrationStreetsChartSeries()
				    this.getMeterRegistrationCustomerTypeChartSeries()
				    this.getMeterRegistrationNotInPyramidTypeChartSeries()
				    this.getMeterRegistrationInPyramidCountChartSeries()
				    this.getMeterRegistrationActiveInPyramidChartSeries()
			    }, 250)
		    },
		    error => this.showNotificationStandardError(error)
	    )
        this.windowWidth = window.innerWidth
    },
    watch: {
        windowWidth(newVal) {
            this.registrationCustomerTypesOptions.legend.position = newVal < 1000 ? 'top' : 'left'
            this.$refs.pieTypesChart.updateOptions(this.registrationTypesOptions)
            this.$refs.pieCustomerTypesChart.updateOptions(this.registrationCustomerTypesOptions)
        }
    },
    computed: {
	    ...mapGetters({
		    types: 'registration/getTypes',
	    }),
    },
    methods: {
        ...mapMutations(['setFavoriteModuleColor']),
        ...mapActions('charts',
            [
                'getMeterRegistrationChartData',
                'getMeterInPyramidChartData',
                'getMeterRegistrationTypesChartData',
                'getMeterRegistrationStreetsChartData',
                'getMeterRegistrationCustomerTypeChartData',
                'getMeterRegistrationNotInPyramidTypeChartData',
                'getMeterRegistrationInPyramidCountChartData',
                'getMeterRegistrationActiveInPyramidChartData'
            ]),
	    ...mapActions('registration', [
		    'fetchTypes',
	    ]),

        resize() {
            this.windowWidth = window.innerWidth
        },

        async getMeterRegistrationChartSeries() {
            try {
                const response = await this.getMeterRegistrationChartData()
                let series = []
                let seriesTotal = []
                let total = 0

                response.forEach(record => {
                    total += parseInt(record.count)
                    series.push([ new Date(record.day), record.count ])
                    seriesTotal.push([ new Date(record.day), total ])
                })

                this.regSeries = [
                    { name: 'Зарегистрировано за день', data: series},
                    { name: 'Всего зарегистрировано', data: seriesTotal}
                ]
                //this.$apexcharts.exec('registration', 'updateSeries',  series, true)
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle, e)
            }
        },

        async getMeterInPyramidChartSeries() {
            try {
                const response = await this.getMeterInPyramidChartData()
                let series = []
                let seriesTotal = []
                let total = 0

                response.forEach(record => {
                    total += parseInt(record.count)
                    const time = new Date(record.day).getTime()
                    series.push([ time, record.count ])
                    seriesTotal.push([time, total])
                })

                this.addInPyramidSeries =  [
                    { name: 'Добавлено за день', data: series},
                    { name: 'Всего добавлено', data: seriesTotal},
                ]
                //this.$apexcharts.exec('registration', 'updateSeries',  series, true)
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle, e)
            }
        },

        async getMeterRegistrationTypesChartSeries() {
            try {
                const response = await this.getMeterRegistrationTypesChartData()
                let series = []
                let labels = []

                response.forEach((record) => {
                    series.push(parseInt(record.count))
                    labels.push(this.getMeterTypeTitle(record.type))
                })

                this.typeSeries = series
                if (this.$refs && this.$refs.pieTypesChart)
                    this.$refs.pieTypesChart.updateOptions({ labels: labels })
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle + '(Разделение зарегистрированных счетчиков по типу)', e)
            }
        },

        async getMeterRegistrationCustomerTypeChartSeries() {
            try {
                const response = await this.getMeterRegistrationCustomerTypeChartData()
                let series = []
                let labels = []

                response.forEach(record => {
                    series.push(parseInt(record.count))
                    record.customer_type === null
                        ? labels.push('Отсутствует')
                        : labels.push((record.customer_type))
                })

                this.customerTypeSeries = series
                if (this.$refs && this.$refs.pieCustomerTypesChart)
                    this.$refs.pieCustomerTypesChart.updateOptions({ labels: labels })
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle, e)
            }
        },

        async getMeterRegistrationStreetsChartSeries() {
	        const plan = [
		        { address:'пр-кт Карла Маркса, д.196', count: 146 },
		        { address:'ул Суворова, д.125/3', count: 55 },
		        { address:'ул Суворова, д.133', count: 100 },
		        { address:'ул Завенягина, д.3', count: 105 },
		        { address:'ул Завенягина, д.16', count: 118 },
		        { address:'ул Завенягина, д.12', count: 186 },
		        { address:'проезд Сиреневый, д.10', count: 80 },
		        { address:'проезд Сиреневый, д.11/2', count: 111 },
		        { address:'проезд Сиреневый, д.15', count: 73 },
		        { address:'проезд Сиреневый, д.14/2', count: 72 },
		        { address:'проезд Сиреневый, д.27', count: 239 },
		        { address:'проезд Сиреневый, д.25', count: 67 },
		        { address:'проезд Сиреневый, д.24/2', count: 108 },
		        { address:'проезд Сиреневый, д.23', count: 107 },
		        { address:'проезд Сиреневый, д.26', count: 220 },
		        { address:'проезд Сиреневый, д.32', count: 108 },
		        { address:'ул Ворошилова, д.7', count: 96 },
		        { address:'ул Ворошилова, д.7/1', count: 70 },
		        { address:'ул Ворошилова, д.7/3', count: 70 },
		        { address:'ул Ворошилова, д.4', count: 128 },
		        { address:'ул Ворошилова, д.6', count: 107 },
		        { address:'ул Ворошилова, д.11', count: 286 },
		        { address:'ул Ворошилова, д.12', count: 106 },
		        { address:'ул Ворошилова, д.13', count: 69 },
		        { address:'ул Ворошилова, д.15', count: 109 },
		        { address:'ул Ворошилова, д.21', count: 136 },
		        { address:'ул Ворошилова, д.23', count: 151 },
		        { address:'ул Ворошилова, д.33', count: 64 },
		        { address:'ул Галиуллина, д.26/1', count: 57 },
		        { address:'ул Галиуллина, д.7', count: 100 },
		        { address:'ул Галиуллина, д.11', count: 99 },
		        { address:'ул Галиуллина, д.30', count: 131 },
		        { address:'ул Галиуллина, д.30/1', count: 71 },
		        { address:'ул Галиуллина, д.49', count: 100 },
		        { address:'ул Галиуллина, д.49/2', count: 70 },
		        { address:'ул Галиуллина, д.49/1', count: 100 },
		        { address:'ул Галиуллина, д.45', count: 112 },
		        { address:'ул Галиуллина, д.41/1', count: 60 },
		        { address:'ул Галиуллина, д.47/2', count: 70 },
		        { address:'ул Доменщиков, д.5/2', count: 119 },
		        { address:'ул Доменщиков, д.1', count: 88 },
		        { address:'ул Доменщиков, д.9', count: 86 },
		        { address:'ул 50-летия Магнитки, д.61', count: 162 },
		        { address:'ул 50-летия Магнитки, д.54', count: 131 },
		        { address:'ул Труда, д.21', count: 164 },
		        { address:'проезд Сиреневый, д.16/2', count: 60 },
		        { address:'пр-кт Карла Маркса, д.198/3', count: 100 },
		        { address:'ул Доменщиков, д.25', count: 88 },
		        { address:'ул Бориса Ручьева, д.17/1', count: 129 },
		        { address:'ул Доменщиков, д.13/1', count: 90 },
		        { address:'ул Доменщиков, д.26', count: 67 },
		        { address:'ул Мичурина, д.130', count: 98 },
		        { address:'ул Советская, д.195/1', count: 68 },
		        { address:'пр-кт Карла Маркса, д.176/1', count: 89 }]

            try {
                const response = await this.getMeterRegistrationStreetsChartData()
                let streetMap = new Map()

                response
                    .map(record => {
                        let addressArray = record.customer_address.split(',')
                        return (addressArray[1] || addressArray[2])
                            ? `${addressArray[1]},${(addressArray[2])}`.trimLeft()
                            : addressArray[0]})
                    .forEach(street => {
                        streetMap.has(street)
                            ? streetMap.set(street, streetMap.get(street) + 1)
                            : streetMap.set(street, 1)
                    })

                streetMap = new Map([ ...streetMap ]
                    .sort((a, b) => { return b[1] - a[1] }))

                const data = []
	            let totalNow = 0, totalPlan = 0;

                [ ...streetMap.keys() ].forEach(address => {
                    const countNow = streetMap.get(address)

                    const platItem = plan.find(row => row.address === address)
                    if (platItem) {
	                    totalNow += countNow
	                    totalPlan += platItem.count
	                    data.push({
		                    x: address,
		                    y: countNow,
		                    goals: [
			                    {
				                    name: 'В плане',
				                    value: platItem.count,
				                    strokeWidth: 6,
				                    strokeHeight: 4,
				                    strokeColor: '#ff6f00'
			                    }
		                    ]
	                    })
                    } else {
	                    data.push({
		                    x: address,
		                    y: countNow,
	                    })
                    }
                })

                this.planProgress = `Выполнение плана: ${ totalNow }/${ totalPlan }`
                this.streetSeries = [{ data: data }]
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle, e)
            }
        },

        async getMeterRegistrationNotInPyramidTypeChartSeries() {
            try {
                const response = await this.getMeterRegistrationNotInPyramidTypeChartData()
                let series = []
                let labels = []

                response.forEach(record => {
                    series.push(parseInt(record.count))
                    labels.push(this.getMeterTypeTitle(record.type))
                })

                this.notInPyramidTypeSeries = series
                if (this.$refs && this.$refs.pieNotInPyramidTypeChart) {
	                this.$refs.pieNotInPyramidTypeChart.updateOptions({ labels })
                }
            } catch (e) {
	            console.log(e)
                this.showNotificationComponentError(this.componentTitle + '(Разделение не загруженных в пирамиду счетчиков по типу)', e)
            }
        },

        async getMeterRegistrationInPyramidCountChartSeries() {
            try {
                const response = await this.getMeterRegistrationInPyramidCountChartData()
                let series = []
                let labels = ['Не загружено', 'Загружено']

                response.forEach(record => series.push(parseInt(record.count)))

                this.inPyramidCountSeries = series
                if (this.$refs && this.$refs.pieInPyramidCountChart) {
	                this.$refs.pieInPyramidCountChart.updateOptions({labels})
                }
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle, e)
            }
        },

        async getMeterRegistrationActiveInPyramidChartSeries() {
            try {
                const response = await this.getMeterRegistrationActiveInPyramidChartData()
                let labels = ['Есть показания', 'Нет показаний']

                this.activeInPyramidCountSeries = [ response.withData, response.total - response.withData ]
                if (this.$refs && this.$refs.pieActiveInPyramidCountChart) {
	                this.$refs.pieActiveInPyramidCountChart.updateOptions({ labels })
                }
            } catch (e) {
                this.showNotificationComponentError(this.componentTitle, e)
            }
        },

	    getMeterTypeTitle(meterType) {
		    const mType = this.types.find((type) => meterType === type.value)
		    return mType ? mType.text : meterType
	    },
    }
  }
</script>
