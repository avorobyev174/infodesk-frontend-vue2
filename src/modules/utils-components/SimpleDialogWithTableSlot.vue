<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="maxWidth"
        @keydown.enter="$emit('okButtonClickEvent')"
        @keydown.esc="$emit('okButtonClickEvent')"
        @click:outside="$emit('okButtonClickEvent')"
    >
        <v-card>
            <v-card-title>
                <span class="m-auto text-h5 text-break text-center">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <v-simple-table
                    fixed-header
                    :height="height"
                >
                    <template v-slot:default>
                        <thead>
                        <tr>
                            <th v-for="title in itemTitles" class="text-center text-wrap">
                                {{ title }}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <slot name="table-row-data"/>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
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
        name: "SimpleDialogWithTableSlot",
        components: {
        },
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
            },
            itemTitles: {
                type: Array,
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
    }
</script>

<style>
    .v-dialog .v-sheet.v-card{
        border-radius: 0px !important;
    }


</style>