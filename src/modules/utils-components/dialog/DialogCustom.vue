<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="maxWidth"
        @keydown.enter="$emit('submit')"
        @keydown.esc="dialogClose"
        @click.outside="dialogClose"
    >
        <v-card>
            <v-card-title>
                <span class="mx-auto text-h5 text-center text-break">{{ title }}</span>
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialogClose">Отмена</v-btn>
                <v-btn color="blue darken-1" text @click="$emit('submit')">OK</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import DialogMixin from "../../mixins/DialogMixin"

    export default {
        name: "DialogCustom",
        mixins: [ DialogMixin ],
        props: {
            maxWidth: {
                type: Number,
                default: 400
            },
            title: {
                type: String,
                required: true
            },
        },
        methods: {
        	dialogBeforeClose() {
		        this.$emit('reject')
            },
        }
    }
</script>

<style scoped>

</style>