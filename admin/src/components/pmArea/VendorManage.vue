<template lang="pug">
  .vendor-manage
    .vendor-manage__title
      span Vendor management
      .vendor-manage__close(@click.stop="closeVendorManage") &#215;

    .vendor-manage__body

      .vendor-manage__steps
        .tabs
          .tabs__option(v-for="(tab, index) in listOfStepsTitles" @click="setTab(index)" :class="{'tabs_active': tab === selectedTab}") {{ tab }}

        .blocks
          .block(v-for="stepsGroup of groupedByTaskId")
            .block__language
              span [{{ stepsGroup[0].taskId.substring(stepsGroup[0].taskId.length - 3) }}]
              span(v-html="getLanguage( stepsGroup[0].sourceLanguage,  stepsGroup[0].targetLanguage)" )

            .block__steps
              .block__step(v-for="step of stepsGroup" @click="chooseStep(step)" :class="{'activeStep': currentStepId === step._id.toString()}")
                .block__name
                  .block__step-title {{ step.step.title }}
                  .block__step-status
                    span(:class="getStatusClass(step.status)") {{ step.status }}

                .block__step-vendor(v-if="step.vendor") {{ step.vendor.firstName }} {{ step.vendor.surname || '' }}
                .block__step-vendor.empty(v-else) No vendor...

              //.block__step-status {{ step.status }}
              //input(readonly="true" placeholder="Vendor" :value="selectedVendors[step._id] ? selectedVendors[step._id].firstName : (step.vendor && step.vendor.firstName) || '-'" @click="chooseStep(step)")

      transition(name="fade")
        .vendor-manage__vendors(v-if="currentStep")
          .vendors__body
            .header
              .header__toggler
                Toggler(:isDisabled="false" :isActive="isEditable" @toggle="toggleEditable")
                .header__toggler-text Editable

              .header__description
                .header__description-text {{ selectedStep }}
                .header__description-text {{ selectedUnit }}
                .header__description-text {{ selectedIndustry }}
                .header__description-langs {{ currentStep.fullSourceLanguage.lang === selectedTarget ? selectedTarget : currentStep.fullSourceLanguage.lang + ' to ' + selectedTarget }}

              transition(name="fade")
                .header__options(v-if="isEditable")
                  .header__option
                    .header__option-title Target:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedTarget"
                        :options="allLanguages.map(i => i.lang)"
                        @chooseOption="setFakeTarget"
                      )
                  .header__option
                    .header__option-title Industry:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedIndustry"
                        :options="allIndustries.map(i => i.name)"
                        @chooseOption="setFakeIndustry"
                      )
                  .header__option
                    .header__option-title Step:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedStep"
                        :options="allSteps.map(i => i.title)"
                        @chooseOption="setFakeStep"
                      )
                  .header__option
                    .header__option-title Unit:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedUnit"
                        :options="allUnits.map(i => i.type)"
                        @chooseOption="setFakeUnit"
                      )


            .vendors__search
              .vendors__search-title Vendors
              .vendors__search-serch
                input(type="text" placeholder="🔎︎  Search" v-model="vendorsSearch")
                .clear-icon(v-if="vendorsSearch" @click="removeVendorsSearch")
                  i.fas.fa-backspace

            .vendors(v-for="item in listOfVendors")
              .vendor {{ item.firstName }}
        //.vendor-manage__options
        //  Button(value="Lang" @clicked="toggleLangNotStrict")
        //  Button(value="Disable Industry" @clicked="toggleDisabledIndustry")
        //  Button(value="Show All" @clicked="toggleShowAllVendor")
        //.vendor-manage__step-info
        //  .step-info LanguagePair: {{currentSourceLanguage + " >> " + currentTargetLanguage }}
        //  .step-info Step: {{currentStepName}}
        //  .step-info Unit: {{currentUnit}}
        //.vendor-manage__vendor(v-for=" vendor of getVendorsForStep")
        //  span {{vendor.firstName}}
        //  Button(value="Use this Vendor" @clicked="setVendorToStep(vendor)")

    //.vendor-manage__footer
      Button(@clicked="saveVendors" :value="'Assign Vendors'")

</template>

<script>
import Tabs from '../Tabs'
import Button from "../Button"
import { mapActions, mapGetters } from "vuex"
import _ from "lodash"
import { setStepVendors } from "../../vuex/general/actions"
import CheckBox from "../CheckBox"
import Toggler from "../Toggler"
import SelectSingle from "../SelectSingle"

export default {
  props: {
    steps: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      selectedTab: 'All Steps',
      currentStepId: null,
      currentStep: null,

      optionDefault: true,
      optionLanguages: true,
      optionIndustries: true,

      isEditable: false,

      selectedTarget: '',
      selectedUnit: '',
      selectedStep: '',
      selectedIndustry: '',

      allVendors: [],
      selectedVendors: {},
      vendorsSearch: ''
    }
  },
  methods: {
    removeVendorsSearch() {
      this.vendorsSearch = ''
    },
    setFakeTarget({ option }) {
      this.selectedTarget = option
    },
    setFakeIndustry({ option }) {
      this.selectedIndustry = option
    },
    setFakeStep({ option }) {
      this.selectedStep = option
    },
    setFakeUnit({ option }) {
      this.selectedUnit = option
    },
    toggleEditable() {
      this.isEditable = !this.isEditable
    },
    getLanguage(s, t) {
      return `<span>${ s }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i className="fas fa-angle-double-right"></i></span><span>${ t }</span>`
    },
    getStatusClass(status) {
      switch (status) {
        case 'Created':
        case 'Request Sent':
          return 'todo'

        case 'Approved':
        case 'Ready to Start':
        case 'Waiting to Start':
        case 'In progress':
          return 'doing'

        case 'Completed':
          return 'done'

        case 'Cancelled':
        case 'Cancelled Halfway':
        case 'Rejected':
          return 'stop'
      }
    },
    async saveVendors() {
      try {
        const stepsVendors = {}
        for (const key in this.selectedVendors) stepsVendors[key] = this.selectedVendors[key]._id
        this.setStepVendors({ projectId: this.$route.params.id, stepsVendors })
      } catch (err) {
        this.alertToggle({ message: 'Error in assigns vendors', isShow: true, type: "error" })
      }
    },
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
      this.$set(this.selectedVendors, this.currentStepId, vendor)
    },
    setTab(index) {
      this.selectedTab = this.listOfStepsTitles[index]
      this.currentStepId = null
      this.currentStep = null
    },
    chooseStep(step) {
      if (this.currentStepId === step._id.toString()) {
        this.currentStepId = null
        this.currentStep = null
        this.selectedTarget = ''
        this.selectedUnit = ''
        this.selectedStep = ''
        this.selectedIndustry = ''
      } else {
        this.currentStepId = step._id.toString()
        this.currentStep = step
        this.selectedTarget = step.fullTargetLanguage.lang
        this.selectedUnit = step.payablesUnit.type
        this.selectedStep = step.step.title
        this.selectedIndustry = this.currentProject.industry.name
      }
    },
    // isLangEqualOrEqualLangBase(firstLang, secondLang, useBasePart) {
    //   const first = useBasePart ? firstLang.split(' ')[0] : firstLang
    //   const second = useBasePart ? secondLang.split(' ')[0] : secondLang
    //   return first === second
    // },
    closeVendorManage() {
      this.$emit('closeVendorManage')
    },
    async getVendorsForSteps() {
      try {
        const allVendors = await this.$http.get('/pm-manage/vendors-for-steps')
        this.allVendors = allVendors.data
        console.log(allVendors.data)
      } catch (err) {
        console.log('err get vendors')
      }
    },
    ...mapActions({
      alertToggle: 'alertToggle',
      setStepVendors: 'setStepVendors'
    })
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      // vendors: "getAllVendorsForProject",
      allLanguages: "getAllLanguages",
      allUnits: "getAllUnits",
      allSteps: "getAllSteps",
      allIndustries: "getAllIndustries"
    }),
    groupedByTaskId() {
      const steps = this.selectedTab === 'All Steps' ? this.steps : this.steps.filter(({ step }) => step.title === this.selectedTab)
      return Object.values(_.groupBy(steps, ({ taskId }) => taskId))
    },
    listOfStepsTitles() {
      let list = new Set([ 'All Steps' ])
      for (const item of this.steps) list.add(item.step.title)
      return [ ...list ]
    },
    listOfVendors() {
      if (!this.allVendors.length) return []
      const vendor = this.allVendors

      if (this.vendorsSearch.length) {

      }

      return this.allVendors
    },
    getVendorsForStep() {
      if (!this.currentSourceLanguage) return ''
      if (this.showAllVendor) return this.vendors
      return this.vendors.filter(({ rates }) => {
        const pricelistTable = rates.pricelistTable
        const { source, target } = this.getLang

        const some = pricelistTable.some(({ sourceLanguage, targetLanguage, industry, step, unit }) => {
          const checkLang = this.isLangEqualOrEqualLangBase(sourceLanguage.lang, source.lang, this.isLangNotStrict)
              && this.isLangEqualOrEqualLangBase(targetLanguage.lang, target.lang, this.isLangNotStrict)
          const chekIndustry = this.isDisabledIndustry ? true : industry._id === this.industry._id
          return checkLang && chekIndustry && step.title === this.currentStepName && unit['type'] === this.currentUnit
        })

        return some
      })
    }
  },
  async created() {
    await this.getVendorsForSteps()
  },
  components: {
    SelectSingle,
    Toggler,
    CheckBox,
    Tabs,
    Button
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.header {
  &__toggler {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: end;
    padding-bottom: 6px;

    &-text {
      margin-top: 2px;
      cursor: default;
    }
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    border: 1px solid lightgrey;
    padding-top: 10px;
    background-color: white;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;

    &-title {
      width: 60px;
    }
  }

  &__description {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 15px;
    background: lightgrey;
    font-family: 'Myriad600';

    &-title {
      padding-right: 12px;
      border-right: 1px solid;
    }
  }
}

.vendors {
  &__body {
    padding-left: 30px;
  }

  &__search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0;
    border-bottom: 1px solid $border;
    padding-bottom: 20px;

    &-title {
      font-size: 19px;
      font-family: 'Myriad600';
    }

    &-serch {
      position: relative;
    }
  }
}

.blocks {
  background: white;
}

.block {
  &__name {

  }

  &__steps {
    margin-left: 20px;
    padding-left: 20px;
    border-left: 1px solid #d3d3d3;
    padding-bottom: 15px;
    padding-top: 15px;
  }

  &__step {
    margin-bottom: 10px;
    padding: 10px 15px;
    border-radius: 4px;
    border: 1px dotted lightgray;
    transition: .1s ease-out;
    display: flex;
    align-items: center;

    &-title {
      //width: 120px;
      //margin-right: 10px;
    }

    &-status {
      //width: 110px;
      //margin-right: 20px;
      //text-align: center;
    }

    &-vendor {
      width: 160px;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border: 1px solid lightgray;
      cursor: pointer;
    }

  }

  &__language {
    font-size: 14px;
    width: 150px;
    background: lightgrey;
    padding: 7px 10px;
    box-sizing: border-box;
  }
}

.vendor-manage {
  &__title {
    font-size: 19px;
    font-family: Myriad600;
    margin-bottom: 20px;
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
    width: 49%;
    display: flex;
    background: linen;
  }

  &__vendors {
    width: 51%;
    background: #f4f2f1;
    border-left: 2px solid green;
  }

  &__step-info,
  &__options {
    display: flex;
    gap: 25px;
  }

  &__step-info {
    margin: 10px 0;
  }

  &__vendor {
    display: flex;
    align-items: center;
    gap: 25px;
    margin: 10px 0;
  }
}

.tabs {
  width: 170px;
  margin-right: 25px;

  &__option {
    cursor: pointer;
    border-left: none;
    border-top: 1px solid $border;
    border-right: 1px solid $border;
    border-left: 1px solid $border;
    border-bottom: none;
    background-color: $white;
    padding: 11px 10px 10px 15px;
    display: flex;
    align-items: center;
    transition: .1s ease-out;

    &:hover {
      color: $text;
      background-color: $table-list-hover;
    }

    &:last-child {
      border: 1px solid $border;
    }
  }

  &_active {
    background-color: $border;
    color: $text;

    &:hover {
      background-color: $border;
    }
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
  width: 200px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.activeStep {
  border: 1px solid $border-focus;

  &:hover {
    border: 1px solid $border-focus;
  }
}

.todo {
  padding: 2px 6px;
  background: $table-list;
  color: $dark-border;
  font-size: 12px;
  border-bottom: 1px solid $dark-border;
  border-radius: 2px;
}

.doing {
  padding: 2px 6px;
  background: $table-list;
  color: $light-yellow;
  font-size: 12px;
  border-bottom: 1px solid $light-yellow;
  border-radius: 2px;
}

.done {
  padding: 2px 6px;
  background: $table-list;
  color: $green;
  font-size: 12px;
  border-bottom: 1px solid $green;
  border-radius: 2px;
}

.stop {
  padding: 2px 6px;
  background: $table-list;
  color: $red;
  font-size: 12px;
  border-bottom: 1px solid $red;
  border-radius: 2px;
}

.empty {
  opacity: .3;
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 4px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fa-backspace {
  font-size: 16px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;

  &:hover {
    color: $text;
  }
}
</style>