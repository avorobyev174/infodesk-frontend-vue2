<template>
  <v-card
    tile
  >
    <v-navigation-drawer
      v-model="drawer"
      class="grey lighten-5"
      :mini-variant="getSideBarState"
      permanent
      clipped
      app
      width="220"
    >
      <v-list dense>
        <v-tooltip
          v-if="getSideBarState"
          right
          v-for="item in availableModules"
          :key="item.title"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              :to="item.url"
              style="text-decoration: none;"
              class="sidebar-item"
              v-bind="attrs"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ item.title }}</span>
        </v-tooltip>
        <v-list-item
          v-else
          :key="item.title"
          :to="item.url"
          style="text-decoration: none;"
          class="sidebar-item"
        >
          <v-list-item-icon
          >
            <v-icon
            >{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
  import {mapGetters, mapState} from "vuex";
  import jwt from "jsonwebtoken";

  export default {
      data: () => ({
          modules: [
              { title: 'Склад', icon: 'mdi-meter-electric-outline', url: '/storage', name: 'storage'},
              { title: 'Программирование', icon: 'mdi-desktop-classic', url: '/programming', name: 'programming'},
              { title: 'ОРБ', icon: 'mdi-progress-pencil', url: '/repair', name: 'repair'},
              { title: 'Поиск', icon: 'mdi-card-search-outline', url: '/search', name: 'search'},
              { title: 'Графики', icon: 'mdi-chart-bar', url: '/charts', name: 'charts'},
              { title: 'Отчеты', icon: 'mdi-file-excel', url: '/reports', name: 'reports'},
              { title: 'Карта', icon: 'mdi-map', url: '/map', name: 'map'},
              { title: 'Утилиты', icon: 'mdi-cog-outline', url: '/test-utils', name: 'test-utils'},
              { title: 'Управление', icon: 'mdi-shield-crown-outline', url: '/admin', name: 'admin'},
          ],
          availableModules: [],
          drawer: true,
      }),
      inject: ['showNotification', 'showNotificationStandardError', 'checkAuth'],
      computed: {
        ...mapState({
          colorBlue: state => state.colorBlue,
          colorRed: state => state.colorRed,
          colorGreen: state => state.colorGreen,
          colorOrange: state => state.colorOrange,
          colorGrey: state => state.colorGrey,
          colorGold: state => state.colorGold,
        }),
      },
      created() {
          const options = jwt.verify($cookies.get('role_token'), process.env.VUE_APP_ROLE_KEY)

          if (!options)
              return this.showNotification('Не получены настройки доступа с сервера', this.colorRed)

          const modulesArr = options.access_modules.split(',').map(m => m.trim())
          const staffId = options.staff_id
          const roles = JSON.parse(options.roles)

          if (modulesArr.length) {
              this.availableModules = this.modules.filter(i => modulesArr.includes(i.name))
              this.$store.commit('setActiveModules', this.availableModules)
          }
          if (staffId) {
              this.$store.commit('setStaffId', staffId)
          }
          if (roles) {
              this.$store.commit('setRoles', roles)
          }
      },
      mounted() {

      },
      methods: {

      },
      computed: {
        ...mapGetters(['getSideBarState', 'getSideBarActiveModules'])
      },
  }
</script>

<style scoped>
  .sidebar-item:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  .v-list-item__icon:first-child {
    margin-right: 10px !important;
  }
</style>