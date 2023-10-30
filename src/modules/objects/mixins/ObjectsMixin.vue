<script>
	import { mapActions, mapGetters, mapState } from "vuex"
    import aiisHeaders from "../js/objects-aiis-table-headers"
    import simHeaders from "../js/objects-sim-table-headers"
    import menuActions from "../js/objects-menu"
    import { defaultObjectsActions } from "../js/objects-actions"

	export default {
		name: "ObjectsMixin",
		data: () => ({
            headers: [ ...aiisHeaders ],
			aiisHeaders,
			simHeaders,
			menuActions,
			selectedHeaders: [],
			defaultObjectsActions
		}),
		computed: {
			...mapGetters({
				objects: 'objects/getObjects',
				currentAccountId: 'getAccountId',
				isLogin: 'getIsLogin',
			}),
			...mapState('objects', [ 'loading' ]),
			...mapState([ 'colorGreen', 'colorGrey', 'colorBlue', 'colorGold' ]),
		},
		inject: [
			'showNotificationSuccess',
            'showNotificationRequestError',
            'showNotificationInfo'
        ],
		provide: function () {
			return {
				formatDate: this.formatDate,
				getMeterTypeTitle: this.getMeterTypeTitle,
				updateObjectData: this.updateObjectData,
				deleteObjectData: this.deleteObjectData,
				getObjects: this.getObjects,
			}
		},
		async mounted() {
           await this.getObjects()
		},
		methods: {
			...mapActions('objects', [
				'fetchObjects',
				'deleteObject',
			]),

			async objectDelete() {
				this.$refs.ObjectDeleteDialog.dialogClose()
				try {
					const { id } = await this.deleteObject(this.selectedObject.id)
					this.deleteObjectData(id, `Объект c id ${ this.selectedObject.id } успешно удален`)
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			updateObjectData(updatedObject, messageSuccess) {
				const obj = this.objects.find(({ id }) => id === updatedObject.id)
				if (obj) {
					Object.assign(obj, updatedObject)
					this.showNotificationSuccess(messageSuccess)
				} else {
					this.showNotificationWarning('Объект обновления не найден')
				}
			},

			deleteObjectData(deletedObjectId, messageSuccess) {
				const obj = this.objects.find(({ id }) => id === deletedObjectId)
				const index = this.objects.indexOf(obj)
				this.objects.splice(index, 1)
				this.showNotificationSuccess(messageSuccess)
			},

			async getObjects() {
				try {
					if (this.objectType) {
						console.log(this.objectType)
						console.log(this.headers)
						//console.log(this.aiisHeaders)
						switch (this.objectType) {
							case 'aiis': this.headers = [ ...this.aiisHeaders ]; this.itemKey = 'id'; break;
							case 'sim': this.headers = [ ...this.simHeaders ]; this.itemKey = 'nomer';break;
						}
						console.log(this.headers)
						await this.fetchObjects(this.objectType)
					}
				} catch (e) {
					this.showNotificationRequestError(e)
				}
            }
		}
    }
</script>
