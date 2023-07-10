<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="width"
        @keydown.enter="dialogClose"
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
                    @submit.prevent="closeDialog"
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
                    @click="closeDialog"
                >
                    {{ closeButtonTitle ? closeButtonTitle : 'Закрыть' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
	import DialogMixin from "../../mixins/DialogMixin"

	export default {
		name: "DialogWithDataSlotOnlyClose",
		components: {},
        data: () => ({
	        formValid: true,
	        dialogModel: false,
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
            closeButtonTitle: {
            	type: String
            }
        },
        methods: {
            closeDialog() {
	            this.$emit('close')
                this.dialogClose()
            }
        }
	}
</script>

<style scoped>

</style>