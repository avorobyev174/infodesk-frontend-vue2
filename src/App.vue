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
import NotificationSnackBar from "./modules/utils-components/notification/NotificationSnackBar"
import SideBar from "./components/SideBar"
import MainContent from "./components/MainContent"
import { mapGetters } from "vuex"
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
		this.loginOrRedirect()
    },
	computed: {
        ...mapGetters({
            isLogin: 'getIsLogin'
        }),
    },
    methods: {
        loginOrRedirect() {
	        if (!$cookies.get('auth_token')) {
		        this.$store.commit('setLogin', false)
		        if (this.$route.name !== 'Login') {
			        this.$router.push('/login')
		        }
	        } else {
		        this.$store.commit('setLogin', true)
	        }
        }
    }
}
</script>