<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="maxWidth"
        @keydown.enter="$emit('okButtonClickEvent')"
        @keydown.esc="$emit('cancelButtonClickEvent')"
    >
        <v-card>
            <v-card-title>
                <span class="mx-auto text-h5 text-center text-break">{{ title }}</span>
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="$emit('cancelButtonClickEvent')">Отмена</v-btn>
                <v-btn color="blue darken-1" text @click="$emit('okButtonClickEvent')">OK</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "SimpleDialog",
        data: () => ({
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
            }
        },
        watch: {
            dialogOpen(val) {
                this.dialogModel = val
            }
        }
    }
</script>

<style scoped>

</style>