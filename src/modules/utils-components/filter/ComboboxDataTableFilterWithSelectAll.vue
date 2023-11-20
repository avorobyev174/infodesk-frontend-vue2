<template>
    <header-filter
        :filter-select-color="filterColorValue"
    >
        <template v-slot:filterItem>
            <v-combobox
                :items="filterItems"
                item-text="title"
                item-value="value"
                :label="filterLabel"
                class="p-3 pt-5 pb-0"
                :value="filterValue"
                @change="changeValue($event)"
                clearable
                multiple
            >
            </v-combobox>
        </template>
        <template v-slot:filterSelectAll>
            <v-btn @click="selectAllOnClick">Выделить все</v-btn>
        </template>
    </header-filter>
</template>

<script>
    import DataTableHeaderFilterWithSelectAll from "./DataTableHeaderFilterWithSelectAll"
    import { mapState } from "vuex"

	export default {
		name: "ComboboxDataTableFilterWithSelectAll",
        data: () => ({
            selectAll: false
        }),
        components: {
	        HeaderFilter: DataTableHeaderFilterWithSelectAll
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
			filterValue: Array,
			filterItems: {
				type: Array,
				required: true
			},
			filterColor: {
				type: String,
				required: true
			},
		},
        methods: {
	        changeValue(value) {
                this.$emit('input', value)
	        },

            selectAllOnClick() {
	            this.$emit('input', [ ...this.filterItems ]);
            }
        }
	}
</script>

<style scoped>

</style>