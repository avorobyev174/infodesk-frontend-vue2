<script>
	import {mapActions, mapGetters} from "vuex";

	export default {
		name: "AddOrEditDialogMixin",
		data: () => ({
            requiredRules: [v => !!v || 'Обязательно к заполнению'],
			editedIndex: -1,
        }),
		props: {
			objects: {
				type: Array,
				required: true
			}
		},
		inject: [
			'showNotificationSuccess',
			'showNotificationError',
			'showNotificationRequestError',
			'updateObjectData',
			'getObjects',
		],
		computed: {
			...mapGetters({}),
			formTitle() { return this.editedIndex === -1 ? 'Добавить' : 'Редактировать' },
		},
        methods: {
	        ...mapActions('objects', [ 'editObject', 'addObject' ]),

	        async open() {
		        this.editedIndex = -1
		        this.$refs.DataDialog.dialogOpen()
	        },

	        async edit(item) {
		        this.editedIndex = this.objects.indexOf(item)
		        this.editedItem = Object.assign({}, item)
		        this.editedItem.index = this.editedIndex
		        this.$refs.DataDialog.dialogOpen()
	        },

	        close() {
		        this.editedItem = Object.assign({}, this.defaultItem)
		        this.editedIndex = -1
	        },

	        async save() {
		        if (this.editedIndex > -1) {
			        try {
				        this.$refs.DataDialog.setLoading(true)
				        const editedObject = await this.editObject(this.editedItem)
				        this.updateObjectData(editedObject, `Объект с id ${ editedObject.id } успешно отредактирован`)
				        this.$refs.DataDialog.dialogClose()
			        } catch (e) {
				        this.$refs.DataDialog.setLoading(false)
				        this.showNotificationRequestError(e)
			        }
		        } else {
			        try {
				        const [ addedObject ] = await this.addObject(this.editedItem)
				        this.showNotificationSuccess(`Объект с id ${ addedObject.id } успешно добавлен`)
			        } catch (e) {
				        this.showNotificationRequestError(e)
			        } finally {
				        this.$refs.DataDialog.dialogClose()
				        await this.getObjects()
			        }
		        }
	        },
		}
	}
</script>

<style scoped>

</style>