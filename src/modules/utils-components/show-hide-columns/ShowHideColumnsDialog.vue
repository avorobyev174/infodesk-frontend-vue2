<template>
    <v-dialog
        v-model="dialogModel"
        max-width="400"
        @keydown.enter="save"
        @keydown.esc="dialogClose"
    >
        <v-card>
            <v-card-title>
                <span class="mx-auto text-h5 mb-2">Показать/Скрыть колонки</span>
            </v-card-title>
            <v-card-text>
                <v-item-group multiple v-model="columns">
                    <v-container class="columns-container">
                        <v-row v-for="(header, i) in headers" :key="i">
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
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "ShowHideColumnsDialog",
        data: () => ({
            columns: []
        }),
	    mixins: [ DialogMixin ],
        props: {
            headers: {
              type: Array,
              required: true
            },
            selectedHeaders: {
              type: Array,
              required: true
            },
            module: {
	            type: String,
	            required: true
            }
        },
        inject: [ 'showNotificationSuccess', 'showNotificationError', 'showNotificationRequestErrorWithCustomText' ],
        computed: {
            ...mapState([ 'colorBlue' ])
        },
        methods: {
            ...mapActions('common', [ 'saveSettings' ]),

            dialogBeforeOpen() {
	            this.columns = this.selectedHeaders.map(({ index }) => index)
            },

            async save() {
            	switch (this.module) {
		             case 'programming':
		             	$cookies.set('programming_columns', this.columns, '4h');
		             	break;
		             case 'storage':
		             	$cookies.set('storage_columns', this.columns, '4h');
		             	break;
		             case 'service':
		             	$cookies.set('service_columns', this.columns, '4h');
		             	break;
	            }

	            try {
		            const { action } = await this.saveSettings({
			            module: this.module,
			            settings: 'columns',
			            value: this.columns
		            })
		            this.dialogClose()
		            this.showNotificationSuccess(action === 'new' ? 'Настройки созданы' : 'Настройки обновлены')
		            this.$emit('changeColumns', this.columns)
	            } catch (e) {
		            this.showNotificationRequestErrorWithCustomText('Ошибка при обновлении или создании настроек начальной страницы', e)
	            }
            }
        }
    }
</script>

<style scoped>
    .columns-container {
        overflow-y: auto !important;
        max-height: 600px;
        height: 450px;
    }
</style>