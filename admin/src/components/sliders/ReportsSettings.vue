<template lang="pug">
.reports
  .reports__table
    TestTable
</template>

<script>
import TestTable from "../finance/TestTable";
export default {
  data() {
    return {
      
    }
  },
  methods: {
    
  },
  components: {
    TestTable
  }
};
</script>

<style lang="scss" scoped>
.reports {
  width: 100%;
  padding: 40px;
  &__table {
    width: 980px;
    padding: 20px;
    box-shadow: 0 0 10px #67573E;
  }
}
</style>
