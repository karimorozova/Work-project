<template lang="pug">
    .potential
        AllVendorsInfo(
            statusFilter="Potential"
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

.potential {
  max-width: 1200px;  
}

</style>
