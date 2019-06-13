<template lang="pug">
    .requests
        .requests__table
          Allprojects(
           projectsType="requests"
          )
</template>

<script>
import Allprojects from './Allprojects';
export default {
    data() {
        return {};
    },
  components: {
    Allprojects
  }
};

</script>

<style lang="scss" scoped>

.requests {
    /*display: flex;*/
    /*width: 100%;*/
    width: calc(100% - 150px);
    /*&__table {*/
        /*max-width: calc(100% - 150px);*/
    /*}*/
}

</style>
