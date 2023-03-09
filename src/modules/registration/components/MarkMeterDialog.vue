<template>
    <v-dialog
        v-model="dialogModel"
        max-width="450px"
        @keydown.enter="marked"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-form
            ref="form"
            v-model="formValid"
            lazy-validation
        >
            <v-card>
                <v-card-title style="display: flex; flex-direction: column">
                    <span class="m-auto text-h5">Списание</span>
                </v-card-title>

                <v-card-text class="m-auto">
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
                        label="Выберите причину"
                        required
                    />
                     <v-text-field
                        v-model="comment"
                        label="Комментарий"
                        type="text"
                    />
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-1"
                        text
                        @click="close"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="blue darken-1"
                        text
                        @click="marked"
                    >
                        ОК
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
    import {mapActions} from "vuex";

    export default {
        name: "MarkMeterDialog",
        data: () => ({
            dialogModel: false,
            formValid: true,
            reason: 1,
            comment: '',
            reasons: [
                {text: 'Не исправен', value: 1},
            ],
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
        inject: ['getMeterTypeTitle', 'showNotification', 'showNotificationError'],
        methods: {
            ...mapActions('registration', ['markMeter']),
            open(item) {
                this.item = item
                this.serialNumber = item.serial_number
                this.type = this.getMeterTypeTitle(item.type)
                this.dialogModel = true
            },
            close() {
                this.dialogModel = false
                this.comment = ''
            },
            marked() {
                this.markMeter({meter: this.item, reason: this.reason, comment: this.comment}).then(
                    data => {
                        const markedMeter = data[0]

                        const updatedMainMeter = this.meters.find((meter) => {
                            return markedMeter.id === meter.id
                        })
                        console.log(updatedMainMeter)

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
                        this.dialogModel = false
                    }
                ).catch(
                    e => this.showNotificationError('Произошла ошибка при утилизации счетчка', e)
                )
            }
        }
    }
</script>

<style scoped>

</style>