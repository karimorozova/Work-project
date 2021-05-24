<template lang="pug">
  .form-layout
    FormProject(:project="currentClientRequest")
</template>

<script>
import FormProject from "./subComponents/FormProject"
import { mapGetters, mapActions } from "vuex"

export default {
  data(){
    return {
      clientRequest: {}
    }
  },
  computed: {
    ...mapGetters({
      currentClientRequest: "getCurrentClientRequest"
    }),
  },
  components: { FormProject }
}
</script>

<style scoped lang="scss">

</style>