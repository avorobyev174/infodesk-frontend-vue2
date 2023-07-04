
<script>
	export default {
		name: "ColumnVisibilityMixin",
        created() {
			if (this.headers) {
				this.headers = this.headers.map((header, i) => ({ ...header, index: i }))
				$cookies.get('meter_service_columns')
					? this.changeColumnsVisibility($cookies.get('meter_service_columns')
						.split(',')
						.map((column) => parseInt(column)))
					: this.selectedHeaders = this.headers
			}
        },
        computed: {
	        showHeaders () {
		        if (this.headers && this.selectedHeaders) {
			        return this.headers.filter((header) => this.selectedHeaders.includes(header))
		        }
	        }
        },
        methods: {
	        changeColumnsVisibility(columns) {
		        if (this.headers) {
			        this.selectedHeaders = this.headers.filter(({ index }) => columns.includes(index))
		        }
	        },
        }
	}
</script>
