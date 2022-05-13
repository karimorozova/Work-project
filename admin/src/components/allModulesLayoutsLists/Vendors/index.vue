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
          template(slot="sf_phone" slot-scope="{ item, index }")
            span {{ item.phone }}
          template(slot="sf_email" slot-scope="{ item, index }")
            span {{ item.email }}
          template(slot="sf_currency" slot-scope="{ item, index }")
            span {{ item.currency }}
          template(slot="sf_timezone" slot-scope="{ item, index }")
            span {{ item.timezone }}
          template(slot="sf_gender" slot-scope="{ item, index }")
            span {{ item.gender }}
          template(slot="sf_vendorType" slot-scope="{ item, index }")
            span {{ item.vendorType }}
          template(slot="sf_native" slot-scope="{ item, index }")
            span(v-if='item.native') {{ item.native.lang }}
            span(v-else) -
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
          template(slot="sf_fullName" slot-scope="{ item, index }")
            router-link.link(:to="{path: `/pangea-vendors/all/details/${item._id}`}" )
              PhotoDefault(:user="item" style="margin-right: 8px;")
              span {{ item.fullName }}
          template(slot="sf_dateInfo.createdAt" slot-scope="{ item, index }")
            span(v-if="item.dateInfo") {{ dateFormat(item.dateInfo.createdAt) }}
            span(v-else) -
          //- //template(slot="sf_billingInfo" slot-scope="{ item, index }")
          //- //  .table__data(v-html="vendorPaymentMethods(item.billingInfo)")
          template(slot="sf_catExperience" slot-scope="{ item, index }")
            span(v-if="item.catExperience.length" ) {{ item.catExperience.join(', ') }}
            span(v-else) -
            
          template(slot="sf_sourceLanguages" slot-scope="{ item, index }")
            .table__data(v-html="vendor(item)")
          //- //template(slot="sf_targetLanguages" slot-scope="{ item, index }")
          //- //  .table__data(v-html="targetLanguages(item.competencies)")
          //- //template(slot="sf_industry" slot-scope="{ item, index }")
          //- //  .table__data(v-html="vendorIndustries(item.competencies)")
          //- //template(slot="sf_steps" slot-scope="{ item, index }")
          //- //  .table__data(v-html="vendorSteps(item.competencies)")
          //- //template(slot="sf_rate" slot-scope="{ item, index }")
          //- //  .table__data(v-html="vendorRates(item.pendingCompetencies)")

</template>

<script>
import LayoutWrapper from "../LayoutWrapper"
import ListTable from "../ListTable"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import VendorsFilters from "./VendorsFilters"
import PhotoDefault from '../../PhotoDefault.vue'
import { mapGetters } from "vuex"


export default {
  mixins: [ LayoutWrapperMixin ],
  components: {
    VendorsFilters,
    LayoutWrapper,
    ListTable,
    PhotoDefault
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
      industries: "getAllIndustries",
      steps: "getAllSteps"
    })
  },
  methods: {
    // vendorPaymentMethods(obj) {
    //   const { paymentMethods } = obj
    //   console.log(this.steps)
    //   if (!paymentMethods.length) return '-'
    //
    //   const paymentTypes = paymentMethods.map(({ paymentType }) => paymentType)
    //   const filteredPaymentTypes = paymentTypes.filter((value, index, arr) => {
    //     return arr.indexOf(value) === index
    //   })
    //   return filteredPaymentTypes.join(', ')
    //
    // },
    vendor(item) {
      console.log(item);
    },
    vendorIndustries(competencies, qualifications, assessments, pendingCompetencies) {
      // if (!competencies.length) return '-'
      console.log(competencies);
      // const competenciesIndustries = competencies.map(({ industry }) =>
      //     this.industries.find(({ _id, name }) => {
      //       if (industry === _id) return name
      //     })
      // )
      // const qualificationsIndustries = qualifications.map(({ industries }) =>
      //     industries.forEach(id => {
      //       this.industries.find(({ _id, name }) => {
      //       if (id === _id) return name
      //     });
          
      //     })
      // )
      // const assessmentsIndustries = assessments.map(({ industries }) => {
      //   return industries.map(({industry}) => 
      //     this.industries.find(({ _id, name }) => {
      //       if (industry === _id) return name
      //     })
      //   )
      // })
      // const pendingCompetenciesIndustries = pendingCompetencies.map(({ industry }) =>
      //     this.industries.find(({ _id, name }) => {
      //       if (industry === _id) return name
      //     })
      // )
      // const filteredIndustries = [...competenciesIndustries, ...qualificationsIndustries, ...pendingCompetenciesIndustries]
      // .map(({ name }) => name).filter((value, index, arr) => {
      //   return arr.indexOf(value) === index
      // })
      // console.log(filteredIndustries);
      // return filteredIndustries.join(', ')
      
    
    },
    //   const filteredIndustries = vendorIndustries.map(({ name }) => name).filter((value, index, arr) => {
    //     return arr.indexOf(value) === index
    //   })
    //   return filteredIndustries.join(', ')
    //
    // },
    // vendorSteps(competencies) {
    //   if (!competencies.length) return '-'
    //   const vendorSteps = competencies.map(({ step }) =>
    //       this.steps.find(({ _id, title }) => {
    //         if (step === _id) return title
    //       })
    //   )
    //   const filteredSteps = vendorSteps.map(({ title }) => title).filter((value, index, arr) => {
    //     return arr.indexOf(value) === index
    //   })
    //   return filteredSteps.join(', ')
    // },
    // vendorRates(pendingCompetencies) {
    //   if (!pendingCompetencies.length) return '-'
    //   const vendorRates = pendingCompetencies.map(({ rate }) => rate)
    //
    //   return vendorRates.join(', ')
    // },
    // vendorNativeLanguage(native) {
    //   return this.languages.find(({ _id }) => _id === native).lang
    // },
    // sourceLanguages(competencies) {
    //   if (!competencies.length) return '-'
    //   const sourceLanguages = []
    //   competencies.map(({ sourceLanguage }) => {
    //     const source = this.languages.find(({ _id }) => _id === sourceLanguage).lang
    //     sourceLanguages.push(source)
    //   })
    //
    //   const filteredSourceLanguages = sourceLanguages.filter((value, index, arr) => {
    //     return arr.indexOf(value) === index
    //   })
    //   return filteredSourceLanguages.join(', ')
    // },
    // targetLanguages(competencies) {
    //   if (!competencies.length) return '-'
    //   const targetLanguages = []
    //   competencies.map(({ targetLanguage }) => {
    //     const target = this.languages.find(({ _id }) => _id === targetLanguage).lang
    //     targetLanguages.push(target)
    //   })
    //   const filteredTargetLanguages = targetLanguages.filter((value, index, arr) => {
    //     return arr.indexOf(value) === index
    //   })
    //   return filteredTargetLanguages.join(', ')
    //
    //   // const allTargetLanguages = competencies.map(({ targetLanguage }) => {
    //   //   const target = this.languages.find(({_id}) => _id === targetLanguage).lang
    //   //   return { targetLanguage: target }})
    //   // const targetLanguages = allTargetLanguages.map(({targetLanguage}) => targetLanguage)
    // }
  },
  beforeRouteEnter(to, from, next) {
    
    next(vm => {
      vm.collectQueryData(vm.getModuleData).then(() => {
        console.log(vm.moduleData)
      })
    })
  }

}
</script>

<style lang="scss" scoped>
.link {
  display: flex;
  align-items: center;
}
</style>
