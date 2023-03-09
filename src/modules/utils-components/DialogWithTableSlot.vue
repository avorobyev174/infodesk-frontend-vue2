<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="maxWidth"
        @keydown.enter="okButtonClick"
        @keydown.esc="$emit('cancelButtonClickEvent')"
        @click:outside="$emit('cancelButtonClickEvent')"
    >
        <v-card>
            <v-card-title style="display: flex; flex-direction: column">
                <span class="m-auto text-h5 text-break text-center">{{ title }}</span>
                <span class="m-auto text-h7" v-if="successCountNumber !== undefined">{{ successCountNumber }}</span>
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
                    @click="$emit('cancelButtonClickEvent')"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="$emit('okButtonClickEvent')"
                    :loading="actionButtonLoading"
                >
                    {{ okButtonTitle }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        name: "DialogWithTableSlot",
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
            actionButtonTitle: {
                type: String,
                required: true
            },
            cancelButtonTitle: {
                type: String,
                default: 'OK'
            },
            successActionStatus: {
                type: Boolean,
                required: true
            },
            actionButtonLoading: {
                type: Boolean,
                default: false
            },
            height: {
                type: String,
                default: '500px'
            },
            successCountNumber: {
                type: String
            }
        },
        watch: {
            dialogOpen(val) {
                this.dialogModel = val
            }
        },
        computed: {
            okButtonTitle() {
                return this.successActionStatus ? this.cancelButtonTitle : this.actionButtonTitle
            },
        },
        methods: {
            okButtonClick() {
                this.$emit('okButtonClickEvent')
            }
        }
    }
</script>

<style>
    .v-dialog .v-sheet.v-card{
        border-radius: 0px !important;
    }


</style>