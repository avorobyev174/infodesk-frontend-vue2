<template>
    <v-menu
        open-on-hover
        bottom
        offset-y
        :nudge-width="200"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                height="40px"
            >
                <v-icon size="30px">mdi-file-excel</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click="action.onClick ? $emit(action.onClick) : localFuncCall(action)"
                :class="action.disabled ? 'active' : 'hidden'"
            >
                <v-list-item-icon>
                    <v-icon
                        v-text="action.icon"
                        :color="action.color"
                    ></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{ action.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "ExcelMenu",
        data: () => ({
            actions: [
                { id: 1, title: 'Скачать excel файл для загрузки в Пирамиду', onClick: 'saveExcelDataToPyramid', icon: 'mdi-file-upload', color: 'primary' },
                { id: 2, title: 'Скачать excel файл с обновленными счетчиками в СТЭКе', onClick: 'saveExcelRefreshDataToPyramid', icon: 'mdi-file-refresh', color: 'primary' },
            ],
        }),
        methods: {


        }
    }
</script>

<style scoped>
    .active {
        display: none;
    }

    .hidden {
        display: flex;
    }

    .v-list-item__icon:first-child {
        margin-right: 10px !important;
    }
</style>