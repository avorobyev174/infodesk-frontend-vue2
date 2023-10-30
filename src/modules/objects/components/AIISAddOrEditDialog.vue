<template>
    <div>
        <dialog-with-data-slot
            ref="DataDialog"
            :title="formTitle"
            @submit="save"
            @close="close"
            :height="400"
        >
            <template v-slot:fields>
                <v-text-field
                    v-model="editedItem.name"
                    label="Название"
                    type="text"
                    :rules="requiredRules"
                />
                <v-text-field
                    v-model="editedItem.address"
                    label="Адрес"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.ip_td"
                    label="IP ТД"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.ip_uspd"
                    label="IP УСПД"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.is_adam"
                    label="IP ADAM"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.sim"
                    label="Сим карта"
                    type="text"
                    :rules="requiredRules"
                />
                <v-text-field
                    v-model="editedItem.connection_type"
                    label="Тип связи"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.customer"
                    label="Контактное лицо"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.customer_phone"
                    label="Телефон"
                    type="text"
                />
                <v-text-field
                    v-model="editedItem.comment"
                    label="Комментарий"
                    type="text"
                />
            </template>
        </dialog-with-data-slot>
    </div>
</template>

<script>
    import DialogWithDataSlot from "../../utils-components/dialog/DialogWithDataSlot"
    import AddOrEditDialogMixin from "./AddOrEditDialogMixin"

    export default {
        name: "AIISAddOrEditDialog",
        components: {
	        DialogWithDataSlot,
        },
        mixins: [ AddOrEditDialogMixin ],
        data: () => ({
	        editedItem: {
		        name: '',
		        address: '',
		        ip_td: '',
		        ip_uspd: '',
		        is_adam: '',
		        sim: '',
		        connection_type: '',
		        customer: '',
		        customer_phone: '',
		        comment: '',
	        },
	        defaultItem: {
		        name: '',
		        address: '',
		        ip_td: '',
		        ip_uspd: '',
		        is_adam: '',
		        sim: '',
		        connection_type: '',
		        customer: '',
		        customer_phone: '',
		        comment: '',
	        }
        }),
    }
</script>

<style scoped>
</style>