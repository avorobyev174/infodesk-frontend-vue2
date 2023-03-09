<template>
  <div>
    <gmap-map
        :center="center"
        :zoom="zoom"
        ref="map"
        :options="options"
    >
      <h1>dfsdfdsf</h1>
<!--      <gmap-marker-->
<!--          :draggable="true"-->
<!--          :key="index"-->
<!--          v-for="(m, index) in locations"-->
<!--          :position="{-->
<!--          lat: parseFloat(m.acf.place_latitude),-->
<!--          lng: parseFloat(m.acf.place_longitude)-->
<!--        }"-->
<!--      ></gmap-marker>-->
    </gmap-map>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    centerRef: {
      type: Object,
      default: function() {
        return { lat: 53.41295, lng: 58.99823 };
      }
    },
    zoomVal: {
      type: Number,
      default: function() {
        return 11;
      }
    }
  },
  data() {
    return {
      feedLoaded: false,
      zoom: this.zoomVal,
      center: this.centerRef,
      options: {
        mapTypeControl: true,
        zoomControl: true,
        fullscreenControl: true,
        streetViewControl: true
      },
      mapTypeId: "roadMap",
      locations: []
    };
  },

  created: function() {
    //this.getData();
  },
  mounted() {
    console.log(this.locations);
  },
  methods: {
    toggleInfoWindow() {},
    // getData() {
    //   const url =
    //       "https://gist.githubusercontent.com/vgrem/1bab3ded8f8a6d2012e1357ec263c45a/raw/a3c9b6d561759d026d7f4390d730c8971d7a8539/locations.json";
    //   axios
    //       .get(url)
    //       .then(response => {
    //         this.locations = response.data;
    //         this.feedLoaded = true;
    //       })
    //       .catch(error => {
    //         console.log(error);
    //       });
    // }
  }
};
</script>

<style>
.vue-map-container {
  height: calc(100vh - 50px);
}
</style>
