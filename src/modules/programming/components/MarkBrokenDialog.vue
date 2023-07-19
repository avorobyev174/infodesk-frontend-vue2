<template>
    <dialog-with-data-slot
        ref="DataDialog"
        title="Списание"
        @submit="marked"
        @close="close"
        :width="400"
    >
        <template v-slot:fields>
            <v-text-field
                label="Тип"
                readonly
                type="text"
                :value="type"
            />
            <v-text-field
                :value="serialNumber"
                label="Серийный номер"
                readonly
                type="text"
            />
            <v-select
                v-model="reason"
                :items="reasons"
                item-text="text"
                item-value="value"
                label="Причина"
                required
            />
            <v-text-field
                v-model="comment"
                label="Комментарий"
                type="text"
            />
        </template>
    </dialog-with-data-slot>
</template>

<script>
    import { mapActions } from "vuex"
    import DialogWithDataSlot from "../../utils-components/dialog/DialogWithDataSlot"

    export default {
        name: "MarkBrokenDialog",
        components: {
        	DialogWithDataSlot
        },
        data: () => ({
            reason: 1,
            comment: '',
            reasons: [ { text: 'Не исправен', value: 1 }, ],
            serialNumber: '',
            type: '',
            item: {}
        }),
        props: {
            meters: {
                type: Array,
                required: true
            },
        },
        inject: [
        	'getMeterTypeTitle',
            'showNotificationRequestError'
        ],
        methods: {
            ...mapActions('programming', [ 'markMeterBroken' ]),
            open(item) {
                this.item = item
                this.serialNumber = item.serial_number
                this.type = this.getMeterTypeTitle(item.type)
                this.$refs.DataDialog.dialogOpen()
            },

            close() {
                this.comment = ''
            },

            async marked() {
	            this.$refs.DataDialog.dialogClose()
            	try {
		            const meterData = await this.markMeterBroken({ meter: this.item, reason: this.reason, comment: this.comment })
		            const [ markedMeter ] = meterData

		            const updatedMainMeter = this.meters.find(({ id }) => markedMeter.id === id)

		            markedMeter.address = 'СНЯТ'
		            markedMeter.sms_id = null
		            markedMeter.sms_status = 1
		            markedMeter.customer = null
		            markedMeter.customer_address = null
		            markedMeter.customer_phone = null
		            markedMeter.customer_type = null
		            markedMeter.customer_email = null
		            markedMeter.in_pyramid = 0
		            markedMeter.loaded = null
		            markedMeter.personal_account = null

		            Object.assign(updatedMainMeter, markedMeter)
		            this.showNotificationSuccess(`Счетчик ${ updatedMainMeter.serial_number } успешно списан`)
                } catch (e) {
		            this.showNotificationRequestError(e)
	            }
            }
        }
    }
</script>

<style scoped>

</style>