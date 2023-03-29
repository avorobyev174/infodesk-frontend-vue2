<template>
    <v-menu
        bottom
        offset-y
        :disabled="disabledActions"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                size="25"
                class="ma-2"
                v-bind="attrs"
                v-on="on"
                :color="disabledActions ? 'red' : 'darkgrey'"
            >
                mdi-arrow-down-drop-circle
            </v-icon>
        </template>
        <v-list>
            <v-list-item
                v-for="(a, i) in actions"
                :key="i"
                @click="$emit(a.action)"
            >
                <v-list-item-icon>
                    <v-icon v-text="a.icon"></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{ a.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "ActionColumn",
        data: () => ({

        }),
        props: {
            disabledActions: {
                type: Boolean,
                required: true
            },
            actions: {
            	type: Array,
                required: true
            }
        }
    }
</script>

<style>

</style>