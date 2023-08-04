<script>
	import { mapActions, mapGetters, mapState } from "vuex"
	import headers from "../js/programming-table-headers"
	import menuActions from "../js/meters-menu"
	import { defaultMeterActions, filterActions } from '../js/meters-actions'
	import { ProgrammingState } from "../../../const"

	export default {
		name: "ProgrammingMixin",
		data: () => ({
			headers,
			menuActions,
			defaultMeterActions,
			selectedHeaders: [],
		}),
		provide: function () {
			return {
				formatDate: this.formatDate,
				getMeterTypeTitle: this.getMeterTypeTitle,
				getPhaseTitle: this.getPhaseTitle,
				getSimStatusTitle: this.getSimStatusTitle,
				getSmsTitleByStatus: this.getSmsTitleByStatus,
				getIpAddressTitle: this.getIpAddressTitle,
				module: this.module,
				getMeters: this.getMeters,
				getAccountFullName: this.getAccountFullName,
				getProgrammingLogTypeTitle: this.getProgrammingLogTypeTitle,
				updateMeterData: this.updateMeterData,
			}
		},
		computed: {
			...mapGetters({
				meters: 'programming/getMeters',
				isLogin: 'getIsLogin',
				currentAccountId: 'getAccountId',
			}),
			...mapState('programming', [ 'loading' ]),
			...mapState([ 'colorGreen', 'colorGrey', 'colorBlue' ]),
		},
		mounted() {
			document.onkeydown = (evt) => {
				if (this.$route.name === 'Programming' && evt.key === 'Alt') {
					this.getMeters()
				}
				if (evt.key === '+' && this.$refs.AddOrEditDialog) {
					this.$refs.AddOrEditDialog.open()
				}
			}
		},
		methods: {
			...mapActions('programming', [
				'fetchMeters',
				'fetchAllMeters',
                'addOrRemovePyramidLoad',
				'deleteMeter',
				'removeSimCardData',
			]),
			...mapActions('repair', [
				'setProgrammingValue'
			]),
			filterActions,
			async meterDelete() {
				this.$refs.MeterDeleteDialog.dialogClose()
				try {
					const { id } = await this.deleteMeter(this.selectedMeter.id)
                    this.deleteMeterData(id, `Счетчик ${ this.selectedMeter.serial_number } успешно удален`)
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			async addOrRemovePyramidLoadValue(isAdd) {
				if (isAdd && this.selectedMeter.in_pyramid) {
					this.$refs.MeterAddPyramidLoadValueDialog.dialogClose()
					return this.showNotificationInfo(`Счетчик уже загружен в пирамиду`)
                }
				if (!isAdd && !this.selectedMeter.in_pyramid) {
					this.$refs.MeterRemovePyramidLoadValueDialog.dialogClose()
					return this.showNotificationInfo(`Счетчик еще не загружен в пирамиду`)
				}
				isAdd
                    ? this.$refs.MeterAddPyramidLoadValueDialog.dialogClose()
                    : this.$refs.MeterRemovePyramidLoadValueDialog.dialogClose()
				try {
					const updatedMeter = await this.addOrRemovePyramidLoad({ meter: this.selectedMeter, isAdd })
					this.updateMeterData(updatedMeter, 'Информация успешно обновлена')
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

			async setIsProgrammed() {
				this.$refs.MeterProgrammingDialog.dialogClose()
				try {
					const updatedMeter = await this.setProgrammingValue({ id: this.selectedMeter.id, value: ProgrammingState.LOADED })
                    this.updateMeterData(updatedMeter, 'Информация успешно обновлена')
				} catch (e) {
					this.showNotificationRequestError(e)
				}
			},

            async simCardDataRemove() {
	            try {
		            const updatedMeter = await this.removeSimCardData(this.selectedMeter)
                    this.updateMeterData(updatedMeter, 'Информация успешно обновлена')
	            } catch (e) {
		            console.log(e)
		            this.showNotificationRequestError(e)
	            }
            },

            updateMeterData(updatedMeter, messageSuccess) {
	            const meter = this.meters.find(({ id }) => id === updatedMeter.id)
                if (meter) {
	                Object.assign(meter, updatedMeter)
	                this.showNotificationSuccess(messageSuccess)
                } else {
	                this.showNotificationWarning('Объект обновления не найден')
                }
            },

			deleteMeterData(deletedMeterId, messageSuccess) {
				const meter = this.meters.find(({ id }) => id === deletedMeterId)
                const index = this.meters.indexOf(meter)
				this.meters.splice(index, 1)
				this.showNotificationSuccess(messageSuccess)
			}
		}
	}
</script>
