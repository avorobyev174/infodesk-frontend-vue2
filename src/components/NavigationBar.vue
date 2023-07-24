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
                style="visibility: hidden; cursor: pointer;"
                @click="redirectToWelcomePage"
            />
            <v-spacer></v-spacer>
            <button-with-tooltip
                icon="mdi-star"
                isIcon
                @click="setFavoriteModule"
                v-show="!isWelcomePage"
                :color="favoriteModuleColor"
                title="Назначить модуль начальной страницей"
            />
            <button-with-tooltip
                icon="mdi-account"
                isIcon
                @click="redirectToProfilePage"
                :color="colorSuperGrey"
                title="Профиль"
            />
            <button-with-tooltip
                icon="mdi-logout"
                isIcon
                @click="logoutUser(true)"
                :color="colorSuperGrey"
                title="Выход"
            />
        </v-app-bar>
    </v-card>
</template>

<script>
	import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
	import ButtonWithTooltip from "../modules/utils-components/button/ButtonWithTooltip"

	export default {
		name: 'NavigationBar',
		components: { ButtonWithTooltip },
		computed: {
			...mapGetters({ favoriteModuleColor: 'common/getFavoriteModuleColor' }),
			...mapGetters([ 'getSideBarState' ]),
			...mapState([ 'colorGreen', 'colorGold', 'colorDarkGrey', 'colorSuperGrey' ]),

			isWelcomePage () {
				return this.$route.name === 'Welcome'
			}
		},
		inject: [ 'showNotificationSuccess', 'showNotificationRequestErrorWithCustomText' ],
		methods: {
			...mapMutations([ 'setSideBarState' ]),
			...mapMutations('common', [ 'setFavoriteModuleColor' ]),
			...mapActions('common', [ 'saveSettings' ]),
			...mapActions([ 'logoutUser' ]),

			async setFavoriteModule() {
				let route = '/'

				if (this.favoriteModuleColor === 'grey') {
					this.setFavoriteModuleColor(this.colorGold)
					route = this.$route.fullPath
					$cookies.set('common_favorite_module', route, '4h')
				} else {
					this.setFavoriteModuleColor(this.colorDarkGrey)
					$cookies.remove('common_favorite_module')
				}
				try {
					const { action } = await this.saveSettings({
						module: 'common',
						settings: 'favorite_module',
                        value: route
					})
					this.showNotificationSuccess(action === 'new' ? 'Настройки созданы' : 'Настройки обновлены')
                } catch (e) {
					this.showNotificationRequestErrorWithCustomText('Ошибка при обновлении или создании настроек начальной страницы', e)
				}
			},

            redirectToWelcomePage() {
                if (!this.isWelcomePage) {
	                this.$router.push('/')
                }
            },

			redirectToProfilePage() {
				if (this.$route.name !== 'Profile') {
					this.$router.push('/profile')
				}
			}
		}
	}
</script>

<style scoped>
    /deep/ .v-toolbar__content {
        padding-left: 0px !important;
    }

    @import "../assets/animate.css";
</style>