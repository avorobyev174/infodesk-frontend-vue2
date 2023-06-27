<template>
    <div>
        <v-navigation-drawer
            v-model="mapDrawerModel"
            absolute
            temporary
            right
            width="400"
            class="programm-list"
        >
            <v-select
                v-model="currentMapItem"
                :items="mapItems"
                item-text="title"
                item-value="value"
                @change="mapItemChanged"
                label="Выберите программу отображения"
            />
            <v-combobox
                :items="mkdProgrammTypes"
                item-text="title"
                item-value="value"
                label="Выберите объем ОДПУ в мес(кВт*ч)"
                v-model="currentMkdProgrammTypes"
                clearable
                multiple
                @change="mkdProgrammTypeChanged"
            >
            </v-combobox>
            <v-btn
                color="primary"
                width="100%"
                @click="show"
                :disabled="!currentMapItem"
            >
               Показать
            </v-btn>
        </v-navigation-drawer>
        <v-fab-transition>
            <v-btn
                color="primary"
                dark
                absolute
                right
                fab
                class="arrow"
                icon
                @click="mapDrawerModel = !mapDrawerModel"
            >
                <v-icon x-large>mdi-chevron-left-box</v-icon>
            </v-btn>
        </v-fab-transition>
        <div class="legend">
            <v-chip
                v-for="({ title, color }, index) in currentMkdProgrammTypes"
                :key="index"
                :color="color"
            >
                {{ title }}
            </v-chip>
        </div>
        <gmap-map
            :center="center"
            :zoom="12"
            ref='googleMap'
            class='google-map'
            :options="mapOptions"
        >
            <gmap-custom-marker
                v-for="({ color, position, address, volume }, index) in markers"
                :key="index"
                :marker="position"
                ref="marker"
            >
                <v-tooltip top :color="colorGrey">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            v-bind="attrs"
                            v-on="on"
                            :color="color"
                        >
                            mdi-home-circle
                        </v-icon>
                    </template>
                    <div style="text-align: center">
                        <span style="display: block">{{ address }}</span>
                        <span style="display: block">{{ `Объем: ${ volume } кВТ*ч` }}</span>
                    </div>
                </v-tooltip>
            </gmap-custom-marker>
        </gmap-map>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex"
import { gmapApi } from 'vue2-google-maps'
import GmapCluster from 'vue2-google-maps/dist/components/cluster'
import GmapCustomMarker from 'vue2-gmap-custom-marker'

export default {
    name: "Map",
    components: {
	    GmapCluster,
	    GmapCustomMarker
    },
    data: () => ({
	    mapDrawerModel: false,
	    center: { lat: 53.41295, lng: 58.99823 },
        markers: [],
        filteredMarkers: [],
        mapOptions: {
            disableDefaultUi: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            scrollwheel: true,
            clickableIcons: true
        },
        currentMapItem: null,
        mapItems: [
            { title: 'МКД план обследования по нормативу', value: 1 },
        ],
	    currentMkdProgrammTypes: [],
        mkdProgrammTypes: [
	        { title: '0 - 300', value: 1, color: 'green lighten-1' },
	        { title: '301 - 1000', value: 2, color: '#ecc700' },
	        { title: '1001 - 5000', value: 3, color: 'orange lighten-1' },
	        { title: '> 5000', value: 4, color: 'red lighten-1' },
        ],
	    mkdProgrammMarkers: []
    }),
	created() {
		this.setFavoriteModuleColor($cookies.get('common_favorite_module') === '/map' ? this.colorGold : '')
	},
	async mounted() {
		if (!this.checkAuth()) {
			return
		}

		if (!this.activeModules.filter((module) => module.name === this.$route.name.toLowerCase()).length) {
			this.$router.push('/')
		}
	},
    inject: [ 'showNotification', 'showNotificationError', 'showNotificationStandardError', 'checkAuth' ],
    computed: {
	    ...mapState([ 'colorGreen', 'colorGrey', 'colorRed', 'colorOrange', 'colorBlue', 'colorGold' ]),
	    ...mapGetters({
		    addresses: 'map/getAddresses',
		    activeModules: 'getActiveModules',
	    }),
	    google: gmapApi
    },
    methods: {
        ...mapMutations([ 'setFavoriteModuleColor' ]),
	    ...mapActions('map', [
		    'fetchAddresses',
	    ]),

	    mapItemChanged() {
            switch (this.currentMapItem) {
	            case 1: this.initMkdProgramm(); break
            }
        },

	    mkdProgrammTypeChanged() {
            this.filteredMarkers = this.currentMkdProgrammTypes.map(({ value }) => {
	            switch (value) {
		            case 1: return this.mkdProgrammMarkers
                            .filter(({ volume }) => volume <= 300)
                            .map((marker) => ({ ...marker, color: this.colorGreen }))
		            case 2: return this.mkdProgrammMarkers
                            .filter(({ volume }) => volume > 300 && volume <= 1000)
	                        .map((marker) => ({ ...marker, color: this.colorGold }))
		            case 3: return this.mkdProgrammMarkers
                            .filter(({ volume }) => volume > 1000 && volume <= 5000)
	                        .map((marker) => ({ ...marker, color: this.colorOrange }))
		            case 4: return this.mkdProgrammMarkers
                            .filter(({ volume }) => volume > 5000)
	                        .map((marker) => ({ ...marker, color: this.colorRed }))
	            }
            }).flat()
	    },

	    async initMkdProgramm() {
		    await this.fetchAddresses()
		    this.mkdProgrammMarkers = this.addresses.map(({ lat, lng, address, volume }) => ({
			    address: address.slice(14),
                volume: parseInt(volume),
			    position: { lat, lng }
		    }))
        },

        show() {
        	this.markers = this.filteredMarkers
            this.mapDrawerModel = false
        }
    },
}
</script>

<style scoped>
    .google-map {
        height: calc(100vh - 50px);
    }

    .arrow {
        top: 40vh;
        right: 25px;
    }

    .programm-list {
        padding: 20px;
    }

    .legend {
        position: absolute;
        top: 10px;
        left: 45vw;
        z-index: 1;
        display: flex;
        gap: 5px;
    }
</style>