<template>
   <div>
       <v-form
           ref="form"
           lazy-validation
           @submit.prevent="getMeterData"
       >
            <v-card
                class="m-3 px-4 pb-4"
                max-width="500px"
            >
                <v-card-text class="pb-0">
                    <p class="text-h6 text-secondary search-card-title">Поиск данных счетчика</p>
                    <p class="search-card-info">поиск производится по счетчикам из модуля регистрации загруженных в пирамиду</p>
                </v-card-text>
                <v-card-actions class="d-flex justify-content-around px-4">
                    <v-text-field
                        v-model="serialNumber"
                        :rules="serialNumberRules"
                        required
                        :loading="loading"
                        label="Серийный номер"
                        type="text"
                        clearable
                        class="search-serial-number-input pt-0 pr-1"
                    />
                    <v-btn
                       text
                       color="primary"
                       type="submit"
                    >
                        <v-icon
                            left
                        >
                            mdi-magnify
                        </v-icon>
                        Поиск
                    </v-btn>
                </v-card-actions>
           </v-card>
       </v-form>
       <v-card class="m-3 px-3 pb-4" max-width="500px" v-show="show">
           <v-card-text>
               <p class="text-h6 text-secondary search-card-title">Результаты</p>
           </v-card-text>
           <div class="px-4 pb-4">
               <div class="meter-content-data">
                   <v-text-field
                       v-model="meterType"
                       readonly
                       label="Тип счетчика"
                       type="text"
                   />
                   <v-text-field
                       v-model="customer_type"
                       readonly
                       label="Тип клиента"
                       type="text"
                   />
                   <v-text-field
                       v-model="personal_account"
                       readonly
                       label="Лицевой номер"
                       type="text"
                   />
                   <v-text-field
                       v-model="customer_address"
                       readonly
                       label="Адрес"
                       type="text"
                   />
               </div>
               <v-subheader style="font-size: 13px; height: 16px" class="px-0">{{ lastDateTitle }}</v-subheader>
               <v-simple-table class="mytable py-2" v-show="meterData.dateTime !== ''">
                   <template v-slot:default>
                       <thead>
                       <tr>
                           <th class="text-center">Дата</th>
                           <th class="text-center">Тариф 1</th>
                           <th class="text-center">Тариф 2</th>
                           <th class="text-center">Общий</th>
                       </tr>
                       </thead>
                       <tbody>
                           <tr>
                               <td>{{ meterData.dateTime }}</td>
                               <td>{{ meterData.t1 }}</td>
                               <td>{{ meterData.t2 }}</td>
                               <td>{{ meterData.total }}</td>
                            </tr>
                       </tbody>
                   </template>
               </v-simple-table>
           </div>
       </v-card>
  </div>
</template>

<script>
    import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
    import saveLastTimeDataToExcelFile from "./alpha/js/saveLastTimeDataToExcel";

    export default {
        name: 'Search',
        data: ()=>({
            show: false,
            serialNumber: '',
            meterType: '',
            personal_account: '',
            meterData: { dateTime: '', t1: '', t2: '', total: '' },
            loading: false,
            customer_address: '',
            customer_type: '',
            serialNumberRules: [
                v => !!v || 'Обязательно к заполнению',
                v => (v && String(v).length >= 8) || 'Должно быть не меньше 8 символов',
                v => (v && !(new RegExp('[^0-9]', 'g').test(String(v)))) || 'Должны присутствовать только цифры'
            ],
        }),
        inject: ['showNotification', 'showNotificationStandardError', 'checkAuth', 'setBackgroundImage'],
        computed: {
            ...mapGetters('registration', ['getTypes']),
            ...mapState(['colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue']),

            lastDateTitle() {
                return this.meterData.dateTime !== '' ? 'Последние показания' : 'Последние показания отсутствуют'
            }
        },
        mounted() {
            if (!this.checkAuth())
                return

	        if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length)
	        	this.$router.push('/')

	        this.setBackgroundImage(true)
        },
        created() {
            const isFavorite = $cookies.get('common_favorite_module')

            if (isFavorite === '/search') {
                this.setFavoriteModuleColor(this.colorGold)
            } else {
                this.setFavoriteModuleColor('')
            }
        },
        methods: {
            ...mapActions('search', ['getMeterBySerialNumber']),
            ...mapMutations(['setFavoriteModuleColor']),

            async getMeterData() {
                if (!this.$refs.form.validate()) {
                    return
                }
                this.loading = true
                const response = await this.getMeterBySerialNumber(this.serialNumber)
                this.loading = false
                //console.log(response)
                let meterInfo = response.filter(arr => arr.length === 1)
                let meterAsdDataInfo = response.filter(arr => arr.length === 3)
                this.clear()

                if (meterInfo.length) {
                    this.show = true
                    meterInfo = meterInfo.flat()
                    this.meterType = this.getMeterTypeTitle(meterInfo[0].type)
                    if (meterInfo[0].customer_type) {
                        this.customer_type = meterInfo[0].customer_type
                    } else {
                        this.customer_type = 'отсутствует'
                        this.showNotification('Счетчик найден, запрограммирован УИТ, но не загружен в пирамиду (причина - нет данных от СТЭК)', this.colorBlue)

                    }

                    this.customer_address = meterInfo[0].customer_address ? meterInfo[0].customer_address : 'отсутствует'
                    this.personal_account = meterInfo[0].personal_account ? meterInfo[0].personal_account : 'отсутствует'
                } else {
                    this.showNotification('Счетчик не найден', this.colorOrange)
                    this.show = false
                    return
                }

                if (meterAsdDataInfo.length) {
                    this.showNotification('Счетчик найден', this.colorGreen)
                    meterAsdDataInfo = meterAsdDataInfo.flat()
                    //console.log(meterAsdDataInfo)
                    let date = new Date(meterAsdDataInfo[0].date_time)
                    const year = date.getFullYear()
                    const month = date.getMonth() + 1
                    const day = date.getDate()

                    this.meterData.dateTime  = `${day}.${month}.${year}`

                    this.meterData.t1 = parseFloat(
                                meterAsdDataInfo.filter(arr => arr.channel_type === 1001)[0].value).toFixed(3)
                    this.meterData.t2 = parseFloat(
                                meterAsdDataInfo.filter(arr => arr.channel_type === 1002)[0].value).toFixed(3)
                    this.meterData.total = parseFloat(
                                meterAsdDataInfo.filter(arr => arr.channel_type === 1000)[0].value).toFixed(3)
                }


            },

            getMeterTypeTitle(meterType) {
                return this.getTypes.find(type => meterType === type.value).text
            },

            clear() {
                this.meterType = ''
                this.personal_account = ''
                this.meterData = { dateTime: '', t1: '', t2: '', total: '' }
                this.customer_address = ''
                this.customer_type = ''
            }
        }
    }
</script>

<style>
    .search-card-title {
        margin-bottom: 0px !important;
        color: rgba(0, 0, 0, 0.87) !important;
    }

    .search-card-info {
        font-size: 11px;
    }

    .search-serial-number-input {
        max-width: 350px;
    }

    .meter-content {
        max-width: 700px;
        padding: 8px 16px 24px 16px;
    }

    .meter-content-data {
        flex-grow: 1;
    }

    .mytable th {
        border-bottom: 1px solid rgba(0, 0, 0, 0.25) !important;
        color: rgba(0, 0, 0, 0.87)
    }

</style>