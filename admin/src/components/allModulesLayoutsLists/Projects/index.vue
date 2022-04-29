<template lang="pug">
  .layout
    LayoutWrapper(
      :hasFilterButton="true"
      :hasSettingButton="true"
      :moduleType="'project'"
    )
      template(slot="filter")
        h1 aksjdkasjd

</template>

<script>
import LayoutWrapper from "../LayoutWrapper"

export default {
  name: "index",
  components: { LayoutWrapper }
}
</script>

<style lang="scss" scoped>

</style>