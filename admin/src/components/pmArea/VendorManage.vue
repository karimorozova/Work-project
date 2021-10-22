<template lang="pug">
  .vendor-manage
    .vendor-manage__title
      span Manage Vendors
      .vendor-manage__close(@click.stop="closeVendorManage") &#215;
    .vendor-manage__body
      .vendor-manage__steps
        .tabs
          .tabs__option(
            v-for="(tab, index) in actualSteps"
            @click="setTab(index)"
            :class="{'tabs_active': tab === selectedTab}"
          ) {{ tab }}
        .block(v-for="stepsGroup of groupedByTaskId")
          span {{stepsGroup[0].sourceLanguage + ">>" + stepsGroup[0].targetLanguage }}
          p(v-for="step of stepsGroup" ) {{step.step}}:
            input(:value="selectedVendor[step._id] ? selectedVendor[step._id].firstName : (step.vendor && step.vendor.firstName) || '-'" @click="chooseStep(step)")

      .vendor-manage__vendors
        .vendor-manage__options
          Button(value="Lang" @clicked="toggleLangNotStrict")
          Button(value="Disable Industry" @clicked="toggleDisabledIndustry")
          Button(value="Show All" @clicked="toggleShowAllVendor")
        .vendor-manage__step-info
          .step-info LanguagePair: {{currentSourceLanguage + " >> " + currentTargetLanguage }}
          .step-info Step: {{currentStepName}}
          .step-info Unit: {{currentUnit}}
        .vendor-manage__vendor(v-for=" vendor of getVendorsForStep")
          span {{vendor.firstName}}
          Button(value="Use this Vendor" @clicked="setVendorToStep(vendor)")
</template>

<script>
import Tabs from '../Tabs'
import Button from "../Button"
import { mapGetters } from "vuex"

import _ from "lodash"
export default {
  props: {
    steps: {
      type: Array,
      default: []
    },
    industry: {
      default: ''
    }
  },
  data() {
    return {
      selectedTab: 'Steps',
      newSteps: [],

      currentSourceLanguage: '-',
      currentTargetLanguage: '-',
      currentStepName: '-',
      currentUnit: '-',

      // currentVendors: [],
      isLangNotStrict: false,
      isDisabledIndustry: false,
      showAllVendor: false,

      selectedVendor: {},

    }
  },
  methods: {
    toggleLangNotStrict() {
      this.isLangNotStrict = !this.isLangNotStrict
    },
    toggleDisabledIndustry() {
      this.isDisabledIndustry = !this.isDisabledIndustry
    },
    toggleShowAllVendor() {
      this.showAllVendor = !this.showAllVendor
    },
    setVendorToStep(vendor) {
      this.$set(this.selectedVendor,this.currentStepId, vendor )
    },
    setTab(index){
      const selected = this.actualSteps[index]
      this.selectedTab = selected
    },
    async getSteps() {
      this.newSteps = (await this.$http.get('/pm-manage/vendors-for-project')).data
      console.log(this.newSteps)
    },
    chooseStep(step) {
      this.currentStepId = step._id
      this.currentSourceLanguage = step.sourceLanguage
      this.currentTargetLanguage = step.targetLanguage
      this.currentStepName = step.step
      this.currentUnit = this.units.find(({ _id })=> _id.toString() === step.serviceStep.unit.toString()).type

      // this.currentVendors =  this.getVendorsForStep()
    },
    getLanguageBySymbol(symbolForSearching) {
      return this.langs.find(({ symbol }) => symbol === symbolForSearching)
    },
    isLangEqualOrEqualLangBase(firstLang, secondLang, useBasePart) {
      const first = useBasePart ? firstLang.split(' ')[0] : firstLang
      const second = useBasePart ? secondLang.split(' ')[0] : secondLang
      return first === second
    },
    closeVendorManage() {
      this.$emit('closeVendorManage')
    }

  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      vendors: "getAllVendorsForProject",
      langs: "getAllLanguages",
      units: "getAllUnits"
      // userGroup: "getUserGroup"
    }),
    groupedByTaskId() {
      return Object.values(_.groupBy(this.steps, ({taskId}) => taskId))
    },
    // filteredSteps() {
    //   if(this.selectedTab = "Steps") return this.groupedByTaskId()
    //   return this.groupedByTaskId.filter((step) => {
    //     return step.name === this.selectedTab
    //   })
    // },
    actualSteps() {
      let actualSteps = new Set(['Steps'])
      for (const step of this.groupedByTaskId) {
        for (const {name} of step) {
          actualSteps.add(name)
        }
      }
      return [...actualSteps]
    },
    getVendorsForStep() {
      if (!this.currentSourceLanguage) return ''
      if(this.showAllVendor) return this.vendors
      return this.vendors.filter(({rates}) => {
        const pricelistTable = rates.pricelistTable
        const { source, target } = this.getLang

        const some = pricelistTable.some(({ sourceLanguage, targetLanguage, industry, step, unit }) => {
          const checkLang = this.isLangEqualOrEqualLangBase( sourceLanguage.lang, source.lang, this.isLangNotStrict)
              && this.isLangEqualOrEqualLangBase(targetLanguage.lang, target.lang, this.isLangNotStrict)
          const chekIndustry = this.isDisabledIndustry ? true : industry._id === this.industry._id
          return checkLang && chekIndustry && step.title === this.currentStepName && unit['type'] === this.currentUnit
        })

        return some
      })
    },
    getLang() {
      return {source: this.getLanguageBySymbol(this.currentSourceLanguage) || { lang: ''}, target: this.getLanguageBySymbol(this.currentTargetLanguage) || { lang: '' }}
    },

  },
  async created() {
    await this.getSteps()
  },
  components: {
    Tabs,
    Button,
  }
}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";
  .vendor-manage {
    &__title {
      font-size: 19px;
      font-family: Myriad600;
    }
    &__close {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }
    &__body {
      display: flex;
    }
    &__steps {
      width: 30%;
    }
    &__vendors {
      width: 70%;
    }
    &__step-info,
    &__options{
      display: flex;
      gap: 25px;
    }
    &__step-info {
      margin: 10px 0;
    }
    &__vendor{
      display: flex;
      align-items: center;
      gap: 25px;
      margin: 10px 0;
    }
  }
  .tabs {
    display: flex;

    &__option {
      cursor: pointer;
      border-left: none;
      border-top: 1px solid $border;
      border-right: 1px solid $border;
      border-bottom: none;
      background-color: $table-list;
      padding: 1px 15px 0 8px;
      height: 31px;
      display: flex;
      align-items: center;
      color: #33333370;

      &:first-child {
        border-left: 1px solid $border !important;
        border-top-left-radius: 4px;
      }

      &:last-child {
        border-top-right-radius: 4px;
      }
    }

    &_active {
      background-color: $white;
      color: $text;
    }
  }
  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    height: 32px;
    transition: .1s ease-out;
    width: 220px;
    font-family: 'Myriad400';

    &:focus {
      border: 1px solid $border-focus;
    }
  }
</style>