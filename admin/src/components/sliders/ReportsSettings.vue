<template lang="pug">
.reports
  .reports__table
    MonoRates
</template>

<script>
import MonoRates from "../finance/MonoRates";
export default {
  data() {
    return {
      
    }
  },
  methods: {
    
  },
  components: {
    MonoRates
  }
};
</script>

<style lang="scss" scoped>
.reports {
  width: 100%;
  padding: 40px;
  &__table {
    width: 870px;
    padding: 20px;
    box-shadow: 0 0 10px #67573E;
  }
}
</style>
