<template lang="pug">
  .layout
    LayoutWrapper(
      :hasFilterButton="true"
      :hasSettingButton="true"
      :moduleType="moduleType"
      @makeDBRequest="collectQueryData(getModuleData)"
    )

      template(slot="filter" slot-scope="{ tableFilters }")

        VendorsFilters(
          :tableFilters="tableFilters"
        )
      template(slot="table" slot-scope="{ tableFields, tableSorting, tableMaxHeight }")
        ListTable(
          :fields="tableFields"
          :sorting="tableSorting"
          :tableMaxHeight="tableMaxHeight"
          :data="moduleData"
          @lazyLoading="collectQueryData(lazyLoading)"
          @makeDBSortingRequest="collectQueryData(getModuleData)"
        )

          template(slot="sf_vendorID" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.vendorId }}
          template(slot="sf_phone" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.phone }}
          template(slot="sf_email" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.email }}
          template(slot="sf_currency" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.currency }}
          template(slot="sf_timezone" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.timezone }}
          template(slot="sf_status" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.status }}
          template(slot="sf_gender" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.gender }}
          template(slot="sf_vendorType" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.vendorType }}
          template(slot="sf_native" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ item.native }}
          template(slot="sf_isAvailableForWork" slot-scope="{ item, index }")
            span(v-if="item.isAvailableForWork")
              i.fas.fa-check
            span(v-else) -
          template(slot="sf_isTest" slot-scope="{ item, index }")
            span(v-if="item.isTest")
              i.fas.fa-check
            span(v-else) -
          template(slot="sf_companyName" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span(v-if="item.vendorType === 'Agency'") {{ item.companyName }}
              span(v-else) -
          template(slot="sf_website" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span(v-if="item.vendorType === 'Agency'") {{ item.website }}
              span(v-else) -
          template(slot="sf_surname" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/All`}" )
              span {{ `${item.firstName} ${item.surname}` }}
          //template(slot="sf_billingInfo" slot-scope="{ item, index }")
          //  .table__data(v-html="vendorPaymentMethods(item.billingInfo)" :selectedPaymentMethods="selectedPaymentMethods")

</template>

<script>
import LayoutWrapper from "../LayoutWrapper"
import ListTable from "../ListTable"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import VendorsFilters from "./VendorsFilters"


export default {
  mixins: [LayoutWrapperMixin],
  name: 'surname',
  components: {
    VendorsFilters,
    LayoutWrapper,
    ListTable
  },
  data() {
    return {
      moduleType: 'vendor',
      selectedPaymentMethods: []
    }
  },
  methods: {
    // vendorPaymentMethods(obj) {
    //   const { paymentMethods } = obj
    //   if(!paymentMethods.length) return '-'
    //
    //   const paymentTypes = paymentMethods.map(({paymentType}) => paymentType)
    //   this.selectedPaymentMethods = paymentTypes
    //   return paymentTypes.join(',')
    //
    // },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.collectQueryData(vm.getModuleData)
    })
    console.log(33)
  },

}
</script>

<style lang="scss" scoped>

</style>
