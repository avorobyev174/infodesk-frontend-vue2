<template>
    <v-card
        class="m-3 px-4 pb-4 welcome-card"
    >
        <v-card-text class="slideRight" style="visibility: hidden;">
            <p class="text-h6 text-secondary welcome-text">Добро пожаловать на внутренний сайт МЭК</p>
            <p class="search-card-info">для продолжения работы перейдите в интересующий вас модуль</p>
            <img :class="imgClass"/>
        </v-card-text>
    </v-card>
</template>

<script>
	import { mapGetters } from "vuex"

	export default {
		name: "Welcome",
		inject: [ 'setBackgroundImage' ],
        data: () => ({
		    alert: false
        }),
		async mounted() {
			if (!this.isLogin) {
				return
			}

			this.setBackgroundImage(true)
		},
        computed: {
	        ...mapGetters({ isLogin: 'getIsLogin' }),
			imgClass() {
	        	return `img-container img${ Math.floor(1 + Math.random() * 3) }`
            }
        },
	}
</script>

<style scoped>
    .welcome-card {
        width: 650px;
        min-width: 350px;
        min-height: 190px;
    }

    .welcome-text {
        color: rgba(0,0,0,0.87) !important;
    }

    .img-container {
        border-radius: 5px;
        width: 100%;
        height: 338px;
    }

    .img1 {
        background: url("../assets/work_time.gif") no-repeat center right;
        background-size: cover;
    }

    .img2 {
        background: url("../assets/work_time2.gif") no-repeat center right;
        background-size: cover;
    }

    .img3 {
        background: url("../assets/work_time3.gif") no-repeat center right;
        background-size: cover;
    }

    @import "../assets/animate.css";
</style>