<script>
	export default {
		name: "DialogMixin",
        data: () => ({
            dialogModel: false
        }),
		methods: {
			dialogClose() {
				this.dialogModel = false
			},

			dialogOpen() {
				this.dialogModel = true
			},
		}
	}
</script>