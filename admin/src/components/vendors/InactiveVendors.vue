<template lang="pug">
    .inactive
        AllVendorsInfo(
            statusFilter="Inactive"
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

.inactive {
    padding: 20px;
    width: calc(100% - 150px);
}

</style>
