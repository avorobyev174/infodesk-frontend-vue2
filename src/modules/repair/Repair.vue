<template>
    <v-card>
        <v-data-table
            :search="search"
            :loading="loading"
            sort-by="id"
            height="80vh"
            class="elevation-1"
            single-select
            item-key="id"
            :items-per-page="100"
            :footer-props="{
                showFirstLastPage: true,
                'items-per-page-text': 'счетчиков на странице',
                'items-per-page-options': [ 100, 500, 1000 ]
            }"
            loading-text="Идет загрузка счетчиков..."
            fixed-header
            :headers="headers"
            :items="meters"
        >
            <template v-slot:no-results>
                <p class="pt-4">Нет данных...</p>
            </template>
            <template v-slot:no-data>
                <p class="pt-4">Нет данных...</p>
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
                            @click="openProgrammingDialog(item)"
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
        </v-data-table>
        <dialog-custom
            ref="ProgrammingValueDialog"
            :max-width="700"
            title="Вы уверены что хотите подтвердить изменение данных?"
            @submit="setProgrammingDone"
        />
    </v-card>
</template>

<script>
	import { mapActions, mapGetters, mapState} from "vuex"
	import DialogCustom from "../utils-components/dialog/DialogCustom"
	import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
	import DictionaryMixin from "../mixins/DictionaryMixin"

	export default {
		name: "Repair",
		components: {
			DialogCustom,
		},
		data: () => ({
			search: '',
			module: 'repair',
			currentItem: {},
			headers: [
				{ text: 'ID', sortable: false, align: 'center', value: 'id' },
				{ text: 'Тип', value: 'type', sortable: true, align: 'center' },
				{ text: 'Серийный номер', value: 'serial_number', sortable: false, align: 'center' },
				{ text: 'IP адрес', value: 'ip_address', sortable: false, align: 'center' },
				{ text: 'Порт', value: 'port', sortable: false, align: 'center' },
				{ text: 'Связной', value: 'contact', sortable: false, align: 'center' },
				{ text: 'Настройка данных', value: 'prog_value', sortable: true, align: 'center' },
			],
		}),
		computed: {
			...mapGetters({
				meters: 'repair/getMeters',
                isLogin: 'getIsLogin',
			}),
			...mapState([ 'colorGreen', 'colorGrey', 'colorBlue']),
			...mapState('repair', [ 'loading', ])
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
		mixins: [ DictionaryMixin, FavoriteModuleMixin ],
		methods: {
	        ...mapActions('repair', [
		        'fetchMeters',
                'setProgrammingValue'
	        ]),

	        async initializeMeters() {
				try {
					await this.fetchMeters()
                } catch (e) {
					this.showNotificationRequestError(e)
				}
	        },

			openProgrammingDialog(item) {
				this.$refs.ProgrammingValueDialog.dialogOpen()
                this.currentItem = item
			},

            async setProgrammingDone() {
	            this.$refs.ProgrammingValueDialog.dialogClose()
                try {
	                await this.setProgrammingValue({ id: this.currentItem.id, value: 1 })
	                this.showNotificationSuccess('Настройка данных успешна обновлена')
                } catch (e) {
	                this.showNotificationRequestError(e)
                }
            },
		}
	}
</script>

<style scoped>
    .search-text-input {
        max-width: 350px;
    }
</style>