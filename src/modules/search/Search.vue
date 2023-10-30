<template>
   <div>
       <v-form
           ref="form"
           lazy-validation
           @submit.prevent="getMeterData"
       >
            <v-card class="m-3 px-4 pb-4" max-width="500px">
                <v-card-text class="pb-0">
                    <p class="text-h6 text-secondary search-card-title">Поиск данных счетчика</p>
                    <p class="search-card-info">поиск данных и показаний счетчика за период</p>
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
                <div class="period">
                    <v-text-field
                        type="date"
                        label="Начало периода"
                        v-model="startDate"
                        clearable
                        outlined
                    >
                    </v-text-field>
                    <v-text-field
                        type="date"
                        label="Конец периода"
                        v-model="endDate"
                        clearable
                        outlined
                    >
                    </v-text-field>
                </div>
                <div style="padding: 0 16px;">
                    <v-select
                        v-model="dataType"
                        label="Тип показаний"
                        v-if="dataTypeAccess"
                        :items="[ 'Данные за сутки', 'Данные за час' ]"
                        outlined
                    />
                </div>
           </v-card>
       </v-form>
       <v-card class="m-3 px-3 pb-4" max-width="500px" v-show="isShowMeterData">
           <v-card-text>
               <p class="text-h6 text-secondary search-card-title">Данные</p>
           </v-card-text>
           <div class="px-4 pb-4">
               <div class="meter-content-data">
                   <v-text-field
                       v-model="destination"
                       readonly
                       label="Источник данных"
                       type="text"
                   />
                   <v-text-field
                       v-model="meterType"
                       readonly
                       label="Тип счетчика"
                       type="text"
                   />
                   <v-text-field
                       v-model="customer_type"
                       v-if="customer_type"
                       readonly
                       label="Тип потребителя"
                       type="text"
                   />
                   <v-text-field
                       v-model="personal_account"
                       v-if="personal_account"
                       readonly
                       label="Лицевой номер"
                       type="text"
                   />
                   <v-text-field
                       v-model="customer_address"
                       v-if="customer_address"
                       readonly
                       label="Адрес"
                       type="text"
                   />
               </div>
               <v-subheader style="font-size: 13px; height: 16px" class="px-0">{{ lastDateTitle }}</v-subheader>
               <v-simple-table class="py-2" v-show="meterData.length">
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
                           <tr v-for="{ dateTime, data } in meterData">
                               <td class="text-center">{{ formatDate(dateTime, true) }}</td>
                               <td class="text-center">{{ parseFloat(data[1000]).toFixed(3) }}</td>
                               <td class="text-center">{{ data[1002] ? parseFloat(data[1002]).toFixed(3) : '-' }}</td>
                               <td class="text-center">{{ data[1001] ? parseFloat(data[1001]).toFixed(3) : '-' }}</td>
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
	        requiredRules: [
		        v => !!v || 'Обязательно к заполнению',
	        ],
	        dataType: 'Данные за сутки',
	        startDate: '',
	        endDate: '',
            meterData: [],
            isShowMeterData: false,
            serialNumber: '',
            meterType: '',
            destination: '',
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
                v => (v && String(v).length >= 6) || 'Должно быть не меньше 6 символов',
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
                return this.meterData?.length ? 'Последние показания' : 'Последние показания отсутствуют'
            },
            dataTypeAccess() {
            	return this.startDate && this.endDate
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
	                const { meter, data } = await this.getMeterDataBySerialNumber({
                        serialNumber: this.serialNumber,
		                startDate: this.startDate,
		                endDate: this.endDate,
		                dataType: this.dataType
	                })

                    this.clear()
	                this.loading = false

                    if (!data.length) {
	                    this.isShowMeterData = false
	                    return this.showNotificationInfo('Данные счетчика не найдены')
                    }

                    const { type, personal_account, customer_type, customer_address } = meter
                    const { mark, destination } = data.at(0)
                    this.isShowMeterData = true
                    let dest = ''
                    switch (destination) {
	                    case 1: dest = 'Бытовые старые'; break
	                    case 2: dest = 'Бытовые новые'; break
	                    case 3: dest = 'Матрица'; break
	                    case 4: dest = 'Альфа-Центр'; break
	                    case 5: dest = 'Пирамида'
                    }
                    this.destination = dest
                    this.meterType = type ? this.getMeterTypeTitle(type) : mark
	                this.customer_type = customer_type
                    this.customer_address = customer_address
                    this.personal_account = personal_account

	                if (data.length) {
		                const dataMap = new Map()
	                	data.forEach(({ channel_type, date_time, value }) => {
	                		if (dataMap.has(date_time)) {
				                const dataProfile = dataMap.get(date_time)
                                dataProfile[ channel_type ] = value
				                dataMap.set(date_time, dataProfile)
                            } else {
	                			const dataProfile = {}
				                dataProfile[ channel_type ] = value
				                dataMap.set(date_time, dataProfile)
                            }
		                })
		                this.meterData = Array.from(dataMap, ([ dateTime, data ]) => ({ dateTime, data }))
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
                this.meterData = []
            }
        }
    }
</script>

<style scoped>
    .period {
        display: flex;
        gap: 10px;
        padding: 0 16px;
    }

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