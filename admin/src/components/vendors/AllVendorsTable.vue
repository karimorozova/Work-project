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
    max-width: 1200px;
}

</style>