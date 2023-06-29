<template>
    <v-menu
        nudge-bottom="10px"
        nudge-left="150px"
        offset-y
        :close-on-content-click="false"
        origin="center center"
        transition="scale-transition"
        ref="filterMenu"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
                <v-icon :color="filterSelectColor" small>mdi-filter-plus</v-icon>
            </v-btn>
        </template>
        <div class="header-filter-wrapper p-1 pr-2">
            <slot name="filterItem"></slot>
        </div>
    </v-menu>
</template>

<script>
	export default {
		name: "DataTableHeaderFilter",
        // data: () => ({
        //
	    //     filterSelectColor: ''
        // }),
        props: {
	        filterSelectColor: {
	        	type: String,
                required: true
            }
        }
	}
</script>

<style scoped>
    .header-filter-wrapper {
        background-color: white;
        display: flex;
        align-items: center;
    }
</style>