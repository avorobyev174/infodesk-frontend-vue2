<template>
    <div>
        <v-select
            v-model="researchType"
            :items="researchTypes"
            item-text="title"
            item-value="value"
            @change="researchTypeChange"
            label="Тип обследования"
        />
        <v-combobox
            :items="researchVolumeTypes"
            item-text="title"
            item-value="value"
            label="Выберите объем ОДПУ в мес(кВт*ч)"
            v-model="researchVolumeType"
            clearable
            multiple
            @change="volumeChange"
        >
        </v-combobox>
    </div>
</template>

<script>
	import { mapActions, mapGetters, mapState } from "vuex"

	export default {
		name: "ResearchMapFilter",
        data: ()=> ({
	        researchTypes: [
		        { title: 'МКД план обследования по нормативу', value: 1 },
	        ],
	        researchType: null,
	        researchVolumeType: [],
	        researchVolumeTypes: [
		        { title: '0 - 300', value: 1, color: 'green lighten-1' },
		        { title: '301 - 1000', value: 2, color: '#ecc700' },
		        { title: '1001 - 5000', value: 3, color: 'orange lighten-1' },
		        { title: '> 5000', value: 4, color: 'red lighten-1' },
	        ],
            markers: [],
	        filteredMarkers: []
        }),
        inject: [ 'getAccountFullName', 'showNotificationRequestError' ],
		computed: {
			...mapState([ 'colorGreen', 'colorRed', 'colorOrange', 'colorGold' ]),
			...mapGetters({
				addresses: 'map/getAddresses',
				isLogin: 'getIsLogin',
			}),
		},
		async mounted() {
			if (!this.isLogin) {
				return
			}
            try {
	            await this.fetchAddresses()
                this.markers = this.addresses.map(({ lat, lng, address, volume }) => ({
	                address: address.slice(14),
	                volume: parseInt(volume),
	                position: { lat, lng }
                }))
            } catch (e) {
                this.showNotificationRequestError(e)
            }
		},
        methods: {
	        ...mapActions('map', [
		        'fetchAddresses',
	        ]),

	        getFilteredMarkers() {
	        	return this.filteredMarkers
            },

	        getLegend() {
		        return this.researchVolumeType
	        },

	        researchTypeChange() {
		        // switch (this.viewType) {
			    //     case 1: this.initResearch(); break
		        // }
	        },

	        volumeChange() {
		        this.filteredMarkers = this.researchVolumeType.map(({ value }) => {
			        switch (value) {
				        case 1: return this.markers
                                            .filter(({ volume }) => volume <= 300)
                                            .map((marker) => ({ ...marker, color: this.colorGreen }))
				        case 2: return this.markers
                                            .filter(({ volume }) => volume > 300 && volume <= 1000)
                                            .map((marker) => ({ ...marker, color: this.colorGold }))
				        case 3: return this.markers
                                            .filter(({ volume }) => volume > 1000 && volume <= 5000)
					                        .map((marker) => ({ ...marker, color: this.colorOrange }))
				        case 4: return this.markers
                                            .filter(({ volume }) => volume > 5000)
                                            .map((marker) => ({ ...marker, color: this.colorRed }))
			        }
		        }).flat()
	        },
        }
	}
</script>

<style scoped>

</style>