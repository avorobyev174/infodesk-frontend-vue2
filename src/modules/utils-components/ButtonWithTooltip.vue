<template>
    <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                :color="color"
                @click="$emit('buttonClickEvent')"
                :class="btnClass"
                v-bind="attrs"
                v-on="on"
                :disabled="disabledBtn"
                :dark="isDark"
                height="40px"
            >
                <v-icon size="30px">{{ icon }}</v-icon>
            </v-btn>
        </template>
        <span>{{ title }}</span>
    </v-tooltip>
</template>

<script>
    export default {
        name: "ButtonWithTooltip",
        props: {
            title: {
                type: String,
                required: true
            },
            icon: {
                type: String,
                required: true
            },
            btnClass: {
                type: String,
                required: true
            },
            color: {
                type: String,
                default: 'primary'
            },
            disabledBtn: {
                type: Boolean,
                default: false
            },
            isDark: {
                type: Boolean,
                default: true
            },
        }
    }
</script>

<style scoped>

</style>