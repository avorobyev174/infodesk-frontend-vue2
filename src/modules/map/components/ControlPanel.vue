<template>
  <div style="display: flex">
<!--    <panel-item-->
<!--        v-for="item in items"-->
<!--        :item="item"-->
<!--    />-->
  </div>
</template>

<script>
import PanelItem from "@/modules/map/components/PanelItem";
export default {
  name: "ControlPanel",
  components: {
    PanelItem
  },
  data() {
    return {
      items: [
        {
          name: "Бытовые потребители"
        },
        {
          name: "Бытовые потребители (не матрица)"
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>