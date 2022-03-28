<template lang="pug">
  .edit-company
    .isLoading(v-if="isLoading")
      .isLoading__text Searching for Vendors...
</template>

<script>
export default {
  name: "EditCompany",
  data() {
    return {
      isLoading: true
    }
  }
}
</script>

<style scoped lang="scss">
  .edit-company {
    position: relative;
  }
  .isLoading {
    background: white;
    width: 100%;
    position: absolute;
    z-index: 2;
    height: 100%;
    text-align: center;
    line-height: 50;
  }
</style>