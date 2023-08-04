<template>
    <dialog-with-table-slot
        ref="UpdateDialog"
        :max-width="1300"
        dialog-title="Получение данных из СТЭКа"
        :count="updatedMeters.length"
        :table-headers="tableHeaders"
        reject-button-title="Закрыть"
        is-only-close
    >
        <template v-slot:table-data>
            <tr v-for="{
            	type,
            	serial_number,
            	personal_account,
            	customer,
            	customer_address,
            	customer_phone,
            	customer_email,
            	kftt,
            	customer_type
            } in updatedMeters" :key="serial_number">
                <td class="text-center">{{ type ? getMeterTypeTitle(type) : type }}</td>
                <td class="text-center">{{ serial_number }}</td>
                <td class="text-center">{{ customer_type }}</td>
                <td class="text-center">{{ personal_account }}</td>
                <td class="text-center">{{ customer }}</td>
                <td class="text-center">{{ customer_address }}</td>
                <td class="text-center">{{ customer_phone }}</td>
                <td class="text-center">{{ customer_email }}</td>
                <td class="text-center">{{ kftt }}</td>
            </tr>
        </template>
    </dialog-with-table-slot>
</template>

<script>
    import DialogWithTableSlot from "../../utils-components/dialog/DialogWithTableSlot"
    import { mapActions, mapMutations } from "vuex"

    export default {
        name: "UpdateDataFromSTEKDialog",
        components: {
            dialogWithTableSlot: DialogWithTableSlot
        },
        data: () => ({
            tableHeaders: [
            	'Тип счетчика',
                'Серийный номер',
	            'Тип потребителя',
                'Номер лицевого',
                'Потребитель',
                'Адрес',
                'Телефон',
                'Почта',
                'КТТ',
            ],
            updatedMeters: []
        }),
        props: {
          meters: {
              type: Array,
              required: true
          }
        },
        inject: [
        	'showNotificationSuccess',
            'showNotificationInfo',
            'showNotificationRequestError',
            'getMeterTypeTitle',
            'getMeters',
        ],
        methods: {
            ...mapActions('programming', [ 'updateDataFromSTEK','updateSingleDataFromSTEK' ]),
	        ...mapMutations('programming', [ 'setLoading' ]),
            async open() {
                try {
                    this.showNotificationInfo('Отправлен запрос на получение данных из СТЕКа')
                    this.updatedMeters = await this.updateDataFromSTEK()
                    if (this.updatedMeters.length) {
                        this.$refs.UpdateDialog.dialogOpen()
                        await this.getMeters()
                    } else {
                        this.showNotificationInfo('В СТЕК не найдено подходящих счетчиков для обновления данных')
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },

            async updateSingleData(meter) {
	            try {
	            	if (meter.personal_account) {
			            return this.showNotificationInfo(`Счетчик ${ meter.serial_number } уже обновлен`)
                    }
		            this.setLoading(true)
                    const updatedMeter = await this.updateSingleDataFromSTEK(meter)
		            await this.getMeters()
                    if (updatedMeter) {
                        this.showNotificationSuccess(`Данные счетчика ${ updatedMeter.serial_number } успешно обновлены`)
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
		            this.setLoading(false)
                }
            },
        },
    }
</script>
