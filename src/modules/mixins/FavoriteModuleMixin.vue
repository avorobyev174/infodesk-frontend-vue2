<script>
	import { mapMutations, mapState } from "vuex"

	export default {
		name: "FavoriteModuleMixin",
        created() {
			if (this.moduleName) {
				const color = $cookies.get('common_favorite_module') === `/${ this.moduleName }` ? this.colorGold : ''
				this.setFavoriteModuleColor(color)
			}
        },
        computed: {
	        ...mapState([ 'colorGold' ]),
        },
		methods: {
			...mapMutations(['setFavoriteModuleColor']),
		}
	}
</script>
