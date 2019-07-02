<template lang="pug">
    .active-vendors
        AllVendorsInfo(
            statusFilter="Active"
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

.active-vendors {
    padding: 20px;
    width: calc(100% - 150px);
}

</style>
