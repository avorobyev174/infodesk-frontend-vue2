<template>
    <v-dialog
        v-model="dialogModel"
        max-width="400"
        @keydown.enter="$emit('okButtonClickEvent')"
        @keydown.esc="$emit('cancelButtonClickEvent')"
    >
        <v-card>
            <v-card-title>
                <span class="mx-auto text-h5 mb-2 text-wrap">Показать/Скрыть загруженные в пирамиду</span>
            </v-card-title>
            <v-card-text>
                <v-item-group multiple v-model="columns">
                    <v-container style="overflow-y: auto !important; max-height: 600px; height: 450px">
                        <v-row v-for="header in headers">
                            <v-col class="p-2">
                                <v-item v-slot="{ active, toggle }">
                                    <v-card
                                        :color="active ? colorBlue : ''"
                                        class="d-flex align-center"
                                        height="35px"
                                        @click="toggle"
                                    >
                                        <v-card-title class="text-lg-h6">{{ header.text }}</v-card-title>
                                    </v-card>
                                </v-item>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-item-group>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="save">Сохранить</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions, mapState } from "vuex"

    export default {
        name: "ShowHideColumsDialog",
        data: () => ({
            dialogModel: false,
            columns: []
        }),
        props: {
          headers: {
              type: Array,
              required: true
          },
          selectedHeaders: {
              type: Array,
              required: true
          }
        },
        inject: [ 'showNotificationSuccess', 'showNotificationRequestErrorWithCustomText', 'module' ],
        computed: {
            ...mapState([ 'colorBlue', 'colorGreen' ])
        },
        methods: {
            ...mapActions('common', ['saveSettings']),
            open() {
                this.columns = this.selectedHeaders.map((header) => header.index)
                this.dialogModel = true
            },
            save() {
                $cookies.set(`${ this.module }_pyramid`, this.columns, '4h')

                this.saveSettings(this.columns).then(
                    response =>  {
                        this.showNotificationSuccess(response.action === 'new' ? 'Настройки созданы' : 'Настройки обновлены', this.colorGreen)
                        this.dialogModel = false
                    },
                    e => this.showNotificationRequestErrorWithCustomText('Ошибка при обновлении или создании настроек колонок', e)
                )
                this.$emit('changeColumns', this.columns)
            }
        }
    }
</script>

<style scoped>

</style>