<template lang="pug">
    .inactive-vendors
        AllVendorsInfo(
            statusFilter="Inactive"
            )
</template>

<script>
import AllVendorsInfo from "./AllVendorsInfo";

export default {
    components: {
        AllVendorsInfo
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.inactive-vendors {
  width: 1200px;
}

</style>
