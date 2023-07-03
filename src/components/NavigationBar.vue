<template>
  <v-card
    tile
  >
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
            @click="setFavoriteModule()"
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
  import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

  export default {
    name: 'NavigationBar',
    data: () => ({

    }),
    computed: {
      ...mapGetters(['getSideBarState', 'getFavoriteModuleColor']),
      ...mapState({
        colorGreen: state => state.colorGreen,
        colorGold: state => state.colorGold,
      }),
      isWelcomePage () {
        return this.$route.name === 'Welcome'
      }
    },
    inject: [ 'showNotificationSuccess', 'showNotificationError' ],
    mounted() {

    },
    methods: {
      ...mapMutations(['setSideBarState', 'setFavoriteModuleColor']),
      ...mapActions('utils', ['saveSettings']),
      ...mapActions(['logoutUser']),
      setFavoriteModule() {
        let route = '/'

        if (!this.getFavoriteModuleColor) {
          this.setFavoriteModuleColor(this.colorGold)
          route = this.$route.fullPath
          $cookies.set('common_favorite_module', route, '3h')
        } else {
          this.setFavoriteModuleColor('')
          $cookies.remove('common_favorite_module')
        }

        this.saveSettings({settingsName: 'favorite_module', settingsVal: route}).then(
          response =>  {
            this.showNotificationSuccess(response.action === 'new' ? 'Настройки созданы' : 'Настройки обновлены')
          },
          e => this.showNotificationRequestErrorWithCustomText('Ошибка при обновлении или создании настроек начальной страницы', e)
        )
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