<template>
    <div class="test-util my-3 mx-3">
        <div class="test-util-meter-info-report">
            <v-textarea
                outlined
                clearable
                label="Введите список серийных номеров через запятую"
                ref="serialNumbers"
                v-model="serialNumbers"
            />
            <v-btn
                :loading="loadingMeterInfoBySerialNumberReport"
                @click="getMeterInfoBySerialNumberReport"
                color="green"
                dark
                class="ml-2"
            >
               Скачать excel отчет c данными по счетчикам
            </v-btn>
        </div>
       <v-btn
            :loading="testLoading"
            @click="testClick"
            color="green"
            dark
        >
            Тест отпр
        </v-btn>
<!--        <v-btn-->
<!--            :loading="testLoading"-->
<!--            @click="testClick1"-->
<!--            color="green"-->
<!--            dark-->
<!--        >-->
<!--            Тест-->
<!--        </v-btn>-->
        <v-btn
            :loading="testLoading"
            @click="testClick2"
            color="green"
            dark
        >
            Тест получ
        </v-btn>
    </div>

</template>

<script>
	import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
    import saveMetersDataBySerialNumberReportToExcelFile from "./js/saveMetersDataBySerialNumberReportToExcel";
    import saveLoadedInPyramidByAddressReportToExcel from "./js/saveLoadedInPyramidByAddressReportToExcel";
    import saveFromUitToStorageReportToExcel from "./js/saveFromUitToStorageReportToExcel";
    import saveNotLoadedInPyramidReportToExcel from "./js/saveNotLoadedInPyramidReportToExcel";

    export default {
        name: "TestUtils",
        data: () => ({
            loadingMeterInfoBySerialNumberReport: false,
            testLoading: false,
            // loadingMeterFromRepairToStorageCount: false,
            // loadingNotInPyramidReport: false,
            serialNumbers: "",
            ipAddress: [
                { text: '172.27.2.214', value: 1 },
                { text: '172.27.30.11', value: 2 },
            ],
        }),
        inject: [
        	'showNotificationSuccess',
            'showNotificationError',
            'setBackgroundImage'
        ],
        computed: {
	        ...mapGetters({
		        isLogin: 'getIsLogin'
	        }),
            ...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue']),
        },
        created() {
            const isFavorite = $cookies.get('common_favorite_module')
            if (isFavorite === '/test-utils') {
                this.setFavoriteModuleColor(this.colorGold)
            } else {
                this.setFavoriteModuleColor('')
            }

	        // if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length)
		    //     this.$router.push('/')

	        this.setBackgroundImage(true)
        },
        mounted() {
	        if (!this.isLogin) {
		        return
	        }
        },
	    methods: {
            ...mapActions('testUtils', ['getDataBySerialNumber', 'goTest', 'goTest1', 'goTest2']),
            ...mapMutations(['setFavoriteModuleColor']),
            async getMeterInfoBySerialNumberReport() {
                this.loadingMeterInfoBySerialNumberReport = true
                //console.log(this.serialNumbers)
                let metersArr = this.serialNumbers.trim().replace('\n', '').split(',').filter(serialNumber => serialNumber != '')
                //console.log(metersArr)
                try {
                    const response = await this.getDataBySerialNumber(metersArr)
                    //console.log(response)
                    let editedResponse = response.map(row => {
                        if (row.length) {
                            let meterData = row[0]
                            meterData.ip_address = this.ipAddress.find(address => meterData.ip_address === address.value).text
                            return [
                                meterData.serial_number,
                                meterData.customer_address,
                                meterData.ip_address,
                                meterData.phone,
                                meterData.port,
                            ]
                        } else
                            return ['', '', '', '', '',]
                    })
                    //console.log(editedResponse)
	                saveMetersDataBySerialNumberReportToExcelFile(editedResponse)
                } catch (e) {
                    console.log(e)
                    this.showNotificationError('Синтаксическая ошибка')
                } finally {
                    this.loadingMeterInfoBySerialNumberReport = false
                }
            },

		    testClick() {
			    console.log('testClick')
                this.goTest()
            },

		    testClick1() {
			    console.log('testClick1')
			    this.goTest1()
		    },

		    testClick2() {
			    console.log('testClick2')
			    this.goTest2()
		    },

/*		    async getPyramidLoadedReport() {

			    this.loadingPyramidLoadedReport = true
			    try {
				    const response = await this.getLoadedPyramidCountByAddress()
				    console.log(response)
				    let editedResponse = response.map((row, i) => {
				    	let finalRow = []
					    finalRow.length = 14
					    finalRow[0] = i + 1
					    finalRow[1] = row.address
                        if (row.data.length) {
                        	row.data.forEach(dataMonth => {
                        		const date = new Date(dataMonth.month_loaded)
		                        //const year = date.getFullYear()
		                        const month = String(date.getMonth() + 1)
		                        //console.log(`month = ${month}; count = ${dataMonth.count}`)
		                        //const day = String(date.getDate())
		                        //const dateStr = `${day}.${month}.${year}`
		                        finalRow[month] = dataMonth.count
                            })
                        }
                        return finalRow
				    })
				    //console.log(editedResponse)
				    saveLoadedInPyramidByAddressReportToExcel(editedResponse)

			    } catch (e) {
				    console.log(e)
				    this.showNotificationError('Синтаксическая ошибка')
			    } finally {
				    this.loadingPyramidLoadedReport = false
			    }
		    },

		    async getMeterFromRepairToStorageCountReport() {

			    this.loadingMeterFromRepairToStorageCount = true
			    try {
				    const response = await this.getMeterFromRepairToStorageCount()
				    console.log(response)
				    let editedResponse = response.map((row, i) => {
                        let meterInfo = row.meter.flat()
					    return { serialNumber: meterInfo[0], type: meterInfo[1], typeTitle: meterInfo[2], date: this.dateFormat(row.date)}
				    })

				    console.log(editedResponse)
				    saveFromUitToStorageReportToExcel(editedResponse)

			    } catch (e) {
				    console.log(e)
				    this.showNotificationError('Синтаксическая ошибка')
			    } finally {
				    this.loadingMeterFromRepairToStorageCount = false
			    }
		    },

		    async getNotInPyramidReport() {

			    this.loadingNotInPyramidReport = true
			    try {
				    const response = await this.getDataByNotInPyramid()
				    console.log(response)

				    let editedResponse = response.map(row => {
					   return [row.serial_number, row.name, row.address, row.phone, this.dateFormat(row.created)]
				    })

				    saveNotLoadedInPyramidReportToExcel(editedResponse)
			    } catch (e) {
				    console.log(e)
				    this.showNotificationError('Синтаксическая ошибка')
			    } finally {
				    this.loadingNotInPyramidReport = false
			    }
		    },*/

            dateFormat(dateToFormat) {
	            const date = new Date(dateToFormat)
	            let day = String(date.getDate())
	            let month = String(date.getMonth() + 1)
	            const year = date.getFullYear()

	            day = day.length < 2 ? day.padStart(2, '0') : day
	            month = month.length < 2 ? month.padStart(2, '0') : month

	            return `${day}.${month}.${year}`
            }
        }
    }
</script>

<style scoped>
    .test-util {
        width: 1000px;
    }

    .test-util-meter-info-report {
        display: flex;
    }
</style>