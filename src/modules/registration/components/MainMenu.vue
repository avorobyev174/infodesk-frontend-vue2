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
                {id: 1, title: 'Обновить', onClick: 'update', icon: 'mdi-refresh', color: 'primary', disabled: false},
                {id: 2, title: 'Добавить', onClick: 'addOrEdit', icon: 'mdi-plus-box-outline', color: 'primary', disabled: false},
                {id: 3, title: 'Актуализировать данные из РТК', onClick: 'actualizeFromRTC', icon: 'mdi-database-import', color: 'primary', disabled: false},
                {id: 4, title: 'Групповая отправка смс', onClick: 'groupSmsSend', icon: 'mdi-email-arrow-right', color: 'primary', disabled: false},
                {id: 5, title: 'Получить все статусы смс после групповой отправки', onClick: 'groupSmsStatusCheck', icon: 'mdi-email-check', color: 'primary', disabled: false},
                {id: 6, title: 'Актуализировать данные из СТЭКа', onClick: 'actualizeFromStek', icon: 'mdi-database-import', color: 'primary', disabled: false},
                {id: 8, title: 'Видимость колонок', onClick: 'showHideColums', icon: 'mdi-eye', color: 'primary', disabled: false},
                //{id: 9, title: 'Показать/Скрыть загруженные в Пирамиду', localOnClick: 'showHidePyramidMeters', icon: 'mdi-pyramid', color: 'primary', disabled: false, show: true},
                {id: 10, title: 'Показать список утилизированных', onClick: 'showBrokenMeters', icon: 'mdi-alert-remove', color: 'primary', disabled: false, show: true},
            ],
        }),
        methods: {
            localFuncCall(action) {
                switch(action.id) {
                    case 9: this.showHidePyramidMeters(action); break
                }
            },

            showHidePyramidMeters(action) {
                this.actions = this.actions.map(a => {
                    if (a.id !== 9 && a.id !== 8 && a.id !== 1) return {...a, disabled: action.show}
                    if (a.id === 9) return {...a, show: !a.show}
                    return a
                })
                this.$emit('showHidePyramidMeters')
            }
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