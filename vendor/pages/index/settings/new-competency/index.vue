<template lang="pug">
  .competencies(v-if="vendorExtra._id" )
    .competencies__body
      ValidationErrors(
        v-if="errors.length"
        :errors="errors"
        :isAbsolute="true"
        @closeErrors="clearErrors"
      )
      .competencies__modal-wrapper(v-if="showAlert.isShow")
        ApproveModal.modal.modal-width-450(
          approveValue="Yes"
          notApproveValue="No"
          @approve="modifyApprove"
          @notApprove="modifyNotApprove"
          @close="closeApproveModal"
        )
          .text-center
            p(v-for="matchPending in matchPendingCompetencies")
              span.bold {{matchPending.sourceLanguage.lang}} &nbsp;
              span >> &nbsp;
              span.bold {{matchPending.targetLanguage.lang}} &nbsp;
              span for &nbsp;
              span.bold {{matchPending.industry.name}} &nbsp;
            p for step: &nbsp;
              span.bold {{currentStep.title}} &nbsp;
              span has been entered in our system.
            p.modal__questions Do you wish to overwrite the information with the new information you have entered?

      .title1 Languages
      .block
        .competencies__row
          .competencies__col
            .competencies__select
              .competencies__input-title Source Language:
              .drop
                SelectSingle(
                  :selectedOption="currentSourceLang.lang"
                  :options="removeEnglishLang(langs).map(i => i.lang)"
                  :hasSearch="true"
                  placeholder="Source language"
                  fieldName="lang"
                  @chooseOption="(e) => setSelectedOption(e, 'currentSourceLang')"
                )
          .competencies__col
            .competencies__select
              .competencies__input-title Target Language:
              .drop
                SelectSingle(
                  :selectedOption="targetLangOrMotherTongue.lang"
                  :options="removeEnglishLang(langs).map(i => i.lang)"
                  :hasSearch="true"
                  fieldName="lang"
                  placeholder="Target language"
                  @chooseOption="(e) => setSelectedOption(e, 'currentTargetLang')"
                )

        .competencies__row-column.mb35(v-if="isEqualsMotherTongue()")
          .competencies__text
            p The target language you have selected isn't your mother tongue.
            p Please provide more details about your level of &nbsp;
              span.bold {{currentTargetLang.lang}}
              span , years of experience and other supporting information.
          .competencies__markdown
            WYSIWYG(@editorBlur="setTargetLangDetails")

      .title Industries & Step
      .block
        .competencies__row
          .competencies__col
            .competencies__select
              .competencies__input-title Industry:
              .drop
                SelectMulti(
                  :selectedOptions="currentIndustry.map(({name})=> name)"
                  :options="industries"
                  :hasSearch="true"
                  fieldName="name"
                  placeholder="Industry"
                  @chooseOptions="setSelectedMultiOption"
                )
          .competencies__col
            .competencies__select
              .competencies__input-title Step:
              .drop
                SelectSingle(
                  :selectedOption="currentStep.title"
                  :options="filteredSteps().map(i => i.title)"
                  :hasSearch="true"
                  fieldName="title"
                  placeholder="Step"
                  @chooseOption="(e) => setSelectedOption(e, 'currentStep')"
                )

        .competencies__row-column.mb35(v-for="{name} in currentIndustry")
          .competencies__text
            p Please provide more details about your experience in &nbsp;
              span.bold {{name}}
          .competencies__markdown
            WYSIWYG(@editorBlur="(e)=> setIndustriesDetails(e,name)")

      .title Rates
      .block
        .competencies__row
          .competencies__select
            .competencies__input-title Rate per word:
            .competencies__rates
              input(v-model.lazy="currentRate" type="number" @click="selectInputValue")

        .competencies__row(v-if="currentSourceLang.lang !== undefined && targetLangOrMotherTongue.lang !== undefined && currentIndustry.length")
          .competencies__back(style="margin-top: 15px; font-family: 'Roboto600;'")
            p Can you back translate?
            p(style="margin-top: 5px;") {{targetLangOrMotherTongue.lang}}&nbsp;>>&nbsp;{{currentSourceLang.lang}} in {{currentIndustry.map(({name})=> name).join(', ')}}

        .competencies__row(v-if="currentSourceLang.lang !== undefined && targetLangOrMotherTongue.lang !== undefined && currentIndustry.length")
          .competencies__reverse-translate
            .competencies__radio-button
              label.radio(for='opt1')
                input#opt1.hidden(type='radio' v-model="isReverseTranslate" :value="true")
                span.label
                | Yes

          .competencies__reverse-translate
            .competencies__radio-button
              label.radio(for='opt2')
                input#opt2.hidden(type='radio' v-model="isReverseTranslate" :value="false")
                span.label
                | No

        .competencies__row
          .competencies__select(v-if="isReverseTranslate")
            .competencies__input-title Rate per word:
            .competencies__rates
              input(v-model.lazy="currentReverseRate" type="text" @click="selectInputValue")

      .competencies__row
        .competencies__submit
          Button(value="Submit" @clicked="checkError" :isDisabled="showAlert.isShow")


</template>

<script>
import SelectSingle from "../../../../components/general/SelectSingle"
import SelectMulti from "../../../../components/general/SelectMulti"
import { mapGetters, mapActions } from "vuex"
import WYSIWYG from "../../../../components/sub-components/WYSIWYG"
import ApproveModal from "../../../../components/general/ApproveModal"
import Button from "../../../../components/general/Button"
import Modal from "../../../../components/sub-components/Modal"
import removeLang from "../../../../mixins/removeLang"
import ValidationErrors from "../../../../components/general/ValidationErrors"

export default {
  mixins: [ removeLang ],
  data() {
    return {
      vendorExtra: {},
      showStep: [ 'Translation', 'Copywriting' ],
      currentSourceLang: {},
      currentTargetLang: {},
      currentIndustry: [],
      currentStep: {},
      industriesDetails: {},
      targetLangDetails: '',
      isReverseTranslate: false,
      currentRate: (0).toFixed(4),
      currentReverseRate: (0).toFixed(4),
      showAlert: {
        isShow: false,
        text: ''
      },
      updateOld: false,
      matchPendingCompetencies: [],
      newPendingCompetencies: [],
      oldPendingCompetencies: [],
      errors: []
    }
  },
  watch: {
    currentRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex, '').replace(',', '.')) || 0
      this.currentRate = (+value).toFixed(4)
    },
    currentReverseRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex, '').replace(',', '.')) || 0
      this.currentReverseRate = (+value).toFixed(4)
    }
  },
  methods: {
    ...mapActions([
      "alertToggle"
    ]),
    filteredSteps() {
      return this.steps.filter((step) => this.showStep.includes(step.title))
    },
    setSelectedOption({ option }, value) {
      let obj = {}
      if (value === 'currentSourceLang' || value === 'currentTargetLang') {
        obj = this.langs.find(i => i.lang === option)
      } else if (value === 'currentStep') {
        obj = this.steps.find(i => i.title === option)
      }
      this[value] = obj
    },
    setSelectedMultiOption({ option }) {
      const index = this.currentIndustry.findIndex(({ name }) => option.name === name)
      if (index !== -1) {
        this.currentIndustry.splice(index, 1)
      } else {
        if (this.currentIndustry.length >= 5) {
          this.errors = []
          this.errors.push('You can select only 5 industry for one request')
          return
        }
        this.currentIndustry.push(option)
      }
    },
    setTargetLangDetails(data) {
      this.targetLangDetails = data
    },
    setIndustriesDetails(data, name) {
      this.industriesDetails[name] = data
    },
    isEqualsMotherTongue() {
      return this.currentTargetLang.lang && this.currentTargetLang.lang !== this.motherTongue.lang
    },
    findMatch(pendingCompetencies) {
      this.oldPendingCompetencies = Array.from(this.vendorExtra.pendingCompetencies || [])
      const vendorPending = Array.from(this.pendingCompetenciesToStrings)

      pendingCompetencies.forEach((elem) => {
        const pattern = `${ elem.sourceLanguage._id }-${ elem.targetLanguage._id }-${ elem.industry._id }-${ elem.step._id }`
        const matchCompetenciesIndex = vendorPending.indexOf(pattern)
        if (matchCompetenciesIndex !== -1) {
          vendorPending.splice(matchCompetenciesIndex, 1)
          this.oldPendingCompetencies.splice(matchCompetenciesIndex, 1)
          this.matchPendingCompetencies.push(elem)
        } else {
          this.newPendingCompetencies.push(elem)
        }
      })
    },
    generateFinalData(sourceLanguage, targetLanguage) {
      let groupedArray = []
      for (const industry of this.currentIndustry) {
        groupedArray.push({
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          industry: industry,
          step: this.currentStep,
          rate: this.currentRate,
          descriptions: {
            targetLanguage: this.targetLangDetails || '',
            industry: this.industriesDetails[industry.name]
          }
        })
      }
      return groupedArray
    },
    checkError() {
      this.errors = []
      if (!this.currentSourceLang.lang) this.errors.push('Source Language is empty')
      if (!this.targetLangOrMotherTongue.lang) this.errors.push('Target Language is empty')
      if (this.currentIndustry.length < 1) this.errors.push('Industry is empty')
      if (!this.currentStep.title) this.errors.push('Step is empty')
      if (this.currentRate <= 0) this.errors.push('Minimal rate value is 0.0001')
      if (this.isReverseTranslate && this.currentReverseRate <= 0) this.errors.push('Minimal reverse rate value is 0.0001')
      if (this.isEqualsMotherTongue() && this.targetLangDetails === '') this.errors.push('Please enter the target language details')
      for (const { name } of this.currentIndustry) {
        if (!this.industriesDetails[name] || this.industriesDetails[name].trim() === '') {
          this.errors.push(`Please enter the ${ name } details`)
        }
      }

      if (this.errors.length <= 0) this.submitForm()
    },
    submitForm() {
      let pendingCompetenciesCombinations = this.generateFinalData(this.currentSourceLang, this.targetLangOrMotherTongue)
      if (this.isReverseTranslate) {
        pendingCompetenciesCombinations.push(...this.generateFinalData(this.targetLangOrMotherTongue, this.currentSourceLang))
      }

      this.findMatch(pendingCompetenciesCombinations)

      const pendingCompetencies = [ ...this.vendorExtra.pendingCompetencies, ...this.newPendingCompetencies ]

      if (this.matchPendingCompetencies.length > 0) {
        this.showAlert.isShow = true
      } else {
        this.sendRequest(pendingCompetencies)
        this.pendingCompetenciesToDefault()
        this.$router.push('/profile-details/competency-and-rate')
      }
    },
    modifyApprove() {
      const pendingCompetencies = [ ...this.oldPendingCompetencies, ...this.matchPendingCompetencies, ...this.newPendingCompetencies ]
      this.sendAndUpdateState(pendingCompetencies)
    },
    modifyNotApprove() {
      const pendingCompetencies = [ ...this.vendorExtra.pendingCompetencies, ...this.newPendingCompetencies ]
      this.sendAndUpdateState(pendingCompetencies)
    },
    closeApproveModal() {
      this.showAlert.isShow = false
      this.pendingCompetenciesToDefault()
    },
    sendAndUpdateState(pendingCompetencies) {
      try {

        this.sendRequest(pendingCompetencies)
        this.setVendorProp({ prop: "pendingCompetencies", value: pendingCompetencies })
        this.pendingCompetenciesToDefault()
        this.showAlert.isShow = false
        this.alertToggle({ message: "You’ve successfully created pending competencies", isShow: true, type: "success" })
        this.$router.push('competency-and-rate')
      } catch (e) {
        this.alertToggle({ message: "Cannot create pending competencies", isShow: true, type: "error" })
      }
    },
    pendingCompetenciesToDefault() {
      this.matchPendingCompetencies = []
      this.newPendingCompetencies = []
      this.oldPendingCompetencies = []
    },
    sendRequest(pendingCompetencies) {
      this.$axios.post('/vendor/pending-competencies', {
        token: this.token,
        pendingCompetencies
      })
    },
    clearErrors() {
      this.errors = []
    },
    selectInputValue(e) {
      e.target.select()
    },
    async getVendorExtra() {
      try {
        const result = await this.$axios.get(`/vendor/portal-vendor-extra-info?token=${ this.$store.state.token }`)
        this.vendorExtra = result.data
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      langs: 'getAllLanguages',
      industries: 'getAllIndustries',
      vendor: "getVendor",
      steps: "getAllSteps",
      token: "getToken"
    }),
    pendingCompetenciesToStrings() {
      return this.vendorExtra
          && this.vendorExtra.pendingCompetencies
          && this.vendorExtra.pendingCompetencies
              .map(item => {
                return `${ item.sourceLanguage._id }-${ item.targetLanguage._id }-${ item.industry._id }-${ item.step._id }`
              })

    },
    motherTongue: function () {
      return this.vendor.native
          ? this.vendor.native
          : ''
    },
    targetLangOrMotherTongue: function () {
      return this.currentTargetLang.lang
          ? this.currentTargetLang
          : this.motherTongue
    }
  },
  components: {
    ValidationErrors,
    Modal,
    Button,
    ApproveModal,
    SelectSingle,
    SelectMulti,
    WYSIWYG
  },
  created() {
    this.getVendorExtra()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
}

.competencies {
  width: 1000px;
  font-family: Roboto400;
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 60px;
  box-shadow: $box-shadow;

  &__col {
    width: 44%;
  }

  p {
    margin: 0;
  }

  &__modal-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 999;

    .modal {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-right: -50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
    }
  }

  &__title {
    margin: 30px 0 10px;
    font-size: 20px;
  }

  &__input-title {
    min-width: 130px;
  }

  &__body {
    position: relative;
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
  }

  &__row-column {
  }

  &__select {
    display: flex;
    align-items: center;
  }

  &__text {
    margin-bottom: 10px;
    margin-top: 20px;
    color: $dark-border;
  }

  &__rates {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }
  }

  &__reverse-translate {
    display: flex;
    margin-right: 30px;
    margin-top: 15px;
    margin-bottom: 15px;

    .reverse-rate {
      display: flex;
      align-items: center;
      width: 130px;
      margin-left: 10px;

      span {
        margin-right: 5px;
      }
    }
  }

  &__radio-button {
    display: flex;
    align-items: center;
  }

  &__submit {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    width: 100%;
  }

  .modal-error {
    color: #d66f58;
    font-family: Roboto600;
    text-align: center;
    font-size: 18px;

    &__errors {
      font-size: 16px;
    }
  }

  .modal {
    &-width-300 {
      width: 300px;
    }

    &-width-450 {
      width: 450px;
    }

    &__questions {
      margin: 7px 0;
    }

    ul {
      padding-left: 20px;
    }
  }


  .radio {
    position: relative;
    cursor: pointer;
    line-height: 20px;
    font-size: 14px;
  }

  .radio .label {
    position: relative;
    display: block;
    float: left;
    margin-right: 10px;
    width: 16px;
    height: 16px;
    border: 1px solid #333;
    border-radius: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  .radio .label:after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background: #666;
    opacity: 0;
    pointer-events: none;
  }

  input[type="radio"]:checked + .label {
    border-color: #333;
  }

  input[type="radio"]:checked + .label:after {
    opacity: 1;
  }

  .cntr {
    position: absolute;
    top: calc(50% - 10px);
    left: 0;
    width: 100%;
    text-align: center;
  }

  .text-center {
    text-align: center;
  }

  .hidden {
    display: none;
  }

  .bold {
    font-family: Roboto600;
  }
}

.title {
  font-size: 14px;
  padding-bottom: 10px;
  padding-top: 30px;
  text-transform: uppercase;
  font-family: 'Roboto600';
}

.title1 {
  font-size: 14px;
  padding-bottom: 10px;
  padding-top: 20px;
  text-transform: uppercase;
  font-family: 'Roboto600';
}

.block {
  padding: 25px;
  border: 1px solid $light-border;
  border-radius: 4px
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 220px;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>
