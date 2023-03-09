<template>
  <v-app>
      <NavigationBar v-if="isLogin"/>
      <SideBar v-if="isLogin"/>
      <MainContent/>
      <NotificationSnackBar
          ref="notificationManager"
      />
  </v-app>
</template>
<script>

import NavigationBar from "@/components/NavigationBar";
import NotificationSnackBar from "@/components/utils-components/NotificationSnackBar";
import SideBar from "@/components/SideBar";
import MainContent from "@/components/MainContent";
import {mapActions, mapGetters} from "vuex";

export default {
    name: 'App',
    components: {
        NavigationBar,
        SideBar,
        MainContent,
        NotificationSnackBar
    },
	mounted() {
        $cookies.get('auth_token')
            ? this.$store.commit('login', true)
            : this.$store.commit('login', false)
    },
    computed: {
        ...mapGetters(['isLogin'])
    },
    provide: function () {
        return {
            showNotification: this.showNotification,
            showNotificationError: this.showNotificationError,
            showNotificationStandardError: this.showNotificationStandardError,
            showNotificationComponentError: this.showNotificationComponentError,
            checkAuth: this.checkAuth
        }
    },
    methods: {
        ...mapActions(['logoutUser']),
        showNotification(text, color) {
            this.$refs.notificationManager.showNotification(text, color)
        },
        showNotificationError(text, error) {
            this.$refs.notificationManager.showNotificationError(text, error)
        },
        showNotificationStandardError(error) {
            this.showNotificationError('Произошла ошибка при получении данных', error)
        },
        showNotificationComponentError(componentTitle, error) {
            this.showNotificationError(`Произошла ошибка (${ componentTitle })`, error)
        },

        checkAuth() {
            if (!$cookies.get('auth_token')) {
                this.showNotification('Срок токена авторизации истек, авторизуйтесь заново', this.$store.state.colorRed)
                this.$store.commit('login', false)
                this.$router.push('/login')
                return false
            }
            return true
        },
    }
}
</script>

<style>

</style>
