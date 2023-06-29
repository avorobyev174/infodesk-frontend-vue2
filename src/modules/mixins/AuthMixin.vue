<script>
	import { mapGetters } from "vuex"

	export default {
		name: "AuthMixin",
        data: () => ({

        }),
		inject: [ 'checkAuth' ],
		computed: {
			...mapGetters({
                activeModules: 'getActiveModules',
            })
		},
        mounted() {
	        if (!this.checkAuth()) {
		        return
	        }

	        if (!this.activeModules.filter((module) => module.name === this.$route.name.toLowerCase()).length) {
		        this.$router.push('/')
	        }
        },
		methods: {

		}
	}
</script>
