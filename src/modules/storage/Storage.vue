<template>
    <v-card>
        <v-data-table
            :search="search"
            :loading="loading"
            sort-by="id"
            height="43vh"
            class="elevation-1 meter-table"
            single-select
            item-key="ID"
            :items-per-page="100"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text':'счетчиков на странице',
                'items-per-page-options': [100, 500, 1000]
            }"
            loading-text="Идет загрузка счетчиков..."
            fixed-header
            :headers="selectedHeaders"
            :items="meters"
            :options.sync="options"
            :server-items-length="totalMeters"
            @click:row="initializeLogs"
        >
            <template v-slot:no-results>
                <span>Идет загрузка счетчиков...</span>
            </template>

            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
            </template>

            <template v-slot:header.SERIAL_NUMBER="{ header }">
                {{ header.text }}
                <v-menu
                    nudge-bottom="10px"
                    nudge-left="140px"
                    offset-y
                    :close-on-content-click="false"
                    origin="center center"
                    transition="scale-transition"
                    ref="filterBySerialNumberMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterBySerialNumberColor" small>
                                mdi-filter-plus
                            </v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-serial-number-wrapper">
                        <v-text-field
                            class="p-3 pt-5 pb-0"
                            label="Введите фильтр"
                            append-icon="mdi-filter-check"
                            variant="solo"
                            @click:append="doFilter(`serialNumber`)"
                            @keydown.enter="doFilter(`serialNumber`)"
                            @click:clear="serialNumberClearOnClick"
                            v-model="filterBySerialNumber"
                            clearable
                        >
                        </v-text-field>
                    </div>
                </v-menu>
            </template>

            <template v-slot:header.METER_TYPE="{ header }">
                {{ header.text }}
                <v-menu
                    nudge-bottom="10px"
                    nudge-left="100px"
                    offset-y
                    :close-on-content-click="false"
                    origin="center center"
                    transition="scale-transition"
                    ref="filterByTypeMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterByTypeColor" small>
                                mdi-filter-plus
                            </v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-type-wrapper p-1 pr-2">
                        <v-combobox
                            :items="types"
                            item-text="TYPE_NAME"
                            label="Выберите тип"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByType"
                            clearable
                            multiple
                            @change="doFilter"
                        >
                        </v-combobox>
                    </div>
                </v-menu>
            </template>

            <template v-slot:header.METER_LOCATION="{ header }">
                {{ header.text }}
                <v-menu
                    nudge-bottom="10px"
                    nudge-left="180px"
                    offset-y
                    :close-on-content-click="false"
                    origin="center center"
                    transition="scale-transition"
                    ref="filterByLocationMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterByLocationColor" small>
                                mdi-filter-plus
                            </v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-location-wrapper p-1 pr-2">
                        <v-combobox
                            :items="locations"
                            item-text="text"
                            label="Выберите местонахождение"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByLocation"
                            clearable
                            multiple
                            @change="doFilter"
                        >
                        </v-combobox>
                    </div>
                </v-menu>
            </template>

            <template v-slot:top>
                <v-toolbar
                    flat
                    height="70px"
                >
                    <!-- Поиск -->
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Поиск"
                        hide-details
                        clearable
                        class="search-text-input"
                    />
                </v-toolbar>
            </template>

            <!-- Подмена значений таблицы на лэйблы -->
            <template v-slot:item.METER_TYPE="{ item }">
                {{ getMeterTypeTitle(item.METER_TYPE) }}
            </template>
            <template v-slot:item.ACCURACY_CLASS="{ item }">
                {{ getAccuracyClassTitle(item.ACCURACY_CLASS) }}
            </template>
            <template v-slot:item.CONDITION="{ item }">
                {{ getConditionTitle(item.CONDITION) }}
            </template>
            <template v-slot:item.PROPERTY="{ item }">
                {{ getOwnerTitle(item.PROPERTY) }}
            </template>
            <template v-slot:item.METER_LOCATION="{ item }">
                {{ getLocationTitle(item.METER_LOCATION) }}
            </template>
            <template v-slot:item.CALIBRATION_DATE="{ item }">
                {{ formatDate(item.CALIBRATION_DATE) }}
            </template>
            <template v-slot:item.CURRENT_OWNER="{ item }">
                {{ getEmployeeTitle(item.CURRENT_OWNER) }}
            </template>
            <!-- Когда нет данных -->
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
                <v-btn
                    color="primary"
                    @click="initializeMeters"
                >
                    Перезагрузить
                </v-btn>
            </template>
        </v-data-table>
        <log-table></log-table>
    </v-card>
</template>

<script>
	import ActionColumn from "../registration/components/ActionColumn"
    import LogTable from "./LogTable";
	import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

	export default {
		name: "Storage",
		components: {
			actionColumn: ActionColumn,
			logTable: LogTable,
		},
		data: () => ({
			options: {},
			filterBySerialNumber: '',
			filterByType: [],
			filterByLocation: [],
            search: '',
			moduleName: 'meter_storage',
			disableColumnActions: false,
			selectedHeaders: [],
			headers: [
				{
					text: 'ID',
                    align: 'center',
                    value: 'ID',
                    sortable: true,
                    index: 0,
					width: '80px'
                },
				{
					text: 'Тип',
                    value: 'METER_TYPE',
                    sortable: false,
                    align: 'center',
                    cellClass: 'table-small-cell',
                    index: 1,
					width: '160px'
                },
				{
					text: 'Серийный номер',
					value: 'SERIAL_NUMBER',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 2,
                    width: '160px'
				},
				{
					text: 'Класс точности',
					value: 'ACCURACY_CLASS',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 3
				},
				{
					text: 'Номер паспорта',
					value: 'PASSPORT_NUMBER',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 4
				},
				{
					text: 'Состояние',
					value: 'CONDITION',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 5,
					width: '80px'
				},
				{
					text: 'Дата поверки',
					value: 'CALIBRATION_DATE',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 6
				},
				{
					text: 'Межповерчный интервал',
					value: 'CALIBRATION_INTERVAL',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 7,
					width: '80px'
				},
				{
					text: 'Местоположение',
					value: 'METER_LOCATION',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 8
				},
				{
					text: 'Текущий владелец',
					value: 'CURRENT_OWNER',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 9
				},
				{
					text: 'Собственник',
					value: 'PROPERTY',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 10
				},
			],
			settings: ['columns'],
			filterBySerialNumberColor: 'grey',
			filterByTypeColor: 'grey',
			filterByLocationColor: 'grey',
			totalMeters: 0,
            filters: {},
		}),
		created() {
			this.setCookies()

			$cookies.get('meter_storage_columns')
				? this.changeColumnsVisibility($cookies.get('meter_storage_columns').split(',').map(column => +column))
				: this.selectedHeaders = this.headers

			const isFavorite = $cookies.get('common_favorite_module')

			isFavorite === '/storage'
				? this.setFavoriteModuleColor(this.colorGold)
				: this.setFavoriteModuleColor('')
		},
        mounted() {
	        if (!this.checkAuth())
		        return

	        if (!this.activeModules.filter(module => module.name === this.$route.name.toLowerCase()).length)
		        this.$router.push('/')

	        document.onkeydown = () => {
		        const route = this.$route.name === 'Storage'
		        if (window.event.keyCode === 18 && route)
			        this.initializeMeters()
	        }

	        this.initializeTypes()
            this.initializeEmployees()
        },
		watch: {
			options: {
				handler () {
					!Object.keys(this.filters).length ? this.initializeMeters() : this.doFilter()
				},
				deep: true,
			},
			filterBySerialNumber: function(newVal, oldVal) {
				!newVal ? this.filterBySerialNumberColor = 'grey' : this.filterBySerialNumberColor = 'blue'
            },
			filterByType: function(newVal, oldVal) {
				!newVal.length ? this.filterByTypeColor = 'grey' : this.filterByTypeColor = 'blue'
			},
			filterByLocation: function(newVal, oldVal) {
				this.filterByLocationColor = !newVal.length ? 'grey' :'blue'
			}
        },
		computed: {
			...mapState({
				loading: state => state.storage.meterLoading,
				colorBlue: state => state.colorBlue,
				colorRed: state => state.colorRed,
				colorGreen: state => state.colorGreen,
				colorOrange: state => state.colorOrange,
				colorGrey: state => state.colorGrey,
				colorGold: state => state.colorGold,
			}),
			...mapGetters({
				getCookies: 'getCookies',
				meters: 'storage/getMeters',
				activeModules: 'getActiveModules',
				types: 'storage/getMeterTypes',
				accuracyClasses: 'storage/getAccuracyClasses',
				customerTypes: 'storage/getCustomerTypes',
				conditions: 'storage/getConditions',
				locations: 'storage/getLocations',
				owners: 'storage/getOwners',
				employees: 'storage/getEmployees',
			}),
			showHeaders() {
				return this.headers.filter(header => this.selectedHeaders.includes(header))
			}
		},
		inject: ['showNotification', 'showNotificationStandardError', 'checkAuth'],
        provide: function () {
	        return {
		        formatDate: this.formatDate,
		        getEmployeeTitle: this.getEmployeeTitle,
		        getMeterTypeTitle: this.getMeterTypeTitle
	        }
        },
		methods: {
			...mapMutations('storage', ['setMeters']),
			...mapMutations(['setFavoriteModuleColor']),
			...mapActions('storage', [
                'filter',
                'fetchMeterTypes',
                'fetchMetersPerPage',
                'fetchEmployees',
				'fetchLogs'
            ]),

			setCookies() {
				if (this.getCookies)
					this.settings.forEach(setting => this.checkAndSetCookieValue(setting))
			},

			//Обработка куки
			checkAndSetCookieValue(settings) {
				const cookieName = `${this.moduleName}_${settings}`
				if (!$cookies.get(cookieName)) {
					const module = this.getCookies[this.moduleName]
					if (module) {
						const cookie = module.find(cookie => cookie.settings === settings)
						if (cookie)
							$cookies.set(cookieName, cookie.value, '4h')
					}
				}
			},

			changeColumnsVisibility(columns) {
				this.selectedHeaders = this.headers.filter(header => columns.includes(header.index))
			},

            initializeTypes() {
                this.fetchMeterTypes()
            },

			initializeEmployees() {
				this.fetchEmployees()
			},

            async initializeMeters() {
	            this.totalMeters = await this.fetchMetersPerPage(this.options)
	            //this.showNotification(`Список счетчиков успешно обновлен`, this.colorGreen)
            },

			getMeterTypeTitle(meterType) {
				return this.types.find(type => meterType === type.TYPE_INDEX).TYPE_NAME
			},

			getAccuracyClassTitle(accuracyClass) {
				return this.accuracyClasses.find(accClass => accuracyClass === accClass.value).text
			},

			getConditionTitle(condition) {
				return this.conditions.find(cond => condition === cond.value).text
			},

			getLocationTitle(location) {
				return this.locations.find(loc => location === loc.value).text
			},

			getOwnerTitle(owner) {
				return this.owners.find(own => owner === own.value).text
			},

			getEmployeeTitle(employee) {
				if (employee === 0)
					return 'отсутствует'
				const emp = this.employees.find(emp => employee === emp.STAFF_ID)
				return emp ?
                    `${ emp.EMPLOYEE_LAST_NAME } ${ emp.EMPLOYEE_FIRST_NAME[0] }. ${ emp.EMPLOYEE_MIDDLE_NAME[0] }.`
                    : employee
			},

            serialNumberClearOnClick() {
				this.filterBySerialNumber = ''
                this.doFilter()
            },

			async doFilter(inputSource) {
				switch (inputSource) {
					case `serialNumber`: this.$refs.filterBySerialNumberMenu.save(); break;
				}

                this.checkAllFilters()

				console.log(this.filters)

                if (!Object.keys(this.filters).length) {
	                await this.initializeMeters()
                } else {
                	try {
		                this.totalMeters = await this.filter({ filters: this.filters, options: this.options })
	                } catch (e) {
                        this.showNotificationStandardError(e)
	                }
                }
			},

            checkAllFilters() {
	            this.filterBySerialNumber
		            ? this.filters['serialNumber'] = this.filterBySerialNumber
                    : delete this.filters['serialNumber']

	            this.filterByType.length
		            ? this.filters['types'] = this.filterByType.map(type => type.TYPE_INDEX)
	                : delete this.filters['types']


	            this.filterByLocation.length
                    ? this.filters['locations'] = this.filterByLocation.map(type => type.value)
                    : delete this.filters['locations']
            },

			initializeLogs(item, row) {
				row.select(true)

				this.fetchLogs(item.GUID)
            },

			formatDate(dateToFormat) {
				if (!dateToFormat)
					return 'отсутствует'

				const date = new Date(dateToFormat)
				let day = String(date.getDate())
				let month = String(date.getMonth() + 1)
				const year = date.getFullYear()

				day = day.length < 2 ? day.padStart(2, '0') : day
				month = month.length < 2 ? month.padStart(2, '0') : month

				return `${day}.${month}.${year}`
			},
		},
	}
</script>

<style scoped>
    .meter-table {
        border-radius: 0 !important;
    }

    tr.v-data-table__selected {
        background: #7d92f5 !important;
    }

    .table-small-cell {
        font-size: 12px !important;
    }

    td {
        text-align: center !important;
    }

    .selected-headers {
        max-width: 450px;
    }

    .search-text-input {
        max-width: 350px;
    }

    .header-filter-wrapper {
        background-color: white;
        display: flex;
        align-items: center;
    }

    .header-filter-serial-number-wrapper {
        width: 250px;
    }

    .header-filter-type-wrapper {
        width: 550px;
    }

    .header-filter-location-wrapper {
        width: 350px;
    }

</style>