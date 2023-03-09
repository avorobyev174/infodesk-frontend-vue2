<template>
  <div ref='googleMap' class='google-map'>
    <div ref="controlPanel">
      <control-panel/>
    </div>
  </div>
</template>

<script>
import controlPanel from "@/modules/map/components/ControlPanel";
import {mapMutations, mapState} from "vuex";
export default {
  name: "Map",
  components: {
    controlPanel
  },
  props: {

  },
  data() {
    return {
      bounds: new google.maps.LatLngBounds(), // Авто масштабирование карты
      mapOptions: {
        center: { lat: 53.41295, lng: 58.99823 },
        mapTypeControl: true,
        zoomControl: true,
        zoom: 11,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.UP_LEFT
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.UP_RIGHT
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.BOTTOM_LEFT
        }
      },
      locations: {
        locations: [
          {id: 1, lat: 53.41295, lng: 58.99823, name_point: 'A', title: 'text on hover'}
        ],
      },
      objects: [],
      householdMarkers: [],
      map: null
    }
  },
  created() {
    const isFavorite = $cookies.get('common_favorite_module')
    if (isFavorite === '/map') {
      this.setFavoriteModuleColor(this.colorGold)
    } else {
      this.setFavoriteModuleColor('')
    }
  },
  inject: ['checkAuth'],
  computed: {
    ...mapState({
      loading: state => state.registration.isMetersLoading,
      colorBlue: state => state.colorBlue,
      colorRed: state => state.colorRed,
      colorGreen: state => state.colorGreen,
      colorOrange: state => state.colorOrange,
      colorGrey: state => state.colorGrey,
      colorGold: state => state.colorGold,
    }),
  },
  methods: {
    ...mapMutations(['setFavoriteModuleColor']),
    initMap() {
      const  { imgClusterUrl, locations } = this.locations

      this.map = new google.maps.Map(this.$refs.googleMap, {
        ...this.mapOptions
      })
      // let markers = locations.map((location) => {
      //   // set locations for auto zoom map
      //   const setLocations = new google.maps.LatLng(location.lat, location.lng)
      //   this.bounds.extend(setLocations)
      //
      //   // set Markers on Map
      //   return new google.maps.Marker({
      //     position: location,
      //     map: map,
      //     label: location.name_point,
      //     title: location.title  + ' ' + location.name_point,
      //   })
      // })
      //
      // let markerCluster = new MarkerClusterer(map, markers)

      //map.fitBounds(this.bounds)
    },
    createControlPanelObjects() {
      this.objects.push({title: 'Бытовые потребители', name: 'household',
        //markers: this.householdMarkers
      });
      this.objects.push({
        title: 'Бытовые потребители (не матрица)',
        name: 'householdNonMatrix',
        //markers: householdNonMatrixMarkers
      });
      this.objects.push({
        title: 'Новые бытовые потребители (не матрица)',
        name: 'newHouseholdNonMatrix',
        //markers: newHouseholdNonMatrixMarkers
      });
      // this.objects.push({title: 'Поселки', name: 'township', markers: townShipMarkers});
      // this.objects.push({title: 'ТП', name: 'ts', markers: TSMarkers});
      // this.objects.push({title: 'Фильтры', name: 'filters', markers: filterMarkers});
      // this.objects.push({title: 'Юр.Лица(Матрица)', name: 'corpPersons', markers: circles});
      // this.objects.push({title: 'Программа (Меркурий 206)', name: 'replaceMeters', markers: circles});
      // this.objects.push({title: 'Раб. счетчики', name: 'workMeters', markers: workCircles});
      // this.objects.push({title: 'Не раб. счетчики', name: 'notWorkMeters', markers: notWorkCircles});
      // this.objects.push({title: 'Инвестпрограмма', name: 'investProgramm', markers: investProgramm});

    },
    createControlPanelDiv() {
      // var controlPanelDiv = document.createElement('div');
      // controlPanelDiv.id = "controlPanel";
      // controlPanelDiv.className = 'controlPanelDiv';
      //
      // this.objects.forEach(function (object) {
      //   if (object.name === 'corpPersons') {
      //     controlPanelDiv.appendChild(createDivWithActionCheckBox(object, false));
      //     //вызывается после загрузки карты, назначает обработчик corpPersons
      //     google.maps.event.addListenerOnce(map, 'tilesloaded', addPopoverWithFormFilter);
      //   } else if (object.name === 'replaceMeters' || object.name === "investProgramm") {
      //     controlPanelDiv.appendChild(createDivWithActionCheckBox(object, false));
      //     google.maps.event.addListenerOnce(map, 'tilesloaded', addPopoverWithFilter);
      //   } else
      //     controlPanelDiv.appendChild(createDivWithActionCheckBox(object, true));
      // });
      //
      // return controlPanelDiv;
      return this.$refs.div1
    }
  },
  mounted() {
    if (!this.checkAuth())
      return

    if (!this.$store.getters.getActiveModules.filter(module => module.name === this.$route.name.toLowerCase()).length)
      this.$router.push('/')

    this.initMap()
    this.createControlPanelObjects();
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(this.$refs.controlPanel);
  }
}
</script>

<style scoped>
  .google-map {
    height: calc(100vh - 50px);
  }
</style>