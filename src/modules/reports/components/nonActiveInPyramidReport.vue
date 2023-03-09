<template>
    <v-dialog
        v-model="dialogModel"
        max-width="400px"
        @keydown.enter="okClick"
        @keydown.esc="close"
        @click:outside="close"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 pb-4 text-break text-center">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <v-form
                    ref="form"
                    v-model="formValid"
                    lazy-validation
                    @submit.prevent="okClick"
                    height="500px"
                >
                    <v-text-field
                        v-model="days"
                        label="Количество дней без ответа"
                        type="number"
                        hide-spin-buttons
                        :rules="daysRules"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="okClick"
                >
                    ОК
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
	export default {
		name: "NonActiveInPyramidReport",
		components: {},
        data: () => ({
	        formValid: true,
	        dialogModel: false,
            days: 0,
	        daysRules: [
		        v => v !== '' || 'Обязательно к заполнению',
		        v => v >= 0 || 'Не должно быть меньше нуля',
	        ],
        }),
        props: {
            title: {
		        type: String,
		        required: true
	        },
        },
		watch: {
			dialogFormOpen(val) {
				console.log(val)
				this.dialogModel = val
			}
		},
        methods: {
			open() {
				this.dialogModel = true
            },
	        close() {
		        this.dialogModel = false
	        },
            okClick() {
	            if (!this.$refs.form.validate()) {
		            return
	            }
	            this.$emit('okButtonClickEvent', this.days )
	            this.dialogModel = false
            }
        }
	}
</script>

<style scoped>

</style>