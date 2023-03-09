<template>
    <v-btn
        :loading="loading"
        @click="getReport"
        class="my-3 mx-3"
        color="green"
        dark
    >
        Скачать excel с последним опросом из Альфа-центра
    </v-btn>
</template>

<script>
    import {mapActions, mapMutations} from "vuex";
    import saveLastTimeDataToExcelFile from "./js/saveLastTimeDataToExcel";

    export default {
        name: "Alpha",
        data: () => ({
            loading: false,
        }),
        inject: ['showNotification', 'showNotificationStandardError', 'checkAuth'],
        mounted() {
            if (!this.checkAuth())
                return

	        if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length)
		        this.$router.push('/')
        },
        created() {
            const isFavorite = $cookies.get('common_favorite_module')
            if (isFavorite === '/alpha') {
                this.setFavoriteModuleColor(this.colorGold)
            } else {
                this.setFavoriteModuleColor('')
            }
        },
        methods: {
            ...mapActions('alpha', ['getAlphaLastTimeDataReport']),
            ...mapMutations(['setFavoriteModuleColor']),
            async getReport() {
                this.loading = true
                const response = await this.getAlphaLastTimeDataReport()
                this.loading = false
                //console.log(response)
                saveLastTimeDataToExcelFile(response)
            }
        }
    }
</script>

<style scoped>

</style>