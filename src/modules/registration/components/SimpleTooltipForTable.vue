<template>
    <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                small
                class="mr-2"
                @click="$emit('clickEvent')"
                v-bind="attrs"
                v-on="on"
            >
                {{ icon }}
            </v-icon>
        </template>
        <span>{{ title }}</span>
    </v-tooltip>
</template>

<script>
    export default {
        name: "SimpleTooltipForTable",
        props: {
            icon: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            }
        }
    }
</script>

<style scoped>

</style>