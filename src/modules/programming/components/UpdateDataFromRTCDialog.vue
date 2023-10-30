<template>
    <dialog-with-table-slot
        ref="UpdateDialog"
        :max-width="1200"
        dialog-title="Получение данных из Ростелекома"
        :table-headers="tableHeaders"
        reject-button-title="Закрыть"
        is-only-close
        @reject="$refs.UpdateDialog.dialogClose()"
        :count="updatedMeters.length"
    >
        <template v-slot:table-data>
            <tr v-for="{ id, type, serial_number, icc, phase, phone, status } in updatedMeters" :key="id">
                <td class="text-center">{{ getMeterTypeTitle(type) }}</td>
                <td class="text-center">{{ serial_number }}</td>
                <td class="text-center">{{ icc }}</td>
                <td class="text-center">{{ getPhaseTitle(phase) }}</td>
                <td class="text-center">{{ phone }}</td>
                <td class="text-center">{{ getSimStatusTitle(status) }}</td>
            </tr>
        </template>
    </dialog-with-table-slot>
</template>

<script>
    import { mapActions } from "vuex"
    import DialogWithTableSlot from "../../utils-components/dialog/DialogWithTableSlot"

    export default {
        name: "UpdateDataFromRTCDialog",
	    components: {
		    DialogWithTableSlot
	    },
        data: () => ({
            tableHeaders: [ "Тип", "Серийный номер", "ICC", "Фазность", "Номер телефона", "Статус" ],
            updatedMeters: [],
        }),
        props: {
            meters: {
                type: Array,
                required: true
            }
        },
        inject: [
            'showNotificationInfo',
            'showNotificationRequestError',
            'getPhaseTitle',
            'getSimStatusTitle',
            'getMeterTypeTitle',
            'getMeters'
        ],
        methods: {
            ...mapActions('programming', [ 'updateDataFromRTC' ]),

            async open() {
	            this.showNotificationInfo('Отправлен запрос на получение данных из Ростелекома')
                try {
	                this.updatedMeters = await this.updateDataFromRTC()
                    if (this.updatedMeters.length) {
	                    this.$refs.UpdateDialog.dialogOpen()
                        await this.getMeters()
                    } else {
	                    this.showNotificationInfo('В Ростелекома не найдено подходящих счетчиков для обновления данных')
                    }
                } catch (e) {
                    this.showNotificationRequestError(e)
                }
            },
        }
    }
</script>

<style scoped>

</style>