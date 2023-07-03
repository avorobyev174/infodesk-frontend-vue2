<template>
    <v-card>
        <v-data-table
            :loading="loading"
            height="43vh"
            class="elevation-1 meter-table"
            single-select
            item-key="id"
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
            <template v-slot:header.serial_number="{ header }">
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
                            label="Введите серийный номер"
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
            <template v-slot:header.meter_type="{ header }">
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
            <template v-slot:header.meter_location="{ header }">
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
            <template v-slot:header.current_owner="{ header }">
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
                    <v-spacer></v-spacer>
                    <main-menu
                        v-if="!isObserver"
                        class="pr-2"
                        @acceptOrIssue="$refs.acceptOrIssueDialog.open(false)"
                        @register="$refs.registerDialog.open(false)"
                        @showHideColumns="$refs.showHideColumnsDialog.open()"
                        @showHideAllMeters="showHideAllMeters"
                        @routerRegister="$refs.registerDialog.open(true)"
                        @routerAcceptOrIssue="$refs.acceptOrIssueDialog.open(true)"
                        @repairOrMaterialsAdd="$refs.repairAndMaterialsDialog.open()"
                    ></main-menu>
                </v-toolbar>
            </template>
            <template v-slot:item.meter_type="{ item }">
                {{ getMeterTypeTitle(item.meter_type) }}
            </template>
            <template v-slot:item.serial_number="{ item }">
                <v-chip
                    v-if="item.repairColor"
                    :color="item.repairColor === 1 ? colorOrange : colorGreen">
                    {{ item.serial_number }}
                </v-chip>
                <span v-else>
                    {{ item.serial_number }}
                </span>
            </template>
            <template v-slot:item.accuracy_class="{ item }">
                {{ getAccuracyClassTitle(item.accuracy_class) }}
            </template>
            <template v-slot:item.condition="{ item }">
                {{ getConditionTitle(item.condition) }}
            </template>
            <template v-slot:item.property="{ item }">
                {{ getOwnerTitle(item.property) }}
            </template>
            <template v-slot:item.meter_location="{ item }">
                {{ getLocationTitle(item.meter_location) }}
            </template>
            <template v-slot:item.calibration_date="{ item }">
                {{ formatDate(item.calibration_date) }}
            </template>
            <template v-slot:item.current_owner="{ item }">
                {{ getEmployeeTitleByStaffId(item.current_owner) }}
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
        <repair-and-materials-dialog
            ref="repairAndMaterialsDialog"
        ></repair-and-materials-dialog>
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
    import StorageMixin from "./mixins/StorageMixin"
    import RepairAndMaterialsDialog from "./components/RepairAndMaterialsDialog"

	export default {
		name: "Storage",
		components: {
			RegisterDialog,
			MainMenu,
			LogTable,
            AcceptOrIssueDialog,
			ShowHideColumnsDialog,
			ActionColumn,
			EditDialog,
			RepairAndMaterialsDialog
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
                    value: 'id',
                    sortable: true,
                    index: 0,
					width: '80px',
				},
				{
					text: 'Тип',
                    value: 'meter_type',
                    sortable: true,
                    align: 'center',
                    cellClass: 'table-small-cell',
                    index: 1,
					width: '160px'
                },
				{
					text: 'Серийный номер',
					value: 'serial_number',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 2,
                    width: '160px'
				},
				{
					text: 'Класс точности',
					value: 'accuracy_class',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 3
				},
				{
					text: 'Номер паспорта',
					value: 'passport_number',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 4
				},
				{
					text: 'Состояние',
					value: 'condition',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 5,
					width: '80px'
				},
				{
					text: 'Дата поверки',
					value: 'calibration_date',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 6
				},
				{
					text: 'Межповерчный интервал',
					value: 'calibration_interval',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 7,
					width: '80px'
				},
				{
					text: 'Местоположение',
					value: 'meter_location',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 8
				},
				{
					text: 'Текущий владелец',
					value: 'current_owner',
					sortable: false,
					align: 'center',
					cellClass: 'table-small-cell',
					index: 9
				},
				{
					text: 'Собственник',
					value: 'property',
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
			actions: [],
            isObserver: false,
            isRepairShowAllFilter: false
		}),
		mixins: [ StorageMixin ],
		inject: [ 'showNotificationRequestError' ],
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
				roles: 'getRoles',
				staffId: 'getStaffId',
				isLogin: 'getIsLogin',
			}),
			showHeaders() {
				return this.headers.filter(header => this.selectedHeaders.includes(header))
			}
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
			filterByOwner: function(newVal) {
				this.filterByOwnerColor = !newVal.length ? 'grey' :'blue'
			},
			search: function(newVal) {
				if (!newVal) {
					this.searchOnClear()
				}
			},
		},
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
	        if (!this.isLogin) {
		        return
	        }

            document.onkeydown = (evt) => {
	            if (evt.key === 'Alt' && this.$route.name === 'Storage') {
		            this.initializeMeters()
	            }
            }

	        this.actions = [ { title: 'Изменить', action: 'edit', icon: 'mdi-pencil' } ]

	        if (this.roles?.storage_module === 'admin') {
		        this.actions.push({ title: 'Удалить', action: 'delete', icon: 'mdi-delete' })
	        }

	        if (this.roles?.storage_module === 'observer') {
		        this.isObserver = true
	        }

	        this.initializeOther()
        },
        provide: function () {
	        return {
		        formatDate: this.formatDate,
		        formatDateIso: this.formatDateIso,
		        getEmployeeTitleByStaffId: this.getEmployeeTitleByStaffId,
		        getMeterTypeTitle: this.getMeterTypeTitle,
		        getMaterialTypeTitle: this.getMaterialTypeTitle,
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
				'fetchLogs',
				'fetchParseOptions',
				'fetchStorageEmployees',
				'fetchMaterialsTypes',
				'getMeterTypesInRepair',
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

			//Инициализация компонента
            async initializeMeters() {
				this.isSearchMeterView = false
                try {
	                if (this.roles?.storage_module === 'repairer') {
		                this.options.role = this.isRepairShowAllFilter ? 'keeper' : 'repairer'
	                }

	                this.totalMeters = await this.fetchMetersPerPage(this.options)
	                this.getMeterTypesInRepair()
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },

			async initializeLogs(item, row) {
				row.select(true)
				try {
					await this.fetchLogs(item.guid)
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			initializeOther() {
				this.fetchMeterTypes()
				this.fetchStorageEmployees()
				this.fetchParseOptions()
				this.fetchMaterialsTypes()
			},

			//Обработка фильтров
			async doFilter(inputSource) {
				if (inputSource === 'serialNumber') {
					this.$refs.filterBySerialNumberMenu.save()
				}

                this.checkAllFilters()

                if (!Object.keys(this.filters).length) {
	                await this.initializeMeters()
                } else {
                	try {
		                if (this.roles?.storage_module === 'repairer') {
			                this.options.role = this.isRepairShowAllFilter ? 'keeper' : 'repairer'
		                }

		                this.totalMeters = await this.meterFilter({ filters: this.filters, options: this.options })
	                } catch (e) {
                        this.showNotificationRequestError(e)
	                }
                }
			},

			resetFilters() {
				this.filterBySerialNumber = ''
				this.filterByType = []
				this.filterByLocation = []
				this.filterByOwner = []
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
		            ? this.filters['types'] = this.filterByType.map((type) => type.index)
	                : delete this.filters['types']

	            this.filterByLocation.length
                    ? this.filters['locations'] = this.filterByLocation.map((loc) => loc.value)
                    : delete this.filters['locations']

	            this.filterByOwner.length
		            ? this.filters['owners'] = this.filterByOwner.map((owner) => owner.staffId)
		            : delete this.filters['owners']
            },

			serialNumberClearOnClick() {
				this.filterBySerialNumber = ''
				this.doFilter()
			},

			async showHideAllMeters(actionType) {
                if (actionType === 'show') {
                    this.isRepairShowAllFilter = true
                } else {
                    this.options.page = 1
	                this.isRepairShowAllFilter = false
                    this.resetFilters()
                }
                await this.initializeMeters()
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
        width: 285px;
    }

    .header-filter-type-wrapper {
        width: 550px;
    }

    .header-filter-location-wrapper {
        width: 350px;
    }

</style>