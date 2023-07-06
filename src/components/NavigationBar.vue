<template>
    <v-card tile>
        <v-app-bar
            class="grey lighten-2"
            dense
            app
            flat
            clipped-left
        >
            <v-app-bar-nav-icon
                class="mx-1"
                @click="setSideBarState(!getSideBarState)"
            >
            </v-app-bar-nav-icon>
            <v-img
                src="@/assets/logo_navbar_mec.webp"
                max-width="60px"
                class="ml-1 slideRight"
                style="visibility: hidden;"
            />
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="setFavoriteModule"
                        v-show="!isWelcomePage"
                    >
                        <v-icon :color="getFavoriteModuleColor">mdi-star</v-icon>
                    </v-btn>
                </template>
                <span>Назначить модуль начальной страницей</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="$router.push('/profile')"
                    >
                        <v-icon>mdi-account</v-icon>
                    </v-btn>
                </template>
                <span>Профиль</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="logoutUser(true)"
                    >
                        <v-icon>mdi-logout</v-icon>
                    </v-btn>
                </template>
                <span>Выход</span>
            </v-tooltip>
        </v-app-bar>
    </v-card>
</template>

<script>
	import { mapActions, mapGetters, mapMutations, mapState } from "vuex"

	export default {
		name: 'NavigationBar',
		computed: {
			...mapGetters([ 'getSideBarState', 'getFavoriteModuleColor' ]),
			...mapState([ 'colorGreen', 'colorGold' ]),
			isWelcomePage () {
				return this.$route.name === 'Welcome'
			}
		},
		inject: [ 'showNotificationSuccess', 'showNotificationRequestErrorWithCustomText' ],
		methods: {
			...mapMutations([ 'setSideBarState', 'setFavoriteModuleColor' ]),
			...mapActions('utils', [ 'saveSettings' ]),
			...mapActions([ 'logoutUser' ]),

			async setFavoriteModule() {
				let route = '/'

				if (!this.getFavoriteModuleColor) {
					this.setFavoriteModuleColor(this.colorGold)
					route = this.$route.fullPath
					$cookies.set('common_favorite_module', route, '4h')
				} else {
					this.setFavoriteModuleColor('')
					$cookies.remove('common_favorite_module')
				}
				try {
					const { action } = await this.saveSettings({
                        settingsName: 'favorite_module',
                        settingsVal: route
					})
					this.showNotificationSuccess(action === 'new' ? 'Настройки созданы' : 'Настройки обновлены')
                } catch (e) {
					this.showNotificationRequestErrorWithCustomText('Ошибка при обновлении или создании настроек начальной страницы', e)
				}
			}
		}
	}
</script>

<style scoped>
    /deep/ .v-toolbar__content {
        padding-left: 0px !important;
    }

    .pointer {
        cursor: pointer;
    }

    @import "../assets/animate.css";
</style>