<template>
    <v-dialog
            v-model="dialogModel"
            :max-width="maxWidth"
            @keydown.enter="okClick"
            @keydown.esc="$emit('cancelButtonClickEvent')"
            @click:outside="$emit('cancelButtonClickEvent')"
    >
        <v-card>
            <v-card-title class="pb-5">
                <span class="m-auto text-h5 text-break text-center">{{ title }}</span>
            </v-card-title>
            <v-card-text class="pb-0">
                <v-form
                    ref="form"
                    v-model="formValid"
                    lazy-validation
                    @submit.prevent="okClick"
                    :height="height"
                >
                    <template v-slot:default>
                        <slot name="form-data"/>
                    </template>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="$emit('cancelButtonClickEvent')"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="$emit('okButtonClickEvent')"
                >
                    {{ OKButtonTitle }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        name: "DialogWithForm",
	    data: () => ({
		    formValid: true,
		    dialogModel: false
	    }),
	    props: {
		    dialogOpen: {
			    type: Boolean,
			    required: true
		    },
		    maxWidth: {
			    type: String,
			    default: '400px'
		    },
		    title: {
			    type: String,
			    required: true
		    },
		    okButtonTitle: {
			    type: String
		    },
		    height: {
			    type: String,
			    default: '500px'
		    },
	    },
	    computed: {
		    OKButtonTitle() {
			    return this.okButtonTitle ? this.okButtonTitle : 'ОК'
		    },
	    },
	    watch: {
		    dialogOpen(val) {
			    this.dialogModel = val
		    }
	    },
        methods: {
        	okClick() {
		        if (!this.$refs.form.validate()) {
			        return
		        }

		        this.$emit('okButtonClickEvent')
            }
        }
    }
</script>

<style scoped>

</style>