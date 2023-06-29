<script>
	export default {
		name: "DialogMixin",
        data: () => ({
            dialogModel: false
        }),
		methods: {
			dialogBeforeClose() {},

			dialogClose() {
				this.dialogBeforeClose()
				this.dialogModel = false
			},

			dialogBeforeOpen() {},

			dialogOpen() {
				this.dialogBeforeOpen()
				this.dialogModel = true
			},
		}
	}
</script>