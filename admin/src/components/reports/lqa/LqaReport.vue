<template lang="pug">
  .lqa(@scroll="handleBodyScroll")
    .lqa__filters
      LqaReportFilter(
        :isLqa="false"
        :allSources="availableSources"
        :allTargets="availableTargets"
        :allVendors="availableVendors"
        :targetFilter="targetFilter"
        :sourceFilter="sourceFilter"
        :tierFilter="tierFilter"
        :industryFilter="industryFilter"
        :vendorFilter="vendorFilter"
        @setTierFilter="setTierFilter"
        @setTargetFilter="setTargetFilter"
        @setSourceFilter="setSourceFilter"
        @setIndustryFilter="setIndustryFilter"
        @setVendorFilter="setVendorFilter"
        @updateReport="updateReport"
        @updateAliases="updateAliases"
      )
    .lqa__languages
      .lqa__language(v-for="{languagePair, sourceLanguage, targetLanguage, industries, step } in reportData")
        .lqa__text
          span.lqa__semi-bold  {{ languagePair }}
          .lqa__industry(v-for="{vendors, industryGroup} in industries")
            .lqa__tier-industry
              span.lqa__semi-bold Industry: &nbsp;
              span {{industryGroup.name}}
              span &nbsp; &nbsp;
              span.lqa__semi-bold Tier: &nbsp;
              span {{getTier(industryGroup.name, sourceLanguage, targetLanguage ) || '-' }}
            Table(v-if="vendors.length" :vendorsData="getVendorsWithInfo(vendors, languagePair, industryGroup,step)"  :industryTier="getTier(industryGroup.name, sourceLanguage, targetLanguage )" :tiersInfo="tiersInfo" @refreshAssessment="refreshData()")

      //.lqa__form(v-if="false")
        NewVendor(:languages="allXtrfLangs" @close="closeForm" @saveVendor="saveVendor")
</template>

<script>
import NewVendor from "../NewVendor"
import Table from "./Table"
import { mapGetters, mapActions } from "vuex"
import LqaReportFilter from "./LqaReportFilter"

export default {
  data() {
    return {
      reportData: null,
      nameFilter: '',

      sourceFilter: 'All',
      targetFilter: 'All',
      industryFilter: 'All',
      tierFilter: 'All',
      vendorFilter: 'All',
      availableSources: [ 'All' ],
      availableTargets: [ 'All' ],
      availableVendors: [ 'All' ],
      allLangs: [],
      isLanguages: true,
      filterCount: 10,
      skipCount: 0,
      isDataRemain: true,
      industriesTiers: [],
      tiersInfo: []
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    findLanguageByTitle(title) {
      return this.allLanguages.find(language => language.lang === title)
    },
    getVendorsWithInfo(vendors, languagePair, industryGroup, step) {
      return vendors.map((vendor) => {
        vendor.assessmentInfo = this.getAssessmentInfo(vendor.vendor.assessments, languagePair, industryGroup)
        vendor.step = step
        return vendor
      })
    },
    getAssessmentInfo(assessment, languagePair, industryGroup) {
      const languages = languagePair.split(' >> ')
      const sourceLang = this.findLanguageByTitle(languages[0])
      const targetLang = this.findLanguageByTitle(languages[1])
      const sourceLangId = sourceLang ? sourceLang._id : null
      const targetLangId = targetLang ? targetLang._id : null

      const basicAssessmentInfo = { languages: { sourceLanguage: sourceLang, targetLanguage: targetLang }, industryGroup }

      if (!targetLang || !assessment || !assessment.length) return { ...basicAssessmentInfo }

      const langPairIndex = assessment.findIndex(({ sourceLanguage, targetLanguage }) =>
          (
              sourceLanguage.toString() === sourceLangId.toString()
              && targetLanguage.toString() === targetLangId.toString()
          )
      )

      if (!assessment[langPairIndex] || !assessment[langPairIndex].industries.length) return { ...basicAssessmentInfo }

      const industryIndex = assessment[langPairIndex].industries.findIndex(({ industry }) => {
        return industry === industryGroup._id.toString()
      })

      const foundAssessment = assessment[langPairIndex].industries[industryIndex] || null

      return { foundAssessment, langPairIndex, industryIndex, ...basicAssessmentInfo }
    },
    async handleBodyScroll(e) {
      const element = e.target
      if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
        if (this.isDataRemain) {
          this.skipCount += 10
          const result = await this.$http.post('/reportsapi/xtrf-lqa-report', { filters: this.filters })
          const { data } = result.data
          this.isDataRemain = data.length === 10
          this.reportData.push(...data)
        }
      }
    },
    async refreshData() {
      this.skipCount = 0
      await this.getReport({ countFilter: 10, skipCount: 0 })
    },
    async getFilterOptions() {
      const result = await this.$http.get('/reportsapi/xtrf-lqa-reports-filter-options')
      for (let key in result.data) {
        if (result.data.hasOwnProperty(key)) {
          this[key].push(...result.data[key])
        }
      }
    },
    async getReport(filters) {
      try {
        const result = await this.$http.post('/reportsapi/xtrf-lqa-report', { filters })
        const { data, industryTiers, tiersInfo } = result.body

        this.isDataRemain = data.length === 10
        this.reportData = data
        this.industriesTiers = industryTiers
        this.tiersInfo = tiersInfo

      } catch (err) {
        this.alertToggle({ message: 'Error on getting LQA report', isShow: true, type: 'error' })
      }
    },

    getTier(industry, sourceGroupLang, targetGroupLang) {
      const industryTiers = this.industriesTiers[industry]
      if (!industryTiers) return 0
      const findTier = industryTiers.find(({ sourceLang, targetLang }) => sourceLang === sourceGroupLang && targetLang === targetGroupLang)
      return !findTier ? 1 : findTier.tier
    },

    async setTierFilter({ value }) {
      this.tierFilter = value
      this.skipCount = 0
      await this.getReport(this.filters)
    },
    async setSourceFilter({ option }) {
      this.sourceFilter = option
      this.skipCount = 0
      await this.getReport(this.filters)
    },
    async setTargetFilter({ option }) {
      this.targetFilter = option
      this.skipCount = 0
      await this.getReport(this.filters)
    },
    async setVendorFilter({ option }) {
      this.vendorFilter = option
      this.skipCount = 0
      await this.getReport(this.filters)
    },
    async setIndustryFilter({ option }) {
      this.industryFilter = option
      this.skipCount = 0
      await this.getReport(this.filters)
    },
    async updateReport({ value }) {
      this.reportData = value
    },
    async updateAliases({ value }) {
      this.reportData = value
    }
  },
  computed: {
    ...mapGetters({
      allLanguages: 'getAllLanguages'
    }),
    filters() {
      let result = {}
      if (this.targetFilter !== 'All') {
        result.targetFilter = this.targetFilter
      }
      if (this.sourceFilter !== 'All') {
        result.sourceFilter = this.sourceFilter
      }
      if (this.tierFilter !== 'All') {
        result.tierFilter = this.tierFilter
      }
      if (this.industryFilter !== 'All') {
        result.industryFilter = this.industryFilter
      }
      if (this.vendorFilter !== 'All') {
        result.vendorFilter = this.vendorFilter
      }
      result.countFilter = this.filterCount
      result.skipCount = this.skipCount
      return result
    }
  },
  components: {
    LqaReportFilter,
    NewVendor,
    Table
  },
  created() {
    this.getFilterOptions()
  },
  mounted() {
    this.getReport(this.filters)
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.lqa {
  box-shadow: $box-shadow;
  position: relative;
  width: 1200px;
  margin: 50px;
  background: white;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 2px;

  &__bold {
    font-family: 'Myriad900';
  }

  &__semi-bold {
    font-family: 'Myriad600';
  }

  &__text {
    font-size: 16px;
  }

  &__industry {
    font-size: 16px;
  }

  &__tier-industry {
    font-size: 14px;
    margin: 10px 0;
  }
}


</style>
