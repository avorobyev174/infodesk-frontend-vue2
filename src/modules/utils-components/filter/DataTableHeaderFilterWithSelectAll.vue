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
        <div class="header-filters">
            <div class="header-filter-wrapper">
                <slot name="filterItem"></slot>
            </div>
            <div class="header-select-all-wrapper">
                <slot name="filterSelectAll"></slot>
            </div>
        </div>
    </v-menu>
</template>

<script>
	export default {
		name: "DataTableHeaderFilterWithSelectAll",
        props: {
	        filterSelectColor: {
	        	type: String,
                required: true,
            },
        }
	}
</script>

<style scoped>
    .header-filter-wrapper, .header-select-all-wrapper {
        background-color: white;
        display: flex;
        align-items: center;
    }

    .header-select-all-wrapper {
        margin-right: 5px;
        margin-top: 20px;
    }

    .header-filters {
        display: flex;
        padding-right: 10px;
        background-color: white;
        align-items: start;
    }
</style>