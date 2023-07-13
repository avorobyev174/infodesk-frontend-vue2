<template>
    <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                :color="color"
                @click="$emit('click')"
                :class="btnClass"
                v-bind="attrs"
                v-on="on"
                :disabled="disabledBtn"
                :dark="isDark"
                :height="height"
                :icon="isIcon"
            >
                <v-icon :size="iconSize">{{ icon }}</v-icon>
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
            height: {
            	type: Number,
                default: 40
            },
            icon: {
                type: String,
                required: true
            },
            btnClass: String,
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
            iconSize: {
	            type: String,
	            default: '30px'
            },
	        isIcon: {
		        type: Boolean,
		        default: false
	        },
        }
    }
</script>

<style scoped>

</style>