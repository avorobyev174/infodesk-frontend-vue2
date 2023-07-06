<template>
  <v-app>
      <NavigationBar v-if="isLogin"/>
      <SideBar v-if="isLogin"/>
      <MainContent/>
      <NotificationSnackBar ref="notificationManager"/>
  </v-app>
</template>
<script>

import NavigationBar from "./components/NavigationBar"
import NotificationSnackBar from "./modules/utils-components/NotificationSnackBar"
import SideBar from "./components/SideBar"
import MainContent from "./components/MainContent"
import { mapActions, mapGetters } from "vuex"
import NotificationMixin from "./modules/mixins/NotificationMixin"

export default {
    name: 'App',
    components: {
        NavigationBar,
        SideBar,
        MainContent,
        NotificationSnackBar
    },
    mixins: [ NotificationMixin ],
	created() {
		if (!$cookies.get('auth_token')) {
			this.$store.commit('setLogin', false)
			const isRedirectToLoginPage = this.$route.name.toLowerCase() !== 'login'
			if (isRedirectToLoginPage) {
				this.$router.push('/login')
			}
		} else {
			this.$store.commit('setLogin', true)
        }
    },
	computed: {
        ...mapGetters({
            isLogin: 'getIsLogin'
        }),
    },
    provide: function () {
        return {
            showNotification: this.showNotification,
	        showNotificationInfo: this.showNotificationInfo,
            showNotificationError: this.showNotificationError,
	        showNotificationWarning: this.showNotificationWarning,
	        showNotificationSuccess: this.showNotificationSuccess,
	        showNotificationRequestError: this.showNotificationRequestError,
	        showNotificationRequestErrorWithCustomText: this.showNotificationRequestErrorWithCustomText,
        }
    },
    methods: {
        ...mapActions([ 'logoutUser' ]),
    }
}
</script>