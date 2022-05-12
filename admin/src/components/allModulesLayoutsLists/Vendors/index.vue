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
            span {{ item.vendorId }}
            //router-link(:to="{path: `/pangea-vendors/all/details/${item._id}`}" )

          template(slot="sf_phone" slot-scope="{ item, index }")
              span {{ item.phone }}
          template(slot="sf_email" slot-scope="{ item, index }")
              span {{ item.email }}
          template(slot="sf_currency" slot-scope="{ item, index }")
              span {{ item.currency }}
          template(slot="sf_timezone" slot-scope="{ item, index }")
              span {{ item.timezone }}
          template(slot="sf_status" slot-scope="{ item, index }")
              span {{ item.status }}
          template(slot="sf_gender" slot-scope="{ item, index }")
              span {{ item.gender }}
          template(slot="sf_vendorType" slot-scope="{ item, index }")
              span {{ item.vendorType }}
          template(slot="sf_native" slot-scope="{ item, index }")
            .table__data(v-html="vendorNativeLanguage(item.native)")

          template(slot="sf_isAvailableForWork" slot-scope="{ item, index }")
            span(v-if="item.isAvailableForWork")
              i.fas.fa-check
            span(v-else) -
          template(slot="sf_isTest" slot-scope="{ item, index }")
            span(v-if="item.isTest")
              i.fas.fa-check
            span(v-else) -
          template(slot="sf_companyName" slot-scope="{ item, index }")
              span(v-if="item.vendorType === 'Agency'") {{ item.companyName }}
              span(v-else) -
          template(slot="sf_website" slot-scope="{ item, index }")
              span(v-if="item.vendorType === 'Agency'") {{ item.website }}
              span(v-else) -
          template(slot="sf_surname" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-vendors/all/details/${item._id}`}" )
              span {{ `${item.firstName} ${item.surname}` }}
          template(slot="sf_billingInfo" slot-scope="{ item, index }")
            .table__data(v-html="vendorPaymentMethods(item.billingInfo)")
          template(slot="sf_catExperience" slot-scope="{ item, index }")
            span(v-if="item.catExperience.length" ) {{ item.catExperience.join(', ') }}
            span(v-else) -
          template(slot="sf_sourceLanguages" slot-scope="{ item, index }")
            .table__data(v-html="sourceLanguages(item.competencies)")
          template(slot="sf_targetLanguages" slot-scope="{ item, index }")
            .table__data(v-html="targetLanguages(item.competencies)")
          template(slot="sf_industry" slot-scope="{ item, index }")
            .table__data(v-html="vendorIndustries(item.competencies)")

</template>

<script>
import LayoutWrapper from "../LayoutWrapper"
import ListTable from "../ListTable"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import VendorsFilters from "./VendorsFilters"
import {mapGetters} from "vuex";


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
  computed: {
    ...mapGetters({
      languages: "getAllLanguages",
      industries: "getAllIndustries"
    }),
  },
  methods: {
    vendorPaymentMethods(obj) {
      const { paymentMethods } = obj
      if(!paymentMethods.length) return '-'

      const paymentTypes = paymentMethods.map(({paymentType}) => paymentType)
       const filteredPaymentTypes = paymentTypes.filter((value, index, arr) => {
        return arr.indexOf(value) === index
      })
      return filteredPaymentTypes.join(', ')

    },
    vendorIndustries(competencies) {
      if(!competencies.length) return '-'
      const vendorIndustries = competencies.map(({industry}) =>
       this.industries.find(({_id, name}) => {
          if (industry === _id) return name
        })
      )
      const filteredIndustries = vendorIndustries.map(({name}) => name).filter((value, index, arr) => {
        return arr.indexOf(value) === index
      })
      return filteredIndustries.join(', ')

    },
    vendorNativeLanguage(native) {
      return this.languages.find(({_id}) => _id === native).lang
    },
    sourceLanguages(competencies) {
      if (!competencies.length) return '-'
      const sourceLanguages = []
      const allSourceLanguages = competencies.map(({ sourceLanguage }) => {
        const source = this.languages.find(({ _id}) => _id === sourceLanguage).lang
        sourceLanguages.push(source)
        // return { sourceLanguage: source }})
        const sourceLanguages = allSourceLanguages.map(({sourceLanguage}) => sourceLanguage)
      const filteredSourceLanguages = sourceLanguages.filter((value, index, arr) => {
        return arr.indexOf(value) === index
      })
      return filteredSourceLanguages.join(', ')
    },
    targetLanguages(competencies) {
      if (!competencies.length) return '-'
      const allTargetLanguages = competencies.map(({ targetLanguage }) => {
        const target = this.languages.find(({_id}) => _id === targetLanguage).lang
        return { targetLanguage: target }})
      const targetLanguages = allTargetLanguages.map(({targetLanguage}) => targetLanguage)
      const filteredTargetLanguages = targetLanguages.filter((value, index, arr) => {
        return arr.indexOf(value) === index
      })
      return filteredTargetLanguages.join(', ')
    },
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
