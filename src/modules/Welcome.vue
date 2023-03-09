<template>
    <v-card
        class="m-3 px-4 pb-4 welcome-card"
    >
        <v-card-text class="slideRight" style="visibility: hidden;">
            <p class="text-h6 text-secondary search-card-title " >Добро пожаловать на внутренний сайт МЭК</p>
            <p class="search-card-info">для продолжения работы перейдите в интересующий вас модуль</p>
            <img :class="getImageClass"/>
        </v-card-text>
    </v-card>
</template>

<script>
	export default {
		name: "Welcome",
		inject: ['checkAuth', 'setBackgroundImage'],
        data: () => ({
            imgCount: 0
        }),
		mounted() {
			if (!this.checkAuth())
				return

			this.imgCount = Math.floor(Math.random() * 3);
			this.setBackgroundImage(true)
		},
        computed: {
			getImageClass() {
				switch (this.imgCount) {
					case 0: return 'img-container img1'; break;
					case 1: return 'img-container img2'; break;
					case 2: return 'img-container img3';
                }
            }
        }
	}
</script>

<style scoped>
    .welcome-card {
        width: 650px;
        min-width: 350px;
        min-height: 190px;
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