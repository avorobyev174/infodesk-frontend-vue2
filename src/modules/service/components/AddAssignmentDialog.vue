<template>
    <div>
        <v-dialog
            v-model="dialogModel"
            max-width="450px"
            @click:outside="dialogClose"
            @keydown.esc="dialogClose"
        >
            <v-form
                ref="form"
                v-model="formValid"
                lazy-validation
                @submit.prevent="save"
            >
                <v-card>
                    <v-card-title>
                        <span class="m-auto text-h5">Добавление</span>
                    </v-card-title>
                    <v-card-text class="m-auto">
                        <v-combobox
                            :items="meterTypes"
                            item-text="title"
                            item-value="value"
                            label="Тип"
                            v-model="type"
                            :rules="typeRules"
                        >
                        </v-combobox>
                        <v-text-field
                            v-model="serialNumber"
                            label="Серийный номер"
                            :rules="serialNumberRules"
                        ></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="dialogClose">Отмена</v-btn>
                        <v-btn color="primary" text type="submit">ОК</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </v-dialog>
    </div>
</template>

<script>
	import { mapActions, mapGetters, mapState } from "vuex"
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "AddAssignmentDialog",
        data: () => ({
            formValid: true,
            type: null,
            serialNumber: '',
            serialNumberRules: [
                v => !!v || 'Обязательно к заполнению',
                v => v && String(v).length >= 8 || 'Должно быть не меньше 8 символов',
            ],
	        typeRules: [
		        v => !!v || 'Обязательно к заполнению',
	        ],
        }),
        inject: [
        	'showNotificationSuccess',
            'showNotificationRequestErrorWithCustomText'
        ],
        mixins: [ DialogMixin ],
	    computed: {
		    ...mapGetters({
			    meterTypes: 'getMeterProgTypes',
		    })
	    },
        mounted() {
            if (this.meterTypes.length) {
	            this.type = this.meterTypes.at(0)
            }
        },
	    methods: {
        	...mapActions('service', [ 'addAssignment' ]),

            dialogClear() {
	            this.serialNumber = ''
	            this.type = null
	            this.$refs.form.resetValidation()
            },

		    async save() {
	            if (!this.$refs.form.validate()) {
		            return
	            }

                try {
	                this.dialogClose()
	            	const createdAssignment = await this.addAssignment({
                        type: this.type?.value,
                        serialNumber: this.serialNumber
	            	})
	                this.$emit('createAssignment', createdAssignment)
                    this.showNotificationSuccess('Поручение успешно добавлено')
                } catch (e) {
                    this.showNotificationRequestErrorWithCustomText('Ошибка при добавлении поручения', e)
                } finally {
	                this.dialogClear()
                }
            }
        }
    }
</script>

<style scoped>

</style>