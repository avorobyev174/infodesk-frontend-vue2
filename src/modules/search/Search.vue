<template>
   <div>
       <v-form
           ref="form"
           lazy-validation
           @submit.prevent="getMeterData"
       >
            <v-card class="m-3 px-4 pb-4" max-width="500px">
                <v-card-text class="pb-0">
                    <p class="text-h6 text-secondary search-card-title">Поиск показаний счетчика</p>
                    <p class="search-card-info">поиск по счетчикам зарегистрированным в УИТ</p>
                </v-card-text>
                <v-card-actions class="d-flex justify-content-around px-4">
                    <v-text-field
                        v-model="serialNumber"
                        :rules="serialNumberRules"
                        :loading="loading"
                        label="Серийный номер"
                        type="text"
                        clearable
                        class="search-serial-number-input pt-0 pr-1"
                    />
                    <v-btn text color="primary" type="submit">
                        <v-icon left>mdi-magnify</v-icon>
                        Поиск
                    </v-btn>
                </v-card-actions>
           </v-card>
       </v-form>
       <v-card class="m-3 px-3 pb-4" max-width="500px" v-show="isShowMeterData">
           <v-card-text>
               <p class="text-h6 text-secondary search-card-title">Данные</p>
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
                       label="Тип потребителя"
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
               <v-simple-table class="py-2" v-show="dateTime">
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
                               <td class="text-center">{{ dateTime }}</td>
                               <td class="text-center">{{ t1 }}</td>
                               <td class="text-center">{{ t2 }}</td>
                               <td class="text-center">{{ total }}</td>
                            </tr>
                       </tbody>
                   </template>
               </v-simple-table>
           </div>
       </v-card>
  </div>
</template>

<script>
    import { mapActions } from "vuex"
    import DictionaryMixin from "../mixins/DictionaryMixin"
    import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
    import { formatDate } from "../Utils"

    export default {
        name: 'Search',
        data: () => ({
            isShowMeterData: false,
            serialNumber: '',
            meterType: '',
            personal_account: '',
	        dateTime: '',
	        t1: '',
	        t2: '',
            total: '',
            loading: false,
            customer_address: '',
            customer_type: '',
            serialNumberRules: [
                v => !!v || 'Обязательно к заполнению',
                v => (v && String(v).length >= 8) || 'Должно быть не меньше 8 символов',
            ],
        }),
        inject: [
        	'showNotificationSuccess',
            'showNotificationInfo',
            'setBackgroundImage',
            'showNotificationRequestError'
        ],
        mixins: [ DictionaryMixin, FavoriteModuleMixin ],
        computed: {
            lastDateTitle() {
                return this.dateTime ? 'Последние показания' : 'Последние показания отсутствуют'
            }
        },
        mounted() {
	        this.setBackgroundImage(true)
        },
        methods: {
            ...mapActions('search', [ 'getMeterDataBySerialNumber' ]),

            async getMeterData() {
                if (!this.$refs.form.validate()) {
                    return
                }
                try {
	                this.loading = true
	                const { meter, data } = await this.getMeterDataBySerialNumber(this.serialNumber)
                    this.clear()
	                this.loading = false
                    if (!meter) {
	                    this.isShowMeterData = false
	                    return this.showNotificationInfo('Счетчик не найден')
                    }

                    const { type, personal_account, customer_type, customer_address } = meter

                    this.isShowMeterData = true
                    this.meterType = this.getMeterTypeTitle(type)
                    if (customer_type) {
                        this.customer_type = customer_type
                    } else {
                        this.customer_type = 'отсутствует'
                        this.showNotificationInfo('Счетчик еще не загружен в пирамиду')
                    }

                    this.customer_address = customer_address ? customer_address : 'отсутствует'
                    this.personal_account = personal_account ? personal_account : 'отсутствует'

	                if (data.length) {
		                const meterData = data.flat()

                        const [ t1, t2, total ] = meterData
		                this.dateTime = formatDate(t1.date_time)

		                this.t1 = parseFloat(t1.value).toFixed(3)
		                this.t2 = parseFloat(t2.value).toFixed(3)
		                this.total = parseFloat(total.value).toFixed(3)
	                }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },

            clear() {
                this.meterType = ''
                this.personal_account = ''
                this.dateTime = ''
                this.t1 = ''
                this.t2 = ''
                this.total = ''
                this.customer_address = ''
                this.customer_type = ''
            }
        }
    }
</script>

<style scoped>
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