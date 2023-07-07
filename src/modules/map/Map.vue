<template>
    <div>
        <v-navigation-drawer
            v-model="mapDrawerModel"
            absolute
            hide-overlay
            right
            width="350"
            class="drawer"
            temporary
        >
            <v-select
                v-model="viewType"
                :items="viewTypes"
                item-text="title"
                item-value="value"
                @change="viewTypeChange"
                label="Тип отображения"
            />
            <research-map-filter
                v-if="viewType === MapViewTypes.RESEARCH"
                :viewType="viewType"
                ref="ResearchMapFilter"
            />
            <assignment-map-filter
                v-if="viewType === MapViewTypes.ASSIGNMENT"
                :viewType="viewType"
                ref="AssignmentMapFilter"
            />
            <v-btn
                color="primary"
                width="100%"
                @click="showMarkers"
                :disabled="!viewType"
            >
               Показать
            </v-btn>
        </v-navigation-drawer>
        <v-fab-transition>
            <v-btn
                color="primary"
                dark
                height="40px"
                class="menu"
                @click="mapDrawerModel = !mapDrawerModel"
            >
                <v-icon size="30px">mdi-menu</v-icon>
            </v-btn>
        </v-fab-transition>
        <filter-legend
            class="filter-legend"
            :legend="legend"
            v-if="viewType === MapViewTypes.RESEARCH"
        />
        <gmap-map
            :center="center"
            :zoom="12"
            ref='googleMap'
            class='google-map'
            :options="mapOptions"
        >
            <gmap-custom-marker
                v-for="(marker, index) in markers"
                :key="index"
                :marker="marker.position"
                ref="marker"
            >
                <research-marker
                    v-if="viewType === MapViewTypes.RESEARCH"
                    :marker="marker"
                />
                <assignment-marker
                    v-if="viewType === MapViewTypes.ASSIGNMENT"
                    :marker="marker"
                />
            </gmap-custom-marker>

        </gmap-map>
    </div>
</template>

<script>
import { mapState } from "vuex"
import { gmapApi } from 'vue2-google-maps'
import GmapCluster from 'vue2-google-maps/dist/components/cluster'
import GmapCustomMarker from 'vue2-gmap-custom-marker'
import AssignmentMapFilter from "./components/Assignments/AssignmentMapFilter"
import DictionaryMixin from "../mixins/DictionaryMixin"
import FavoriteModuleMixin from "../mixins/FavoriteModuleMixin"
import ResearchMapFilter from "./components/Research/ResearchMapFilter"
import FilterLegend from "./components/FilterLegend"
import ResearchMarker from "./components/Research/ResearchMarker"
import AssignmentMarker from "./components/Assignments/AssignmentMarker"
import { MapViewTypes } from "../../const"

export default {
    name: "Map",
    components: {
	    GmapCluster,
	    GmapCustomMarker,
	    AssignmentMapFilter,
	    ResearchMapFilter,
	    FilterLegend,
	    ResearchMarker,
	    AssignmentMarker,
    },
    data: () => ({
	    MapViewTypes,
	    moduleName: 'map',
	    mapDrawerModel: false,
	    center: { lat: 53.41295, lng: 58.99823 },
        markers: [],
        legend: [],
        mapOptions: {
            disableDefaultUi: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            scrollwheel: true,
            clickableIcons: true
        },
        viewType: MapViewTypes.RESEARCH,
        viewTypes: [
            { title: 'Обследования', value: 1 },
            { title: 'Поручения', value: 2 },
        ],
    }),
	inject: [ 'showNotificationError' ],
	mixins: [ DictionaryMixin, FavoriteModuleMixin ],
	provide: function () {
		return {
			formatDate: this.formatDate,
			getAssignmentEventTypeTitle: this.getAssignmentEventTypeTitle,
			getAccountFullName: this.getAccountFullName,
			getAssignmentEventCloseReasonTitle: this.getAssignmentEventCloseReasonTitle,
			getMeterTypeTitle: this.getMeterTypeTitle,
			getAssignmentStatusTitle: this.getAssignmentStatusTitle,
		}
	},
	computed: {
		...mapState([ 'colorGrey', ]),
		google: gmapApi
	},
	mounted() {

	},
    methods: {
	    viewTypeChange() {
	    	this.markers = []
        },

        showMarkers() {
        	switch (this.viewType) {
		        case 1: this.markers = this.showResearchMarkers(); break
		        case 2: this.markers = this.showAssignmentsMarkers(); break
	        }
            this.mapDrawerModel = false
        },

        showAssignmentsMarkers() {
            const { AssignmentMapFilter } = this.$refs
	        return AssignmentMapFilter.getFilteredMarkers()
        },

	    showResearchMarkers() {
		    const { ResearchMapFilter } = this.$refs
            this.legend = ResearchMapFilter.getLegend()
		    return ResearchMapFilter.getFilteredMarkers()
	    },
    },
}
</script>

<style scoped>
    .google-map {
        height: calc(100vh - 50px);
    }

    .menu {
        position: absolute;
        top: 15px;
        right: 20px;
        z-index: 1;
    }

    .drawer {
        padding: 20px;
    }

    .filter-legend {
        position: absolute;
        top: 10px;
        left: 45vw;
        z-index: 1;
        display: flex;
        gap: 5px;
    }
</style>