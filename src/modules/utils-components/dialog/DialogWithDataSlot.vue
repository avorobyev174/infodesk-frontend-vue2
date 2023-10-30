<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="width"
        @keydown.enter="submit"
        @keydown.esc="dialogClose"
        @click:outside="dialogClose"
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
                    @submit.prevent="submit"
                >
                    <slot name="fields"/>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialogClose">Отмена</v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="submit"
                    :loading="loading"
                >ОК</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
	import DialogMixin from "../../mixins/DialogMixin"

	export default {
		name: "DialogWithDataSlot",
        data: () => ({
	        formValid: true,
	        loading: false,
        }),
        mixins: [ DialogMixin ],
        props: {
            title: {
		        type: String,
		        required: true
	        },
            width: {
            	type: Number,
                default: 500
            },
	        height: {
		        type: Number,
		        default: 500
	        },
        },
        methods: {
	        setLoading(loading) {
		        this.loading = loading
	        },

	        dialogBeforeClose() {
                this.$refs.form?.resetValidation()
		        this.loading = false
		        this.$emit('close')
	        },

            submit() {
	            if (!this.$refs.form?.validate()) {
		            return
	            }
	            this.$emit('submit')
	            this.loading = true
            }
        }
	}
</script>

<style scoped>

</style>