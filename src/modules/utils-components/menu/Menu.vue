<template>
    <v-menu
        open-on-hover
        bottom
        offset-y
        :nudge-width="nudgeWidth"
        :nudge-left="nudgeLeft"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                height="40px"
            >
                <v-icon size="30px">mdi-menu</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item
                v-for="(action, i) in menuActions"
                :key="i"
                @click="$emit(action.onClick)"
            >
                <v-list-item-icon>
                    <v-icon
                        v-text="action.icon"
                        :color="action.color"
                    ></v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{ action.title }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "Menu",
        props: {
        	menuActions: {
        		type: Array,
                required: true
            },
            nudgeLeft: {
	            type: Number,
	            default: 250
            },
            nudgeWidth: {
	            type: Number,
	            default: 250
            },
        }
    }
</script>

<style scoped>
    .v-list-item__icon:first-child {
        margin-right: 10px !important;
    }
</style>