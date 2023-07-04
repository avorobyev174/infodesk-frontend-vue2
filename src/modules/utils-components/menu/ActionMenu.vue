<template>
    <v-menu
        v-model="show"
        :position-x="x"
        :position-y="y"
        absolute
        offset-y
    >
        <v-list>
            <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click="$emit(action.onClick)"
                :class="action.disabled ? 'hidden' : 'active'"
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
        name: "ActionMenu",
        data: () => ({
	        show: false,
	        x: 0,
	        y: 0,
        }),
        props: {
	        actions: {
	        	type: Array,
                required: true
            }
        },
        methods: {
            open(x, y) {
	            this.x = x
                this.y = y
                this.show = true
            },
        }
    }
</script>

<style scoped>
    .hidden {
        display: none;
    }

    .v-list-item__icon:first-child {
        margin-right: 10px !important;
    }
</style>