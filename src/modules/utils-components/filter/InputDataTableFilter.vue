<template>
    <header-filter
        :filter-select-color="filterColorValue"
    >
        <template v-slot:filterItem>
            <v-text-field
                class="p-3 pt-5 pb-0"
                :label="filterLabel"
                append-icon="mdi-filter-check"
                variant="solo"
                v-model="innerFilterValue"
                @click:append="acceptFilter()"
                @keydown.enter="acceptFilter()"
                @click:clear="clear"
                clearable
            >
            </v-text-field>
        </template>
    </header-filter>
</template>

<script>
    import DataTableHeaderFilter from "./DataTableHeaderFilter"
    import { mapState } from "vuex"

	export default {
		name: "ComboboxDataTableFilter",
        components: {
	        HeaderFilter: DataTableHeaderFilter
        },
        data: () => ({
            innerFilterValue: ''
        }),
        watch: {
	        filterValue(val) {
	        	this.innerFilterValue = val
            },
        },
        computed: {
	        ...mapState([ 'colorGrey' ]),
			filterColorValue() {
				return this.filterColor ? this.filterColor : this.colorGrey
            }
        },
		props: {
			filterLabel: {
				type: String,
				required: true
			},
			filterValue: String,
			filterColor: {
				type: String,
				required: true,
			},
		},
        methods: {
	        clear() {
		        this.innerFilterValue = ''
		        this.$emit('accept', this.innerFilterValue)
	        },

	        acceptFilter() {
		        this.$emit('accept', this.innerFilterValue)
	        }
        }
	}
</script>

<style scoped>

</style>