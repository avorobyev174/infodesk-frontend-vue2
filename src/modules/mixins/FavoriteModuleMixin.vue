<script>
	import { mapMutations, mapState } from "vuex"

	export default {
		name: "FavoriteModuleMixin",
        created() {
			if (this.moduleName) {
				this.setFavoriteModuleColor($cookies.get('common_favorite_module') === this.moduleName ? this.colorGold : '')
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
