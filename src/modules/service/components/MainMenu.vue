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
                class="mr-2"
            >
                <v-icon size="30px">mdi-menu</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click="$emit(action.onClick)"
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
                {
                	title: 'Обновить',
                    onClick: 'refreshAssignments',
                    icon: 'mdi-refresh',
                    color: 'primary'
                },
                {
                	title: 'Добавить',
                    onClick: 'opendAssignmentAddDialog',
                    icon: 'mdi-plus-box-outline',
                    color: 'primary'
                },
                {
                	title: 'Журнал обновления системы',
                    onClick: 'openAssignmentsLogsDialog',
                    icon: 'mdi-clipboard-text-search-outline',
                    color: 'primary'
                },
                {
                	title: 'Видимость колонок',
                    onClick: 'showHideColumns',
                    icon: 'mdi-eye',
                    color: 'primary'
                },
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