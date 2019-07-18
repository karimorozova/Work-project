<template lang="pug">
    .all-vendors-table
        AllVendorsInfo(
            statusFilter="All"
            )
</template>

<script>
import AllVendorsInfo from "./AllVendorsInfo";

export default {
  data() {
    return {
      
    }
  },
  methods: {
    
  },
  components: {
    AllVendorsInfo
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.all-vendors-table {
    padding: 20px;
    width: calc(100% - 150px);
}

</style>