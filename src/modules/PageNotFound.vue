<template>
   <div class="px-2 py-2">
    <h1>Упс... Такой страницы пока не существует</h1>
  </div>
</template>

<script>
  export default {
    name: 'Search',
    inject: ['checkAuth'],
    mounted() {
        if (!this.checkAuth())
            return
    }
  }
</script>
