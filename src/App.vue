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

export default {
    name: 'App',
    components: {
        NavigationBar,
        SideBar,
        MainContent,
        NotificationSnackBar
    },
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

        showNotification(text, color) {
            this.$refs.notificationManager.showNotification(text, color)
        },

	    showNotificationInfo(text) {
		    this.$refs.notificationManager.showNotificationInfo(text)
	    },

	    showNotificationSuccess(text) {
		    this.$refs.notificationManager.showNotificationSuccess(text)
	    },

	    showNotificationWarning(text) {
		    this.$refs.notificationManager.showNotificationWarning(text)
	    },

	    showNotificationError(text) {
		    this.$refs.notificationManager.showNotificationError(text)
	    },

	    showNotificationRequestError(e) {
		    this.$refs.notificationManager.showNotificationRequestError(e)
	    },

	    showNotificationRequestErrorWithCustomText(text, e) {
            this.$refs.notificationManager.showNotificationRequestErrorWithCustomText(text, e)
        },
    }
}
</script>