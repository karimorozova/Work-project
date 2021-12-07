<template lang="pug">
  .services-template
    ServiceGroups(v-if="client.hasOwnProperty('_id')" :client="client")
</template>

<script>
// import ModalGroups from "../../../components/account/ModalGroups"
import ServiceGroups from "../../../components/account/ServiceGroups"
import { mapActions, mapGetters } from "vuex"
export default {
  components: {
    ServiceGroups
  },
  name: "index.vue",
  methods: {
    ...mapActions({
      getIndustry: "getIndustries",
      getService: "getServices",
      getLang: "getLanguages",
    })
  },
  computed: {
    ...mapGetters({
      client: 'getClientInfo'
    })
  },
  created() {
    this.getIndustry()
    this.getService()
    this.getLang()
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.services-template {
  width: 980px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: $box-shadow;
  padding: 25px;
  position: relative;
}
</style>