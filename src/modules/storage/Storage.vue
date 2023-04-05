<template>
    <v-card>
        <v-data-table
            :loading="loading"
            sort-by="id"
            height="43vh"
            class="elevation-1 meter-table"
            single-select
            item-key="ID"
            :items-per-page="500"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text':'счетчиков на странице',
                'items-per-page-options': [100, 250, 500, 1000]
            }"
            loading-text="Идет загрузка счетчиков..."
            fixed-header
            :headers="selectedHeaders"
            :items="isSearchMeterView ? searchMetersView : meters"
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
                            item-text="title"
                            item-value="index"
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

            <template v-slot:header.CURRENT_OWNER="{ header }">
                {{ header.text }}
                <v-menu
                        nudge-bottom="10px"
                        nudge-left="180px"
                        offset-y
                        :close-on-content-click="false"
                        origin="center center"
                        transition="scale-transition"
                        ref="filterByOwnerMenu"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                            <v-icon :color="filterByOwnerColor" small>
                                mdi-filter-plus
                            </v-icon>
                        </v-btn>
                    </template>
                    <div class="header-filter-wrapper header-filter-location-wrapper p-1 pr-2">
                        <v-combobox
                            :items="storageEmployees"
                            item-text="name"
                            item-value="staffId"
                            label="Выберите сотрудника"
                            class="p-3 pt-5 pb-0"
                            v-model="filterByOwner"
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
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Поиск"
                        type="text"
                        hide-details
                        clearable
                        class="search-text-input"
                        @keydown.enter="doSearchOnEnter"
                        @click:clear="searchOnClear"
                    />
                    <v-spacer></v-spacer>
                    <main-menu
                        class="pr-2"
                        @acceptOrIssue="$refs.acceptOrIssueDialog.open(false)"
                        @register="$refs.registerDialog.open(false)"
                        @showHideColums="$refs.showHideColumnsDialog.open()"
                        @routerRegister="$refs.registerDialog.open(true)"
                        @routerAcceptOrIssue="$refs.acceptOrIssueDialog.open(true)"
                    ></main-menu>
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
                {{ getEmployeeTitleByStaffId(item.CURRENT_OWNER) }}
            </template>
            <template v-slot:item.actions="{ item }">
                <action-column
                    ref="actionColumn"
                    @edit="$refs.editDialog.edit(item)"
                    @delete="$refs.editDialog.delete(item)"
                    :actions="actions"
                    :disabledActions="disableColumnActions"
                />
            </template>
        </v-data-table>
        <log-table></log-table>
        <accept-or-issue-dialog
            ref="acceptOrIssueDialog"
        ></accept-or-issue-dialog>
        <register-dialog
            ref="registerDialog"
            :meters="meters"
        ></register-dialog>
        <edit-dialog
            ref="editDialog"
            :meters="meters"
        ></edit-dialog>
        <show-hide-columns-dialog
            ref="showHideColumnsDialog"
            :headers="headers"
            :selectedHeaders="selectedHeaders"
            @changeColumns="changeColumnsVisibility"
            module-name="storage"
        >
        </show-hide-columns-dialog>
    </v-card>
</template>

<script>
    import LogTable from "./LogTable"
	import MainMenu from "./components/MainMenu"
    import AcceptOrIssueDialog from "./components/AcceptOrIssueDialog"
    import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
	import RegisterDialog from "./components/RegisterDialog"
	import ShowHideColumnsDialog from "../utils-components/ShowHideColumnsDialog"
    import ActionColumn from "../utils-components/ActionColumn"
    import EditDialog from "./components/EditDialog"

	export default {
		name: "Storage",
		components: {
			RegisterDialog,
			MainMenu,
			LogTable,
            AcceptOrIssueDialog,
			ShowHideColumnsDialog,
			ActionColumn,
			EditDialog
		},
		data: () => ({
			options: {},
			filterBySerialNumber: '',
			filterByType: [],
			filterByLocation: [],
			filterByOwner: [],
            search: '',
            isSearchMeterView: false,
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
					width: '80px',
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
				{
					text: 'Действия',
                    value: 'actions',
                    sortable: false,
                    align: 'center',
                    cellClass: 'table-small-cell',
                    index: 11
                },
			],
			settings: ['columns'],
			filterBySerialNumberColor: 'grey',
			filterByTypeColor: 'grey',
			filterByLocationColor: 'grey',
			filterByOwnerColor: 'grey',
			totalMeters: 0,
            filters: {},
            searchMeters: [],
			actions: []
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
		        if (window.event.keyCode === 18 && route) {
			        this.initializeMeters()
		        }
	        }

	        this.actions = [ { title: 'Изменить', action: 'edit', icon: 'mdi-pencil' } ]

	        if (this.roles && this.roles.storage_module && this.roles.storage_module === 'admin') {
		        this.actions.push({ title: 'Удалить', action: 'delete', icon: 'mdi-delete' })
	        }

	        this.initializeTypes()
            this.initializeEmployees()
            this.initializeParseOptions()
        },
		watch: {
			options: {
				handler () {
					!Object.keys(this.filters).length ? this.initializeMeters() : this.doFilter()
				},
				deep: true,
			},
			filterBySerialNumber: function(newVal) {
				!newVal ? this.filterBySerialNumberColor = 'grey' : this.filterBySerialNumberColor = 'blue'
            },
			filterByType: function(newVal) {
				!newVal.length ? this.filterByTypeColor = 'grey' : this.filterByTypeColor = 'blue'
			},
			filterByLocation: function(newVal) {
				this.filterByLocationColor = !newVal.length ? 'grey' :'blue'
			},
            search: function(newVal) {
	            if (!newVal) {
		            this.searchOnClear()
	            }
            },
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
				searchMetersView: 'storage/getSearchMetersView',
				activeModules: 'getActiveModules',
				types: 'storage/getMeterTypes',
				accuracyClasses: 'storage/getAccuracyClasses',
				conditions: 'storage/getConditions',
				locations: 'storage/getLocations',
				owners: 'storage/getOwners',
				employees: 'storage/getEmployees',
				storageEmployees: 'storage/getStorageEmployees',
				roles: 'getRoles',
				staffId: 'getStaffId',
			}),
			showHeaders() {
				return this.headers.filter(header => this.selectedHeaders.includes(header))
			}
		},
		inject: ['showNotification', 'showNotificationStandardError', 'checkAuth'],
        provide: function () {
	        return {
		        formatDate: this.formatDate,
		        getEmployeeTitleByStaffId: this.getEmployeeTitleByStaffId,
		        getMeterTypeTitle: this.getMeterTypeTitle,
		        getOwnerTitle: this.getOwnerTitle,
		        getAccuracyClassTitle: this.getAccuracyClassTitle,
		        getConditionTitle: this.getConditionTitle,
		        getEmployeeStaffIdByCard: this.getEmployeeStaffIdByCard,
		        getEmployeeTitleByCard: this.getEmployeeTitleByCard,
		        getLocationTitle: this.getLocationTitle,
		        getEmployeeCardByStaffId: this.getEmployeeCardByStaffId,
		        initializeMeters: this.initializeMeters,
		        resetFilters: this.resetFilters,
	        }
        },
		methods: {
			...mapMutations(['setFavoriteModuleColor', 'setMeters']),
			...mapMutations('storage', ['setMeters', 'setSearchMetersView']),
			...mapActions('storage', [
                'meterFilter',
                'fetchMeterTypes',
                'fetchMetersPerPage',
                'fetchEmployees',
				'fetchLogs',
				'fetchParseOptions',
				'fetchStorageEmployees',
            ]),
            //Обработка куки
			setCookies() {
				if (this.getCookies) {
					this.settings.forEach(setting => this.checkAndSetCookieValue(setting))
				}
			},

			checkAndSetCookieValue(settings) {
				const cookieName = `${ this.moduleName }_${ settings }`
				if (!$cookies.get(cookieName)) {
					const module = this.getCookies[ this.moduleName ]
					if (module) {
						const cookie = module.find(cookie => cookie.settings === settings)
						if (cookie) {
							$cookies.set(cookieName, cookie.value, '4h')
						}
					}
				}
			},

			changeColumnsVisibility(columns) {
				this.selectedHeaders = this.headers.filter(header => columns.includes(header.index))
			},

            doSearchOnEnter() {
				if (!this.search) {
					return
				}

				this.isSearchMeterView = true

	            const searchedMeters = this.meters.filter(meter => {
		            return String(meter.ID).includes(this.search) ||
			            String(meter.SERIAL_NUMBER).includes(this.search) ||
			            String(meter.PASSPORT_NUMBER).includes(this.search)
	            })

	            this.setSearchMetersView(searchedMeters)
                this.totalMeters = this.searchMetersView.length
            },

            searchOnClear() {
				if (this.isSearchMeterView) {
					this.initializeMeters()
				}
            },

            initializeTypes() {
                this.fetchMeterTypes()
            },

			initializeEmployees() {
				//this.fetchEmployees()
				this.fetchStorageEmployees()
			},

			initializeParseOptions() {
				this.fetchParseOptions()
			},

            async initializeMeters() {
				this.isSearchMeterView = false
                try {
	                this.totalMeters = await this.fetchMetersPerPage(this.options)
                } catch (e) {
	                this.showNotificationStandardError(e)
                }
            },

			getMeterTypeTitle(meterType) {
				const type = this.types.find(type => parseInt(meterType) === type.index)
                return type ? type.title : meterType
			},

			getAccuracyClassTitle(accuracyClass) {
				const accClass = this.accuracyClasses.find(accClass => accuracyClass === accClass.value)
				return accClass ? accClass.text : accuracyClass
			},

			getConditionTitle(condition) {
				const cond = this.conditions.find(cond => condition === cond.value)
				return cond ? cond.text : condition
			},

			getLocationTitle(location) {
				const loc = this.locations.find(loc => location === loc.value)
				return loc ? loc.text : location
			},

			getOwnerTitle(owner) {
				const own =  this.owners.find(own => owner === own.value)
				return own ? own.text : owner
			},

			getEmployeeTitleByStaffId(employeeStaffId) {
				if (employeeStaffId === 0) {
					return 'Отсутствует'
				}
				const emp = this.storageEmployees.find(emp => employeeStaffId === emp.staffId)
				return emp ?  emp.name : employeeStaffId
			},

			getEmployeeStaffIdByCard(employeeCard) {
				if (!employeeCard) {
					return 'Неизвестный сотрудник'
				}
				const emp = this.storageEmployees.find(emp => parseInt(employeeCard) === emp.card)
				return emp ? emp.staffId : 'Неизвестный сотрудник'
			},

			getEmployeeCardByStaffId(staffId) {
				if (!staffId) {
					return 'Неизвестный сотрудник'
				}
				const emp = this.storageEmployees.find(emp => staffId === emp.staffId)
				return emp ? emp.card : 'Неизвестный сотрудник'
			},

			getEmployeeTitleByCard(employeeCard) {
				if (!employeeCard) {
					return 'Неизвестный сотрудник'
				}
				const emp = this.storageEmployees.find(emp => parseInt(employeeCard) === emp.card)
				return emp ? emp.name : 'Неизвестный сотрудник'
			},

            serialNumberClearOnClick() {
				this.filterBySerialNumber = ''
                this.doFilter()
            },

			async doFilter(inputSource) {
				if (inputSource === 'serialNumber') {
					this.$refs.filterBySerialNumberMenu.save()
				}

                this.checkAllFilters()

                if (!Object.keys(this.filters).length) {
	                await this.initializeMeters()
                } else {
                	try {
		                this.totalMeters = await this.meterFilter({ filters: this.filters, options: this.options })
	                } catch (e) {
                        this.showNotificationStandardError(e)
	                }
                }
			},

			resetFilters() {
				this.filterBySerialNumber = ''
				this.filterByType = []
				this.filterByLocation = []
            },

            checkAllFilters() {
				if (this.filterBySerialNumber) {
					this.filters['serialNumber'] = this.filterBySerialNumber.startsWith('0')
                        ? this.filterBySerialNumber.slice(1)
                        : this.filterBySerialNumber
                } else {
					delete this.filters['serialNumber']
                }

	            this.filterByType.length
		            ? this.filters['types'] = this.filterByType.map(type => type.index)
	                : delete this.filters['types']


	            this.filterByLocation.length
                    ? this.filters['locations'] = this.filterByLocation.map(loc => loc.value)
                    : delete this.filters['locations']

	            this.filterByOwner.length
		            ? this.filters['owners'] = this.filterByOwner.map(owner => owner.staffId)
		            : delete this.filters['owners']
            },

			async initializeLogs(item, row) {
				row.select(true)
                try {
					await this.fetchLogs(item.GUID)
                } catch (e) {
	                this.showNotificationStandardError(e)
                }
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

				return `${ day }.${ month }.${ year }`
			},
		},
	}
</script>

<style scoped>
    .meter-table {
        border-radius: 0 !important;
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