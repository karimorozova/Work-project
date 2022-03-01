<template lang="pug">
  .wrapper
    .header(v-if="!isLoading")
      .col
        .col__title Added to Report:
        .col__value(v-if="report" )
          router-link(v-if="report.status !== 'Paid'" class="link-to" :to="{ path: `/billing/invoices/details/${report._id}`}")
            span {{ report.reportId }}
          router-link(v-else class="link-to" :to="{ path: `/billing/invoices/details-paid/${report._id}`}")
            span {{ report.reportId }}

        .col__value(v-else) {{  'Not in the report...' }}
      .col
        .col__title Status:
        .col__value(v-if="report" ) {{ report.status }}
        .col__value(v-else) {{  'Not in the report...' }}
    .header(v-else) Loading...

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
      isLoading: true,
      report: null
    }
  },
  methods: {
    async getVendorReport() {
      try {
        const [ _stepId ] = this.$route.params.id.split('_')

        const result = await this.$axios.get(`/vendor/reports/?token=${ this.$store.state.token }&steps=${ _stepId }`)
        const result2 = await this.$axios.get(`/vendor/paid-reports/?token=${ this.$store.state.token }&steps=${ _stepId }`)
        const decode = JSON.parse(window.atob(result.data))
        const decode2 = JSON.parse(window.atob(result2.data))

        this.report = decode.length && decode[0] || decode2.length && decode2[0]
      } catch (err) {
      } finally {
        this.isLoading = false
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

.header {
  display: flex;
  gap: 100px;
}

.col {
  display: flex;
  gap: 15px;

  &__title {
    color: $dark-border;
  }
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>