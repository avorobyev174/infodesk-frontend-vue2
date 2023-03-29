<template>
    <v-menu
        open-on-hover
        bottom
        offset-y
        nudge-left="140px"
        :nudge-width="200"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                height="40px"
                class="mr-0"
            >
                <v-icon size="30px">mdi-menu</v-icon>
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
        name: "MainMenu",
        data: () => ({
            actions: [
	            { id: 1, title: 'Регистрация', onClick: 'register', icon: 'mdi-plus-thick', color: 'primary', disabled: false },
                { id: 2, title: 'Прием/Выдача', onClick: 'acceptOrIssue', icon: 'mdi-swap-horizontal-bold', color: 'primary', disabled: false },
	            { id: 3, title: 'Показать/Скрыть колонки', onClick: 'showHideColums', icon: 'mdi-eye', color: 'primary', disabled: false },
            ],
        }),
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