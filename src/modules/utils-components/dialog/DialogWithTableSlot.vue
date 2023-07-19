<template>
    <v-dialog
        v-model="dialogModel"
        :max-width="maxWidth"
        @keydown.esc="dialogClose"
        @click:outside="dialogClose"
    >
        <v-card>
            <v-card-title style="display: flex; flex-direction: column">
                <p class="m-auto text-h5 text-break text-center pb-1 d-block">{{ dialogTitle }}</p>
                <p
                    v-show="dialogAdditionalTitle"
                    class="m-auto text-break text-center pb-3 d-block">
                    {{ dialogAdditionalTitle }}
                </p>
                <v-chip v-if="count" :color="colorGrey">{{ count }}</v-chip>
            </v-card-title>

            <v-card-text>
                <v-simple-table
                    fixed-header
                    :height="height"
                    class="mb-0"
                    :class="tableClass"
                >
                    <template v-slot:default>
                        <thead>
                        <tr>
                            <th v-for="title in tableHeaders" class="text-center text-wrap">{{ title }}</th>
                        </tr>
                        </thead>
                        <tbody>
                            <slot name="table-data"/>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    v-show="!isOnlyClose"
                    color="blue darken-1"
                    text
                    @click="$emit('submit')"
                >
                    {{ submitButtonTitle }}
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="dialogClose"
                >
                    {{ rejectButtonTitle }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import DialogMixin from "../../mixins/DialogMixin"
    import { mapState } from "vuex"

    export default {
        name: "DialogWithTableSlot",
        mixins: [ DialogMixin ],
        props: {
            maxWidth: {
                type: Number,
                default: 400
            },
	        height: {
		        type: Number,
		        default: 500
	        },
            dialogTitle: String,
	        dialogAdditionalTitle: String,
            tableHeaders: Array,
            submitButtonTitle: String,
	        rejectButtonTitle: String,
            count: [ Number, String ],
            tableClass: String,
            isOnlyClose: Boolean
        },
        computed: {
	        ...mapState([ 'colorGrey' ]),
        },
        methods: {
        	dialogBeforeClose() {
		        this.$emit('reject')
            }
        }
    }
</script>
