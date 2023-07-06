<template>
    <v-tooltip top :color="colorGrey">
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                large
                v-bind="attrs"
                v-on="on"
                :color="marker.color"
            >
                mdi-home-circle
            </v-icon>
        </template>
        <div style="text-align: center">
            <span class="tooltip-span">{{ marker.address }}</span>
            <span class="tooltip-span">{{ `Объем: ${ marker.volume } кВТ*ч` }}</span>
        </div>
    </v-tooltip>
</template>

<script>
	import { mapState } from "vuex";

	export default {
		name: "ResearchMarker",
		computed: {
			...mapState([ 'colorGrey' ]),
		},
		props: {
			marker: {
				type: Object,
				required: true
			},
		},
	}
</script>

<style scoped>
    .tooltip-span {
        display: block;
        color: black;
        font-weight: 600;
    }
</style>