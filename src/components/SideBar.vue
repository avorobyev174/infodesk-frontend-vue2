<template>
    <v-card tile>
        <v-navigation-drawer
            v-model="drawer"
            :mini-variant="getSideBarState"
            permanent
            clipped
            app
            width="220"
        >
            <v-list dense>
                <v-list-item
                    v-for="{ title, icon, url } in activeModules"
                    :key="title"
                    :to="url"
                    style="text-decoration: none;"
                    class="side-bar__item"
                >
                    <v-tooltip right v-if="getSideBarState">
                        <template v-slot:activator="{ on, attrs }">
                            <v-list-item-icon
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon>{{ icon }}</v-icon>
                            </v-list-item-icon>
                        </template>
                        <span>{{ title }}</span>
                    </v-tooltip>
                    <v-list-item-icon v-else>
                        <v-icon>{{ icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ title }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
    </v-card>
</template>

<script>
	import { mapGetters } from "vuex"
	import jwt from "jsonwebtoken"

	export default {
		name: 'SideBar',
		data: () => ({
			modules: [
				{ title: 'Склад', icon: 'mdi-meter-electric-outline', url: '/storage', name: 'storage' },
				{ title: 'Программирование', icon: 'mdi-desktop-classic', url: '/programming', name: 'programming' },
				{ title: 'Поручения', icon: 'mdi-clipboard-text-multiple-outline', url: '/service', name: 'service' },
				{ title: 'ОРБ', icon: 'mdi-progress-pencil', url: '/repair', name: 'repair' },
				{ title: 'Поиск', icon: 'mdi-card-search-outline', url: '/search', name: 'search' },
				{ title: 'Графики', icon: 'mdi-chart-bar', url: '/charts', name: 'charts' },
				{ title: 'Отчеты', icon: 'mdi-file-excel', url: '/reports', name: 'reports' },
				{ title: 'Карта', icon: 'mdi-map', url: '/map', name: 'map' },
				{ title: 'Утилиты', icon: 'mdi-cog-outline', url: '/test-utils', name: 'test-utils' },
				{ title: 'Управление', icon: 'mdi-shield-crown-outline', url: '/admin', name: 'admin' },
				{ title: 'Объекты', icon: 'mdi-alpha-o-circle-outline', url: '/objects', name: 'objects' },
			],
			activeModules: [],
			drawer: true,
		}),
		inject: [ 'showNotificationError'],
		computed: {
			...mapGetters({
				getSideBarState: 'getSideBarState',
			}),
		},
		mounted() {
            const options = jwt.verify($cookies.get('role_token'), process.env.VUE_APP_ROLE_KEY)

            if (!options) {
                return this.showNotificationError('Не получены настройки доступа с сервера')
            }

            const accessModules = options.access_modules.split(',').map(m => m.trim())
            const staffId = options.staff_id
            const accId = options.acc_id
            const roles = JSON.parse(options.roles)

            if (accessModules.length) {
                this.activeModules = this.modules.filter((module) => accessModules.includes(module.name))
                this.$store.commit('setActiveModules', this.activeModules)
            } else {
            	if (this.$route.name !== 'Welcome') {
		            this.$router.push('/')
	            }
            }
            if (staffId) {
                this.$store.commit('setStaffId', staffId)
            }
            if (roles) {
                this.$store.commit('setRoles', roles)
            }
            if (accId) {
                this.$store.commit('setAccountId', accId)
            }
		},
	}
</script>

<style scoped>
    .side-bar__item:hover {
        background-color: rgba(0, 0, 0, 0.02);
    }

    .v-list-item__icon:first-child {
        margin-right: 10px !important;
    }
</style>