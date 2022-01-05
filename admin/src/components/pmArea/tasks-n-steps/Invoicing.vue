<template lang="pug">
  .invoicing-steps
    Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTabQuery")
</template>

<script>
import Tabs from "../../Tabs"

export default {
  components: {
    Tabs
  },
  props: {
    tabs: {
      type: Array,
      default: []
    }
  },
  methods: {
    setTab({ index }) {
      this.$emit('setTab', { index })
    }
  },
  computed: {
    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
    }
  }
}
</script>

<style scoped lang="scss">

</style>