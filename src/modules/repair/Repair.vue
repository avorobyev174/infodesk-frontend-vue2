<template>
    <v-card>
        <v-data-table
            :search="search"
            :loading="loading"
            sort-by="id"
            height="80vh"
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
            :headers="headers"
            :items="meters"
        >
            <template v-slot:no-results>
                <span>Нет данных...</span>
            </template>

            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
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
            <template v-slot:item.type="{ item }">
                {{ getMeterTypeTitle(item.type) }}
            </template>
            <template v-slot:item.ip_address="{ item }">
                {{ getIpAddressTitle(item.ip_address) }}
            </template>
            <template v-slot:item.prog_value="{ item }">
                <v-tooltip bottom v-if="item.prog_value === 0">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            size="25"
                            class="ma-2"
                            v-bind="attrs"
                            v-on="on"
                            :color="colorGrey"
                            @click="openProgrammingDoneDialog(item)"
                        >
                            mdi-checkbox-blank-circle-outline
                        </v-icon>
                    </template>
                    <span>Подтвердить внесение данных</span>
                </v-tooltip>
                <v-icon
                    v-else-if="item.prog_value === 1"
                    size="25"
                    class="ma-2"
                    :color="colorBlue"
                >
                    mdi-checkbox-marked-circle-outline
                </v-icon>
                <v-icon
                    v-else
                    size="25"
                    class="ma-2"
                    :color="colorGreen"
                >
                    mdi-checkbox-marked-circle-plus-outline
                </v-icon>
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
        <simple-dialog
            :dialog-open="programmingDialogModel"
            max-width="700px"
            title="Вы уверены что хотите подтвердить загрузку в пирамиду данных?"
            @okButtonClickEvent="setProgrammingDone"
            @cancelButtonClickEvent="closeProgrammingDoneDialog"
        ></simple-dialog>
    </v-card>
</template>

<script>
	import SimpleDialog from "../utils-components/SimpleDialog"
	import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
	import RegistrationMixin from "../registration/mixins/RegistrationMixin"

	export default {
		name: "Repair",
		components: {
			SimpleDialog,
		},
		data: () => ({
			search: '',
			moduleName: 'meter_repair',
			programmingDialogModel: false,
			currentItem: {},
			headers: [
				{ text: 'ID', sortable: false, align: 'center', value: 'id'},
				{ text: 'Тип', value: 'type', sortable: true, align: 'center', cellClass: 'table-small-cell'},
				{ text: 'Серийный номер', value: 'serial_number', sortable: false, align: 'center', cellClass: 'table-small-cell'},
				{ text: 'IP адрес', value: 'ip_address', sortable: false, align: 'center', cellClass: 'table-small-cell'},
				{ text: 'Порт', value: 'port', sortable: false, align: 'center', cellClass: 'table-small-cell'},
				{ text: 'Связной', value: 'contact', sortable: false, align: 'center', cellClass: 'table-small-cell'},
				{ text: 'Настройка данных', value: 'prog_value', sortable: true, align: 'center', cellClass: 'table-small-cell'},
			],
		}),
		computed: {
			...mapGetters({
				meters: 'repair/getMeters',
				types: 'registration/getTypes',
				ipAddresses: 'registration/getIpAddress',
				activeModules: 'getActiveModules',
                isLogin: 'getIsLogin',
			}),
			...mapState({
				loading: state => state.repair.isMetersLoading,
				colorGreen: state => state.colorGreen,
				colorGrey: state => state.colorGrey,
				colorBlue: state => state.colorBlue,
			})
        },
		inject: [
			'showNotificationSuccess',
            'showNotificationRequestError',
        ],
        mounted() {
	        if (!this.isLogin) {
		        return
	        }

	        this.initializeMeters()

	        document.onkeydown = (evt) => {
		        if (this.$route.name !== 'Repair') {
			        return
		        }
		        if (evt.key === 'Alt') {
			        this.initializeMeters()
		        }
	        }
        },
		mixins: [ RegistrationMixin ],
		created() {
			const isFavorite = $cookies.get('common_favorite_module')

			isFavorite === '/repair'
				? this.setFavoriteModuleColor(this.colorGold)
				: this.setFavoriteModuleColor('')
		},
		methods: {
			...mapMutations([ 'setFavoriteModuleColor' ]),
	        ...mapActions('repair', [
		        'fetchMeters',
                'setProgrammingValue'
	        ]),
			...mapActions('registration', [
				'fetchTypes'
			]),

	        async initializeMeters() {
				try {
					await this.fetchTypes()
					await this.fetchMeters()
					this.showNotificationSuccess('Список счетчиков успешно обновлен')
                } catch (e) {
					this.showNotificationRequestError(e)
				}
	        },

			openProgrammingDoneDialog(item) {
				this.programmingDialogModel = true
                this.currentItem = item
			},

            async setProgrammingDone() {
	            this.closeProgrammingDoneDialog()
                try {
	                const updatedMeter = await this.setProgrammingValue({ id: this.currentItem.id, value: 1 })
	                const mainUpdatedMeter = this.meters.find(mainMeter => updatedMeter.id === mainMeter.id)
	                Object.assign(mainUpdatedMeter, updatedMeter)
	                this.showNotificationSuccess('ПКЭ успешно обновлен')
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },

			closeProgrammingDoneDialog() {
				this.programmingDialogModel = false
			}
		}
	}
</script>

<style scoped>
    .search-text-input {
        max-width: 350px;
    }
</style>