<template>
    <v-card class="m-3 px-4 pb-6" max-width="800px">
        <v-card-text class="pb-0">
            <p class="text-h6 text-secondary search-card-title">Управление данными подключений</p>
            <p class="search-card-info">содержит информацию об учетных записях, которые используются в работе различных модулей</p>
        </v-card-text>
    </v-card>
</template>

<script>
	import { mapGetters } from "vuex"

	export default {
		name: "Admin",
		inject: [ 'setBackgroundImage'],
		computed: {
			...mapGetters({
				isLogin: 'getIsLogin'
			}),
		},
		mounted() {
			this.setBackgroundImage(true)
		},
	}
</script>

<style scoped>

</style>