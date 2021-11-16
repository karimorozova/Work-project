<template lang="pug">
  .details
    .details__links
      .details__vendorLinks(v-if="!!vendor")
        .link
          .link__title Vendor Portal:
          .link__icon(@click="goToVendor")
            i.fas.fa-external-link-alt
        .link
          .link__title Vendor Page:
          .link__icon(@click="gotToVendorInfo")
            i.fas.fa-external-link-alt

      .details__memoqLinks(v-if="task.hasOwnProperty('memoqDocs')")
        .link(v-for="item in task.memoqDocs")
          .link__title {{ item.DocumentName }}
          .link__icon(@click="goToMemoq(item)")
            i.fas.fa-external-link-alt

</template>

<script>
export default {
  name: "StepDetails",
  props: {
    vendor: {
      type: Object
    },
    step: {
      type: Object
    },
    task: {
      type: Object
    }
  },
  methods: {
    goToMemoq(item) {
      const { WebTransUrl } = item
      // const domainUrl = !WebTransUrl.includes('memoqweb') ? WebTransUrl.replace('/webtrans', 'memoqweb/webtrans') : WebTransUrl
      window.open(`${ 'https://memoq.pangea.global/memoqwebLegacy/webtrans/' + WebTransUrl.split('/webtrans/').pop() }`, '_blank')
    },
    gotToVendorInfo() {
      window.open(`/pangea-vendors/all/details/${ this.vendor._id }`, '_blank')
    },
    async goToVendor() {
      const { data } = await this.$http.post("/service-login/vendor", { vendorId: this.vendor._id })
      const domain = window.location.origin.indexOf('pangea') !== -1 ? '.pangea.global' : 'localhost'
      const redirectTo = window.location.origin.indexOf('pangea') !== -1 ? 'https://vendor.pangea.global/dashboard' : 'http://localhost:3002/dashboard'
      document.cookie = `vendor=${ data }; path=/; domain=${ domain }`
      window.open(redirectTo, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.details {
  &__links {
    display: flex;
  }

  &__vendorLinks {
    margin-bottom: 20px;
    border-left: 2px solid $light-border;
    padding: 0 10px;
    width: 200px;
  }

  &__memoqLinks {
    margin-bottom: 20px;
    border-left: 2px solid $light-border;
    padding: 0 10px;
    height: max-content;
  }

  &__title1 {
    font-size: 19px;
    margin-top: 20px;
    font-family: 'MYRIAD300';
  }
}

.link {
  display: flex;
  height: 32px;
  align-items: center;

  &__title {
    min-width: 85px;
  }

  &__icon {
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;
    margin-left: 12px;

    &:hover {
      color: $text;
    }
  }
}
</style>