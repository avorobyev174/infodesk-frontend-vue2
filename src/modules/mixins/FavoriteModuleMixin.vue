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
	        ...mapState([ 'colorGold', 'colorSuperGrey' ]),
        },
		methods: {
			...mapMutations('common', [ 'setFavoriteModuleColor' ]),

            setFavoriteModuleFavorite() {
	            if (this.module) {
		            const color = $cookies.get('common_favorite_module') === `/${ this.module }` ? this.colorGold : this.colorSuperGrey
		            this.setFavoriteModuleColor(color)
	            }
            }
		}
	}
</script>
