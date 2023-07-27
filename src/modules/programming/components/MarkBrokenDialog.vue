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
            'showNotificationRequestError',
            'updateMeterData'
        ],
        methods: {
            ...mapActions('programming', [ 'setMeterBroken' ]),
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
            	try {
		            const markedMeter = await this.setMeterBroken({ meter: this.item, comment: this.comment })
                    this.updateMeterData(markedMeter, `Счетчик ${ markedMeter.serial_number } успешно списан`)
                } catch (e) {
		            this.showNotificationRequestError(e)
	            } finally {
		            this.$refs.DataDialog.dialogClose()
	            }
            }
        }
    }
</script>

<style scoped>

</style>