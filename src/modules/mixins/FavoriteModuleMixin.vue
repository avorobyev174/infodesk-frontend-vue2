<script>
	import { mapMutations, mapState } from "vuex"

	export default {
		name: "FavoriteModuleMixin",
        mounted() {
	        this.setFavoriteModuleFavorite()
        },
		updated() {
			this.setFavoriteModuleFavorite()
		},
        computed: {
	        ...mapState([ 'colorGold', 'colorDarkGrey' ]),
        },
		methods: {
			...mapMutations('common', [ 'setFavoriteModuleColor' ]),
            setFavoriteModuleFavorite() {
	            if (this.module) {
		            const color = $cookies.get('common_favorite_module') === `/${ this.module }` ? this.colorGold : this.colorDarkGrey
		            this.setFavoriteModuleColor(color)
	            }
            }
		}
	}
</script>
