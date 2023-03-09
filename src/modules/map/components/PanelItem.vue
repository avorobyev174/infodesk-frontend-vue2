<template>
  <div>
    <v-img
        src="@/assets/map_assets/building2.png"
        width="50"
        height="60"
        class="m-auto"
    ></v-img>
    <v-btn
        class="ma-2 mt-0"
        :loading="loading"
        :disabled="loading"
        style="color: grey"
        medium
        @click="loadInformation"
    >
      <p class="text-wrap panel-item-name">{{ item.name }}</p>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "PanelItem",
  data() {
    return {
      loading: false,
    }
  },
  props: {
    item: {
      type: Object
    }
  },
  methods: {
    loadInformation() {
      this.loading = true
      setTimeout(()=> {

        this.loading = false
      },1000);
    }
  }
}
</script>

<style scoped>
  .panel-item-name {
    width: 80px;
    margin: auto;
    font-size: 10px;
    text-transform: none;
  }
</style>