<template lang="pug">
  .blanket
    .blanket__title
      p {{ title }}
    .blanket__description Coming soon ...
</template>

<script>
  export default {
    data() {
      return {
        title: 'Dashboard'
      }
    },
    methods: {}
  }
</script>

<style lang="scss">
  .blanket {
    padding: 10px 40px;
    color: #67573e;
    &__title {
      font-size: 26px;
    }
    &__description {
      padding-left: 20px;
      font-size: 20px;
    }
  }
</style>
