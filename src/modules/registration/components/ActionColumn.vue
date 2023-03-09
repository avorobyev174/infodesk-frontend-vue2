<template>
    <v-menu
        bottom
        offset-y
        :disabled="disabledActions"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                size="25"
                class="ma-2"
                v-bind="attrs"
                v-on="on"
                :color="disabledActions ? 'red' : 'darkgrey'"
            >
                mdi-arrow-down-drop-circle
            </v-icon>
        </template>
        <v-list>
            <v-list-item
                v-for="(item, i) in items"
                :key="i"
                @click="$emit(item.action)"
            >
                <v-list-item-icon>
                    <v-icon v-text="item.icon"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "ActionColumn",
        data: () => ({
            items: [
                { title: 'Изменить', action: 'edit', icon: 'mdi-pencil' },
                { title: 'Удалить', action: 'delete', icon: 'mdi-delete' },
                { title: 'Отправить смс', action: 'smsSend', icon: 'mdi-email-arrow-right' },
                { title: 'Узнать статус смс', action: 'smsCheckStatus', icon: 'mdi-email-check' },
                { title: 'Списать', action: 'marked', icon: 'mdi-alert-remove'},
                { title: 'Установить признак загрузки в пирамиду', action: 'addPyramidLoadValue', icon: 'mdi-pyramid' },
                { title: 'Убрать признак загрузки в пирамиду', action: 'removePyramidLoadValue', icon: 'mdi-pyramid-off' },
                { title: 'Актуализировать данные из СТЕКа', action: 'actualizeDataFromStek', icon: 'mdi-database-import' },
            ]
        }),
        props: {
            disabledActions: {
                type: Boolean,
                required: true
            }
        }
    }
</script>

<style>

</style>