<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="width"
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
                    <slot name="fields"/>
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
                    :loading="loading"
                >
                    ОК
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
	export default {
		name: "SimpleDialogWithInputSlot",
		components: {},
        data: () => ({
	        formValid: true,
	        dialogModel: false,
	        loading: false,
        }),
        props: {
            title: {
		        type: String,
		        required: true
	        },
            width: {
            	type: Number,
                default: 500
            },
        },
        methods: {
			open() {
				this.dialogModel = true
            },

	        setLoading(loading) {
		        this.loading = loading
	        },

	        close() {
		        this.dialogModel = false
                if (this.$refs.form) {
	                this.$refs.form.resetValidation()
                }
		        this.$emit('closeEvent')
	        },

            okClick() {
	            if (!this.$refs.form?.validate()) {
		            return
	            }
	            this.$emit('okButtonClickEvent')
	            this.loading = true
            }
        }
	}
</script>

<style scoped>

</style>