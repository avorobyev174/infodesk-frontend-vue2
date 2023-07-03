<template>
    <div class="px-2 py-2">
        <h1>Упс... Такой страницы пока не существует</h1>
    </div>
</template>

<script>
    import { mapGetters } from "vuex"

    export default {
        name: 'PageNotFound',
        computed: {
          ...mapGetters({ isLogin: 'getIsLogin' })
        },
        mounted() {
            if (!this.isLogin) {
	            return
            }
        }
    }
</script>
