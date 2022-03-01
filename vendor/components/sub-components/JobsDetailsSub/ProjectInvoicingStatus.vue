<template lang="pug">
  .wrapper
    .header
      .col
        .col__title Added to Report:
        .col__value 1221
      .col
        .col__title
        .col__value

</template>

<script>
export default {
  name: "ProjectInvoicingStatus",
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      report: null
    }
  },
  methods: {
    async getVendorReport() {
      try {
        const [ _stepId ] = this.$route.params.id.split('_')

        const result = await this.$axios.get(`/vendor/reports/?token=${ this.$store.state.token }&steps=${ _stepId }`)
        const result2 = await this.$axios.get(`/vendor/paid-reports/?token=${ this.$store.state.token }&steps=${ _stepId }`)

        const decode = window.atob(result.data)
        const decode2 = window.atob(result2.data)

        console.log(decode, decode2)
      } catch (err) {
      }
    }
  },
  created() {
    this.getVendorReport()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.wrapper {
  width: 740px;
  background-color: white;
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  position: relative;
  box-shadow: $box-shadow;
}
</style>