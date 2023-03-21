<template>
    <v-data-table
        fixed-header
        height="300px"
        class="meter-add-table pl-1"
        :items="meters"
        single-select
        item-key="serialNumber"
        :headers="headers"
        hide-default-footer
        @click:row="selectRow"
        loading-text="Идет поиск счетчика..."
        :loading="loading"
    >
        <template v-slot:no-data>
            <p class="pt-4">Нет данных</p>
        </template>
        <template v-slot:no-results>
            <p class="pt-4">Нет данных</p>
        </template>
        <template v-slot:item.type="{ item }">
            {{ getMeterTypeTitle(item.type) }}
        </template>
        <template v-slot:item.oldLocation="{ item }">
            <v-chip small tag="span" :color="resultOldLocationColor"> {{ getMeterLocationTitle(item.oldLocation) }}</v-chip>
            <span> &#10132; </span>
            <v-chip
                    v-if="!checkIfMeterLocationValid(item)"
                    small
                    tag="span"
                    :color="resultSuccessCountColor">
                {{ getMeterLocationTitle(newLocation)}}
                <v-icon right small v-if="item.status === 1">
                    mdi-check-circle-outline
                </v-icon>
            </v-chip>
            <v-chip
                    v-else
                    small
                    tag="span"
                    :color="colorRed">
                {{ getMeterLocationTitle(newLocation) }}
                <v-icon right small v-if="item.status === 2">
                    mdi-close-circle-outline
                </v-icon>
            </v-chip>
        </template>
    </v-data-table>
</template>

<script>
	import {mapGetters, mapState} from "vuex";

	export default {
		name: "MeterTable",
        data: () => ({
	        headers: [
		        {
			        text: 'Тип',
			        align: 'center',
			        value: 'type',
			        sortable: false,
			        cellClass: 'table-header-size',
			        width: '40%'
		        },
		        {
			        text: 'Серийный номер',
			        align: 'center',
			        value: 'serialNumber',
			        sortable: false,
			        cellClass: 'table-header-size',
			        width: '30%'
		        },
		        {
			        text: 'Операция',
			        align: 'center',
			        value: 'oldLocation',
			        sortable: false,
			        cellClass: 'table-header-size',

		        },
	        ],
	        resultSuccessCountColor: 'grey',
	        resultOldLocationColor: 'green',
        }),
        props: {
	        newLocation: {
	        	type: Number,
                required: true
            },
            meters: {
	        	type: Array,
                required: true
            },
            loading: {
	        	type: Boolean,
                required: true
            }
        },
		inject: [
			'getMeterLocationTitle',
			'getMeterTypeTitle',
		],
		computed: {
			...mapState({
				colorBlue: state => state.colorBlue,
				colorRed: state => state.colorRed,
				colorGreen: state => state.colorGreen,
				colorOrange: state => state.colorOrange,
				colorGrey: state => state.colorGrey,
				colorGold: state => state.colorGold,
			}),
			...mapGetters({

			}),
		},
        methods: {
	        selectRow(item, row) {
		        this.selectedMeterIndex = row.index
		        row.select(true)
	        },
	        checkIfMeterLocationValid(meter) {
		        return meter.oldLocation === 0 && this.newLocation === 0 ||
			        meter.oldLocation !== 0 && this.newLocation !== 0
	        },
        },
	}
</script>

<style scoped>

</style>